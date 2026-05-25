---
title: "Two Signal Types, One API: How RefineX Handles Arbitrage and Interruption Risk"
meta_title: "Spot Arbitrage vs Interruption Risk: One API, Two Signal Types"
date: "2026-05-25"
description: "RefineX exposes spot_arbitrage and interruption_risk signals through unified endpoints with different detection logic and actions."
slug: "spot-arbitrage-interruption-risk-signals"
tags: ['aws', 'spot', 'signal-design', 'api-design']
schema:
  type: Article
  datePublished: "2026-05-25"
  author: "Keith Brown"
  publisher: "RefineX"
canonical: "https://www.refinex.io/blog/spot-arbitrage-interruption-risk-signals"
published: false
---

The RefineX API delivers two fundamentally different signal types through the same endpoints: `spot_arbitrage` for buy opportunities and `interruption_risk` for volatile regions to avoid. They share JSON structure but require different responses from your infrastructure code.

## What Are Arbitrage vs Interruption Risk Signals?

Arbitrage signals identify immediate cost savings opportunities where spot prices drop below 50% of on-demand pricing. Interruption risk signals flag instance families and availability zones with coefficient of variation above 0.25, indicating high volatility and probable interruptions.

The signals use different detection algorithms but arrive through identical API responses. Your code receives the same confidence score, expected value, and TTL structure regardless of signal type. The `type` field and `action` recommendations differentiate how you should respond.

## How RefineX Detects Each Signal Type

Our arbitrage detector scans the latest 10-minute price window across all AWS regions. When spot pricing drops to create savings of 50% or greater versus on-demand, we calculate confidence based on price stability over the detection window. The detector updates existing signals rather than creating duplicates, maintaining one active arbitrage signal per instance family and availability zone combination.

The interruption predictor operates on 24-hour normalized price data. We calculate the coefficient of variation by dividing standard deviation by mean spot price. When this ratio exceeds 0.25, we flag the combination as interruption risk. High coefficient of variation correlates with sudden price spikes that typically precede spot instance terminations.

Both detectors write to the same Signal table with identical schema but populate the evidence field differently. Arbitrage signals store savings calculations while interruption signals record volatility coefficients. The confidence scoring remains deterministic across both types.

## Why We Unified the API Design

DevOps teams managing spot fleets need both signal types in their automation workflows, but they do not want to poll multiple endpoints or handle different authentication schemes. We tested separate endpoints during development and found teams were building wrapper functions to normalize the responses anyway.

The unified design lets you write one signal polling function that handles both opportunity detection and risk avoidance. Your code can switch on the signal type and route to appropriate handlers without duplicating the HTTP client, caching, or error handling logic. When signals expire or get suppressed, your existing cleanup routines work for both types.

We also maintain consistent suppression logic across signal types. Both arbitrage and interruption signals get suppressed below the same confidence thresholds, and all suppressions appear in our [transparency log](https://www.refinex.io/transparency) with identical audit formatting.

## How to Handle Each Signal Type in Your Code

Arbitrage signals typically carry a `buy_spot` action with expected savings in the `expected_value` field. Your automation should validate that the instance family meets your workload requirements, check current capacity in the target availability zone, then execute spot requests if conditions align. The TTL averages 15 minutes because arbitrage opportunities close quickly.

Interruption risk signals recommend `migrate_spot` or `fallback_on_demand` actions. These signals have longer TTLs since volatility regimes persist for hours or days. Your infrastructure code should drain existing spot instances in flagged availability zones and avoid launching new capacity there until the signal expires.

The confidence bands work identically for both signal types. We suppress anything below 0.50 confidence, deliver 0.50-0.75 signals in preview mode, and recommend production usage above 0.75. Both signal types respect your account's preview mode settings and suppression preferences.

## Current Signal Distribution

This week we generated 6 interruption signals versus 5 arbitrage opportunities across all monitored regions. The interruption signals concentrated in us-east-1 and eu-west-1 during peak demand hours. Our suppression rate of 47.5% over the last 2 hours reflects conservative confidence thresholds rather than detection failures.

The average confidence of 0.85 for delivered signals includes both types. Arbitrage signals tend toward higher confidence because price differentials are directly observable. Interruption risk signals require volatility analysis over longer windows, making confidence calculation more conservative.

Both signal types contribute to the same delivery quotas and rate limits on your API key. You cannot request only arbitrage or only interruption signals through filtering parameters. This ensures consistent signal mixing and prevents teams from ignoring risk signals while consuming opportunity signals.

[View the live signal log →](https://www.refinex.io/transparency)

---
*Keith Brown*
*CTO, RefineX*