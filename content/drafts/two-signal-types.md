---
title: "Two Signal Types, One API: How RefineX Routes Arbitrage and Risk Signals"
meta_title: "AWS Spot Signal Types: Arbitrage vs Interruption Risk API"
date: "2026-05-08"
description: "RefineX API exposes spot_arbitrage and interruption_risk through unified endpoints. Same JSON format, different detection logic and actions."
slug: "spot-signal-types-arbitrage-interruption-risk"
tags: ['aws', 'spot', 'signal-design', 'api-design']
schema:
  type: Article
  datePublished: "2026-05-08"
  author: "Keith Brown"
  publisher: "RefineX"
canonical: "https://www.refinex.io/blog/spot-signal-types-arbitrage-interruption-risk"
published: false
---

## What Are RefineX Signal Types?

RefineX delivers two distinct signal types through a single API endpoint: spot_arbitrage signals identify buy opportunities with savings above 50%, while interruption_risk signals flag volatile regions where Spot instances face termination risk. Both share identical JSON formatting but trigger different detection algorithms and recommended actions.

The unified design stems from a core constraint: DevOps engineers need actionable signals, not separate APIs for each risk dimension. Our signal model supports both types through a single type field, with detection logic running in parallel workers that populate the same database table.

## How Arbitrage Detection Works

The arbitrage detector scans AWS Spot pricing every 10 minutes, comparing current Spot prices against published On-Demand rates. We calculate savings percentage as (on_demand_price - spot_price) / on_demand_price and generate signals only when savings exceed our 50% threshold.

The detector queries the latest price for each cloud, region, availability zone, and instance type combination. If an existing spot_arbitrage signal is active for that tuple, we update the pricing data and extend the TTL. If no signal exists and savings exceed 50%, we create a new signal with action: "buy_spot" and populate expected_value with savings_percent and savings_usd_per_hour.

Arbitrage signals typically expire within 15 minutes because Spot pricing changes rapidly. The confidence score derives from price stability over the detection window. More stable pricing at high savings generates higher confidence scores.

## How Interruption Risk Detection Works

The interruption predictor operates on normalized hourly price data, calculating the coefficient of variation (standard deviation divided by mean price) across 24-hour windows. When volatility exceeds 25%, we generate an interruption_risk signal with action: "migrate_spot" or "fallback_on_demand" depending on the volatility severity.

Unlike arbitrage signals that focus on current pricing, interruption signals analyze price patterns. High volatility correlates with Spot capacity constraints, which precede termination notices. The predictor examines std_dev and avg_spot_price from our NormalizedPrice table to compute volatility coefficients.

Interruption signals persist longer than arbitrage signals because capacity patterns evolve more slowly than prices. These signals help teams avoid launching new workloads in unstable zones rather than chasing immediate savings opportunities.

## Why One API for Both Signal Types

We considered separate endpoints for arbitrage and interruption signals but chose unification for operational simplicity. DevOps teams consume signals programmatically through automation pipelines. Managing two API endpoints, two authentication flows, and two response schemas creates integration complexity without meaningful benefit.

The unified approach delivers both signal types through /signals/active with identical JSON structure. The type field distinguishes between spot_arbitrage and interruption_risk, while action indicates the recommended response. Callers can filter by type in query parameters or handle both types in the same processing loop.

This design mirrors AWS's own approach with Instance Advisor, which combines pricing and interruption data in unified responses. The difference is our signals include confidence scores and specific actions rather than raw historical data.

## Signal Processing Differences

Despite sharing an API endpoint, the two signal types require different handling logic in caller applications. Arbitrage signals with action: "buy_spot" suggest immediate capacity expansion opportunities. Teams typically route these to autoscaling policies or batch job schedulers that can launch instances within the signal TTL window.

Interruption signals with action: "migrate_spot" indicate existing workloads face termination risk. These route to monitoring systems that can drain traffic or migrate state before termination occurs. The evidence field contains the volatility_coefficient that triggered detection, helping teams assess urgency.

Our [transparency log](https://www.refinex.io/transparency) shows suppression reasons differ between signal types. Arbitrage signals get suppressed for stale pricing data, while interruption signals face suppression for insufficient historical data to calculate reliable volatility metrics.

## Implementation Details

Both detectors write to the same signals table with identical schema. The spot_arbitrage_detector.py worker populates current_spot_price and on_demand_price with real-time data, while interruption_predictor.py uses averaged pricing from the NormalizedPrice aggregation table.

Confidence calculation differs significantly between types. Arbitrage confidence derives from price stability and savings magnitude. Interruption confidence correlates with volatility severity and historical accuracy of our predictions in that region and instance family.

The unified signal model supports both types without schema changes. Adding new signal types requires only new detector workers and corresponding action values. The API layer remains unchanged.

[View the live signal log →](https://www.refinex.io/transparency)

---
*Keith Brown*
*CTO, RefineX*