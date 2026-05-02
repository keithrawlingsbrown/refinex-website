---
title: "How RefineX Detects Volatile Regions as Interruption Risk"
meta_title: "AWS Spot Interruption Risk Detection via Price Volatility"
date: "2026-05-02"
description: "RefineX flags regions where spot price volatility exceeds 25% coefficient of variation as interruption risk, not arbitrage opportunity."
slug: "spot-interruption-risk-volatility-detection"
tags: ['aws', 'spot', 'signal-design', 'interruption']
schema:
  type: Article
  datePublished: "2026-05-02"
  author: "Keith Brown"
  publisher: "RefineX"
canonical: "https://www.refinex.io/blog/spot-interruption-risk-volatility-detection"
published: false
---

What makes a spot pricing signal an interruption risk rather than an arbitrage opportunity? RefineX uses coefficient of variation to answer this question. When normalized price volatility in a region exceeds 25% over the previous 24 hours, we classify that instance family and availability zone combination as interruption risk and recommend migrate_spot actions instead of buy_spot.

The distinction matters because volatile pricing often signals capacity constraints, not genuine arbitrage. A region showing 40% savings with high volatility represents danger, not opportunity. Our interruption predictor catches these scenarios before they catch your workloads.

## How RefineX Calculates Volatility Coefficients

Our interruption_predictor.py runs every hour and examines normalized price data from the previous 24-hour window. For each cloud, region, and instance type combination, we calculate the coefficient of variation by dividing standard deviation by mean spot price.

The calculation uses aggregated hourly data, not raw spot prices. Our normalize_prices.py worker first processes raw AWS pricing data into hourly buckets, computing average, minimum, maximum, and standard deviation for each hour. This eliminates noise from AWS pricing API fluctuations while preserving genuine volatility signals.

When the coefficient of variation reaches our 0.25 threshold, the predictor creates an interruption_risk signal with migrate_spot action. The evidence field stores the exact volatility coefficient for audit purposes. Every signal includes TTL expiration and gets logged to our transparency system.

## Why We Chose 25% as the Volatility Threshold

The 25% coefficient of variation threshold emerged from analyzing AWS spot interruption patterns across regions. Below 15%, price movements typically represent normal market fluctuations. Above 35%, the region often shows clear capacity stress with frequent interruptions.

We set the threshold at 25% to catch developing volatility before it reaches crisis levels. This conservative approach means we flag some regions that might stabilize, but we avoid recommending spot placements in genuinely risky zones.

The threshold applies uniformly across all AWS regions and instance families. We do not adjust for regional differences or instance type characteristics. This consistency ensures predictable signal behavior regardless of workload location.

## What migrate_spot Actions Mean for Autoscalers

When RefineX generates an interruption_risk signal with migrate_spot action, we recommend moving existing spot instances away from that region and instance type combination, not launching new ones there. This differs from our spot_arbitrage signals, which recommend buy_spot actions for new capacity.

The migrate_spot recommendation assumes you have workloads running in the flagged region. If you receive this signal but have no active instances in that zone, you can safely ignore it. The signal serves as a warning against future placement, not a mandate for immediate action.

Autoscalers can consume migrate_spot signals by adjusting their placement strategies. Instead of immediately terminating instances, consider directing new capacity to stable regions while allowing natural workload churn to drain the volatile zone. This approach reduces disruption while improving reliability.

## How Interruption Signals Differ from Arbitrage Signals

Our signal classification determines the recommended action. Arbitrage signals focus on cost savings opportunities with buy_spot actions. Interruption signals focus on reliability risks with migrate_spot actions. The same region can trigger both signal types simultaneously if it shows both savings potential and volatility risk.

Interruption signals carry different confidence scoring than arbitrage signals. While arbitrage confidence reflects expected savings accuracy, interruption confidence reflects volatility prediction reliability. A 0.8 confidence interruption signal means we are 80% confident the region will remain volatile, not that interruptions will definitely occur.

The evidence field structure also differs between signal types. Arbitrage signals include savings_percent and price differentials. Interruption signals include volatility_coefficient and often reference recent interruption events or capacity announcements from AWS.

## Signal Suppression for Interruption Risk

Our suppression system applies to interruption signals just like arbitrage signals. If an interruption signal falls below our confidence threshold, it gets suppressed before delivery. Every suppressed interruption signal appears in our public transparency log with the suppression reason.

Interruption signals also face suppression for duplicate detection. If we already have an active interruption_risk signal for a region and instance type, new signals for the same combination get suppressed to avoid noise. The existing signal gets updated with fresh volatility data instead.

You can track all interruption signal suppressions and deliveries through our transparency system. This visibility helps you understand when we detected volatility but chose not to alert, versus when we never detected risk in the first place.

[View the live signal log →](https://www.refinex.io/transparency)

---
*Keith Brown*
*CTO, RefineX*