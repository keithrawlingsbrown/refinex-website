---
title: "Why /signals/active Returns One Action, Not a List"
meta_title: "API Design: Why /signals/active Returns Single Action Not List"
date: "2026-05-25"
description: "Most infrastructure APIs return all data and let callers decide. RefineX /signals/active returns one highest-confidence action with fallback strategy for autoscalers."
slug: "signals-active-single-action-api-design"
tags: ['aws', 'spot', 'api-design']
schema:
  type: Article
  datePublished: "2026-05-25"
  author: "Keith Brown"
  publisher: "RefineX"
canonical: "https://www.refinex.io/blog/signals-active-single-action-api-design"
published: false
---

Most infrastructure APIs return arrays. Query for EC2 instances, get a list. Ask for CloudWatch metrics, get time series data. The caller processes everything and decides what to do. RefineX /signals/active breaks this pattern. It returns exactly one action per call with a fallback parameter that tells the system what to do when no high-confidence signal exists.

## What Is Single-Action API Design?

Single-action API design means the endpoint makes one recommendation per request instead of returning raw data for the caller to process. When an autoscaler calls /signals/active for m5.large in us-east-1a, it gets back either "buy_spot", "migrate_spot", "wait", or the fallback action. No arrays. No confidence scores to interpret. One decision.

The fallback parameter controls what happens when we suppress all signals due to low confidence. Set fallback=on_demand and the API returns {"action": "fallback_on_demand"} when no Spot signal meets our threshold. Set fallback=wait and it returns {"action": "wait"}. The autoscaler implements the action without evaluating confidence bands or interpreting market conditions.

## How Does RefineX Score Spot Risk?

Our signal scoring runs deterministically without LLM involvement. The system evaluates current_spot_price against on_demand_price, calculates expected savings in the expected_value JSON field, and assigns a confidence score between 0.0 and 1.0. Every signal gets an action field set to one of four values: buy_spot, migrate_spot, wait, or fallback_on_demand.

The Signal model stores confidence as a Float column with the action as a String column. When confidence falls below 0.5, we suppress the signal before delivery. The suppression logic examines confidence thresholds, data staleness, and TTL expiration. Suppressed signals never reach the /signals/active endpoint, which means callers only see signals we trust.

Current market conditions show 2 active signals with 48.1% suppression rate over the past two hours. The average confidence of delivered signals is 0.85, meaning we block roughly half of all generated signals to maintain quality.

## Why Autoscalers Need Opinionated APIs

Autoscaling systems make rapid decisions about instance provisioning. A Kubernetes cluster autoscaler evaluating node types needs clear direction, not confidence intervals to interpret. When pod scheduling requires additional capacity, the system calls /signals/active with the target instance family and availability zone. Getting back {"action": "buy_spot", "instance_type": "m5.large", "region": "us-east-1", "availability_zone": "us-east-1a"} lets the autoscaler proceed immediately.

The alternative forces every autoscaler to implement the same decision logic. Parse confidence scores, evaluate market conditions, handle edge cases where no signals exist. Single-action design moves this complexity into the API where we can test it once instead of debugging it across multiple caller implementations.

We see this pattern when teams integrate RefineX with AWS Auto Scaling Groups or Kubernetes cluster autoscalers. The integration code becomes a simple action dispatcher rather than a complex signal evaluation engine. The autoscaler calls our endpoint, matches the returned action in a switch statement, and executes the appropriate scaling behavior.

## Handling the Absence of Signals

The fallback parameter solves the empty response problem. Traditional APIs return empty arrays when no data meets the criteria. The caller must detect this condition and implement default behavior. Our fallback parameter makes the default explicit in the API contract.

When market conditions prevent us from generating high-confidence Spot recommendations, we suppress all signals for that instance family and region combination. Without fallback logic, /signals/active would return an error or empty response. The autoscaler would need error handling code to decide between waiting for better signals or proceeding with On-Demand instances.

Setting fallback=on_demand in the API call eliminates this complexity. The endpoint always returns an action, either from a high-confidence signal or from the fallback strategy. The autoscaler implements the action without checking for error conditions or empty responses.

Our [transparency log](https://www.refinex.io/transparency) shows both delivered and suppressed signals. The public feed reveals how often we choose suppression over delivery, demonstrating the conservative defaults that make single-action responses reliable.

## Implementation Details

The /signals/active endpoint queries the Signal table for active records matching the requested region and instance_type. The query filters by is_active=True and expires_at > current_time. When multiple signals match, we return the one with highest confidence. When no signals meet our thresholds, we return the fallback action.

The confidence threshold lives in the suppression logic, not the API endpoint. Signals below 0.5 confidence get is_active set to False before the endpoint query runs. This separation means /signals/active never sees low-confidence signals, simplifying the response logic to picking the best available option or returning the fallback.

Each signal includes expected_value JSON with savings_percent and other metrics, but /signals/active strips this complexity. The caller gets the action and basic instance details. Teams that need the underlying data can query other endpoints, but the primary integration point stays simple.

[View the live signal log →](https://www.refinex.io/transparency)

---
*Keith Brown*
*CTO, RefineX*