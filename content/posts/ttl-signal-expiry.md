---
title: "Why Every Spot Signal Has an Expiry Date"
meta_title: "Spot Signal TTL: Why RefineX Expires Every Signal"
date: "2026-03-30"
description: "RefineX expires every Spot signal after 15 minutes. Stale pricing data creates historical trivia, not actionable signals."
slug: "spot-signal-ttl-expiry-system"
tags: ['aws', 'spot', 'signal-design']
schema:
  type: Article
  datePublished: "2026-03-30"
  author: "Keith Brown"
  publisher: "RefineX"
canonical: "https://www.refinex.io/blog/spot-signal-ttl-expiry-system"
published: true
---

A spot recommendation built on 15-minute-old pricing data is not advice. It is historical trivia. Every signal RefineX delivers carries a TTL that ensures it reflects current market conditions. When that TTL expires, the signal dies regardless of how attractive the underlying spread appears.

## What Is Signal TTL?

Signal TTL (time-to-live) is the maximum age we allow any spot signal to reach before automatic expiry. Every signal in our system includes a `ttl` field measured in seconds and an `expires_at` timestamp that marks its death. Our expiration worker runs every minute, checking the `expires_at` field against current time and marking expired signals as inactive.

When AWS spot prices shift rapidly during regional repricing events, signal freshness becomes critical. We watch TTL expiry rates spike during these periods because the underlying assumptions that generated each signal no longer hold. A signal recommending m5.large in us-east-1a based on pricing from 20 minutes ago may now recommend launching into an interruption zone.

## How RefineX Handles Signal Expiration

Our expiration system runs as a scheduled worker that processes all active signals every minute. The `expire_old_signals()` function queries the database for signals where `expires_at` has passed and marks them as inactive by setting `is_active` to false. This prevents any expired signal from appearing in API responses or reaching delivery channels.

The worker logs each expiration event with the count of signals that died in that cycle. During normal market conditions, we typically expire 10-15 signals per minute. During AWS pricing events, that number can reach 50+ as market volatility shortens the practical lifespan of each signal. Cache entries expire naturally through their own TTL system, requiring no manual invalidation when signals die.

## Why We Suppress Stale Signals

Our public signal endpoint reveals the suppression logic that protects users from acting on outdated information. When we derive suppression reasons for the transparency log, stale data appears as one of three primary causes. Signals with confidence below 0.5 get marked as "confidence_below_threshold." Signals that expire within 5 minutes of creation get flagged as "stale_data." Everything else that dies from TTL expiry gets marked as "ttl_expired."

This suppression system operates independently of signal quality. A signal showing 40% potential savings on c5.xlarge instances gets suppressed the moment its TTL expires, even if the underlying math remains sound. We suppress because the conditions that generated that math have changed. Spot markets move faster than most monitoring systems can track.

## The Architecture of Signal Death

Every signal starts life with a predetermined TTL that reflects the volatility of its target market. High-frequency instance families in competitive regions get shorter TTLs. Stable families in quieter zones live longer. The `expires_at` timestamp gets calculated at signal creation by adding the TTL to the current time, creating a hard deadline that no subsequent processing can extend.

Our signal repository includes an index on the expiration fields to make the cleanup query efficient. The database query that finds expired signals filters on `is_active`, `expires_at`, and related fields without scanning the entire signals table. This matters when processing thousands of signals per hour during active market periods.

The expiration worker itself runs in isolation from the main signal generation pipeline. If signal creation stops, expiration continues. If the database gets loaded with scoring operations, the expiration job still runs every minute. This separation ensures that stale signals die on schedule regardless of what else happens in the system.

## Current Expiration Patterns

Today we show 0 active signals with a 50% suppression rate over the past 2 hours. Of the 8 interruption signals we generated, none survived the confidence and TTL filters to reach delivery. This pattern reflects conservative signal discipline during a quiet market period where most potential signals failed our freshness or confidence thresholds.

You can track these patterns in real-time through our transparency log, which shows every signal we generate alongside its suppression status and reasoning. The append-only nature of this log means you can audit our expiration decisions and verify that TTL enforcement happens as documented.

Signal TTL represents the discipline that separates actionable intelligence from market commentary. We kill signals not because they are wrong, but because they are old. In spot markets, old and wrong converge faster than most systems acknowledge.

[View the live signal log →](https://www.refinex.io/transparency)

---
*Keith Brown*
*CTO, RefineX*