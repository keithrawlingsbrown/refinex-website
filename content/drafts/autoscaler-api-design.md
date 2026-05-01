---
title: "Why /signals/active Returns One Action, Not a List"
meta_title: "API Design: Single Action vs Lists for Infrastructure APIs"
date: "2026-05-01"
description: "Most infrastructure APIs return all data and let callers decide. RefineX /signals/active returns one highest-confidence action with fallback. Here's why."
slug: "api-design-single-action-vs-lists"
tags: ['aws', 'spot', 'api-design']
schema:
  type: Article
  datePublished: "2026-05-01"
  author: "Keith Brown"
  publisher: "RefineX"
canonical: "https://www.refinex.io/blog/api-design-single-action-vs-lists"
published: false
---

Most infrastructure APIs follow the same pattern: return all available data, let the caller filter and decide. AWS EC2 DescribeSpotPriceHistory returns every price point. Kubernetes metrics APIs return every data point. The application layer handles the decision logic.

The RefineX /signals/active endpoint does the opposite. Each call returns exactly one action with a confidence score and an optional fallback parameter. When your autoscaler queries us, it gets "buy_spot" or "fallback_on_demand" or "wait", never a list of possibilities to evaluate.

## What is Single-Action API Design?

Single-action API design means the service makes exactly one recommendation per request. Instead of returning multiple signals with different confidence levels and letting the caller rank them, the API applies its own decision tree and returns the highest-confidence action that meets the caller's constraints.

In our case, the /signals/active endpoint queries the signals table, filters by is_active and expires_at, then applies a deterministic ranking algorithm. The signal with the highest confidence score above our suppression threshold becomes the returned action. Everything else gets logged to our suppression system.

## How Does RefineX Score and Rank Signals?

The Signal model stores confidence as a float between 0.0 and 1.0. Each signal also contains an action field with values like "buy_spot", "migrate_spot", "wait", or "fallback_on_demand". When /signals/active runs, it queries active signals for the requested region and instance type, then ranks them by confidence score.

Our suppression logic removes signals below the confidence threshold before they reach the API response. This week we suppressed 48.9% of generated signals. The remaining signals get ranked, and the top scorer becomes the API response. The suppression decisions appear in our public log at /transparency, creating an auditable trail of what we filtered out and why.

The expected_value JSON field contains savings_percent and other economic factors, but confidence drives the ranking. A 0.85 confidence "buy_spot" signal beats a 0.72 confidence "migrate_spot" signal, regardless of potential savings.

## Why Not Return All Available Signals?

We tested a /signals/all endpoint during development. It returned every active signal for the requested region and instance type, ranked by confidence. The API consumers spent more time building ranking logic than integrating our recommendations.

Autoscalers particularly struggled with this pattern. They needed to implement fallback chains, confidence thresholds, and tie-breaking logic. Three different customers built nearly identical decision trees on top of our signal list. We were pushing complexity to every integration point instead of centralizing it.

The single-action design moves that complexity into our service layer. We implement the ranking logic once, test it against historical data, and expose the decision through a simple interface. The autoscaler gets "buy_spot" with confidence 0.85 and can immediately act on it or ignore it based on its own risk tolerance.

## How Does the Fallback Parameter Work?

The fallback parameter tells our API what action to return when no high-confidence signals exist for the requested instance type and region. Without fallback, the API returns null when we have no recommendations. With fallback set to "on_demand", it returns that action with confidence 1.0.

This serves autoscalers that need a decision on every call. They can set fallback to "on_demand" and always receive an actionable response. When we have high-confidence spot recommendations, they get those. When spot conditions look risky, they get the fallback action.

The fallback logic appears in our decision tree after signal ranking. If the highest-confidence signal still falls below our delivery threshold, we check for a fallback parameter and return that action instead of null. The response includes a flag indicating whether the returned action came from signal analysis or fallback logic.

## Integration Benefits for Autoscalers

Kubernetes autoscalers and AWS Auto Scaling groups benefit from APIs that make definitive recommendations. They already handle complex scheduling, capacity planning, and resource allocation. Adding signal evaluation and ranking creates another failure mode.

With single-action responses, the integration becomes straightforward. The autoscaler calls /signals/active with the target instance type and region. It receives "buy_spot" with confidence 0.85 or "fallback_on_demand" with confidence 1.0. The autoscaler compares the confidence score against its own threshold and acts accordingly.

This pattern also simplifies error handling. The autoscaler doesn't need to validate signal rankings or handle empty result sets. Each API call returns exactly one action, and the fallback parameter eliminates null responses entirely.

## Opinionated APIs and Decision Boundaries

The single-action design represents a broader principle: APIs should encode domain expertise, not just data access. We understand spot market dynamics, interruption patterns, and pricing volatility better than the typical API consumer. The ranking algorithm captures that knowledge.

By returning one recommendation instead of raw data, we create a clear decision boundary. We handle signal evaluation, confidence scoring, and suppression logic. The consumer handles business logic, risk tolerance, and execution timing. Neither component needs to understand the other's domain.

Our [transparency log](https://www.refinex.io/transparency) shows this approach in practice. Today we generated 1 active signal with average confidence 0.85. The suppression rate of 48.9% over the past two hours demonstrates how much filtering happens before signals reach the API layer.

[View the live signal log →](https://www.refinex.io/transparency)

---
*Keith Brown*
*CTO, RefineX*