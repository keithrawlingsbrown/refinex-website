---
title: "Why /signals/active Returns One Action, Not a List"
meta_title: "API Design: Single Action vs List Returns for Infrastructure"
date: "2026-03-15"
description: "RefineX /signals/active returns one highest-confidence action with fallback, not a list. Why autoscalers benefit from opinionated APIs that make exactly one recommendation."
slug: "api-design-single-action-vs-list-returns"
tags: ['aws', 'spot', 'api-design']
schema:
  type: Article
  datePublished: "2026-03-15"
  author: "Keith Brown"
  publisher: "RefineX"
canonical: "https://www.refinex.io/blog/api-design-single-action-vs-list-returns"
published: true
---

## What is Single-Action API Design?

Most infrastructure APIs return all available data and let the caller decide what to do with it. The RefineX `/signals/active` endpoint does the opposite: it returns exactly one action recommendation with the highest confidence score, plus a fallback strategy. Instead of shipping a list of spot arbitrage opportunities across multiple availability zones, we pick the best one and tell you specifically what to do.

This design choice matters because autoscalers need decisions, not data. When your Kubernetes cluster autoscaler calls our API to decide whether to launch spot instances, it gets back a single JSON response with `action: "buy_spot"` for us-east-1a and m5.large, or `action: "fallback_on_demand"` if no spot opportunities meet our confidence threshold.

## How RefineX Selects the Single Action

Our signal scoring runs deterministic calculations across all AWS regions and instance families we monitor. Each signal gets a confidence score between 0.0 and 1.0 based on current spot pricing, interruption risk models, and expected savings calculations. The `/signals/active` endpoint queries the signals table and returns the record with the highest confidence score that has not expired.

The selection logic lives in our SignalRepository service, which queries active signals where `is_active = true` and `expires_at > NOW()`, then sorts by confidence descending. The first result becomes your single action recommendation. If no signals meet the minimum confidence threshold of 0.5, the endpoint returns a fallback action instead.

Every signal record in our database includes an `action` field that contains one of four values: `buy_spot`, `migrate_spot`, `wait`, or `fallback_on_demand`. These actions come from our deterministic scoring system that analyzes the current spot market conditions and calculates expected value for each instance family and availability zone combination.

## Why Autoscalers Prefer Single Recommendations

Autoscaling systems work best with clear instructions. When the Cluster Autoscaler needs to provision new nodes, it calls external APIs to gather information about resource availability and cost optimization opportunities. APIs that return lists of possibilities force the autoscaler to implement its own decision logic on top of the external data.

Our approach inverts this relationship. We handle the decision logic and return a single recommendation that the autoscaler can act on immediately. The response includes the specific instance type, availability zone, and action, plus the confidence score so the calling system can decide whether to trust our recommendation.

This design also prevents decision paralysis in automated systems. When you have five different spot arbitrage opportunities with confidence scores between 0.7 and 0.9, your autoscaler needs additional logic to pick one. We make that choice based on our understanding of spot market dynamics and return the highest-value option.

## How the Fallback Parameter Works

The `/signals/active` endpoint accepts a `fallback` query parameter that determines what happens when no high-confidence spot opportunities exist. Setting `fallback=on_demand` tells our API to return `action: "fallback_on_demand"` when spot markets look risky. Setting `fallback=wait` returns `action: "wait"` instead, which tells your autoscaler to defer scaling decisions for a few minutes.

This parameter exists because different workloads have different tolerance for delays. Batch processing jobs can usually wait for better spot prices, while user-facing applications might need to launch on-demand instances immediately when spot markets turn volatile.

Our current suppression rate of 29.2% means that nearly one-third of potential signals get blocked before delivery because they fail to meet our confidence requirements. The fallback parameter ensures your autoscaler gets actionable guidance even when we suppress the primary signal.

## Implementation Details from Production

Our signals table stores each recommendation with a TTL value and `expires_at` timestamp. Most spot arbitrage signals expire within 15 minutes because pricing data becomes stale quickly. The `/signals/active` endpoint respects these expiration windows and will not return signals that have passed their useful lifetime.

The confidence scoring happens in our deterministic pipeline, which analyzes current spot pricing from AWS APIs, historical interruption patterns, and on-demand price comparisons. Every signal includes an `expected_value` JSON field with calculations like `savings_percent` and `savings_usd_per_hour` that inform the confidence score.

We track every suppressed signal in our public transparency log at [https://www.refinex.io/transparency](https://www.refinex.io/transparency), which shows both delivered and blocked recommendations. This audit trail lets you verify that our single-action approach actually delivers the highest-confidence opportunities rather than arbitrary selections.

The current market state shows 50 active signals with an average confidence of 0.85, which means our single-action endpoint has high-quality options to choose from. When market conditions deteriorate and confidence scores drop, the fallback parameter ensures your infrastructure gets clear guidance about alternative actions.

[View the live signal log →](https://www.refinex.io/transparency)

---
*Keith Brown*
*CTO, RefineX*