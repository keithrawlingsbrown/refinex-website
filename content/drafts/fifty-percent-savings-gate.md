---
title: "The 50% Gate: Why We Reject Small Spreads Before Scoring"
meta_title: "AWS Spot 50% Savings Gate - Why RefineX Rejects Small Spreads"
date: "2026-05-15"
description: "RefineX requires minimum 50% savings vs on-demand before scoring AWS Spot signals. Learn why the gate exists and what passes through."
slug: "aws-spot-50-percent-savings-gate-reject-small-spreads"
tags: ['aws', 'spot', 'signal-design']
schema:
  type: Article
  datePublished: "2026-05-15"
  author: "Keith Brown"
  publisher: "RefineX"
canonical: "https://www.refinex.io/blog/aws-spot-50-percent-savings-gate-reject-small-spreads"
published: false
---

## What is the 50% Gate?

The 50% gate is RefineX's first filter for AWS EC2 Spot signals. Before we calculate confidence scores or run any analysis, we check one question: does the current Spot price offer at least 50% savings versus on-demand? If not, the signal never enters our scoring pipeline.

This happens in our arbitrage detector, which runs every 10 minutes and scans the latest AWS pricing data. The threshold is hardcoded as `ARBITRAGE_THRESHOLD = 0.50` in our spot arbitrage detector. No exceptions, no override flags, no special cases.

## Why We Filter on Raw Savings First

The decision to gate on savings percentage before confidence scoring reflects our signal design philosophy. We deliver signals with context, not comprehensive market coverage. A 30% savings opportunity with 95% confidence is still a signal we will never send.

The reason is operational cost versus benefit. Running confidence scoring requires pulling 30 days of historical price data, calculating volatility metrics, analyzing market depth, and computing stability scores. This analysis takes compute time and database queries. More importantly, it creates noise for the DevOps engineer receiving the signal.

Our current active signal count is 3, with a suppression rate of 47.1% over the past 2 hours. This low signal volume is intentional. The 50% gate eliminates many potential signals before they consume scoring resources or appear in our [transparency log](https://www.refinex.io/transparency).

## How the Arbitrage Detection Works

Our arbitrage detector queries the RawPrice table for the most recent pricing data within the last 10 minutes. For each unique combination of cloud, region, availability zone, and instance type, we find the latest timestamp and pull the corresponding Spot and on-demand prices.

The savings calculation is straightforward: `(on_demand_price - spot_price) / on_demand_price`. If this percentage meets or exceeds 0.50, the signal moves to the next stage. If the same signal already exists and is active, we update the pricing data but keep the existing signal record.

Signals that pass the 50% gate but have no historical data default to a 0.5 confidence score in our scoring system. This conservative default means many signals that clear the savings threshold still get suppressed before delivery due to insufficient confidence.

## What Passes the Gate But Gets Suppressed

The 50% gate is necessary but not sufficient for signal delivery. We see regular patterns where signals pass the savings threshold but fail confidence scoring. Instance types with high volatility often fall into this category. A spot price might be 60% below on-demand, but if the 30-day history shows frequent price spikes or interruptions, the confidence score drops below our delivery threshold.

Our confidence calculation weighs several factors: 30% historical stability, 25% market depth, 20% sample size, 15% price volatility, and 10% interruption rate. A signal needs strong performance across multiple dimensions to survive both the 50% gate and confidence scoring.

Regional differences also create interesting gate dynamics. The same instance family might pass the 50% threshold in us-west-2a but not in us-east-1b due to demand patterns. When AWS adjusts on-demand pricing, the gate behavior shifts across all regions simultaneously, sometimes clearing previously filtered signals or blocking previously active ones.

## The Engineering Tradeoff

The 50% gate represents a conscious tradeoff between signal coverage and signal quality. We could lower the threshold to 30% or 25% and catch more opportunities. The cost would be higher compute usage, more database load, and most critically, more noise for end users.

DevOps engineers managing Spot fleets care about reliability as much as cost savings. A 35% discount that requires constant monitoring delivers less value than a 60% discount with stable pricing. The gate enforces this priority at the architecture level.

We currently reject signals representing smaller savings spreads without scoring them. These rejections do not appear in our public suppression log because they never become signals. Only data that passes the 50% gate and enters confidence scoring can be suppressed and logged.

## How On-Demand Pricing Changes Affect the Gate

When AWS adjusts on-demand prices, the 50% gate behavior changes immediately. A Reserved Instance pricing update or on-demand price reduction can push previously active signals below the threshold. Conversely, on-demand price increases can clear new signals through the gate.

We track these dynamics in our pricing normalization pipeline, but the gate logic remains constant. The 50% threshold never changes based on market conditions or AWS pricing updates. This deterministic behavior ensures consistent signal quality regardless of broader pricing volatility.

[View the live signal log →](https://www.refinex.io/transparency)

---
*Keith Brown*
*CTO, RefineX*