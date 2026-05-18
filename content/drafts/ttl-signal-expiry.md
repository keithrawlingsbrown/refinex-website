---
title: "Why Every Spot Signal Has an Expiry Date"
meta_title: "Spot Signal TTL: Why AWS Recommendations Expire Fast"
date: "2026-05-18"
description: "Every RefineX spot signal expires within minutes. Here's why stale pricing data makes recommendations worthless and how TTL prevents bad decisions."
slug: "spot-signal-ttl-expiry-aws-pricing"
tags: ['aws', 'spot', 'signal-design']
schema:
  type: Article
  datePublished: "2026-05-18"
  author: "Keith Brown"
  publisher: "RefineX"
canonical: "https://www.refinex.io/blog/spot-signal-ttl-expiry-aws-pricing"
published: false
---

A spot recommendation built on 15-minute-old pricing data is not advice. It is historical trivia. Every signal RefineX delivers carries an expiry timestamp, and when that timestamp passes, the signal is automatically suppressed. This week we expired 312 signals that would have otherwise shipped with stale data.

## What Is Signal TTL?

Signal TTL (time-to-live) is the maximum age a spot market signal remains valid before automatic expiration. Each signal includes a `ttl` field in seconds and an `expires_at` timestamp. When the expiry time passes, the signal is marked inactive and removed from delivery, regardless of how attractive the underlying cost spread appears.

Our expiration scheduler runs every 60 seconds, scanning all active signals for TTL violations. The process is deterministic and automatic. No human intervention decides what expires. The timestamp decides.

## How Does RefineX Handle Signal Expiration?

The expiration system operates through a scheduled worker that queries the database every minute. When signals pass their expiry timestamp, they are marked inactive and logged. The system tracks expired signal counts and logs the operation for audit purposes.

Here's how the process works. The scheduler identifies signals where `expires_at` is earlier than the current timestamp. These signals are marked `is_active = False` in a single database transaction. The expired count is logged with structured metadata. Cache entries naturally expire through their own TTL mechanism without manual invalidation.

The expiration logic is conservative. When we cannot determine signal freshness or when pricing data timestamps are missing, we default to shorter TTL values. A signal with questionable data freshness gets a 3-minute TTL instead of the standard 8-minute window.

## Why Stale Data Makes Spot Signals Dangerous

AWS spot pricing changes every few minutes across different availability zones and instance families. A signal recommending m5.large in us-east-1a based on pricing data from 12 minutes ago is making assumptions about market conditions that no longer exist.

Consider this scenario. At 14:22 UTC, spot pricing for m5.large in us-east-1a shows $0.042 per hour against an on-demand price of $0.096. The spread suggests 56% savings. But by 14:35 UTC, spot pricing has moved to $0.089 per hour. The savings calculation is now 7%. The original signal would recommend an action based on savings that vanished 13 minutes ago.

We suppress signals derived from stale inputs rather than delivering them with disclaimers. This is not caution. This is architecture. Bad data creates bad decisions, and bad decisions in production cost more than missing opportunities.

## When TTL Expiry Rates Spike

Signal expiry rates increase during periods of rapid AWS pricing changes. Regional repricing events, capacity adjustments, and demand spikes all cause pricing data to age faster than usual. During these periods, our TTL expiry rate can reach 60% or higher as we prioritize signal accuracy over signal volume.

Last Tuesday, during a pricing adjustment in us-west-2, we expired 47 signals within a 2-hour window. These signals showed attractive spreads based on pre-adjustment pricing data. Delivering them would have recommended actions based on prices that no longer existed.

The system logged each expiry with the reason "stale_data" and the time elapsed since the underlying pricing data was collected. This creates an audit trail that shows why signals were suppressed rather than delivered. You can review these decisions on our [transparency log](https://www.refinex.io/transparency).

## TTL as a Quality Gate

TTL expiration is a quality gate, not a limitation. We prefer to suppress a signal than deliver advice based on outdated information. This creates gaps in coverage but ensures the signals we do deliver reflect current market conditions.

The public signal feed shows both delivered and suppressed signals with expiry reasons. When you see "ttl_expired" as a suppression reason, that signal contained pricing data that aged beyond our freshness threshold. The underlying cost calculation might have been attractive, but the data supporting it was no longer reliable.

Our current suppression rate sits at 47.6% over the past 2 hours. This means we are blocking nearly half of potential signals due to freshness, confidence, or data quality issues. Each blocked signal represents a decision to prioritize accuracy over volume.

## Conservative Defaults Are the Product

Everything in RefineX defaults to suppression. Signals expire quickly. Confidence thresholds are high. Data quality requirements are strict. These are not bugs to be fixed through optimization. They are features that define the product.

When AWS spot markets move quickly, signal TTL prevents us from giving advice based on market conditions that no longer exist. The cost of missing an opportunity is lower than the cost of acting on bad information. This tradeoff shapes every decision in the signal lifecycle.

[View the live signal log →](https://www.refinex.io/transparency)

---
*Keith Brown*
*CTO, RefineX*