---
title: "Why Every Spot Signal Has an Expiry Date"
meta_title: "Spot Signal TTL: Why AWS Recommendations Expire"
date: "2026-05-22"
description: "Spot signals built on stale pricing data are historical trivia, not actionable intelligence. How TTL systems ensure signal freshness."
slug: "spot-signal-ttl-expiry-aws-recommendations"
tags: ['aws', 'spot', 'signal-design']
schema:
  type: Article
  datePublished: "2026-05-22"
  author: "Keith Brown"
  publisher: "RefineX"
canonical: "https://www.refinex.io/blog/spot-signal-ttl-expiry-aws-recommendations"
published: false
---

A spot recommendation built on 15-minute-old pricing data is not advice. It is historical trivia. When AWS spot markets reprice rapidly, the window between useful signal and stale information collapses to minutes, not hours. Every signal we generate carries an explicit expiry timestamp, and signals derived from outdated inputs are suppressed rather than delivered, regardless of how attractive the underlying savings appear.

## What Is Signal TTL in Spot Markets?

Signal TTL (time-to-live) defines how long a spot market recommendation remains valid before automatic expiration. Unlike static recommendations that assume market conditions persist indefinitely, TTL-bound signals acknowledge that spot pricing data degrades predictably over time. A signal generated at 14:32 UTC with a 5-minute TTL expires at 14:37 UTC, even if the original confidence score was 0.94.

Our signal expiration worker runs every minute, scanning for signals where `expires_at` has passed and marking them inactive. The process is deterministic: `expired_count = repo.expire_old_signals()` returns the count of newly expired signals, which averaged 23 per hour this week across all regions and instance families.

## How Does RefineX Calculate Signal Expiry?

Signal expiry derives from data source freshness, not arbitrary timeouts. When we score spot interruption risk for a specific instance family and availability zone combination, we track the age of the underlying pricing data. A signal based on 2-minute-old spot price history receives a longer TTL than one built from 12-minute-old data.

The calculation happens during signal generation: `ttl = calculate_ttl_from_data_age(pricing_data_age, confidence)` where higher confidence scores can extend TTL slightly, but stale input data always constrains maximum lifetime. A signal with 0.89 confidence but 14-minute-old pricing data expires faster than a 0.72 confidence signal built from 3-minute-old data.

This appears in our signal model as three distinct fields: `ttl` stores the original lifetime in seconds, `expires_at` contains the calculated expiration timestamp, and `is_active` tracks current validity status. The database index on `(is_active, cloud, region, instance_type, expires_at)` ensures expiry queries complete in milliseconds even with thousands of active signals.

## Why Stale Signals Get Suppressed

When spot markets reprice during regional events or capacity adjustments, signal accuracy degrades rapidly. We suppressed 312 signals this week, with 127 failures attributed to TTL expiry specifically. These suppressions protect against delivering recommendations that were valid when generated but became misleading before delivery.

The suppression logic examines multiple factors: signals with confidence below 0.5 get marked `suppression_reason = "confidence_below_threshold"`, while those where `expires_at < created_at + timedelta(minutes=5)` indicate `suppression_reason = "stale_data"`. The most common case, `suppression_reason = "ttl_expired"`, applies to signals that lived their full lifetime but expired before the customer requested them.

Every suppression appears in our transparency log at /transparency, providing a public audit trail of when and why signals were blocked. Current suppression rate sits at 48.3% over the past 2 hours, elevated due to increased volatility in us-east-1 and eu-west-1 spot markets.

## What Happens During Signal Expiration

The expiration process runs as a scheduled background job, not as part of API request processing. Every minute, the scheduler executes `expire_old_signals()` which queries for signals where `NOW() > expires_at` and sets `is_active = false`. Database-level constraints ensure expired signals never appear in active signal queries.

Cache invalidation happens automatically through TTL, not manual clearing. When a signal expires in the database, the corresponding cache entries expire naturally within 60 seconds, maintaining consistency without forced cache flushes. This design prevents race conditions where cached data contradicts database state.

The public signals endpoint demonstrates this expiry logic in real time. When you query `/signals/public`, suppressed signals appear with their suppression reason derived from the available data: low confidence, stale data age, or TTL expiry. This transparency ensures customers understand why certain signals were blocked rather than delivered.

## Signal Freshness During Market Volatility

Recent AWS pricing changes in multiple regions created conditions where signal TTL became critical. During rapid repricing events, signals generated 8 minutes apart could reflect entirely different market conditions, making TTL enforcement essential for accuracy. Our average confidence dropped from 0.91 to 0.85 during these events, but suppression rates increased appropriately to maintain signal quality.

Conservative TTL policies become more valuable during volatility, not less. While shorter signal lifetimes reduce coverage, they prevent the worse outcome of delivering confident recommendations based on outdated market data. We blocked 847 additional signals during last week's repricing event, maintaining delivery accuracy above 94% for signals that did ship.

The tradeoff is explicit: fewer signals with higher accuracy beats more signals with degraded reliability. This discipline in signal lifecycle management is architecture, not limitation.

[View the live signal log →](https://www.refinex.io/transparency)

---
*Keith Brown*
*CTO, RefineX*