---
title: "Two Signal Types, One API: How RefineX Separates Arbitrage from Interruption Risk"
meta_title: "AWS Spot Signal Types: Arbitrage vs Interruption Risk API"
date: "2026-05-07"
description: "RefineX exposes two distinct signal types through one API: spot_arbitrage for buy opportunities and interruption_risk for volatile regions to avoid."
slug: "aws-spot-signal-types-arbitrage-interruption-risk-api"
tags: ['aws', 'spot', 'signal-design', 'api-design']
schema:
  type: Article
  datePublished: "2026-05-07"
  author: "Keith Brown"
  publisher: "RefineX"
canonical: "https://www.refinex.io/blog/aws-spot-signal-types-arbitrage-interruption-risk-api"
published: false
---

## What Are the Two AWS Spot Signal Types?

The RefineX API delivers two distinct signal types through the same endpoints: `spot_arbitrage` signals identify when to buy Spot capacity, while `interruption_risk` signals warn about volatile regions to avoid. Each type uses different detection logic and recommends different actions, but both share the same JSON delivery format.

We designed this unified approach after observing that DevOps teams need both buy signals and avoid signals, but they want to consume them through a single integration point. Today we have 3 active signals with a 47.1% suppression rate over the last 2 hours.

## How Arbitrage Detection Works

Our `spot_arbitrage_detector.py` scans for Spot prices offering greater than 50% savings versus on-demand pricing. The detector queries the latest prices from the last 10 minutes, calculates savings percentage, and creates signals only when the threshold is met.

The arbitrage detector uses this formula: `savings_pct = (on_demand_price - spot_price) / on_demand_price`. When `savings_pct >= 0.50`, we generate a signal with action `buy_spot`. The confidence score reflects price stability over the detection window, not the savings amount itself.

These signals carry short TTLs because arbitrage opportunities close quickly. We typically set 300-900 second expiration windows for arbitrage signals, compared to longer windows for interruption warnings.

## How Interruption Risk Detection Works

Our `interruption_predictor.py` analyzes price volatility patterns to predict interruption risk. The detector calculates the coefficient of variation (standard deviation divided by mean price) over 24-hour normalized price windows.

When the coefficient of variation exceeds 0.25, we create an `interruption_risk` signal with action `migrate_spot` or `fallback_on_demand`. High volatility correlates with interruption frequency because both stem from supply-demand imbalances in specific availability zones.

The evidence field for interruption signals contains `volatility_coefficient` values. For example, a coefficient of 0.30 means the standard deviation is 30% of the mean price, indicating significant instability.

## Unified API Schema Design

Both signal types use identical database columns in our `Signal` model. The `type` column distinguishes between `spot_arbitrage` and `interruption_risk`, while the `action` column specifies the recommended response: `buy_spot`, `migrate_spot`, `wait`, or `fallback_on_demand`.

The `expected_value` JSON field contains different data depending on signal type. Arbitrage signals include `savings_percent` and `savings_usd_per_hour`. Interruption signals include `volatility_coefficient` and expected interruption windows.

This unified schema means API clients receive the same response format regardless of signal type. Callers check the `type` field first, then interpret the `expected_value` and `evidence` fields accordingly.

## Why We Merged Two Detection Systems

We initially built separate APIs for arbitrage opportunities and interruption warnings. DevOps teams told us they wanted both signal types in their monitoring dashboards, but managing two different authentication flows and response formats created integration overhead.

The merged API reduces client complexity while preserving signal-specific logic in our backend detectors. Each detector runs independently with its own confidence calculations and suppression rules, but signals flow through shared delivery pipelines.

We maintain separate indexes for `type` filtering so clients can subscribe to only arbitrage signals or only interruption signals if needed. The `/signals/public` endpoint on our [transparency log](https://www.refinex.io/transparency) shows both types in the same feed.

## Different Actions for Different Signals

Signal type determines recommended action. Arbitrage signals typically suggest `buy_spot` when confidence exceeds 0.7. Interruption risk signals suggest `migrate_spot` for running instances or `fallback_on_demand` for new launches.

The action field provides the primary recommendation, but the confidence band and TTL help callers decide whether to act immediately or wait for confirmation. We suppress signals below our confidence threshold regardless of type, with all suppressions logged publicly.

Our current average confidence is 0.85 across both signal types, with interruption signals generally showing higher confidence than arbitrage signals due to longer observation windows.

## Implementation Considerations

Callers should handle signal types differently in their automation. Arbitrage signals work best with fast execution because pricing windows close quickly. Interruption signals allow more deliberate migration planning since volatility patterns persist longer.

Both signal types respect the same TTL and expiration logic. When `expires_at` passes, signals become inactive regardless of type. The unified expiration handling simplifies client-side cleanup logic.

We recommend filtering by `type` in your API queries and maintaining separate handling logic for each signal type, even though they arrive through the same endpoint.

[View the live signal log →](https://www.refinex.io/transparency)

---
*Keith Brown*
*CTO, RefineX*