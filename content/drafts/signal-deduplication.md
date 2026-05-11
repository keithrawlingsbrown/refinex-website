---
title: "Why We Deduplicate Spot Signals at the Detection Layer"
meta_title: "Signal Deduplication AWS Spot Markets - RefineX Detection Layer"
date: "2026-05-11"
description: "RefineX updates existing signals instead of creating duplicates. Our 6-hour clustering window prevents autoscaler noise and improves reliability."
slug: "signal-deduplication-detection-layer-spot-markets"
tags: ['aws', 'spot', 'signal-design']
schema:
  type: Article
  datePublished: "2026-05-11"
  author: "Keith Brown"
  publisher: "RefineX"
canonical: "https://www.refinex.io/blog/signal-deduplication-detection-layer-spot-markets"
published: false
---

RefineX updates existing signals instead of creating duplicates when we detect multiple arbitrage opportunities for the same instance family and availability zone combination. This prevents autoscaler noise and maintains signal reliability for teams running event-driven infrastructure.

## What is Signal Deduplication?

Signal deduplication means that when our arbitrage detector finds a second opportunity for c7g.xlarge in us-east-1a while an active signal already exists for that exact combination, we update the existing signal rather than shipping a duplicate. The existing signal gets refreshed with new pricing data and confidence scores, but the signal count stays at one.

Our detection layer implements this through a simple database query that checks for active signals before creating new ones. When the spot_arbitrage_detector finds savings above our 50% threshold, it queries the Signal table for any active records matching the cloud, region, availability zone, instance type, and signal type combination.

## How Our Detection Layer Prevents Duplicates

The deduplication logic runs inside our arbitrage detection worker every 5 minutes. When we process the latest spot pricing data, our code first identifies price combinations that meet the 50% savings threshold. Then, for each qualifying opportunity, we check if an active signal already exists.

If we find an existing signal, we update its current_spot_price, on_demand_price, and updated_at timestamp. The signal keeps its original signal_id and creation time, but gets fresh pricing data. If no existing signal exists, we create a new one with a fresh UUID.

This prevents scenarios where a single instance type experiencing consistent arbitrage opportunities would generate multiple active signals. Without deduplication, a stable price advantage for m6i.2xlarge in us-west-2c could create 12 separate signals over an hour, each triggering separate autoscaler evaluations.

## The Six-Hour Clustering Window

Our signal expiration logic creates an effective six-hour clustering window for deduplication. Signals remain active until they either fail confidence scoring or reach their natural TTL expiration. Most arbitrage signals maintain a 6-hour TTL unless market volatility suggests shorter intervals.

This window prevents oscillating signals when spot prices fluctuate around our detection threshold. If c5n.xlarge in eu-west-1a drops to 49% savings (below threshold) at 2:00 PM, then returns to 52% savings at 2:15 PM, we update the existing signal rather than creating a new one. The signal stays active throughout the fluctuation.

The clustering window also handles detection gaps. If our price collector misses data points due to AWS API throttling, returning signals for previously covered instance families update existing records rather than creating duplicates with temporal gaps.

## Why Autoscalers Break With Duplicate Signals

Event-driven autoscaling systems expect discrete signal events, not continuous streams of duplicate recommendations. When duplicate signals arrive for the same resource, autoscalers typically queue multiple scaling evaluations for identical infrastructure changes.

We observed this behavior in post-mortems from teams running Kubernetes Cluster Autoscaler with custom metrics adapters. Multiple signals for the same node group caused competing scale-out decisions, leading to resource over-provisioning and cost escalation beyond the original arbitrage advantage.

Duplicate signals also complicate rollback logic. If an autoscaler receives three separate signals recommending c6i.large adoption in us-east-1b, it cannot easily determine which signal to invalidate if market conditions change. The autoscaler ends up treating each signal as independent evidence, amplifying the perceived confidence of what should be a single recommendation.

## Implementation Details From Our Codebase

Our SignalRepository implements deduplication through a composite key lookup that includes cloud, region, availability_zone, instance_type, and signal type. The database query runs with an is_active filter to exclude expired signals from the deduplication check.

When we detect an existing active signal, we update the current_spot_price and on_demand_price fields with fresh market data, then bump the updated_at timestamp. The signal flows through our normal confidence scoring pipeline, where it might get suppressed if the updated data falls below our confidence threshold.

Our Redis caching layer handles deduplication by maintaining a single cache entry per unique signal combination. When we update an existing signal, the cache refresh overwrites the previous entry rather than creating additional keys. This keeps our API response times consistent regardless of signal update frequency.

The transparency log at our [public suppression tracker](https://www.refinex.io/transparency) shows deduplication events as "signal_updated" entries rather than "signal_created" events. This gives teams visibility into when we refresh existing recommendations versus discovering new opportunities.

## Signal Quality Over Signal Volume

Deduplication reflects our core principle that signal quality exceeds signal volume. We suppress 43.2% of potential signals today, including duplicates that would create noise without adding intelligence. The 6 active signals in our current pipeline represent distinct, non-overlapping opportunities rather than variations on the same theme.

Teams building on our signals can trust that each signal_id represents a discrete decision point. When you receive a spot_arbitrage signal for r6g.4xlarge in ap-southeast-1a, you know it is the single authoritative recommendation for that combination, not one of several competing suggestions.

This approach scales with infrastructure complexity. As teams manage larger spot fleets across more availability zones, they need fewer, higher-confidence signals rather than comprehensive coverage of every marginal opportunity.

[View the live signal log →](https://www.refinex.io/transparency)

---
*Keith Brown*
*CTO, RefineX*