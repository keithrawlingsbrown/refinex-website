---
title: "Two Signal Types, One API: Arbitrage vs Interruption Risk"
meta_title: "Spot Arbitrage vs Interruption Risk Signals - RefineX API"
date: "2026-03-29"
description: "How RefineX delivers spot arbitrage and interruption risk signals through unified endpoints with different detection logic and actions."
slug: "spot-arbitrage-vs-interruption-risk-signals"
tags: ['aws', 'spot', 'signal-design', 'api-design']
schema:
  type: Article
  datePublished: "2026-03-29"
  author: "Keith Brown"
  publisher: "RefineX"
canonical: "https://www.refinex.io/blog/spot-arbitrage-vs-interruption-risk-signals"
published: true
---

The RefineX API delivers two distinct signal types through the same endpoints: spot_arbitrage for buy opportunities and interruption_risk for volatile regions to avoid. Both arrive as JSON through `/signals/active`, but they use different detection algorithms, different confidence inputs, and recommend different actions.

What is a dual-signal architecture? It means one API surface that routes to multiple detection systems. When you call our signals endpoint, you get both buy signals (spot_arbitrage) and risk signals (interruption_risk) in the same response format, but each type uses separate scoring logic under the hood.

## How Arbitrage Detection Works

The arbitrage detector scans for spot prices with savings above 50% compared to on-demand. Our `spot_arbitrage_detector.py` queries the latest prices from the past 10 minutes, calculates the savings percentage as `(on_demand_price - spot_price) / on_demand_price`, and creates signals only when savings exceed the 0.50 threshold.

The detector groups prices by cloud, region, availability zone, and instance type to find the most recent price for each combination. If an existing arbitrage signal is already active for that location, it updates the price data instead of creating duplicates. The confidence score for arbitrage signals comes from price stability over the detection window.

Arbitrage signals carry an action field set to `buy_spot` and include expected value data showing savings_percent and savings_usd_per_hour. The TTL defaults to 15 minutes because spot arbitrage opportunities close quickly when other users discover the same price gap.

## How Interruption Risk Detection Works

The interruption predictor identifies high volatility as a proxy for interruption risk. Our `interruption_predictor.py` analyzes normalized price data from the past 24 hours and calculates the coefficient of variation (standard deviation divided by mean price) for each instance family and region combination.

When the coefficient of variation exceeds 0.25, we generate an interruption_risk signal. The 25% threshold means the standard deviation is at least one-quarter of the mean price, indicating significant price instability that typically precedes interruptions.

Risk signals set the action field to `migrate_spot` or `fallback_on_demand` depending on the severity. The confidence score reflects how far above the volatility threshold the current measurement sits. Risk signals get longer TTLs, typically 2-4 hours, because interruption conditions persist longer than arbitrage windows.

## Unified API Design

Both signal types use the same database schema in `models/signal.py`. The type column distinguishes between `spot_arbitrage` and `interruption_risk`, but they share the same confidence, expected_value, evidence, and expiration fields. This design lets us add new signal types without changing client integration patterns.

The `/signals/active` endpoint returns both types in the same JSON array. Callers filter by the type field to separate buy opportunities from risk warnings. The public transparency endpoint at `/signals/public` shows both delivered and suppressed signals across both types, creating a complete audit trail that you can verify at our [transparency log](https://www.refinex.io/transparency).

## Different Actions for Different Signals

The key difference appears in the action field. Arbitrage signals recommend `buy_spot` when we detect a pricing opportunity. Risk signals recommend `migrate_spot` to move workloads to safer regions or `fallback_on_demand` to exit spot entirely during high-risk periods.

Your automation should handle these differently. Arbitrage signals trigger capacity expansion or new instance launches. Risk signals trigger defensive actions like workload migration or temporary fallback to on-demand instances.

## Why Unify Instead of Separate Endpoints

We considered separate endpoints like `/signals/arbitrage` and `/signals/risk` but chose unification for three reasons. First, most users want both signal types in a single call to minimize API latency. Second, the suppression logic applies equally to both types, so they share the same confidence thresholds and delivery controls. Third, unified endpoints simplify rate limiting and authentication.

The current system processes 1 active signal with a 48.4% suppression rate over the past 2 hours. Both arbitrage and risk signals face the same suppression criteria: confidence below threshold, stale data, or expired TTL. We logged 312 suppressions this week with reasons published in our append-only audit trail.

The tradeoff is slightly more complex client code to handle different action types, but most users already filter signals by region or instance family, so adding a type filter costs little additional complexity.

[View the live signal log →](https://www.refinex.io/transparency)

---
*Keith Brown*
*CTO, RefineX*