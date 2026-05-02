---
title: "How We Classify Volatile Regions as Interruption Risk"
meta_title: "Spot Interruption Risk: How RefineX Detects Volatile Regions"
date: "2026-05-02"
description: "RefineX uses coefficient of variation >25% to classify AWS regions as interruption risk rather than arbitrage. Learn how volatility detection works."
slug: "spot-interruption-risk-volatile-region-detection"
tags: ['aws', 'spot', 'signal-design', 'interruption']
schema:
  type: Article
  datePublished: "2026-05-02"
  author: "Keith Brown"
  publisher: "RefineX"
canonical: "https://www.refinex.io/blog/spot-interruption-risk-volatile-region-detection"
published: false
---

## What Is Spot Interruption Risk Detection?

RefineX classifies AWS EC2 Spot instances with high price volatility as interruption risk rather than arbitrage opportunities. When the coefficient of variation in a region's normalized price history exceeds 25%, we generate an interruption_risk signal with a migrate_spot action instead of a buy_spot recommendation. This prevents autoscalers from launching workloads in regions where price instability indicates capacity constraints.

The detector runs on hourly normalized price data aggregated from raw AWS pricing feeds. For each cloud, region, and instance type combination, we calculate the coefficient of variation by dividing standard deviation by the mean spot price over the last 24 hours. High volatility correlates with interruption events because AWS reduces Spot capacity when demand spikes, causing both price swings and instance terminations.

## How RefineX Calculates Volatility Thresholds

Our interruption predictor uses a fixed 25% coefficient of variation threshold defined in the VOLATILITY_THRESHOLD constant. This value emerged from analyzing historical AWS pricing data where regions with CV above 0.25 showed significantly higher interruption rates than stable pricing zones.

The calculation happens in src/workers/detect/interruption_predictor.py. We query the latest normalized price record for each instance family and availability zone combination, then compute CV as standard deviation divided by mean spot price. If the result exceeds 0.25, we create an interruption_risk signal with migrate_spot action.

The evidence field captures the exact volatility coefficient rounded to four decimal places. Recent signals show coefficients ranging from 0.2847 to 0.4231 in regions experiencing capacity constraints. We log every calculation to our public transparency log at /transparency for audit purposes.

## Why Volatility Indicates Interruption Risk

Price volatility in Spot markets reflects underlying capacity dynamics. When AWS has abundant spare capacity in a region, spot prices remain stable with minimal standard deviation. High volatility typically occurs when available capacity shrinks due to on-demand usage spikes or hardware maintenance events.

Our normalization worker aggregates raw price samples into hourly buckets using standard SQL functions. The normalized price model stores avg_spot_price, min_spot_price, max_spot_price, and std_dev for each hour. This data feeds directly into the volatility calculation without any machine learning or prediction models.

We chose coefficient of variation over absolute price changes because it normalizes for instance cost differences. A $0.10 price swing means different things for c5.large versus c5.24xlarge instances. CV provides consistent risk measurement across all instance families.

## How migrate_spot Actions Work

When we detect interruption risk, the signal action becomes migrate_spot instead of buy_spot. This tells downstream autoscalers to move existing Spot workloads out of the volatile region rather than launching new instances there.

The signal model defines action as a string field with values including buy_spot, migrate_spot, wait, and fallback_on_demand. The migrate_spot action pairs with interruption_risk signal types to indicate evacuation rather than acquisition opportunities.

Each interruption signal includes TTL expiration and confidence scoring like arbitrage signals. The confidence calculation for interruption risk factors in sample count and price stability over the detection window. Regions with insufficient price history get suppressed before delivery.

## Conservative Signal Suppression

We suppress interruption signals below our confidence threshold before they reach the API. The suppression logic checks for duplicate signals within the same region and instance family to prevent alert fatigue. Every suppressed signal gets logged with a specific reason code in our public audit trail.

Current suppression rate runs at 50% for the last 2-hour window, meaning half of detected volatility events fail to meet our delivery standards. We generated 12 interruption signals in the past 2 hours with zero active signals currently in the API. This reflects our conservative approach to signal quality over quantity.

The signal lifecycle includes automatic expiration based on TTL values. Interruption risk signals typically expire within 6 hours since volatility patterns change faster than arbitrage opportunities. Expired signals get marked inactive but remain in the database for historical analysis.

## Implementation Details

Our interruption detector runs as a scheduled worker process querying the normalized_prices table. The SQLAlchemy query joins latest normalized records with hour bucket aggregates to find the most recent price data for each region and instance type.

The code handles edge cases like zero spot prices and missing standard deviation values. When avg_spot_price equals zero, we skip the coefficient calculation to avoid division errors. Standard deviation defaults to 0.0 for single-sample hours where variance cannot be computed.

Signal creation includes duplicate checking against existing active interruption signals for the same cloud, region, and instance type. Updates refresh the current_spot_price, expires_at timestamp, and evidence dictionary with the latest volatility coefficient.

[View the live signal log →](https://www.refinex.io/transparency)

---
*Keith Brown*
*CTO, RefineX*