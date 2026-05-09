---
title: "Why /signals/active Returns One Action, Not a List"
meta_title: "API Design: Single Action vs List - RefineX /signals/active"
date: "2026-05-09"
description: "RefineX /signals/active returns one highest-confidence action with fallback, not a list. How opinionated APIs simplify autoscaler integration."
slug: "signals-active-single-action-api-design"
tags: ['aws', 'spot', 'api-design']
schema:
  type: Article
  datePublished: "2026-05-09"
  author: "Keith Brown"
  publisher: "RefineX"
canonical: "https://www.refinex.io/blog/signals-active-single-action-api-design"
published: false
---

Most infrastructure APIs return all available data and let the caller decide what to do with it. The RefineX `/signals/active` endpoint does the opposite: it returns exactly one action with a confidence score and optional fallback strategy. When you call it for `us-east-1a` and `m5.large`, you get either `buy_spot`, `migrate_spot`, `wait`, or `fallback_on_demand`. Never a list.

This design decision shapes how autoscalers integrate with spot market intelligence. Instead of parsing multiple signals and implementing decision logic, the autoscaler receives one clear recommendation per API call.

## How Single Action Selection Works

Our signal scoring runs deterministically across all active AWS EC2 spot combinations. The current market shows 8 active signals with an average confidence of 0.85. When `/signals/active` receives a request for a specific region and instance type, it queries the Signal model for the highest-confidence active signal matching those parameters.

The database query orders by confidence descending and takes the first result. If multiple signals exist for the same instance type in the same availability zone, the one with the highest confidence wins. Signals below our confidence threshold get suppressed before they reach this endpoint. Today's suppression rate sits at 44.4% over the last two hours.

The returned action maps directly to autoscaler behavior. `buy_spot` means the current price and interruption risk support launching new spot instances. `migrate_spot` suggests moving existing workloads to this instance type for better economics. `wait` indicates current conditions favor delaying spot launches. `fallback_on_demand` signals that spot risk exceeds the savings threshold for this workload profile.

## Why Not Return Multiple Options

Infrastructure teams initially expect APIs to return ranked lists of options. This matches how AWS pricing APIs work or how kubectl returns multiple pod candidates. We tested this approach during early development and found three problems.

First, decision paralysis in automated systems. When an autoscaler receives five valid spot options with confidence scores between 0.72 and 0.89, it needs additional logic to pick one. That logic duplicates our internal scoring and introduces inconsistency across different autoscaler implementations.

Second, stale decision making. Lists encourage callers to cache results and iterate through options locally. Spot markets change faster than most caching strategies. By the time the autoscaler tries the third option from a cached list, market conditions may have shifted enough to invalidate the original scoring.

Third, complexity in fallback handling. Our `fallback` parameter tells the API what to return if no spot signals meet the confidence threshold. When the primary recommendation is `buy_spot` but fallback is `on_demand`, the autoscaler gets clear instructions: try spot first, use on-demand if spot fails. Lists complicate this fallback chain.

## Fallback Parameter Design

The fallback parameter accepts `on_demand`, `wait`, or `none`. This parameter only applies when we would otherwise return no signal due to low confidence or stale data. It does not override high-confidence signals.

When fallback is `on_demand`, the API returns `{"action": "fallback_on_demand", "confidence": 0.0, "reason": "no_qualifying_spot_signals"}` instead of an empty response. This keeps autoscaler logic simple. The autoscaler always gets an action, never null responses that require additional error handling.

When fallback is `wait`, the API returns `{"action": "wait", "confidence": 0.0, "reason": "no_qualifying_spot_signals"}`. This works well for batch workloads that can delay launches until spot conditions improve.

When fallback is `none`, the API returns a 204 status with no body. This explicit empty response lets sophisticated callers implement their own fallback logic while maintaining clear API semantics.

## Integration With Kubernetes Autoscalers

Kubernetes cluster autoscaler integration benefits from single-action responses. The autoscaler polls `/signals/active` before scaling decisions. Instead of implementing complex spot market analysis, it receives one recommendation: scale using spot, migrate to different instance types, wait for better conditions, or fall back to on-demand.

The autoscaler webhook calls our endpoint with the current node group's instance type and target availability zone. Our response includes the action, confidence score, expected savings percentage, and TTL. The autoscaler caches this decision until TTL expires, then polls again.

This pattern reduces the integration from hundreds of lines of spot market logic to a single API call with straightforward action mapping. The autoscaler trusts our confidence scoring and executes the recommended action. We handle the complexity of market analysis, interruption prediction, and pricing arbitrage.

Current active signals show 3 interruption-related signals out of 8 total. Our deterministic scoring evaluates each signal's evidence without LLM involvement. Suppressed signals appear in our [transparency log](https://www.refinex.io/transparency) with specific reasons for the suppression decision.

Opinionated APIs make fewer decisions for the caller, not more. By returning one action instead of comprehensive data, `/signals/active` eliminates decision complexity from autoscaler integrations while maintaining full transparency about the reasoning behind each recommendation.

[View the live signal log →](https://www.refinex.io/transparency)

---
*Keith Brown*
*CTO, RefineX*