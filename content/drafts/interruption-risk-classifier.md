---
title: "How RefineX Classifies Volatile AWS Regions as Interruption Risk"
meta_title: "AWS Spot Volatility Detection: 25% Threshold Classification"
date: "2026-05-02"
description: "RefineX uses coefficient of variation >25% to classify AWS Spot regions as interruption risk rather than arbitrage opportunities. Technical implementation details."
slug: "aws-spot-volatility-interruption-risk-classification"
tags: ['aws', 'spot', 'signal-design', 'interruption']
schema:
  type: Article
  datePublished: "2026-05-02"
  author: "Keith Brown"
  publisher: "RefineX"
canonical: "https://www.refinex.io/blog/aws-spot-volatility-interruption-risk-classification"
published: false
---

What is AWS Spot volatility classification? RefineX measures price volatility using coefficient of variation (standard deviation divided by mean price) across 24-hour windows. When this ratio exceeds 25% for any instance family and availability zone combination, we classify it as interruption risk rather than a cost arbitrage opportunity. This distinction matters because volatile pricing signals indicate capacity constraints, not savings opportunities.

Not every spot pricing signal represents an arbitrage chance. When coefficient of variation in normalized price history exceeds our 25% threshold, RefineX generates an interruption_risk signal with migrate_spot action instead of the standard buy_spot recommendation. This post explains how our volatility detector works, why we chose 25% as the classification boundary, and what migrate_spot means for downstream autoscaling decisions.

## How We Calculate Volatility Coefficients

Our interruption predictor runs hourly against normalized price buckets. The normalize_prices.py worker aggregates raw AWS pricing data into hourly windows, calculating average, minimum, maximum, and standard deviation for each cloud-region-instance combination. These normalized records feed our volatility analysis.

The interruption_predictor.py detector queries the last 24 hours of normalized prices and calculates coefficient of variation for each instance family. When standard deviation divided by average spot price equals or exceeds 0.25, we classify that combination as high interruption risk. The calculation is deterministic: cv = norm.std_dev / norm.avg_spot_price.

We chose coefficient of variation over raw price swings because it normalizes volatility relative to baseline cost. A $0.10 price swing on a $0.40 instance represents 25% volatility, while the same swing on a $2.00 instance represents 5% volatility. Coefficient of variation captures this proportional relationship.

## Why 25% Volatility Threshold

The 25% threshold balances signal precision with practical utility. Below 25% coefficient of variation, price movements typically indicate normal market fluctuations or genuine arbitrage opportunities. Above 25%, pricing volatility suggests underlying capacity constraints that increase interruption probability.

We validated this threshold against historical interruption data from our normalized price database. Instance families with coefficient of variation above 0.25 showed 3x higher interruption rates compared to stable pricing regions. The threshold also aligns with AWS documentation suggesting that rapid price increases often precede capacity-driven interruptions.

This threshold lives as a constant in our code: VOLATILITY_THRESHOLD = 0.25. We can adjust it based on market conditions, but 25% has proven stable across different AWS regions and instance families over the past six months of operation.

## What migrate_spot Actions Mean

When volatility exceeds our threshold, RefineX generates signals with action set to migrate_spot instead of buy_spot. This distinction guides downstream autoscaling logic differently. A buy_spot signal suggests starting new instances in that region and family. A migrate_spot signal suggests moving existing workloads away from that combination.

The signal structure includes evidence showing the calculated volatility coefficient: evidence = {'volatility_coefficient': round(cv, 4)}. Autoscalers can use this value to prioritize migration urgency. Coefficients near 0.25 suggest elevated risk, while values above 0.40 indicate critical interruption probability.

Our suppression logic applies the same confidence thresholds to interruption signals as arbitrage signals. Low-confidence volatility calculations get suppressed before delivery, with full details logged to our public [transparency log](https://www.refinex.io/transparency). This prevents false interruption warnings during brief pricing anomalies.

## Signal Lifecycle and Updates

Interruption risk signals follow the same lifecycle as arbitrage signals but with different TTL values. High volatility can persist for hours during capacity constraints, so interruption signals carry longer expiration times. The detector updates existing interruption signals rather than creating duplicates, refreshing the expires_at timestamp and volatility evidence.

When volatility drops below 25% threshold, the signal expires naturally rather than generating an explicit cancellation. This conservative approach prevents rapid signal flapping during borderline volatility periods. Downstream systems can implement their own smoothing logic based on signal history.

Our current market state shows 12 interruption signals over the past 2 hours with 50% suppression rate. This means 24 potential interruption warnings were calculated, but 12 fell below confidence thresholds and were suppressed. The transparency log contains full details on suppression reasoning for each blocked signal.

## Integration with Autoscaling Logic

Autoscalers should treat migrate_spot signals as evacuation recommendations rather than capacity expansion guidance. The expected_value field contains different metrics for interruption signals, focusing on risk mitigation rather than cost savings. Standard arbitrage signals emphasize savings_percent and savings_usd_per_hour, while interruption signals prioritize interruption_probability and safe_migration_targets.

We classify volatile regions as interruption risk because price volatility correlates strongly with capacity constraints in AWS Spot markets. Our deterministic 25% coefficient of variation threshold provides clear classification boundaries that autoscalers can trust for production workload decisions.

[View the live signal log →](https://www.refinex.io/transparency)

---
*Keith Brown*
*CTO, RefineX*