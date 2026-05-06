---
title: "How RefineX Classifies Volatile AWS Regions as Interruption Risk"
meta_title: "Spot Interruption Risk Detection: 25% Volatility Threshold"
date: "2026-05-06"
description: "RefineX flags regions with >25% price volatility as interruption risk instead of arbitrage opportunities. Here's how the classifier works."
slug: "spot-interruption-risk-detection-volatility-threshold"
tags: ['aws', 'spot', 'signal-design', 'interruption']
schema:
  type: Article
  datePublished: "2026-05-06"
  author: "Keith Brown"
  publisher: "RefineX"
canonical: "https://www.refinex.io/blog/spot-interruption-risk-detection-volatility-threshold"
published: false
---

Not every AWS Spot pricing signal represents an arbitrage opportunity. When the coefficient of variation in a region's normalized price history exceeds 25%, RefineX classifies that combination as interruption risk rather than cost savings potential. This means we send a migrate_spot action instead of buy_spot, signaling that your autoscaler should move workloads away from that instance family and availability zone.

What is interruption risk classification? It's RefineX's method for distinguishing between stable Spot opportunities and volatile regions where price swings indicate impending capacity constraints. Instead of treating all low Spot prices as savings opportunities, we calculate the coefficient of variation (standard deviation divided by mean price) for each cloud, region, and instance type combination over a 24-hour window.

## How RefineX Calculates Volatility

The interruption predictor runs hourly against our normalized price database. For each instance family in each availability zone, we pull 24 hours of aggregated pricing data from the NormalizedPrice table. Our normalize_prices worker already calculated the standard deviation and mean for each hourly bucket, so the volatility detection becomes a simple division: std_dev divided by avg_spot_price.

The 25% threshold emerged from analyzing historical Spot interruption patterns. Regions with coefficient of variation below 0.25 showed consistent availability over multi-hour periods. Above that threshold, interruption rates increased sharply within 2-6 hours. We chose the conservative boundary to reduce false positives in our signal stream.

When volatility exceeds the threshold, RefineX creates an interruption_risk signal type instead of a spot_arbitrage signal. The evidence field includes the calculated volatility coefficient rounded to four decimal places. The action field switches from buy_spot to migrate_spot, telling downstream systems to treat this as evacuation rather than expansion.

## What migrate_spot Means for Autoscalers

The migrate_spot action carries specific operational intent. Unlike buy_spot signals that suggest launching new instances in that availability zone, migrate_spot signals recommend moving existing workloads away. For autoscaling groups, this typically means temporarily removing that availability zone from launch templates until the volatility signal expires.

The signal includes a TTL field measured in seconds. Most interruption risk signals carry 2-4 hour expiration windows based on confidence levels. Higher volatility coefficients get shorter TTLs because rapid price swings indicate immediate capacity pressure. Our signal processor automatically deactivates expired entries, so your automation doesn't need to track signal lifecycle.

Current market conditions show 6 active interruption signals with an average confidence of 0.85 across all signal types. Our suppression rate sits at 46.7% over the past 2 hours, meaning we blocked nearly half of potential signals before delivery. This aggressive filtering ensures that only high-confidence volatility patterns reach your infrastructure automation.

## The Detection Algorithm

Our interruption predictor queries the NormalizedPrice table for records from the past 24 hours. The normalization happens hourly via a separate worker that aggregates raw AWS API pricing data into statistical summaries. Each normalized record contains the mean, standard deviation, minimum, maximum, and sample count for that hour bucket.

For active signals, the detector checks whether an interruption_risk signal already exists for that cloud, region, and instance type combination. If found, we update the existing record with fresh pricing data and reset the expiration timer. If not found and volatility exceeds threshold, we create a new signal with type interruption_risk and action migrate_spot.

The confidence scoring happens separately from volatility detection. High volatility alone doesn't guarantee high confidence. Sample count, data freshness, and historical accuracy all factor into the final confidence band. Signals below our confidence threshold get suppressed before delivery and logged in our public [transparency log](https://www.refinex.io/transparency).

## Conservative Defaults by Design

RefineX defaults to blocking signals rather than shipping them. The 25% volatility threshold represents the conservative boundary of our interruption detection. Regions with 20-24% volatility might still carry interruption risk, but we suppress those signals to avoid false alarms in production workloads.

This approach prioritizes precision over recall. We would rather miss a volatile region than incorrectly flag a stable one as high-risk. The suppression log captures every blocked signal with specific reasoning, creating an auditable trail of our detection discipline.

The interruption classifier runs independently of our arbitrage detection. A single region can simultaneously show cost savings potential and volatility risk. In those cases, RefineX ships the higher-priority signal type based on confidence levels and recent accuracy metrics.

[View the live signal log →](https://www.refinex.io/transparency)

---
*Keith Brown*
*CTO, RefineX*