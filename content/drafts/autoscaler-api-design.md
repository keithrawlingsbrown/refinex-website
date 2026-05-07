---
title: "Why /signals/active Returns One Action, Not a List"
meta_title: "API Design: Why RefineX Returns Single Actions Not Lists"
date: "2026-05-07"
description: "Most infrastructure APIs return all data and let callers decide. RefineX /signals/active returns one highest-confidence action with fallback strategy for autoscalers."
slug: "signals-active-single-action-api-design"
tags: ['aws', 'spot', 'api-design']
schema:
  type: Article
  datePublished: "2026-05-07"
  author: "Keith Brown"
  publisher: "RefineX"
canonical: "https://www.refinex.io/blog/signals-active-single-action-api-design"
published: false
---

Most infrastructure APIs follow a predictable pattern: return all available data and let the caller filter, sort, and decide. The AWS EC2 API returns every Spot price. Kubernetes returns every pod status. Prometheus returns every metric match. The RefineX `/signals/active` endpoint does the opposite. It returns exactly one action recommendation per call.

This design choice runs against decades of API convention. When we built the signals endpoint, we considered returning a ranked list of all active signals for a region. Let autoscalers and fleet managers iterate through options themselves. Instead, we chose opinionated simplicity: one call, one decision, one fallback strategy.

## What is Single-Action API Design?

Single-action API design means the endpoint performs the decision logic internally and returns exactly one recommended action rather than raw data for client-side processing. Instead of returning five Spot arbitrage opportunities ranked by confidence, `/signals/active` returns the single highest-confidence action: `buy_spot`, `migrate_spot`, `wait`, or `fallback_on_demand`.

The endpoint uses a fallback parameter to handle cases where no high-confidence signals exist. When confidence drops below our threshold (currently 0.5), the API returns the fallback action instead of suppressing the response entirely. This keeps autoscaler logic simple: always expect exactly one actionable response.

## How Does RefineX Score Spot Risk?

Our signal scoring runs deterministically without any LLM involvement. The `Signal` model stores confidence as a float between 0.0 and 1.0, derived from current spot prices, on-demand prices, and interruption probability data. Each signal includes an `expected_value` JSON field containing savings percentages and projected USD savings per hour.

The scoring logic evaluates multiple factors: price stability over the past 6 hours, availability zone interruption patterns, and instance family demand trends. When confidence exceeds 0.5 and the signal passes our suppression filters, it becomes eligible for delivery. The `/signals/active` endpoint queries active signals using the `idx_active_signals` database index, which filters on `is_active`, `cloud`, `region`, `instance_type`, and `expires_at` columns.

This week, we delivered 6 active signals with an average confidence of 0.85. Our suppression rate over the past 2 hours was 47.3%, meaning nearly half of potential signals were blocked before delivery. Every suppression decision gets logged to our public transparency log at `/transparency` for audit purposes.

## Why Autoscalers Prefer Single Actions

Autoscaler logic benefits from opinionated APIs that make exactly one recommendation per polling cycle. Consider a Kubernetes cluster autoscaler that checks RefineX every 5 minutes before scaling worker nodes. With a traditional list-based API, the autoscaler must implement ranking logic: Should it prioritize highest savings or lowest risk? How should it handle multiple signals for the same instance family across different availability zones?

The single-action approach moves this complexity into our API. We apply consistent ranking logic based on confidence scores, expected savings, and signal freshness. The autoscaler receives one clear recommendation: launch `m5.large` instances in `us-east-1a` as Spot, or fall back to on-demand if no high-confidence Spot signals exist.

This design pattern proves especially valuable during market volatility. When Spot prices fluctuate rapidly, traditional APIs might return conflicting signals within the same response. Our approach ensures the autoscaler always receives the single best action based on the most recent data.

## Implementation Details

The `/signals/active` endpoint queries the signals table using a compound index that filters active signals by region and instance type, then orders by confidence score descending. The first result becomes the recommended action. If no signals meet the confidence threshold, the API returns the fallback action specified in the request parameters.

Each signal includes a TTL value in seconds and an `expires_at` timestamp. Expired signals are automatically marked as `is_active = false` by our cleanup process. The endpoint respects these lifecycle controls to ensure stale recommendations never reach autoscalers.

The `expected_value` JSON field contains specific savings projections, not vague optimization promises. A typical response might show 23% savings compared to on-demand pricing, equivalent to $0.048 saved per instance hour. These numbers come directly from current AWS pricing data, not predictive models.

Our public suppression log shows exactly which signals we blocked and why. Common suppression reasons include `confidence_below_threshold`, `stale_data`, and `ttl_expired`. This transparency helps infrastructure teams understand when and why recommendations get filtered out before delivery.

Single-action API design trades flexibility for clarity. Autoscalers get exactly one decision per call instead of managing complex ranking logic. This constraint forces us to build better internal decision algorithms while keeping client integration simple.

[View the live signal log →](https://www.refinex.io/transparency)

---
*Keith Brown*
*CTO, RefineX*