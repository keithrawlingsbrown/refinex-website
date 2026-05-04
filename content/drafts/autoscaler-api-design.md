---
title: "Why /signals/active Returns One Action, Not a List"
meta_title: "API Design: Why RefineX Returns One Action Per Call"
date: "2026-05-04"
description: "Most infrastructure APIs return all available data. RefineX /signals/active returns one highest-confidence action with fallback strategy for autoscalers."
slug: "api-design-single-action-response"
tags: ['aws', 'spot', 'api-design']
schema:
  type: Article
  datePublished: "2026-05-04"
  author: "Keith Brown"
  publisher: "RefineX"
canonical: "https://www.refinex.io/blog/api-design-single-action-response"
published: false
---

Most infrastructure APIs follow the same pattern: return all available data and let the caller filter. Query for EC2 instances, get a JSON array of every instance. Ask for CloudWatch metrics, receive every data point in the time range. The RefineX `/signals/active` endpoint does the opposite. It returns exactly one action with a fallback strategy, not a list of possibilities.

## What Is Single-Action API Design?

Single-action API design means the endpoint makes exactly one recommendation per call. When an autoscaler queries `/signals/active` for `us-west-2` and `m5.large`, it receives either `buy_spot`, `migrate_spot`, `wait`, or `fallback_on_demand`. Never a list of options ranked by confidence. The API has already selected the highest-confidence signal above our suppression threshold and chosen the action.

This decision emerged from watching how autoscalers actually consume external signals. They need one clear instruction per scaling decision, not multiple competing recommendations to evaluate.

## How RefineX Selects the Single Action

Our signal scoring runs deterministically across AWS Spot price history and interruption patterns. Each signal receives a confidence score from 0.0 to 1.0, plus an action recommendation based on current market conditions. When `/signals/active` executes, it queries active signals for the requested region and instance type, then applies our selection algorithm.

The code in `src/api/routes/signals.py` shows this filtering process. We query the Signal model for `is_active=True` records that match the region and instance type parameters. The database returns signals ordered by confidence score descending. We take the first signal above our confidence threshold, which currently sits at 0.5 for most signal types.

If no signals meet the confidence requirement, we return the fallback action specified in the request parameter. This prevents autoscalers from receiving empty responses during low-confidence periods.

## Why Autoscalers Need Opinionated APIs

Kubernetes Horizontal Pod Autoscaler and AWS Auto Scaling Groups operate on single scaling decisions. When pod CPU crosses 70%, the autoscaler calculates target replica count and issues one scaling command. It does not evaluate multiple CPU thresholds simultaneously.

External signal APIs should match this decision pattern. If RefineX returned five Spot arbitrage signals with confidence scores between 0.6 and 0.9, the autoscaler would need additional logic to select one. This pushes signal evaluation complexity into every integration instead of centralizing it in our API.

We handle this complexity once in our signal selection algorithm. The autoscaler receives `buy_spot` for `m5.large` in `us-west-2a` with confidence 0.87. It can act immediately or ignore the signal based on its own policies.

## How Fallback Parameters Work

The fallback parameter solves the empty response problem. During periods when all signals fall below confidence thresholds, `/signals/active` could return nothing. Autoscalers would need error handling for null responses, plus logic to determine safe default actions.

Instead, every request includes a fallback action: `wait`, `fallback_on_demand`, or `maintain_current`. When we suppress all active signals due to low confidence, the API returns the fallback with a confidence score of 0.0 and suppression metadata explaining why no higher-confidence signals qualified.

Our [transparency log](https://www.refinex.io/transparency) shows this suppression pattern clearly. During the past two hours, we suppressed 47% of generated signals. Those API calls received fallback responses instead of empty JSON.

## The Tradeoff: Simplicity vs Flexibility

Single-action responses trade flexibility for integration simplicity. Advanced users might want to see all available signals and implement custom selection logic. A trading firm might prefer the second-highest confidence signal if it targets a different availability zone for geographic distribution.

We chose autoscaler-first design because that represents 80% of our expected integrations. Teams building custom Spot fleet managers can make multiple API calls with different region and instance type parameters to gather broader signal sets.

The performance cost is minimal. Our Redis cache handles sub-100ms response times for single signal lookups. Making three API calls to cover three availability zones adds 200ms total latency, which fits comfortably within autoscaler decision cycles.

## Implementation Details

The Signal model in `src/models/signal.py` stores each signal with its confidence score, action recommendation, and TTL. Our database index on `is_active`, `cloud`, `region`, `instance_type`, and `expires_at` supports fast lookups for the `/signals/active` endpoint.

We calculate TTL based on signal type and market volatility. Spot arbitrage signals typically expire within 10 minutes due to price movement. Interruption risk signals can remain valid for 2-4 hours since capacity patterns change more slowly.

When signals expire, we set `is_active=False` instead of deleting records. This preserves the complete signal history for our public audit trail while preventing expired signals from affecting live API responses.

[View the live signal log →](https://www.refinex.io/transparency)

---
*Keith Brown*
*CTO, RefineX*