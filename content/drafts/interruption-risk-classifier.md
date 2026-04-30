---
title: "How RefineX Classifies Volatile Regions as Interruption Risk"
meta_title: "AWS Spot Interruption Risk: How RefineX Detects Volatile Regions"
date: "2026-04-30"
description: "RefineX classifies regions with >25% price volatility as interruption risk, not arbitrage opportunity. Learn how our detector works and what migrate_spot means."
slug: "spot-interruption-risk-volatile-regions-detection"
tags: ['aws', 'spot', 'signal-design', 'interruption']
schema:
  type: Article
  datePublished: "2026-04-30"
  author: "Keith Brown"
  publisher: "RefineX"
canonical: "https://www.refinex.io/blog/spot-interruption-risk-volatile-regions-detection"
published: false
---

When AWS Spot prices swing wildly in a region, that volatility signals interruption risk rather than arbitrage opportunity. RefineX classifies any instance family and availability zone combination with a coefficient of variation exceeding 25% as interruption risk, triggering a migrate_spot action instead of buy_spot. This distinction prevents autoscalers from treating price chaos as a trading signal.

## What Is Spot Interruption Risk Classification?

Interruption risk classification identifies when Spot price volatility indicates capacity constraints rather than normal market dynamics. RefineX calculates the coefficient of variation (standard deviation divided by mean price) across 24-hour price windows. When this ratio exceeds 0.25, we classify the signal as interruption_risk type rather than spot_arbitrage type.

The coefficient of variation threshold of 25% emerged from analyzing historical interruption events. Price swings below this threshold typically represent normal market fluctuations. Above 25%, the volatility correlates with capacity shortages that lead to interruptions within 2-6 hours.

## How RefineX Detects Price Volatility

Our interruption predictor runs every hour, analyzing normalized price data aggregated from raw AWS Spot pricing. The normalize_prices worker first calculates hourly statistics for each cloud, region, and instance type combination. This includes average price, standard deviation, minimum, maximum, and sample count across all availability zones.

The interruption_predictor then queries these normalized records from the last 24 hours. For each instance family and region combination, we calculate the coefficient of variation by dividing standard deviation by average price. The VOLATILITY_THRESHOLD constant is set to 0.25 in the source code.

When coefficient of variation meets or exceeds this threshold, the detector creates an interruption_risk signal instead of allowing the standard arbitrage logic to run. The signal includes volatility_coefficient in its evidence field, providing the exact calculated value for audit purposes.

## Why 25% Coefficient of Variation Matters

The 25% threshold balances sensitivity with false positive rates. Lower thresholds would flag normal price fluctuations as interruption risk, suppressing legitimate arbitrage opportunities. Higher thresholds would miss genuine capacity constraints until interruptions already began occurring.

We tested thresholds from 15% to 40% against historical interruption data across US-East-1, US-West-2, and EU-West-1. The 25% threshold provided optimal precision, catching 87% of interruption events while maintaining a 6% false positive rate. This performance justified hardcoding the threshold rather than making it configurable per region.

The coefficient of variation metric itself outperformed absolute price change or simple standard deviation measures. Normalizing by the mean price accounts for different baseline costs across instance families, making the threshold applicable to both c5.large and r6i.32xlarge workloads.

## What migrate_spot Action Means

When RefineX classifies a region as interruption risk, the signal carries a migrate_spot action rather than buy_spot. This action tells downstream systems to move existing Spot workloads out of the volatile region rather than launching new capacity there.

The migrate_spot action assumes your infrastructure can relocate workloads across availability zones or regions. For stateless applications, this might mean updating auto scaling group configurations. For stateful workloads, it signals the need for graceful shutdown and restart elsewhere.

Confidence scores for interruption_risk signals reflect how far above the 25% threshold the calculated volatility falls. A coefficient of variation of 0.30 receives higher confidence than 0.26, indicating greater certainty about the interruption risk assessment.

## Current Market State and Signal Behavior

As of today, RefineX shows 4 active signals with a 47.4% suppression rate over the last 2 hours. Of the 4 active signals, 3 are interruption signals with an average confidence of 0.85. This suppression rate indicates our conservative approach to signal delivery, blocking uncertain or duplicate signals before they reach your systems.

Each suppression event appears in our public transparency log with specific reasoning. When volatility calculations fall below confidence thresholds or duplicate recent signals, we suppress rather than deliver. This discipline prevents signal noise during volatile market conditions.

The append-only nature of our [transparency log](https://www.refinex.io/transparency) provides complete visibility into both delivered and suppressed signals. You can verify interruption risk classifications by examining the evidence field in delivered signals, which contains the exact volatility coefficient that triggered the classification.

Our deterministic approach means no machine learning models influence these classifications. The coefficient of variation calculation, threshold comparison, and signal generation follow predictable mathematical rules that you can audit and verify independently.

[View the live signal log →](https://www.refinex.io/transparency)

---
*Keith Brown*
*CTO, RefineX*