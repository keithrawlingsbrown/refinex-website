---
title: "Why Every Spot Signal Has an Expiry Date"
meta_title: "Spot Signal TTL Expiry: Why Fresh Data Matters for AWS EC2"
date: "2026-05-23"
description: "Every RefineX spot signal expires within minutes. Here's why stale pricing data gets suppressed instead of delivered, and how TTL prevents historical trivia."
slug: "spot-signal-ttl-expiry-fresh-data"
tags: ['aws', 'spot', 'signal-design']
schema:
  type: Article
  datePublished: "2026-05-23"
  author: "Keith Brown"
  publisher: "RefineX"
canonical: "https://www.refinex.io/blog/spot-signal-ttl-expiry-fresh-data"
published: false
---

A spot recommendation built on 15-minute-old pricing data is not advice. It is historical trivia. Every RefineX signal carries a TTL that expires within minutes of creation, and signals derived from stale inputs are suppressed rather than delivered regardless of how attractive the underlying spread appears.

What is signal TTL? Time-to-live defines how long a spot signal remains valid before automatic expiry. Our TTL system ensures every delivered signal reflects current market conditions rather than outdated pricing snapshots. When AWS spot markets reprice rapidly, signal freshness becomes critical and TTL expiry rates spike.

## How Signal Expiration Works

Every signal in our database carries an `expires_at` timestamp calculated from the signal creation time plus its assigned TTL. The maintenance worker runs every minute, querying for signals where `expires_at` has passed and marking them inactive. This happens automatically without human intervention.

Our `expire_old_signals()` function performs this cleanup on a fixed schedule. The worker queries all active signals, compares their expiry timestamps against the current time, and flips their `is_active` flag to false. The process logs the count of expired signals for audit purposes. Currently, we expire signals every minute rather than waiting for longer intervals.

The TTL value itself varies by signal type and market conditions. Spot arbitrage signals typically carry shorter TTLs than interruption risk signals because pricing spreads change faster than availability patterns. A signal created during stable market conditions might receive a 300-second TTL, while the same signal type during volatile periods gets 120 seconds.

## Why Fresh Data Matters More Than Attractive Spreads

Spot pricing can shift within seconds across AWS regions. A signal showing 60% savings on m5.large in us-east-1a becomes meaningless if that pricing changed five minutes ago. We suppress these expired signals rather than delivering stale recommendations because acting on outdated data creates false confidence.

Consider a real scenario from our current operations. Today we suppressed 48.1% of potential signals in the past two hours, with three active interruption signals carrying an average confidence of 0.85. Many suppressions occur because the underlying pricing data aged past its TTL window, even when the mathematical savings calculation remained attractive.

The public transparency log at our [transparency page](https://www.refinex.io/transparency) shows this discipline in action. Signals marked as suppressed often carry suppression reasons like "stale_data" or "ttl_expired" rather than confidence-based rejections. This represents our conservative approach to signal delivery.

## Implementation Details Behind TTL Management

Our signal model includes dedicated columns for lifecycle management. The `ttl` field stores the time-to-live in seconds, while `expires_at` contains the calculated expiration timestamp. The `is_active` boolean flag controls whether the signal appears in API responses. Database indexes on these fields ensure efficient expiry queries.

The scheduled maintenance process uses APScheduler to run expiration checks at one-minute intervals. Each run queries signals where `expires_at` is less than the current timestamp and `is_active` remains true. The bulk update operation sets these signals to inactive status and logs the count for monitoring purposes.

Cache invalidation happens naturally through Redis TTL rather than manual clearing. Signal cache entries carry their own expiration timers that align with database signal TTLs. This prevents serving cached responses for expired signals without additional cleanup logic.

## Conservative Defaults as Architecture

Signal expiration represents discipline rather than limitation. We designed the system to err toward suppression rather than delivery of questionable signals. Every TTL starts conservatively short and only extends based on market stability indicators.

This approach means fewer total signals but higher confidence in delivered recommendations. Engineers receive signals they can act on immediately rather than sorting through potentially outdated information. The suppression rate serves as a quality metric rather than a coverage problem.

The alternative would be delivering every signal regardless of data freshness and letting users determine relevance. We reject this approach because it shifts risk assessment from our system to individual engineers making real-time infrastructure decisions.

When AWS repricing events occur, our TTL system responds by increasing expiry rates rather than extending signal lifetimes. This ensures rapid market changes surface quickly through signal suppression patterns rather than gradually through declining confidence scores.

[View the live signal log →](https://www.refinex.io/transparency)

---
*Keith Brown*
*CTO, RefineX*