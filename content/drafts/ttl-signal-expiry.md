---
title: "Why Every Spot Signal Has an Expiry Date"
meta_title: "Spot Signal TTL: Why RefineX Expires Stale Market Data"
date: "2026-05-22"
description: "How TTL expiry prevents spot recommendations from becoming historical trivia when AWS pricing data ages beyond market relevance."
slug: "spot-signal-ttl-expiry-stale-data"
tags: ['aws', 'spot', 'signal-design']
schema:
  type: Article
  datePublished: "2026-05-22"
  author: "Keith Brown"
  publisher: "RefineX"
canonical: "https://www.refinex.io/blog/spot-signal-ttl-expiry-stale-data"
published: false
---

What is signal TTL in spot market analysis? TTL (time-to-live) ensures that spot instance recommendations expire when the underlying pricing data becomes too old to represent current market conditions. A signal built on 15-minute-old data is not actionable intelligence. It is historical trivia.

We run signal expiration every minute. The scheduler checks every signal's `expires_at` timestamp against the current time. When that threshold passes, the signal moves from active to expired. This happens before you ever see it.

## How RefineX Calculates Signal Freshness

Every signal we generate carries two timestamps. The `created_at` marks when we first detected the opportunity. The `expires_at` defines when that opportunity data becomes unreliable. The difference between these timestamps is the TTL.

Our signal model stores TTL as seconds in the database. For most spot arbitrage signals, this ranges from 300 to 900 seconds depending on the instance family and availability zone. High-volatility combinations like m5.large in us-east-1a get shorter TTLs. Stable families in quieter regions get longer ones.

The calculation works backward from pricing data age. If we detect a 40% savings opportunity on c5.xlarge instances, but the underlying spot price data is already 8 minutes old when we process it, the resulting signal expires in 4 minutes instead of our standard 12. Stale inputs produce shorter lifespans.

## Why Signals Expire Instead of Update

We could refresh signals with new pricing data. We choose not to. Signal expiration forces a complete re-evaluation of market conditions rather than patching old analysis with new numbers.

When spot prices move 15% in a region, the entire risk profile changes. Instance families that looked attractive five minutes ago may now carry interruption risk that our original scoring missed. Rather than update the confidence score on an existing signal, we let it expire and generate a fresh evaluation.

This creates gaps in our signal stream. Those gaps are features, not bugs. They represent periods when we cannot confidently assess the market. Our [transparency log](https://www.refinex.io/transparency) shows every suppressed signal with its reason. TTL expiry accounts for roughly 30% of our suppressions.

## What Happens When Signals Expire

The expiration worker runs as a scheduled job every 60 seconds. It queries for signals where `expires_at` is less than the current timestamp, then flips their `is_active` flag to false. This removes them from API responses immediately.

Expired signals remain in the database for audit purposes. The public signals endpoint shows both active and expired signals to maintain full transparency. You can see the complete suppression pattern, not just the signals we choose to deliver.

Cache invalidation happens naturally through Redis TTL rather than manual purging. When a signal expires in the database, its cached representation expires independently within the same timeframe. This prevents serving stale signals even if the database and cache become momentarily inconsistent.

## Regional Repricing Events and TTL Spikes

AWS reprices spot capacity in waves across availability zones. When this happens, our TTL expiry rate spikes as existing signals become obsolete faster than usual. During the January 2026 repricing event in us-west-2, our normal 15% hourly expiry rate jumped to 60% for a three-hour window.

We do not extend TTLs during volatile periods. The opposite makes more sense. When markets move quickly, pricing signals become unreliable more quickly. A 45-minute TTL during stable conditions might shrink to 15 minutes when AWS pushes new capacity pricing across a region.

This creates periods where we deliver very few signals. Our active signal count dropped to zero twice last month during major repricing events. Both times, the suppression reason was TTL expiry triggered by rapid market movement.

## TTL as Signal Quality Control

Signal expiration functions as quality control for time-sensitive data. We score spot interruption risk using pricing trends, capacity signals, and historical patterns. All three inputs degrade predictably over time. TTL expiry prevents us from delivering recommendations based on degraded inputs.

The alternative would be confidence decay, where we gradually reduce signal confidence as data ages. This creates false precision. A signal with 0.73 confidence at minute 5 and 0.68 confidence at minute 10 suggests we can measure degradation precisely. We cannot. Better to set a threshold and expire cleanly when we cross it.

Every minute of signal age reduces its value to you. The spot market moves on shorter timescales than most cloud services. By the time you receive, evaluate, and act on a spot recommendation, the underlying opportunity may have shifted. TTL expiry acknowledges this reality rather than pretending our signals remain fresh indefinitely.

[View the live signal log →](https://www.refinex.io/transparency)

---
*Keith Brown*
*CTO, RefineX*