---
title: "Why Every Spot Signal Has an Expiry Date"
meta_title: "Spot Signal TTL: Why RefineX Expires Stale Market Data"
date: "2026-05-20"
description: "RefineX expires spot signals after 15 minutes to prevent stale pricing data from generating misleading recommendations. Here's how our TTL system works."
slug: "spot-signal-ttl-expiry-system"
tags: ['aws', 'spot', 'signal-design']
schema:
  type: Article
  datePublished: "2026-05-20"
  author: "Keith Brown"
  publisher: "RefineX"
canonical: "https://www.refinex.io/blog/spot-signal-ttl-expiry-system"
published: false
---

A spot recommendation built on 15-minute-old pricing data is not advice. It is historical trivia. When AWS spot prices shift rapidly, that attractive arbitrage opportunity you calculated at 14:30 UTC might represent a market state that no longer exists by 14:45 UTC. This is why every signal RefineX generates carries a time-to-live (TTL) and expires automatically when that window closes.

## What Is Signal TTL in Spot Market Intelligence?

Signal TTL (time-to-live) is the maximum age we allow a spot market signal to remain active before it gets suppressed. Our system runs an expiration job every minute that marks signals as inactive once they exceed their configured TTL. This prevents customers from acting on stale pricing data that no longer reflects current market conditions.

Our TTL implementation lives in the Signal model where each record carries both a `ttl` field (duration in seconds) and an `expires_at` timestamp. The maintenance worker queries for signals where `expires_at` has passed and flips their `is_active` flag to false. Once expired, these signals no longer appear in the active feed.

## How RefineX Calculates Signal Expiry Times

Every signal gets a TTL based on market volatility for that specific instance family and availability zone. The expires_at timestamp is calculated by adding the TTL duration to the signal's creation time. For most spot signals, we set a 15-minute TTL. High-volatility instance families like GPU instances get shorter windows, sometimes as brief as 5 minutes.

The expiry system runs as a scheduled job that executes every 60 seconds. Our expire_signals worker queries the database for any active signals where the current time exceeds the expires_at value. The worker processes these in batches and logs the total expired count for monitoring. This week we expired an average of 47 signals per hour, with spikes during AWS repricing events reaching 120+ expirations per hour.

## Why Stale Data Gets Suppressed Instead of Delivered

When a signal expires due to stale underlying data, we suppress it rather than deliver it with a warning. This design choice reflects our core principle that uncertain signals should not reach customers at all. A 20-minute-old spot price reading that still shows attractive savings might tempt a customer to launch instances into a market that has already repriced higher.

Our public signal log at [/transparency](https://www.refinex.io/transparency) shows both delivered and suppressed signals with their suppression reasons. This week, stale data accounted for 23% of all suppressions, behind confidence_below_threshold at 41% but ahead of duplicate_cluster at 18%. The log entry includes the specific suppression reason so customers can understand why a seemingly good signal was held back.

## Signal Freshness During Market Repricing Events

AWS spot markets can reprice within seconds when capacity constraints shift. During these events, our TTL system becomes critical for maintaining signal quality. We have observed cascade repricing where one instance family's price increase triggers demand shifts that affect related families within 2-3 minutes. A signal generated before this cascade begins can become misleading by the time it reaches a customer.

Our evidence gathering includes timestamp metadata for all pricing inputs. When the difference between signal generation time and the oldest pricing data point exceeds our staleness threshold, the signal gets flagged for early expiry. This prevents us from delivering recommendations based on data that predates significant market moves.

## How Expired Signals Affect the Suppression Rate

Today our suppression rate sits at 41.2% over the past 2 hours, with TTL expiry contributing significantly to that total. The suppression rate increases during volatile market periods when more signals expire before delivery. Rather than viewing this as a limitation, we consider it a feature. High suppression rates during market volatility indicate the system is working correctly by holding back uncertain signals.

The expire_old_signals function logs every expiration event with a count of affected signals. This data feeds into our internal metrics that track suppression reasons and helps us tune TTL values for different instance families. When we see consistently high expiry rates for a specific instance type, it often indicates we need to shorten the default TTL for that family.

## Conservative Defaults Prevent Stale Signal Delivery

Our TTL system defaults to shorter windows rather than longer ones. New instance families get a conservative 10-minute TTL until we have enough data to calibrate the appropriate window. This approach means we suppress more signals initially but avoid delivering stale data while we learn the market behavior patterns for that instance type.

The expires_at field is indexed for query performance since the expiry job runs every minute across all active signals. We also maintain a composite index on is_active, cloud, region, instance_type, and expires_at to optimize both the expiry queries and the customer-facing API that filters for active signals only.

Every expired signal represents a moment where we chose data quality over signal volume. That tradeoff defines our approach to spot market intelligence.

[View the live signal log →](https://www.refinex.io/transparency)

---
*Keith Brown*
*CTO, RefineX*