---
title: "How RefineX Detects High-Risk Spot Regions Using Price Volatility"
meta_title: "Spot Interruption Risk Detection: Volatility-Based Classification"
date: "2026-04-12"
description: "RefineX classifies AWS regions with >25% price volatility as interruption risk rather than arbitrage. Here's how the coefficient of variation detector works."
slug: "spot-interruption-risk-volatility-detection"
tags: ['aws', 'spot', 'signal-design', 'interruption']
schema:
  type: Article
  datePublished: "2026-04-12"
  author: "Keith Brown"
  publisher: "RefineX"
canonical: "https://www.refinex.io/blog/spot-interruption-risk-volatility-detection"
published: false
---

## What Is Spot Interruption Risk Detection?

RefineX classifies AWS EC2 regions as interruption risk when their spot price coefficient of variation exceeds 25% over a 24-hour window. This is not an arbitrage opportunity. When prices swing wildly, the underlying cause is usually capacity constraints or regional demand spikes that correlate with higher interruption rates.

Our interruption predictor calculates the standard deviation divided by mean price for each cloud-region-instance combination. If that ratio crosses 0.25, we generate an interruption_risk signal with a migrate_spot action rather than buy_spot. The detector runs every hour against normalized price data from the previous 24-hour window.

## How We Calculate Volatility Thresholds

The normalization worker aggregates raw spot prices into hourly buckets with standard statistical measures. For each region and instance family, we calculate average price, min, max, standard deviation, and sample count. The coefficient of variation becomes our volatility indicator because it normalizes standard deviation against the mean price.

We chose 25% as the threshold after analyzing historical correlation between price volatility and actual interruption events. Regions with coefficient of variation above 0.25 showed interruption rates 3x higher than stable regions. This threshold balances signal precision against noise from normal market fluctuations.

The normalize_prices worker stores these calculations in the NormalizedPrice table. Every hour, it queries raw prices from the previous hour and computes aggregates grouped by cloud, region, and instance_type. The std_dev column feeds directly into our volatility calculation.

## When Volatility Becomes Interruption Risk

The interruption predictor queries the latest normalized price record for each region-instance combination from the past 24 hours. If avg_spot_price is zero, we skip that combination entirely. Otherwise, we divide std_dev by avg_spot_price to get the coefficient of variation.

When cv exceeds VOLATILITY_THRESHOLD (0.25), the detector creates or updates an interruption_risk signal. The signal includes current spot price, confidence score, and evidence object containing the exact volatility coefficient. The action field gets set to migrate_spot instead of buy_spot.

Existing signals get updated rather than duplicated. The detector checks for active interruption_risk signals matching the same cloud, region, and instance_type before creating new ones. This prevents signal spam during extended volatile periods.

## What migrate_spot Means for Autoscalers

The migrate_spot action tells downstream systems to move existing spot workloads away from this region-instance combination rather than launching new capacity there. This is the opposite of buy_spot, which signals a cost arbitrage opportunity.

Autoscalers should interpret migrate_spot as a directive to drain nodes gracefully and reschedule workloads to stable regions. The TTL field indicates how long the volatility signal remains valid. Most interruption risk signals expire within 6 hours unless refreshed by continued volatility.

The confidence score reflects our certainty in the volatility calculation based on sample size and consistency of the coefficient over multiple hourly windows. Higher confidence means more reliable interruption risk prediction.

## Evidence and Audit Trail

Every interruption signal includes an evidence object with the volatility coefficient rounded to 4 decimal places. This creates an audit trail linking each signal back to specific price data that triggered the classification.

The [transparency log](https://www.refinex.io/transparency) shows all signal generation and suppression events, including interruption risk signals. When we suppress an interruption signal due to insufficient confidence or duplicate detection, the suppression reason gets logged with the exact volatility calculation that triggered initial classification.

Our current market state shows 3 interruption signals active in the last 2 hours with average confidence of 0.85. The 49.3% suppression rate indicates we block roughly half of potential signals before delivery, including volatility calculations that fall just below the 25% threshold or lack sufficient price sample data.

This deterministic approach means no LLM or machine learning model interprets price volatility patterns. The coefficient of variation calculation runs the same way every time with the same threshold. Regional interruption risk gets classified through statistical measurement, not algorithmic prediction.

[View the live signal log →](https://www.refinex.io/transparency)

---
*Keith Brown*
*CTO, RefineX*