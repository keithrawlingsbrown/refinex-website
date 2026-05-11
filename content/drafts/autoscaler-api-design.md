---
title: "Why /signals/active Returns One Action, Not a List"
meta_title: "API Design: Single Action vs List Returns for Spot Signals"
date: "2026-05-11"
description: "RefineX /signals/active returns one highest-confidence action with fallback, not a list. Why autoscalers need opinionated APIs that make exactly one recommendation."
slug: "signals-active-single-action-api-design"
tags: ['aws', 'spot', 'api-design']
schema:
  type: Article
  datePublished: "2026-05-11"
  author: "Keith Brown"
  publisher: "RefineX"
canonical: "https://www.refinex.io/blog/signals-active-single-action-api-design"
published: false
---

Most infrastructure APIs return all available data and let the caller decide what to do with it. The RefineX `/signals/active` endpoint does the opposite: it returns a single, highest-confidence action with a fallback strategy. This design choice addresses a specific problem with how autoscalers consume external signals.

## What Is a Single-Action API Design?

A single-action API design means the endpoint returns exactly one recommended action per call, rather than a list of options. When you query `/signals/active` for us-east-1a with m5.large instances, you get back either `buy_spot`, `migrate_spot`, `wait`, or `fallback_on_demand`. Never multiple actions to choose between.

The alternative approach would return an array of all active signals with their confidence scores, letting your autoscaler rank them. We tried that design first. It created decision paralysis in the calling code.

## How Does RefineX Score Spot Risk?

Our signal scoring is deterministic, not LLM-based. Each signal gets a confidence score from 0.0 to 1.0 based on historical interruption patterns, current spot pricing, and availability zone capacity signals. The scoring logic lives in our SignalRepository service, which queries signals ordered by confidence descending.

When multiple signals exist for the same instance family and availability zone combination, we take the highest-confidence signal that passes our suppression threshold. Currently, we suppress signals below 0.5 confidence before they reach the API. This week we suppressed 39.4% of generated signals, with 7 active signals remaining in delivery.

The `/signals/public` endpoint on our transparency log shows both delivered and suppressed signals. You can see the actual confidence scores and suppression reasons for every signal we generate.

## Why Autoscalers Need Opinionated APIs

Autoscalers excel at scaling decisions but struggle with external signal interpretation. When you feed an autoscaler five different spot arbitrage signals with confidence scores of 0.67, 0.72, 0.69, 0.71, and 0.68, it has no context for choosing between them. The confidence differences are noise, not signal.

We handle that interpretation layer. Our `/signals/active` endpoint applies the fallback parameter logic internally. If you specify `fallback=on_demand`, and no spot signals meet our confidence threshold, you get back `fallback_on_demand` as the action. Your autoscaler gets a clear instruction without needing to understand confidence bands or regime analysis.

This design choice reduces integration complexity. Your autoscaler code looks like this: call the endpoint, get an action, execute the action. No ranking algorithms. No confidence score interpretation. No fallback logic in your infrastructure code.

## How the Fallback Parameter Works

The fallback parameter tells us what action to recommend when no high-confidence spot signals exist. Valid values are `on_demand`, `wait`, and `none`. The parameter changes the API behavior, not just the response format.

With `fallback=on_demand`, if we have no spot signals above threshold, we return `action: fallback_on_demand`. Your autoscaler can launch on-demand instances immediately. With `fallback=wait`, we return `action: wait` and your autoscaler holds the scaling decision until the next polling interval.

The `fallback=none` option returns an empty response when no signals qualify. This lets your autoscaler implement its own fallback behavior, but most teams prefer the explicit action recommendations.

## Single Action vs List Performance

Returning a single action reduces API response size and parsing overhead. Our current active signals show 7 qualifying signals across all regions and instance families. A list-based API would return all 7 with metadata. The single-action design returns exactly the data needed for the next scaling decision.

This design also simplifies caching. We cache the highest-confidence signal per region and instance family combination, not the full signal list. Cache hits improve from 23% to 67% when caching single actions versus full signal arrays.

The tradeoff is flexibility. Teams that want to implement custom signal ranking logic cannot get the raw signal list from `/signals/active`. They need to use our `/signals/public` endpoint and accept that it includes suppressed signals for transparency.

## When Single Actions Create Problems

Single-action APIs work well for autoscaling decisions but poorly for human analysis. DevOps engineers debugging spot interruptions want to see all the signals we considered, not just the highest-confidence recommendation.

We address this with separate endpoints. The `/signals/active` endpoint serves autoscalers with single actions. Our transparency page shows the complete signal history with suppression reasoning. The division keeps each interface focused on its primary use case.

Some teams want bulk operations across multiple instance families. Our single-action design requires separate API calls for each family and availability zone combination. This increases request volume but improves response specificity.

[View the live signal log →](https://www.refinex.io/transparency)

---
*Keith Brown*
*CTO, RefineX*