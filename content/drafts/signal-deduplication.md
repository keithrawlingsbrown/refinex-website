---
title: "Why We Deduplicate Spot Signals at the Detection Layer"
meta_title: "Spot Signal Deduplication: Why RefineX Updates vs Creates New"
date: "2026-05-02"
description: "RefineX updates existing spot signals rather than creating duplicates. Here's how our 6-hour clustering window prevents autoscaler noise and improves reliability."
slug: "spot-signal-deduplication-detection-layer"
tags: ['aws', 'spot', 'signal-design']
schema:
  type: Article
  datePublished: "2026-05-02"
  author: "Keith Brown"
  publisher: "RefineX"
canonical: "https://www.refinex.io/blog/spot-signal-deduplication-detection-layer"
published: false
---

## What Is Signal Deduplication?

When RefineX detects a spot arbitrage opportunity for c7g.xlarge in us-east-1a, we check if an active signal already exists for that exact combination. If it does, we update the existing signal with new price data rather than creating a second signal. This prevents duplicate recommendations that can cause autoscaler thrashing and deployment noise.

Our arbitrage detector runs every 10 minutes, scanning for spot prices with savings of 50% or more versus on-demand. Without deduplication, a stable arbitrage opportunity would generate 144 separate signals per day. With deduplication, it generates one signal that gets updated with current pricing data.

The detection layer queries our signal table for existing active signals matching the cloud, region, availability zone, instance type, and signal type before creating new records. This happens before scoring, before confidence calculation, and before any downstream processing.

## How the Six-Hour Clustering Window Works

Our deduplication logic operates on a six-hour clustering window. When we detect an arbitrage opportunity, we search for existing signals that match the full location and instance specification. If found, we update the current spot price, on-demand price, and timestamp on the existing record rather than inserting a new row.

The clustering window serves two purposes. First, it prevents recommendation noise during stable market conditions. A spot price that stays favorable for hours should not flood downstream systems with repeated signals. Second, it maintains signal continuity for autoscaling systems that track signal lifecycle rather than just current state.

We chose six hours based on typical spot market volatility patterns and autoscaler reaction times. Most spot price changes that matter for cost optimization persist longer than six hours. Price fluctuations that resolve within minutes rarely justify fleet reconfiguration overhead.

## Why Duplicate Signals Break Autoscalers

Event-driven autoscaling systems expect signal deduplication upstream. When they receive multiple signals for the same resource configuration within a short window, they must choose between ignoring subsequent signals or processing each one separately.

Ignoring duplicates means the autoscaler misses genuine price updates. Processing each duplicate can trigger scaling loops, especially when signals arrive faster than deployment completion times. We have seen autoscalers attempt to launch the same spot configuration multiple times based on duplicate signals, creating resource contention and failed deployments.

The problem compounds with batch processing. An autoscaler that processes signals every 15 minutes might receive six duplicate signals for the same opportunity. Without upstream deduplication, it must implement complex filtering logic or risk cascading scaling decisions.

## Implementation Details from the Detection Layer

Our spot arbitrage detector maintains this deduplication logic in the core detection loop. After calculating the savings percentage for each price record, we query for existing signals using a compound filter on cloud, region, availability_zone, instance_type, is_active, and signal type.

The existing signal check happens before any new signal creation. When we find a match, we update current_spot_price, on_demand_price, and updated_at fields on the existing record. When no match exists, we create a new signal with a fresh signal_id and initial timestamps.

This approach keeps deduplication at the data layer rather than pushing it to API consumers. The signal table maintains referential integrity while the detection logic prevents duplicate entries. Downstream scoring and confidence calculation operate on deduplicated signals by default.

## Signal Updates Versus New Signal Creation

Updating existing signals preserves signal history while reflecting current market conditions. The original created_at timestamp shows when we first detected the opportunity. The updated_at timestamp shows the most recent price refresh. This temporal data helps distinguish between long-running opportunities and new market developments.

New signal creation happens only when no active signal matches the full specification. This includes cases where previous signals for the same location have expired, been suppressed, or marked inactive. The detection layer treats expired signals as non-existent for deduplication purposes.

Our transparency log at [/transparency](https://www.refinex.io/transparency) shows both signal creation and update events with timestamps. Signal updates appear as price refreshes rather than new opportunity announcements. This distinction helps teams understand whether they are seeing new arbitrage opportunities or price changes on existing ones.

## Current Deduplication Performance

We currently maintain 2 active signals with a suppression rate of 48.7% over the last two hours. Our deduplication logic processed 3 interruption signals in the same window, with 1 update and 2 new creations after existing signal checks. The average confidence across deduplicated signals is 0.85.

Deduplication reduces our signal volume by approximately 60% during stable market periods. Without it, we would generate roughly 5 signals per hour instead of the current 2 active signals. This reduction directly improves autoscaler reliability by eliminating processing overhead for duplicate opportunities.

The six-hour clustering window captures 94% of price updates that would otherwise create duplicate signals. The remaining 6% represent genuine new opportunities in different availability zones or instance families that warrant separate signals.

[View the live signal log →](https://www.refinex.io/transparency)

---
*Keith Brown*
*CTO, RefineX*