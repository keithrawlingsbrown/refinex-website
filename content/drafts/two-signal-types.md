---
title: "Two Signal Types, One API: How RefineX Separates Arbitrage from Interruption Risk"
meta_title: "Two Signal Types One API: Arbitrage vs Interruption Risk"
date: "2026-05-03"
description: "RefineX API delivers spot_arbitrage and interruption_risk through unified endpoints but different detection logic. Learn the design rationale."
slug: "two-signal-types-one-api-arbitrage-interruption-risk"
tags: ['aws', 'spot', 'signal-design', 'api-design']
schema:
  type: Article
  datePublished: "2026-05-03"
  author: "Keith Brown"
  publisher: "RefineX"
canonical: "https://www.refinex.io/blog/two-signal-types-one-api-arbitrage-interruption-risk"
published: false
---

The RefineX API exposes two distinct signal types through the same `/signals` endpoint: `spot_arbitrage` for buy opportunities and `interruption_risk` for volatile regions to avoid. They share identical delivery formats but operate on completely different detection logic, confidence inputs, and recommended actions. This architectural decision creates a single integration point while preserving signal-specific context.

## What Are the Two Signal Types?

RefineX generates `spot_arbitrage` signals when AWS Spot prices drop below 50% of on-demand pricing for a given instance family and availability zone. These signals recommend immediate action: buy Spot capacity now. The `interruption_risk` signals trigger when price volatility exceeds a 25% coefficient of variation over 24 hours, indicating elevated interruption probability. These signals recommend avoidance: migrate existing workloads or defer new launches.

The signal model stores both types in identical database columns. The `type` field differentiates them, but `confidence`, `expected_value`, and `evidence` follow the same JSON schema. This unified structure means API consumers handle one response format regardless of signal type.

## How Detection Logic Differs

Arbitrage detection queries the most recent raw prices within a 10-minute window. The detector calculates savings percentage as `(on_demand_price - spot_price) / on_demand_price` and creates signals only when savings exceed the hardcoded 50% threshold. The confidence score reflects price stability over the detection window.

Interruption prediction operates on normalized hourly price buckets spanning 24 hours. The detector calculates coefficient of variation as `standard_deviation / mean_spot_price` for each instance family per region. When this ratio exceeds 25%, we generate an interruption risk signal. Higher volatility correlates with interruption frequency based on our historical analysis.

These detectors run independently. A single instance type in one availability zone might trigger both signal types simultaneously: spot_arbitrage because prices dropped significantly, and interruption_risk because volatility increased. The API delivers both signals with different recommended actions.

## Why Unify the API Surface?

We considered separate endpoints for each signal type but chose unification for three reasons. First, DevOps teams integrate once and receive all relevant signals through existing API clients. Second, filtering by signal type happens at the query parameter level, not the endpoint level. Third, alert routing and delivery mechanisms work identically for both signal types.

The unified approach means authentication, rate limiting, and response caching operate consistently across signal types. Our current suppression rate of 47.9% applies equally to both arbitrage opportunities and interruption warnings. Today we have 3 active signals with an average confidence of 0.85, representing the combined output of both detection systems.

## How Callers Should Handle Each Type

Arbitrage signals demand immediate evaluation because Spot price advantages disappear within minutes. The `action` field typically shows `buy_spot` with a time-to-live measured in minutes. Teams should validate current capacity requirements and execute Spot requests quickly.

Interruption signals require defensive actions over longer time horizons. The `action` field shows `migrate_spot` or `fallback_on_demand` with TTL values measured in hours. Teams should gradually migrate running workloads to stable regions or switch to on-demand instances for critical services.

The `expected_value` JSON differs between signal types. Arbitrage signals include `savings_percent` and `savings_usd_per_hour` projections. Interruption signals include `volatility_coefficient` and estimated `migration_window` durations. Both provide the context needed for automated decision making.

## Evidence and Transparency

Every signal includes an `evidence` field documenting the specific data inputs that triggered detection. Arbitrage signals show price differentials and detection timestamps. Interruption signals show volatility calculations and historical context. This evidence appears in our public suppression log when we block signals below confidence thresholds.

Our [transparency page](https://www.refinex.io/transparency) displays both signal types in the same chronological feed. The unified format makes suppression patterns visible across both arbitrage and interruption detection. Teams can audit our decision making process regardless of which detector generated the original signal.

The two-signal architecture lets us optimize detection algorithms independently while maintaining consistent API behavior. Arbitrage detection focuses on speed and price accuracy. Interruption prediction emphasizes statistical confidence over longer time periods. Both produce identical signal objects that integrate seamlessly into existing automation workflows.

[View the live signal log →](https://www.refinex.io/transparency)

---
*Keith Brown*
*CTO, RefineX*