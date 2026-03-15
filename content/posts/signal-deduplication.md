---
title: "Why We Deduplicate Spot Signals at the Detection Layer"
meta_title: "Spot Signal Deduplication: Detection Layer Logic"
date: "2026-03-14"
description: "RefineX deduplicates spot arbitrage signals at detection to prevent autoscaler noise. Six-hour clustering window updates existing signals rather than creating duplicates."
slug: "spot-signal-deduplication-detection-layer"
tags: ['aws', 'spot', 'signal-design']
schema:
  type: Article
  datePublished: "2026-03-14"
  author: "Keith Brown"
  publisher: "RefineX"
canonical: "https://www.refinex.io/blog/spot-signal-deduplication-detection-layer"
published: true
---

## What Is Signal Deduplication in Spot Markets?

Signal deduplication prevents multiple identical spot arbitrage signals from reaching the same autoscaling system within a short time window. When RefineX detects that c7g.xlarge in us-east-1a offers 70% savings over on-demand pricing, we check whether an active signal already exists for that exact combination of cloud, region, availability zone, and instance type. If one exists, we update the existing signal rather than creating a second one.

Our detection layer implements this deduplication logic because duplicate signals degrade autoscaler behavior. Teams running event-driven autoscaling report that signal noise creates cascading scale-out events, where each duplicate signal triggers additional capacity requests. The result is overprovisioning and increased interruption risk as multiple autoscalers compete for the same spot capacity.

## How RefineX Implements Detection-Layer Deduplication

The arbitrage detector queries our signals table before creating new records. We filter for active signals matching four dimensions: cloud provider, region, availability zone, and instance type. The signal type must also match spot_arbitrage to avoid conflicts with interruption predictions or capacity alerts.

Our implementation runs this check on every detection cycle. The detector processes latest spot prices, identifies opportunities above our savings threshold, then performs the deduplication query. RefineX has suppressed 1,650 duplicate or low-confidence signals over the past 7 days, compared to 70 signals active and delivered to customer endpoints. That ratio — roughly 24 suppressed for every 1 delivered — reflects the discipline built into the detection layer.

When we find an existing signal, we update three fields: current_spot_price, on_demand_price, and updated_at timestamp. The signal_id remains constant, preserving any customer-side tracking or correlation logic. This update pattern maintains signal continuity while reflecting current market conditions.

## Why Six-Hour Clustering Windows Work

We expire signals after six hours by default, though customers can configure shorter TTL values through API parameters. This clustering window emerged from analysis of spot price volatility patterns across AWS regions. Arbitrage opportunities lasting longer than six hours typically indicate sustained capacity imbalances, while shorter opportunities often represent transient pricing adjustments.

The six-hour window also aligns with common autoscaler evaluation cycles. Most production autoscaling systems evaluate scaling decisions every 5 to 15 minutes, with cooldown periods ranging from 15 minutes to 2 hours. Our clustering window spans multiple evaluation cycles without creating stale recommendations that outlive market conditions.

We track signal age in our [transparency log](https://www.refinex.io/transparency) to validate these assumptions. Current active signals average $0.035/hr spot price against $0.115/hr on-demand — a 70% discount band. Signals at that spread level have proven durable enough to justify the six-hour default TTL without generating stale recommendations.

## Database Query Performance at Scale

Deduplication requires fast lookups against our signals table during peak detection cycles. We index on the four-dimensional key: cloud, region, availability_zone, instance_type, plus is_active and type flags. This composite index supports sub-millisecond queries against a signals table now holding over 16,000 historical records.

We partition older signals by week to maintain consistent performance as data volume grows, and isolate detection worker connections from API serving connections to prevent deduplication queries from blocking customer API requests during high-volume detection periods.

## The Suppression Log as a Trust Surface

Our [transparency page](https://www.refinex.io/transparency) publishes what we suppressed and why — not just what we delivered. Of the 175 signals suppressed in the last six hours alone, each has a logged suppression reason: confidence below threshold, TTL expired, or duplicate within the clustering window.

This is deliberate. Overfiring destroys trust faster than underfiring. A signal that fires every time the price ticks below on-demand is not a signal — it is noise. Deduplication is what makes the delivered signal meaningful.

The no-auth endpoint at [refinex.io/live](https://www.refinex.io/live) shows the current best signal in real time, including the suppressed_last_6h count. That number is the product.

[View the live signal log →](https://www.refinex.io/transparency)

---
*Keith Brown*
*CTO, RefineX*
