---
title: "Two Signal Types, One API: How RefineX Separates Arbitrage from Interruption Risk"
meta_title: "RefineX API Signal Types: Arbitrage vs Interruption Risk"
date: "2026-05-04"
description: "The RefineX API exposes spot_arbitrage and interruption_risk signals through unified endpoints. Different detection logic, same delivery format."
slug: "refinex-api-signal-types-arbitrage-interruption-risk"
tags: ['aws', 'spot', 'signal-design', 'api-design']
schema:
  type: Article
  datePublished: "2026-05-04"
  author: "Keith Brown"
  publisher: "RefineX"
canonical: "https://www.refinex.io/blog/refinex-api-signal-types-arbitrage-interruption-risk"
published: false
---

## What Are RefineX Signal Types?

RefineX delivers two distinct signal types through a single API: spot_arbitrage signals identify opportunities to buy cheap Spot instances, while interruption_risk signals flag volatile regions where Spot instances face higher termination probability. Both signals share the same JSON delivery format and confidence scoring system, but they use completely different detection algorithms and recommend opposite actions.

The signal model in our database defines a type column that stores either "spot_arbitrage" or "interruption_risk" for every signal. Each type follows the same schema for confidence, expected_value, and evidence fields, but the underlying detection logic operates independently. This unified approach means callers handle one API response format while getting access to both buy signals and avoid signals.

## How Spot Arbitrage Detection Works

Our spot_arbitrage_detector.py runs a straightforward price comparison against a 50% savings threshold. The detector queries RawPrice records from the last 10 minutes, calculates the savings percentage between current Spot price and On-Demand price, and creates signals only when savings exceed the ARBITRAGE_THRESHOLD of 0.50.

The arbitrage detector focuses on price spreads, not volatility. When a c5.large instance in us-east-1a costs $0.025 per hour on Spot versus $0.085 On-Demand, the 70% savings triggers a spot_arbitrage signal with action set to "buy_spot". The evidence field contains the actual savings percentage and dollar amounts per hour.

These signals tell you when to act. The recommended action for spot_arbitrage signals is always to launch new Spot instances or migrate existing On-Demand workloads to take advantage of the price gap. The confidence score reflects how stable this pricing pattern has been over recent sampling windows.

## How Interruption Risk Prediction Works

The interruption_predictor.py takes the opposite approach by measuring price volatility rather than absolute savings. This detector analyzes NormalizedPrice records from the last 24 hours and calculates the coefficient of variation (standard deviation divided by mean price) for each instance family and region combination.

When the coefficient of variation exceeds our VOLATILITY_THRESHOLD of 0.25, we generate an interruption_risk signal. High volatility indicates unstable Spot capacity, which correlates strongly with interruption events. The evidence field stores the actual volatility coefficient, and the recommended action is typically "migrate_spot" or "fallback_on_demand".

These signals tell you when to avoid or exit. If m5.xlarge instances in eu-west-1b show a volatility coefficient of 0.31, you should migrate running workloads to more stable availability zones or switch to On-Demand temporarily. The confidence score reflects how consistent this volatility pattern has been across our sampling windows.

## Why One API for Both Signal Types

We unified both signal types under a single /signals endpoint because they represent different facets of the same decision: where and when to run Spot workloads. DevOps teams need both perspectives within the same automation scripts and monitoring dashboards.

The shared schema eliminates integration complexity. Both signal types return confidence scores from 0.0 to 1.0, TTL values in seconds, and structured evidence fields. Your API client handles spot_arbitrage and interruption_risk signals identically, then branches on the type field to determine the appropriate action.

Our public signals endpoint on the [transparency page](https://www.refinex.io/transparency) shows both signal types in the same feed. You can see arbitrage opportunities alongside interruption warnings, with the same suppression logic applied to both types. Signals below confidence thresholds get suppressed regardless of type.

## How to Handle Each Signal Type

Your automation should treat these signals as complementary inputs, not competing recommendations. A spot_arbitrage signal tells you to buy, while an interruption_risk signal for the same region tells you to wait or choose a different availability zone.

When you receive a spot_arbitrage signal with confidence above 0.7, launch new Spot instances or migrate workloads to capture the savings. When you receive an interruption_risk signal above the same confidence threshold, delay new Spot launches in that availability zone or migrate existing instances to more stable regions.

The TTL field becomes critical for timing these decisions. Arbitrage opportunities typically have shorter TTL values because price spreads change quickly. Interruption risk signals carry longer TTL values because volatility patterns persist across multiple hours.

We suppress both signal types using identical confidence thresholds and staleness checks. The suppression rate applies equally to arbitrage and interruption signals, maintaining consistent quality standards across both detection paths.

[View the live signal log →](https://www.refinex.io/transparency)

---
*Keith Brown*
*CTO, RefineX*