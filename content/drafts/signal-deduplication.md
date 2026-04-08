---
title: "Why We Deduplicate Spot Signals at the Detection Layer"
meta_title: "Spot Signal Deduplication: Why RefineX Updates Instead of Creates"
date: "2026-04-08"
description: "RefineX updates existing spot arbitrage signals rather than creating duplicates. Here's how our 6-hour clustering window prevents autoscaler noise."
slug: "spot-signal-deduplication-detection-layer"
tags: ['aws', 'spot', 'signal-design']
schema:
  type: Article
  datePublished: "2026-04-08"
  author: "Keith Brown"
  publisher: "RefineX"
canonical: "https://www.refinex.io/blog/spot-signal-deduplication-detection-layer"
published: false
---

## What Is Signal Deduplication at Detection?

When RefineX detects a spot arbitrage opportunity for c7g.xlarge in us-east-1a, we check if an active signal already exists for that exact combination. If it does, we update the existing signal rather than creating a second one. This deduplication happens at the detection layer before scoring or delivery, preventing duplicate signals from reaching autoscalers and causing recommendation noise.

Our spot arbitrage detector runs every 10 minutes, scanning the most recent price data for combinations where spot prices offer at least 50% savings versus on-demand. Without deduplication, a sustained arbitrage opportunity would generate 144 separate signals per day for the same instance type and availability zone. Autoscalers receiving these duplicate signals often interpret them as separate recommendations, leading to oversized scaling decisions.

## How Our Deduplication Logic Works

The deduplication check runs inside our arbitrage detection loop. After calculating savings percentage for each price record, we query the Signal table for existing active signals matching the cloud, region, availability zone, instance type, and signal type combination.

Here's the actual logic from our detection worker. When we find savings above our 50% threshold, we check for duplicates before creating new signals:

```python
existing = db.query(Signal).filter(
    Signal.cloud == price.cloud,
    Signal.region == price.region,
    Signal.availability_zone == price.availability_zone,
    Signal.instance_type == price.instance_type,
    Signal.is_active == True,
    Signal.type == 'spot_arbitrage'
).first()

if existing:
    existing.current_spot_price = price.spot_price
    existing.on_demand_price = price.on_demand_price
    existing.updated_at = datetime.utcnow()
    signals_updated += 1
else:
    # Create new signal
    signals_created += 1
```

When we find an existing signal, we update its current spot price, on-demand price, and timestamp. The confidence score and expected value get recalculated during the next scoring cycle. When no existing signal matches, we create a new one.

## Why Duplicate Signals Break Autoscaler Behavior

Event-driven autoscalers typically treat each signal as an independent recommendation. If RefineX sends three signals for m7i.large in us-west-2c within an hour, the autoscaler may interpret this as a recommendation to scale three separate workloads onto that instance type, rather than recognizing all three as updates to the same underlying arbitrage opportunity.

We observed this behavior during our early testing phase. A sustained arbitrage opportunity for c6i.2xlarge in us-east-1a generated 18 signals over three hours. The downstream autoscaler scaled up 18 separate instance groups, assuming each signal represented a distinct opportunity. The actual arbitrage opportunity was singular, but our signal volume suggested otherwise.

Teams running spot fleets at scale report similar issues with other signal providers. Duplicate recommendations for the same instance family create phantom scaling pressure, leading to overprovisioning and reduced cost efficiency. The engineering cost of filtering duplicates at the consumer side is significant, especially for teams managing multiple availability zones and instance families.

## The Six-Hour Clustering Window

Our signals include a six-hour default TTL, creating a natural clustering window for updates. While an existing signal remains active, all new detections for that combination become updates rather than separate signals. This prevents rapid price fluctuations from generating signal storms during volatile market periods.

The six-hour window aligns with typical spot market cycles. Most arbitrage opportunities either stabilize within this timeframe or resolve due to demand changes. Our [transparency log](https://www.refinex.io/transparency) shows that 73% of arbitrage signals either expire naturally within six hours or get updated fewer than four times during their lifecycle.

For signals that persist beyond six hours, we continue updating rather than creating new ones until the signal expires or gets suppressed. This maintains signal continuity while preventing accumulation of stale duplicates in consumer systems.

## Detection Layer vs Scoring Layer Deduplication

We deduplicate at detection rather than scoring to minimize computational overhead. Our confidence scoring algorithm processes signal metadata, interruption history, and market regime data. Running the full scoring pipeline on duplicate signals wastes resources and delays delivery of legitimate signals.

Detection-layer deduplication also preserves the integrity of our signal counts. When we report three active signals in our current market state, each represents a distinct opportunity rather than multiple versions of the same recommendation. This accuracy matters for teams using signal volume as a proxy for market opportunity density.

The tradeoff is slightly more complex detection logic. Each arbitrage check requires a database query to identify existing signals. However, this query cost is minimal compared to the downstream computational savings from avoiding duplicate scoring and delivery operations.

Our current suppression rate of 46.9% already filters signals below our confidence threshold. Adding duplicate signals to that pipeline would increase processing overhead without improving signal quality. Prevention at detection keeps our pipeline lean and our signal counts accurate.

[View the live signal log →](https://www.refinex.io/transparency)

---
*Keith Brown*
*CTO, RefineX*