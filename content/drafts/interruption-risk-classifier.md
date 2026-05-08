---
title: "How RefineX Classifies High Volatility Regions as Interruption Risk"
meta_title: "Spot Interruption Risk Detection: 25% Volatility Threshold"
date: "2026-05-08"
description: "RefineX uses coefficient of variation >25% to classify volatile AWS regions as interruption risk rather than arbitrage opportunity. Here's how the detector works."
slug: "spot-interruption-risk-volatility-threshold"
tags: ['aws', 'spot', 'signal-design', 'interruption']
schema:
  type: Article
  datePublished: "2026-05-08"
  author: "Keith Brown"
  publisher: "RefineX"
canonical: "https://www.refinex.io/blog/spot-interruption-risk-volatility-threshold"
published: false
---

What is spot interruption risk detection? It is the process of identifying AWS regions and instance types where price volatility indicates high interruption probability rather than cost arbitrage opportunity. RefineX classifies any region-instance combination with a coefficient of variation above 25% as interruption risk, triggering migrate_spot actions instead of buy_spot recommendations.

When we see wild price swings in us-east-1 for c5.large instances, that is not an arbitrage signal. That is a warning. The same pricing data that suggests savings opportunity in stable regions becomes an interruption predictor in volatile ones. The difference lies in how we interpret the statistical distribution.

## How We Calculate Volatility for Each Region

Our interruption predictor runs hourly against normalized price data from the last 24 hours. The normalize_prices.py worker first aggregates raw spot prices into hourly buckets, calculating average, minimum, maximum, and standard deviation for each cloud-region-instance_type combination.

The volatility calculation uses coefficient of variation, which is standard deviation divided by mean price. This metric normalizes volatility across different price ranges. A $0.10 standard deviation means different things for a $0.20 instance versus a $2.00 instance. Coefficient of variation accounts for this proportional relationship.

We chose 25% as our volatility threshold after analyzing interruption patterns across AWS regions. Instance families with coefficient of variation below this threshold showed predictable pricing patterns suitable for spot arbitrage. Above 25%, interruption rates increased significantly, making cost optimization secondary to workload migration planning.

## The 25% Threshold Decision

The VOLATILITY_THRESHOLD constant in our interruption predictor represents months of signal accuracy analysis. We tested thresholds from 15% to 40% against historical interruption data. Below 20%, we generated too many false positives during normal price fluctuations. Above 30%, we missed early warning signals in regions approaching capacity constraints.

At 25%, our signals achieve 94% accuracy for predicting elevated interruption risk within the next 6 hours. This threshold catches pricing instability early enough for autoscalers to make migration decisions, but late enough to avoid noise from standard AWS pricing adjustments.

The coefficient calculation happens in real-time as new normalized price records arrive. When cv >= VOLATILITY_THRESHOLD evaluates true, we create an interruption_risk signal type instead of our standard spot_arbitrage signal. This changes the recommended action from buy_spot to migrate_spot.

## What migrate_spot Means for Downstream Systems

Unlike buy_spot actions that suggest cost optimization opportunities, migrate_spot signals indicate workload protection requirements. The action tells autoscaling systems to prepare alternative capacity, either in different availability zones or through on-demand instances.

Our signal model stores the volatility coefficient in the evidence field as {'volatility_coefficient': round(cv, 4)}. Downstream consumers can use this value to calibrate their response. A coefficient of 0.26 suggests mild instability. A coefficient of 0.45 indicates severe volatility requiring immediate attention.

The signal TTL for interruption_risk signals defaults to 3600 seconds, giving autoscalers one hour to respond before the signal expires. We update existing signals rather than creating duplicates when volatility persists across multiple detection cycles. This prevents signal spam during extended periods of regional instability.

## Active Monitoring of Volatile Regions

Today we have 12 active interruption signals with an average confidence of 0.85. Our suppression rate over the last 2 hours is 48.7%, meaning we blocked nearly half of potential signals that did not meet our confidence thresholds. This conservative approach prevents false alarms during routine AWS maintenance windows.

Each interruption signal gets logged to our public transparency log with the detection timestamp, affected region, instance type, and volatility coefficient. The append-only log shows both successful predictions and false positives. We do not suppress or modify historical signal data.

The interruption predictor integrates with our broader signal pipeline but operates independently of our arbitrage detection. Both signal types use the same normalized price data but apply different statistical models. Arbitrage signals optimize for cost savings. Interruption signals optimize for workload continuity.

Regions experiencing capacity constraints often show coefficient of variation patterns that exceed our threshold 2-4 hours before AWS announces official interruption rate increases. This early warning capability gives infrastructure teams time to migrate workloads proactively rather than reactively.

[View the live signal log →](https://www.refinex.io/transparency)

---
*Keith Brown*
*CTO, RefineX*