---
title: "Why Every Spot Signal Has an Expiry Date"
meta_title: "Spot Signal TTL: Why RefineX Expires Stale Market Data"
date: "2026-05-01"
description: "RefineX expires spot signals every minute to prevent stale pricing data from becoming outdated advice. Here's how TTL keeps signals current."
slug: "spot-signal-ttl-expiry-stale-data"
tags: ['aws', 'spot', 'signal-design']
schema:
  type: Article
  datePublished: "2026-05-01"
  author: "Keith Brown"
  publisher: "RefineX"
canonical: "https://www.refinex.io/blog/spot-signal-ttl-expiry-stale-data"
published: false
---

What happens when a spot price recommendation sits in your queue for 15 minutes while the underlying market reprices? You get historical trivia masquerading as actionable intelligence. RefineX prevents this by expiring every signal with a time-to-live (TTL) boundary that invalidates data the moment it becomes stale. A spot signal built on expired pricing data gets suppressed before delivery, regardless of how attractive the savings percentage appears.

## How RefineX Manages Signal Expiry

Every signal in our system carries an `expires_at` timestamp that determines its validity window. Our expiration scheduler runs every minute, scanning the signal table for records where the current time exceeds the expiry threshold. When signals age past their TTL, the system marks them as inactive and removes them from delivery queues.

The scheduler implementation runs as a blocking process with interval-based job execution. We query the signal repository, count expired records, and log the expiration count for transparency tracking. The process handles database connections with proper cleanup and structured error logging for operational visibility.

Our signal model stores the TTL value in seconds alongside the calculated expiry timestamp. This dual approach allows for both programmatic TTL management and direct timestamp comparison during database queries. The `is_active` boolean flag provides a fast filter for queries that need only current signals.

## Why Stale Pricing Data Creates False Signals

AWS Spot markets reprice continuously based on capacity and demand fluctuations across availability zones. A pricing snapshot from 10 minutes ago reflects market conditions that no longer exist. When spot prices spike due to capacity constraints or regional demand shifts, signals based on previous pricing states become actively misleading.

Consider an m5.large signal generated when spot prices were 30% below on-demand rates. If that instance family reprices upward while the signal sits in queue, the actual savings opportunity may have disappeared or reversed entirely. Delivering that signal creates a recommendation to act on market conditions that changed after the data collection timestamp.

We see this pattern during AWS regional events or large-scale capacity shifts. Signal expiry rates spike as market volatility invalidates pricing assumptions faster than normal TTL windows. Our transparency log shows these patterns clearly, with suppression reasons tracking whether signals died from confidence issues or TTL expiration.

## The One-Minute Expiry Window

RefineX runs signal expiration checks every 60 seconds rather than using longer intervals or real-time invalidation. This frequency balances operational overhead with data freshness requirements. Real-time expiry would create excessive database load without meaningful accuracy improvements, while longer intervals would allow stale signals to persist beyond acceptable staleness thresholds.

The minute-based schedule aligns with our pricing data collection intervals and AWS Spot market update frequencies. Since AWS publishes spot price changes in near-real-time but not with microsecond precision, minute-level expiry granularity captures the practical boundaries of market state changes.

Our expiry scheduler uses APScheduler with blocking execution and systematic job replacement to prevent overlap between expiry runs. The scheduler logs start and stop events for operational monitoring and handles shutdown signals cleanly during service updates or restarts.

## Suppression Over Correction

When signals expire, we suppress them rather than attempting to refresh the underlying data with current pricing. This approach prevents the system from delivering signals based on mixed temporal data where some inputs reflect current conditions while others remain stale.

Signal suppression creates an auditable trail of what we chose not to deliver and why. The [transparency log](https://www.refinex.io/transparency) shows expiry-based suppressions alongside confidence-based rejections, providing visibility into both types of signal rejection logic. Suppression reasons derive from signal state analysis, with TTL expiry distinguished from confidence threshold failures.

This conservative approach means we sacrifice potential valid signals to avoid delivering any recommendations based on temporal inconsistencies. The tradeoff favors precision over coverage, ensuring that delivered signals reflect coherent market snapshots rather than mixed temporal states.

## Cache Invalidation and TTL Alignment

Our Redis cache layer respects the same TTL boundaries as database signal records. Rather than manually invalidating cache entries when signals expire, we rely on natural TTL expiration in the cache to maintain consistency with database state. This approach reduces coordination complexity between cache and database layers while maintaining temporal alignment.

The cache TTL values align with signal expiry windows to prevent scenarios where cached data outlives the corresponding database records. When the expiry scheduler marks database signals as inactive, the corresponding cache entries expire through their own TTL mechanisms within the same time window.

Signal queries check both database `is_active` flags and cache presence to ensure expired signals cannot reach delivery endpoints through either data path. This dual-layer validation prevents race conditions between database updates and cache expiration timing.

[View the live signal log →](https://www.refinex.io/transparency)

---
*Keith Brown*
*CTO, RefineX*