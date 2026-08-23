---
title: "How RefineX Classifies Volatile Regions as Interruption Risk Instead of Arbitrage"
meta_title: "Spot Interruption Risk Detection: 25% Volatility Threshold"
date: "2026-05-24"
description: "When coefficient of variation exceeds 25% in normalized price history, RefineX flags instance families as interruption risk rather than arbitrage opportunity."
slug: "spot-interruption-risk-volatility-threshold"
tags: ['aws', 'spot', 'signal-design', 'interruption']
schema:
  type: Article
  datePublished: "2026-05-24"
  author: "Keith Brown"
  publisher: "RefineX"
canonical: "https://www.refinex.io/blog/spot-interruption-risk-volatility-threshold"
published: false
---

What is spot interruption risk detection? It's the process of identifying when AWS EC2 Spot pricing volatility indicates high termination probability rather than cost savings opportunity. When the coefficient of variation in a region's normalized price history exceeds 25%, RefineX classifies that combination as interruption risk and generates a migrate_spot signal instead of buy_spot.

Not every spot pricing movement represents an arbitrage opportunity. Price volatility often signals capacity constraints, regional issues, or demand spikes that correlate with higher interruption rates. Our detector calculates the coefficient of variation for each cloud-region-instance_type combination over the last 24 hours. When that ratio hits our 25% threshold, we shift the signal type from arbitrage to risk management.

## How We Calculate the Volatility Coefficient

The interruption predictor runs hourly against normalized price data. We aggregate raw spot prices into hour buckets, calculating average, minimum, maximum, and standard deviation for each instance family per region. The coefficient of variation is standard deviation divided by mean price.

Our normalization process creates these hourly aggregates from raw AWS pricing API calls. For each hour bucket, we group prices by cloud provider, region, and instance type, then calculate statistical measures including sample count and standard deviation. The normalized_prices table stores these aggregates with the hour_bucket as the time index.

When the detector runs, it queries the latest normalized price record for each instance family. If the average spot price is greater than zero, we calculate coefficient of variation as std_dev divided by avg_spot_price. Values at or above 0.25 trigger interruption risk classification.

## Why We Chose the 25% Threshold

The 25% volatility threshold represents the point where price instability indicates capacity pressure rather than normal market fluctuation. Below this level, price movements typically reflect demand patterns that create arbitrage opportunities. Above 25%, the standard deviation suggests underlying supply constraints that increase termination risk.

This threshold came from analyzing historical correlations between coefficient of variation and actual interruption events across AWS regions. Instance families with sustained volatility above 25% showed interruption rates that made cost savings irrelevant. The 25% cutoff maximizes signal accuracy while minimizing false positives.

We store this threshold as a constant in the interruption predictor code. The VOLATILITY_THRESHOLD variable is set to 0.25, making the decision boundary explicit and auditable. Every signal generated above this threshold includes the actual volatility coefficient in the evidence field for transparency.

## What migrate_spot Means for Downstream Systems

When volatility exceeds our threshold, RefineX generates an interruption_risk signal with the migrate_spot action. This tells autoscalers and orchestrators to move workloads off the current instance family in that region, not to avoid spot entirely.

The migrate_spot action differs from fallback_on_demand in both urgency and scope. Migration suggests moving to a different spot instance family or availability zone within the same region. Fallback indicates switching to on-demand instances due to broader spot market issues.

Downstream systems typically respond to migrate_spot by checking alternative instance families in the same region first. If our detector shows low volatility for similar compute profiles, migration keeps workloads on spot instances while avoiding the high-risk combination. This preserves cost savings while reducing interruption exposure.

## How We Track Signal Accuracy

Every interruption risk signal includes the volatility coefficient that triggered it in the evidence JSON field. We log these values to enable post-event analysis of threshold effectiveness. When actual interruptions occur, we can correlate them with the coefficient of variation we calculated at signal generation time.

The signal model stores confidence scores from 0.0 to 1.0 for each risk assessment. Interruption signals typically show confidence levels between 0.7 and 0.95, reflecting the strength of the volatility indicator. Lower confidence signals get suppressed before delivery according to our standard suppression logic.

Our transparency log at https://www.refinex.io/transparency shows both delivered signals and suppressed ones with reasoning. This includes interruption risk signals that didn't meet confidence thresholds or were blocked by duplicate detection within the 6-hour window for the same instance family.

Active signals currently stand at 4, with a 48.1% suppression rate over the last 2 hours. Of the 3 interruption signals generated today, the average confidence is 0.85. These numbers reflect real-time detector output and suppression decisions.

The interruption risk classifier runs as part of our deterministic signal scoring pipeline. No LLM involvement exists in the coefficient of variation calculation or threshold comparison. The volatility math is standard statistical computation applied to normalized pricing data we collect from AWS APIs every hour.

[View the live signal log →](https://www.refinex.io/transparency)

---
*Keith Brown*
*CTO, RefineX*