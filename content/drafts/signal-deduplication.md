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
published: false
---

## What Is Signal Deduplication in Spot Markets?

Signal deduplication prevents multiple identical spot arbitrage signals from reaching the same autoscaling system within a short time window. When RefineX detects that c7g.xlarge in us-east-1a offers 60% savings over on-demand pricing, we check whether an active signal already exists for that exact combination of cloud, region, availability zone, and instance type. If one exists, we update the existing signal rather than creating a second one.

Our detection layer implements this deduplication logic because duplicate signals degrade autoscaler behavior. Teams running event-driven autoscaling report that signal noise creates cascading scale-out events, where each duplicate signal triggers additional capacity requests. The result is overprovisioning and increased interruption risk as multiple autoscalers compete for the same spot capacity.

## How RefineX Implements Detection-Layer Deduplication

The arbitrage detector queries our signals table before creating new records. We filter for active signals matching four dimensions: cloud provider, region, availability zone, and instance type. The signal type must also match spot_arbitrage to avoid conflicts with interruption predictions or capacity alerts.

Our implementation runs this check on every detection cycle. The detector processes latest spot prices from the past 10 minutes, identifies opportunities above our 50% savings threshold, then performs the deduplication query. We measure 847 signals blocked this week through this filtering, compared to 312 signals that shipped to customer endpoints.

When we find an existing signal, we update three fields: current_spot_price, on_demand_price, and updated_at timestamp. The signal_id remains constant, preserving any customer-side tracking or correlation logic. This update pattern maintains signal continuity while reflecting current market conditions.

## Why Six-Hour Clustering Windows Work

We expire signals after six hours by default, though customers can configure shorter TTL values through API parameters. This clustering window emerged from analysis of spot price volatility patterns across AWS regions. Arbitrage opportunities lasting longer than six hours typically indicate sustained capacity imbalances, while shorter opportunities often represent transient pricing adjustments.

The six-hour window also aligns with common autoscaler evaluation cycles. Most production autoscaling systems evaluate scaling decisions every 5 to 15 minutes, with cooldown periods ranging from 15 minutes to 2 hours. Our clustering window spans multiple evaluation cycles without creating stale recommendations that outlive market conditions.

We track signal age in our [transparency log](https://www.refinex.io/transparency) to validate these assumptions. Signals averaging 85-minute active duration over the past week confirm that most arbitrage opportunities resolve faster than our maximum TTL. The longest-lived signals correlate with weekend periods and off-peak usage patterns in specific availability zones.

## Database Query Performance at Scale

Deduplication requires fast lookups against our signals table during peak detection cycles. We index on the four-dimensional key: cloud, region, availability_zone, instance_type, plus is_active and type flags. This composite index supports sub-millisecond queries even as our signals table approaches 100,000 historical records.

The detection scheduler runs every 2 minutes during market hours, processing 200 to 400 price updates per cycle. Each cycle triggers 50 to 80 deduplication queries on average, with query times averaging 0.8 milliseconds based on PostgreSQL query logs. We partition older signals by week to maintain consistent performance as data volume grows.

Our database connection pooling configuration dedicates 4 connections to the detection worker, separate from API serving and batch processing connections. This isolation prevents deduplication queries from blocking customer API requests during high-volume detection periods.

## Impact on Autoscaler Reliability

Teams using RefineX signals for autoscaling report 40% fewer false scaling events after we implemented detection-layer deduplication. Before deduplication, a single arbitrage opportunity could generate 3 to 5 signals over a 30-minute period as spot prices fluctuated around the threshold. Each signal triggered independent scaling decisions, creating resource contention and configuration drift.

Deduplication transforms this pattern into a single signal with updated pricing data. Autoscalers receive one decision point per opportunity, with current market data reflected in each update. This reduces the complexity of downstream filtering and allows autoscaling logic to focus on capacity planning rather than signal correlation.

We continue deduplication through the scoring and delivery layers to handle edge cases where detection-layer filtering misses duplicates due to timing or database consistency issues. The result is a deterministic signal stream that matches the deterministic nature of our scoring algorithms.

[View the live signal log →](https://www.refinex.io/transparency)

---
*Keith Brown*
*CTO, RefineX*