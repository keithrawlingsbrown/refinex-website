---
title: "Two Signal Types, One API: How RefineX Separates Arbitrage from Interruption Risk"
meta_title: "AWS Spot Signal Types: Arbitrage vs Interruption Risk API"
date: "2026-04-13"
description: "RefineX delivers spot_arbitrage and interruption_risk signals through one API. Different detection logic, same JSON format. How to handle each type."
slug: "spot-signal-types-arbitrage-interruption-risk-api"
tags: ['aws', 'spot', 'signal-design', 'api-design']
schema:
  type: Article
  datePublished: "2026-04-13"
  author: "Keith Brown"
  publisher: "RefineX"
canonical: "https://www.refinex.io/blog/spot-signal-types-arbitrage-interruption-risk-api"
published: false
---

## What Are RefineX Signal Types?

RefineX delivers two distinct signal types through a single API endpoint: spot_arbitrage signals that identify buy opportunities with over 50% savings, and interruption_risk signals that flag volatile regions where spot instances face higher termination probability. Both signals share the same JSON response format but require different caller actions and have completely separate detection logic.

The /signals/public endpoint currently shows 2 active signals with a 48.7% suppression rate over the last 2 hours. Of the 12 interruption signals detected today, all passed the 0.25 coefficient of variation threshold with an average confidence of 0.85. This dual-signal architecture lets callers distinguish between opportunity and risk within the same integration.

## How Spot Arbitrage Detection Works

The spot_arbitrage_detector.py worker scans raw spot prices every 10 minutes, comparing current spot rates against on-demand pricing. Any instance family showing 50% or greater savings triggers signal creation. The detector queries for the latest price in each cloud, region, availability zone, and instance type combination within the last 10 minutes.

When a spot price in us-east-1a for m5.large drops to $0.025 while on-demand stays at $0.096, the savings percentage reaches 74%. This exceeds our ARBITRAGE_THRESHOLD of 0.50, so the detector creates a spot_arbitrage signal with action set to buy_spot. The confidence calculation factors in price stability over the detection window and historical savings persistence for that instance family.

Existing arbitrage signals get updated rather than duplicated. If m5.large in us-east-1a already has an active spot_arbitrage signal, the detector refreshes the current_spot_price, recalculates expected_value, and extends expires_at based on the configured TTL. This prevents signal spam while keeping opportunity data current.

## How Interruption Risk Prediction Works

The interruption_predictor.py worker operates on normalized price data rather than raw spot prices. It calculates the coefficient of variation (standard deviation divided by mean price) across 24-hour windows for each instance family and region combination. High price volatility correlates with interruption risk since AWS adjusts spot pricing based on capacity demand.

When the coefficient of variation exceeds 0.25, the predictor generates an interruption_risk signal. For example, if c5.xlarge instances in us-west-2 show an average spot price of $0.048 with a standard deviation of $0.014, the coefficient of variation reaches 0.29. This triggers a signal with action set to migrate_spot or fallback_on_demand, depending on the volatility severity.

The evidence field captures the specific volatility_coefficient that triggered the signal. Unlike arbitrage signals that focus on immediate savings, interruption signals help callers avoid regions where spot capacity constraints create termination risk. The detection runs on normalized hourly data rather than real-time pricing to smooth out brief price spikes.

## Why One API for Both Signal Types

We unified both signal types under the same endpoint structure because callers need to process spot decisions holistically. A DevOps engineer managing spot fleets cannot optimize for savings while ignoring interruption risk, or vice versa. The shared JSON schema lets automation tools handle both signal types through a single integration.

The Signal model stores both types with identical fields: cloud, region, availability_zone, instance_type, confidence, expected_value, action, and evidence. The type field distinguishes spot_arbitrage from interruption_risk, but the response format stays consistent. This means your spot fleet management logic can process both opportunity and risk signals through the same parsing code.

Different signal types generate different recommended actions. Arbitrage signals suggest buy_spot when savings exceed thresholds, while interruption signals recommend migrate_spot or wait when volatility indicates capacity pressure. Your automation can branch on the action field rather than implementing separate detection logic for each signal type.

## How to Handle Each Signal Type in Your Code

When processing spot_arbitrage signals, focus on the savings_percent value in expected_value and the current_spot_price field. These signals indicate immediate cost optimization opportunities. Check the expires_at timestamp since arbitrage windows typically last minutes, not hours.

For interruption_risk signals, examine the volatility_coefficient in the evidence field and the confidence score. These signals suggest defensive actions like migrating workloads to stable regions or falling back to on-demand instances. Interruption signals typically have longer TTL values since capacity trends persist across hours.

Our [transparency log](https://www.refinex.io/transparency) shows the live mix of both signal types, including suppressed signals that failed confidence thresholds. The append-only log lets you audit how each signal type behaves over time and tune your handling logic accordingly. Today's 48.7% suppression rate reflects conservative defaults that prioritize signal quality over quantity.

## Signal Type Performance in Production

The two-signal architecture creates natural validation. When spot_arbitrage signals cluster in specific regions while interruption_risk signals flag other zones, the inverse correlation confirms our detection logic. We suppressed 312 signals this week, with 88 delivered signals achieving 94% accuracy across both types.

Current market conditions show arbitrage opportunities concentrated in us-east-1 and eu-west-1, while interruption risk signals cluster around us-west-2 during peak hours. This geographic separation helps callers route workloads toward opportunity zones while avoiding high-risk regions.

[View the live signal log →](https://www.refinex.io/transparency)

---
*Keith Brown*
*CTO, RefineX*