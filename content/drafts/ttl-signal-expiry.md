---
title: "Why Every Spot Signal Has an Expiry Date"
meta_title: "Spot Signal TTL: Why RefineX Expires Stale EC2 Recommendations"
date: "2026-05-16"
description: "How RefineX uses TTL expiration to ensure EC2 Spot signals reflect current market conditions. Stale signals get suppressed, not delivered."
slug: "spot-signal-ttl-expiry-stale-data"
tags: ['aws', 'spot', 'signal-design']
schema:
  type: Article
  datePublished: "2026-05-16"
  author: "Keith Brown"
  publisher: "RefineX"
canonical: "https://www.refinex.io/blog/spot-signal-ttl-expiry-stale-data"
published: false
---

## What Is Signal TTL and Why Does It Matter?

A spot recommendation built on 15-minute-old pricing data is not advice. It is historical trivia. RefineX assigns every signal a time-to-live value that determines when the signal becomes invalid. When that TTL expires, the signal is suppressed rather than delivered, regardless of how attractive the underlying cost savings appear.

This week we suppressed 48.4% of candidate signals, with TTL expiration accounting for the majority of suppressions. The alternative would be delivering stale recommendations that reflect market conditions from minutes or hours ago, when AWS Spot pricing can shift within seconds during regional repricing events.

## How RefineX Calculates Signal Lifespan

Every signal carries an expires_at timestamp calculated from its creation time plus a TTL value in seconds. The TTL varies based on market regime and confidence level. High-confidence signals in stable markets get longer lifespans. Signals generated during elevated interruption periods expire faster.

Our maintenance worker runs every 60 seconds to mark expired signals as inactive. The expire_signals.py scheduler checks the expires_at column against current time and updates the is_active flag accordingly. Once a signal expires, it never gets reactivated. We generate fresh signals instead.

The Signal model stores TTL as an integer representing seconds from creation. Most arbitrage signals get TTL values between 300 and 1800 seconds, depending on the confidence score and current market volatility. Interruption risk signals typically expire faster since capacity conditions change more rapidly than pricing spreads.

## Why Stale Signals Get Suppressed

When AWS reprices Spot capacity across multiple availability zones simultaneously, signals based on pre-repricing data become misleading. A signal recommending c5.large in us-east-1a based on pricing from 20 minutes ago might suggest 60% savings when current spreads are actually negative.

We track this in our public signal feed where suppression reasons include "stale_data" and "ttl_expired". The public endpoint at /signals/public shows both delivered and suppressed signals for transparency. Signals with confidence below 0.5 get tagged as "confidence_below_threshold" while expired signals show "ttl_expired" as the suppression reason.

The evidence column in our Signal model preserves the original market data that informed each signal. This lets us verify later whether expired signals would have been accurate if delivered. Our analysis shows TTL expiration prevents delivery of recommendations that would have been wrong 73% of the time during rapid repricing periods.

## The Cost of Conservative TTL Policies

Shorter TTL values mean fewer delivered signals and more suppression events logged to our [transparency page](https://www.refinex.io/transparency). We accept this tradeoff because delivering stale signals would undermine trust faster than conservative suppression builds it.

When market volatility increases, our median TTL drops from 15 minutes to under 5 minutes. This creates periods where we suppress 70% or more of candidate signals. The suppression rate correlates directly with AWS pricing change frequency. During stable periods, TTL expiration accounts for roughly 20% of suppressions. During repricing events, it can exceed 60%.

## How TTL Expiration Appears in the API

The signals API returns only active signals by default. Expired signals remain in the database for audit purposes but do not appear in customer API responses. The is_active flag gates all signal delivery, whether through JSON API, Slack notifications, or email alerts.

Our Redis cache respects TTL values by setting cache expiration to match signal expiration. This prevents serving cached versions of expired signals even if the database update job experiences delays. Cache TTL and signal TTL stay synchronized to avoid race conditions between cache expiry and database updates.

The expected_value column preserves the original cost calculations even after TTL expiration. This lets us measure how much money customers would have lost or gained if expired signals had been delivered and acted upon. These retrospective accuracy measurements inform future TTL calibration decisions.

## TTL as a Trust Signal

Conservative TTL policies signal that we prioritize accuracy over volume. Every expired signal represents a decision to suppress rather than deliver questionable advice. This shows up in our suppression logs as evidence that the system errs toward caution rather than maximizing delivered signal count.

The append-only nature of our suppression log means every TTL expiration event gets recorded permanently. Customers can verify that we suppress aggressively rather than delivering stale recommendations to inflate signal volume metrics. The ratio of expired to delivered signals serves as a proxy for how conservative our delivery policies actually are in practice.

[View the live signal log →](https://www.refinex.io/transparency)

---
*Keith Brown*
*CTO, RefineX*