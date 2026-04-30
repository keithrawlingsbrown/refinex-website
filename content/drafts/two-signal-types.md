---
title: "Two Signal Types, One API: Arbitrage vs Interruption Risk"
meta_title: "Spot Arbitrage vs Interruption Risk: Two AWS Signal Types"
date: "2026-04-30"
description: "RefineX API delivers spot_arbitrage and interruption_risk signals through unified endpoints. Different detection logic, same delivery format."
slug: "spot-arbitrage-vs-interruption-risk-signal-types"
tags: ['aws', 'spot', 'signal-design', 'api-design']
schema:
  type: Article
  datePublished: "2026-04-30"
  author: "Keith Brown"
  publisher: "RefineX"
canonical: "https://www.refinex.io/blog/spot-arbitrage-vs-interruption-risk-signal-types"
published: false
---

## What Are Spot Arbitrage and Interruption Risk Signals?

The RefineX API exposes two distinct signal types through the same endpoints: spot_arbitrage for buy opportunities and interruption_risk for volatile regions to avoid. Each has different detection logic, different confidence inputs, and different recommended actions. But they share a single delivery format through our unified Signal model.

A spot_arbitrage signal fires when current spot prices drop 50% or more below on-demand pricing. An interruption_risk signal fires when price volatility exceeds 25% coefficient of variation within a 24-hour window. Same API call, different underlying math.

## How Arbitrage Detection Works

Our spot_arbitrage_detector.py scans the last 10 minutes of price data for each cloud, region, availability zone, and instance type combination. The detection threshold is hardcoded at 50% savings minimum. If a spot price is less than half the on-demand price, we generate a signal.

The detector queries our RawPrice table for the most recent timestamp per location. It calculates savings_pct as (on_demand_price minus spot_price) divided by on_demand_price. When savings_pct exceeds ARBITRAGE_THRESHOLD of 0.50, the system either creates a new signal or updates an existing active one.

Every arbitrage signal gets an action field set to buy_spot and evidence populated with the actual savings percentage. The confidence score derives from how long the pricing gap has persisted. Gaps lasting under 5 minutes get lower confidence scores than gaps persisting for hours.

## How Interruption Risk Detection Works

Our interruption_predictor.py operates on NormalizedPrice data aggregated into hour buckets over the last 24 hours. It calculates coefficient of variation (standard deviation divided by mean price) for each instance type per region. When this ratio exceeds VOLATILITY_THRESHOLD of 0.25, we flag the combination as high interruption risk.

The predictor pulls the latest normalized record for each cloud, region, and instance type. High coefficient of variation indicates price instability, which historically correlates with interruption likelihood. Unlike arbitrage signals that recommend buy_spot, interruption signals recommend migrate_spot or fallback_on_demand actions.

Evidence for interruption signals contains the volatility_coefficient rounded to four decimal places. TTL varies based on how volatile the pricing appears. More chaotic pricing gets shorter signal lifespans.

## Why One API for Two Signal Types

We unified both signal types in the same Signal model and delivery endpoints because DevOps teams need both perspectives for the same infrastructure decisions. You want to know when spot pricing creates arbitrage opportunities AND when specific regions show interruption warning signs.

The unified approach means one API call returns both buy signals and avoid signals for your target regions. Our /signals/public endpoint on our [transparency log](https://www.refinex.io/transparency) shows this mix in real time. Today we have 18 interruption signals active with 49.6% of total signals suppressed over the last 2 hours.

Both signal types flow through identical confidence scoring and suppression logic. If either type falls below confidence thresholds, it gets suppressed before delivery. The suppression appears in our public audit trail with the specific reason logged.

## Different Actions, Same Format

The key difference lies in the action field. Arbitrage signals recommend buy_spot when pricing favors immediate launches. Interruption signals recommend migrate_spot for existing instances or fallback_on_demand for new launches in volatile regions.

Your automation can branch on signal type and action together. A spot_arbitrage signal with buy_spot action suggests launching new instances. An interruption_risk signal with migrate_spot action suggests moving existing workloads out of that availability zone.

Expected_value JSON differs between types too. Arbitrage signals include savings_usd_per_hour calculations. Interruption signals include estimated_stability_window predictions based on historical volatility patterns.

## Confidence Scoring Across Types

Both signal types use the same 0.0 to 1.0 confidence scale, but the inputs differ completely. Arbitrage confidence depends on pricing gap duration and depth. Interruption confidence depends on volatility consistency and sample size.

Current average confidence across active signals sits at 0.85 today. Signals below 0.5 confidence get automatically suppressed. This conservative default applies equally to both arbitrage opportunities and interruption warnings.

The deterministic scoring path never involves LLMs. Both detectors use pure mathematical thresholds against time-series pricing data. No machine learning models, no neural networks, no probabilistic outputs.

## Implementation Details

Our Signal table stores both types identically. The type column distinguishes spot_arbitrage from interruption_risk. Cloud, region, availability_zone, and instance_type create the location context. Current_spot_price and on_demand_price provide pricing context regardless of signal type.

The evidence JSON field stores type-specific detection details. TTL and expires_at handle lifecycle management uniformly. The is_active boolean controls suppression state for both types through identical logic paths.

API consumers get the same JSON structure whether they receive buy signals or risk warnings. This consistency simplifies integration while preserving the distinct detection logic underneath.

[View the live signal log →](https://www.refinex.io/transparency)

---
*Keith Brown*
*CTO, RefineX*