---
title: "Why Every Spot Signal Has an Expiry Date"
meta_title: "Signal TTL Systems: Why Spot Recommendations Expire Fast"
date: "2026-05-20"
description: "AWS Spot signals built on stale pricing data become historical trivia. RefineX expires signals every minute to ensure recommendations reflect current market conditions."
slug: "signal-ttl-expiry-spot-recommendations"
tags: ['aws', 'spot', 'signal-design']
schema:
  type: Article
  datePublished: "2026-05-20"
  author: "Keith Brown"
  publisher: "RefineX"
canonical: "https://www.refinex.io/blog/signal-ttl-expiry-spot-recommendations"
published: false
---

A spot recommendation built on 15-minute-old pricing data is not advice. It is historical trivia. When AWS spot markets reprice in seconds, any signal derived from stale inputs becomes worthless faster than the time it takes to provision an instance.

RefineX runs an expiration scheduler every minute that invalidates signals whose TTL has elapsed. This is not defensive programming. This is recognition that in spot markets, freshness determines whether a signal represents current opportunity or outdated information that could cost you money.

## What Happens When Signals Expire

The `expire_old_signals()` function queries the database for any signal where `expires_at` is less than the current timestamp. These signals have their `is_active` flag set to false, removing them from API responses immediately. The process logs the count of expired signals but never the specific recommendations that were invalidated.

Our current suppression rate sits at 47.9% over the past two hours. This means nearly half of all generated signals are either expired due to TTL limits or suppressed for confidence thresholds before reaching any API consumer. The three interruption signals generated in the same window maintained an average confidence of 0.85, but only the two that remained within their TTL windows were delivered.

When spot markets reprice rapidly during AWS regional events, TTL expiry rates spike. Signals that looked attractive when generated at 10:00:05 AM become dangerous recommendations by 10:01:30 AM if the underlying c5.large price in us-east-1a has moved from $0.045 to $0.078 per hour. The 90-second difference matters more than the 67% savings calculation that originally triggered the signal.

## How TTL Values Are Determined

Every signal carries a TTL value expressed in seconds, stored alongside the confidence score and expected value calculations. The `expires_at` timestamp is computed at signal creation time by adding the TTL duration to the creation timestamp. This approach ensures that signals expire based on when they were generated, not when they are retrieved.

The TTL duration varies by signal type and market volatility. Spot arbitrage signals in stable regions may carry 300-second TTLs, while interruption risk signals during peak demand periods expire in 90 seconds. The specific TTL for each delivered signal is visible in our transparency log, where suppression reasons include "ttl_expired" alongside confidence-based suppressions.

Instance families with higher volatility receive shorter TTL windows. An m5.xlarge signal in a stable availability zone might remain valid for five minutes, while the same instance family in a zone experiencing demand spikes expires in two minutes. The evidence JSON contains the market conditions that determined the initial TTL, but the expiration timestamp is absolute regardless of whether conditions improve.

## Why Stale Data Creates False Signals

The public signal feed shows how TTL expiry prevents false recommendations from reaching production systems. When signals are marked `suppressed: true` with `suppression_reason: "stale_data"`, these represent cases where the underlying pricing data was outdated at signal generation time, not signals that expired due to time passage.

A signal generated from pricing data collected at 09:45:00 but processed at 09:50:30 fails our freshness requirements before TTL expiry becomes relevant. These signals are suppressed during the scoring phase rather than delivered and later expired. The distinction matters because TTL expiry catches signals that were valid when created but became stale due to market movement, while data staleness suppression catches signals built from already-outdated inputs.

Current market conditions show 2 active signals remaining from recent generation cycles. The other signals generated in the same timeframe were either suppressed for confidence thresholds below 0.5 or expired when their TTL windows closed. Our [transparency log](https://www.refinex.io/transparency) records both suppression types with specific timestamps and reasons.

## The Cost of Conservative TTL Windows

Short TTL windows mean more signals expire before being acted upon, even when the underlying recommendations would have remained accurate. This creates a tradeoff between signal freshness and signal availability. We choose freshness because acting on stale spot recommendations carries asymmetric risk compared to missing opportunities due to expired signals.

The Redis cache layer respects TTL expiration without manual invalidation. When signals expire in the database, cache entries naturally expire via their own TTL settings, maintaining consistency between cached and database states. The expiration scheduler logs successful runs with expired signal counts but never logs the specific instance types or regions where signals were invalidated.

Conservative TTL settings suppress potentially profitable signals to prevent recommendations based on market conditions that no longer exist. This approach reduces signal volume but improves the reliability of delivered recommendations. The suppression rate reflects this discipline, not system limitations.

## Signal Expiry During Market Events

When AWS reprices capacity in specific regions, signals with longer TTL windows become dangerous faster than normal expiration cycles would catch them. The one-minute expiration frequency means signals can remain active for up to 60 seconds after their designated expiry time, depending on when the scheduler last ran.

The `BlockingScheduler` ensures that expiration jobs complete before the next cycle begins, preventing overlapping expiration runs that could create race conditions between signal generation and expiration. The scheduler logs startup and shutdown events but does not log individual job executions beyond the expired signal count.

Market volatility makes TTL discipline more important, not less. When spot prices move quickly, the temptation is to extend TTL windows to deliver more signals. We do the opposite. Rapid price movement triggers shorter TTL windows and higher suppression rates because stale recommendations become more dangerous, not just less optimal.

[View the live signal log →](https://www.refinex.io/transparency)

---
*Keith Brown*
*CTO, RefineX*