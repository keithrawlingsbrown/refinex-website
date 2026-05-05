---
title: "Why /signals/active Returns One Action, Not a List"
meta_title: "API Design: Single Action vs List - RefineX Spot Signals"
date: "2026-05-05"
description: "RefineX /signals/active returns one highest-confidence action with fallback, not a list. How opinionated APIs serve autoscalers better than data dumps."
slug: "signals-active-single-action-api-design"
tags: ['aws', 'spot', 'api-design']
schema:
  type: Article
  datePublished: "2026-05-05"
  author: "Keith Brown"
  publisher: "RefineX"
canonical: "https://www.refinex.io/blog/signals-active-single-action-api-design"
published: false
---

Most infrastructure APIs return all the data and let the caller decide. The RefineX `/signals/active` endpoint does the opposite: it returns a single, highest-confidence action with a fallback strategy. This design choice reflects a core principle about what signal intelligence should be.

## What is an Opinionated API Response?

An opinionated API response makes exactly one recommendation per call instead of returning raw data. When you query `/signals/active` for us-east-1 m5.large instances, you get back one action: `buy_spot`, `migrate_spot`, `wait`, or `fallback_on_demand`. You do not get a list of all possible actions with their respective confidence scores.

This approach differs from typical cloud APIs that return comprehensive datasets. AWS EC2 DescribeSpotPriceHistory returns every price point for every instance type in a region. The caller parses hundreds of records to make one decision. We invert this pattern.

## How Single-Action Responses Work

Our signal scoring engine evaluates multiple factors for each instance family and availability zone combination. The confidence calculation uses current spot pricing, historical interruption patterns, and demand signals from AWS capacity trends. This produces a confidence score between 0.0 and 1.0 for each potential action.

The `/signals/active` endpoint selects the action with the highest confidence score above our suppression threshold. If no action meets the minimum confidence requirement, the endpoint returns the fallback action specified in the request parameters. The fallback parameter accepts `wait`, `fallback_on_demand`, or `suppress_signal`.

Here's the critical implementation detail: when multiple signals exist for the same region and instance type, we return only the highest-confidence recommendation. The other signals are logged but not delivered. This prevents decision paralysis in automated systems that need to act on exactly one signal per resource.

## Why Autoscalers Prefer Single Recommendations

Kubernetes cluster autoscalers and AWS Auto Scaling Groups operate on binary decisions. Scale up or scale down. Launch spot instances or launch on-demand instances. These systems cannot easily process a ranked list of recommendations with confidence intervals.

Consider a Kubernetes autoscaler receiving spot signals for three availability zones in us-west-2. If our API returned all available signals, the autoscaler would need additional logic to rank, filter, and select one action. This pushes signal interpretation logic into every consuming system.

By returning one action, we move that complexity into our signal processing layer where it belongs. The autoscaler receives `buy_spot` with a confidence of 0.87 and can act immediately. The decision logic stays centralized and auditable.

## Fallback Parameters and Conservative Defaults

The fallback parameter handles cases where no signal meets our confidence threshold. When you request signals for an instance type with high interruption risk, we might suppress all buy_spot recommendations. The fallback determines what action to return instead.

Setting fallback to `wait` returns a signal telling the autoscaler to defer scaling decisions for this resource type. Setting fallback to `fallback_on_demand` returns a signal recommending on-demand instances when spot signals are suppressed. The `suppress_signal` option returns no signal at all, letting the consuming system use its default behavior.

This parameter exists because different workloads have different risk tolerances. A batch processing job might prefer `wait` to avoid unnecessary costs. A user-facing service might prefer `fallback_on_demand` to maintain availability. The API accommodates both approaches without changing our core signal scoring.

## The Suppression Decision as Product

Every signal we suppress appears in our public transparency log. When we suppress a buy_spot signal because confidence dropped below 0.5, that suppression is logged with the reason and timestamp. This creates an auditable record of what signals we chose not to deliver.

The suppression rate over the last two hours stands at 45.5%, meaning we blocked nearly half of all potential signals before delivery. This high suppression rate is not a bug in our system. It represents disciplined signal curation that prevents low-confidence recommendations from reaching production systems.

You can verify this claim by checking our live signal data where 8 active signals are currently delivered while many more were evaluated and suppressed. The delivered signals average 0.85 confidence, well above our minimum threshold.

## Single Actions Enable Trust

Infrastructure teams trust systems that make clear, accountable decisions. When `/signals/active` returns `migrate_spot` with 0.91 confidence, that recommendation is traceable to specific pricing data and interruption patterns. The signal scoring path uses deterministic calculations without LLM involvement.

Returning a single action with full context builds more trust than returning multiple options with less context each. The tradeoff is clear: we sacrifice comprehensiveness for decisiveness. The result is an API that serves production autoscaling decisions rather than data exploration workflows.

[View the live signal log →](https://www.refinex.io/transparency)

---
*Keith Brown*
*CTO, RefineX*