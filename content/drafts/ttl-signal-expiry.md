---
title: "Why Every Spot Signal Has an Expiry Date"
meta_title: "Spot Signal TTL: Why AWS Recommendations Expire in Minutes"
date: "2026-05-18"
description: "Every RefineX spot signal expires within minutes of creation. Here's why TTL prevents stale pricing data from becoming bad recommendations."
slug: "spot-signal-ttl-expiry-aws-recommendations"
tags: ['aws', 'spot', 'signal-design']
schema:
  type: Article
  datePublished: "2026-05-18"
  author: "Keith Brown"
  publisher: "RefineX"
canonical: "https://www.refinex.io/blog/spot-signal-ttl-expiry-aws-recommendations"
published: false
---

A spot recommendation built on 15-minute-old pricing data is not advice. It is historical trivia. Every signal RefineX generates carries an expiration timestamp, and when that time passes, the signal is marked inactive regardless of how attractive the underlying cost savings appear.

## What is Signal TTL in AWS Spot Markets?

Signal TTL (time-to-live) defines how long a spot recommendation remains valid before expiring. In AWS spot markets, pricing can shift within seconds across availability zones. A signal recommending m5.large in us-east-1a becomes worthless if that recommendation was based on pricing data from 20 minutes ago. Our TTL system ensures delivered signals reflect current market conditions, not historical snapshots.

When we generate a signal, the expires_at timestamp is calculated immediately. Our scheduler runs every minute to mark expired signals as inactive. This is not caution. This is architecture.

## How RefineX Handles Signal Expiration

Our expiration system runs as a dedicated worker process. The expire_signals scheduler executes every minute, querying for signals where expires_at has passed and marking them inactive. We log every expiration event with the count of expired signals.

The implementation is straightforward. We query the signals table for records where expires_at is less than the current time and is_active is true. Those signals are marked inactive in a single transaction. The expired_count gets logged for transparency. Our [public suppression log](https://www.refinex.io/transparency) shows when signals are suppressed for TTL expiry alongside confidence thresholds and duplicate detection.

This happens separate from signal delivery. When you query our API, you only see signals where is_active is true and expires_at is in the future. Expired signals are filtered out at the database level before they reach the response.

## Why Stale Data Creates Bad Recommendations

Spot pricing volatility makes TTL critical for signal accuracy. During regional repricing events, spot markets can shift 40-60% within minutes. A signal generated during stable pricing becomes dangerous advice when market conditions change. We have observed TTL expiry rates spike during AWS pricing updates because signals expire faster than normal market movement would suggest.

Consider a signal recommending migration from on-demand to spot for r5.xlarge in us-west-2c. If generated when spot was 30% below on-demand but delivered when spot has risen to 10% below on-demand, the expected savings calculation is wrong. The confidence score becomes meaningless. The action recommendation could trigger a migration that saves less than the operational cost of the move.

We suppress these signals rather than deliver them with caveats. A conditional recommendation is not a signal. It is noise.

## Our Current TTL Configuration

Most RefineX signals carry TTL values between 300 and 900 seconds (5 to 15 minutes). The exact TTL depends on market volatility indicators and the instance family. Larger instance types get shorter TTLs because their spot markets move less predictably. Stable regions get longer TTLs because pricing patterns are more consistent.

Today we are tracking 7 active signals with a suppression rate of 46.7% over the past two hours. That suppression rate includes TTL expiry, confidence thresholds below 0.5, and duplicate cluster detection. The 12 interruption signals delivered in the past two hours have an average confidence of 0.85.

These numbers demonstrate the discipline required for useful signals. We could deliver more signals by extending TTL windows or lowering confidence thresholds. We choose not to. Signal quality depends on saying no more often than saying yes.

## How Signal Expiration Affects the API Response

When you query our signals endpoint, expired signals do not appear in results. The database query filters on is_active equals true and expires_at greater than current time. This filtering happens before confidence scoring or evidence assembly. You never see a signal that has expired, even by seconds.

Our public endpoint returns both delivered and suppressed signals for transparency. Suppressed signals include a suppression_reason derived from available data. If confidence is below 0.5, the reason is confidence_below_threshold. If expires_at is within 5 minutes of created_at, the reason is stale_data. Otherwise, it is ttl_expired.

This design means our API responses reflect current market conditions. A signal recommending spot usage is valid when you receive it. Whether you act on it within the TTL window is your decision. We provide signals with context. You provide the execution.

Signal expiration is not a limitation of our system. It is the system. Without TTL enforcement, we would be delivering market commentary instead of actionable intelligence. The difference between those two things is what makes RefineX worth using.

[View the live signal log →](https://www.refinex.io/transparency)

---
*Keith Brown*
*CTO, RefineX*