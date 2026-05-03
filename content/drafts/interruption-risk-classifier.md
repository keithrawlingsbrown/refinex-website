---
title: "How RefineX Classifies Volatile Regions as Interruption Risk"
meta_title: "Spot Interruption Risk Detection: 25% Volatility Threshold"
date: "2026-05-03"
description: "RefineX classifies AWS regions with >25% price volatility as interruption risk instead of arbitrage. Here's how the detector works."
slug: "spot-interruption-risk-detection-volatility-threshold"
tags: ['aws', 'spot', 'signal-design', 'interruption']
schema:
  type: Article
  datePublished: "2026-05-03"
  author: "Keith Brown"
  publisher: "RefineX"
canonical: "https://www.refinex.io/blog/spot-interruption-risk-detection-volatility-threshold"
published: false
---

Not every spot pricing signal is an arbitrage opportunity. When the coefficient of variation in a region's normalized price history exceeds 25%, RefineX classifies that combination as interruption risk rather than arbitrage. The detector calculates standard deviation divided by mean price across 24-hour windows. High volatility indicates capacity constraints, not stable savings.

## What is Spot Interruption Risk Classification?

Spot interruption risk classification is a deterministic scoring method that identifies AWS regions where price volatility indicates high interruption probability. RefineX uses the coefficient of variation (standard deviation divided by mean price) to separate stable arbitrage opportunities from volatile, high-risk scenarios. When this ratio exceeds 0.25, we generate an interruption_risk signal with a migrate_spot action instead of the standard buy_spot recommendation.

## How Does RefineX Score Spot Risk?

The interruption predictor runs hourly against normalized price data. Our code calculates the coefficient of variation for each cloud, region, and instance type combination over the last 24 hours. The calculation is straightforward: we divide the standard deviation by the average spot price. If this ratio reaches or exceeds our 25% threshold, we classify the signal as interruption risk.

The detector queries the NormalizedPrice table for the most recent hour bucket per region and instance family. We aggregate raw spot prices into hourly windows, storing average, minimum, maximum, standard deviation, and sample count. This gives us clean time series data without the noise of individual API calls.

When volatility exceeds the threshold, we create or update a Signal record with type set to interruption_risk. The action field gets set to migrate_spot, telling downstream autoscalers to move workloads to more stable regions rather than chase apparent arbitrage. The evidence field stores the actual volatility coefficient rounded to four decimal places.

## Why We Chose 25% as the Volatility Threshold

We set VOLATILITY_THRESHOLD = 0.25 after analyzing interruption patterns across AWS regions during capacity constraint events. Regions showing coefficient of variation above 25% correlate with interruption rates that make arbitrage strategies counterproductive. Below this threshold, price variation typically reflects normal market dynamics rather than capacity pressure.

This threshold balances sensitivity with false positive rates. Too low and we suppress legitimate arbitrage signals during minor price fluctuations. Too high and we miss genuine interruption risk until workloads are already affected. The 25% level captures meaningful volatility while maintaining signal precision.

## What migrate_spot Means for Autoscalers

When RefineX emits an interruption_risk signal with migrate_spot action, we recommend moving existing spot workloads to different availability zones or instance families within the same region. This differs from our standard buy_spot action, which suggests launching new spot capacity to capture arbitrage.

The migrate_spot action indicates that current pricing suggests interruption risk outweighs potential savings. Autoscalers receiving this signal should prioritize workload stability over cost optimization. Some implementations drain existing spot instances gradually rather than launching additional capacity in the affected zone.

Our API delivers these signals with the same JSON structure as arbitrage signals, but the action field clearly differentiates the recommended response. The TTL for interruption signals typically runs shorter than arbitrage signals because volatility conditions can shift rapidly during capacity events.

## How We Handle Signal Suppression

RefineX applies the same confidence thresholds to interruption signals as arbitrage signals. If our confidence calculation falls below the minimum threshold, we suppress the signal and log the reason in our public [transparency log](https://www.refinex.io/transparency). Suppressed interruption signals often occur when sample counts are too low to calculate reliable standard deviation.

We also suppress duplicate interruption signals within six-hour windows for the same region and instance type combination. This prevents signal flooding during extended volatility periods while ensuring teams receive updates when conditions change significantly.

The interruption predictor updates existing active signals rather than creating duplicates. When volatility persists, we extend the expires_at timestamp and refresh the evidence field with the current volatility coefficient. This approach maintains clean signal state without overwhelming downstream systems.

## Integration with Existing Workflows

Teams running mixed on-demand and spot workloads can configure different responses for arbitrage versus interruption signals. Some autoscaling policies ignore interruption signals entirely, preferring to let AWS handle interruptions through standard mechanisms. Others use migrate_spot signals to proactively rebalance across availability zones.

The deterministic scoring ensures interruption classification remains consistent across API calls. No machine learning models influence the volatility calculation or threshold comparison. Teams can audit the classification logic by examining the coefficient of variation stored in each signal's evidence field.

[View the live signal log →](https://www.refinex.io/transparency)

---
*Keith Brown*
*CTO, RefineX*