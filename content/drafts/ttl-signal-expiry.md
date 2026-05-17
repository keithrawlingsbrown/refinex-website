---
title: "Why Every Spot Signal Has an Expiry Date"
meta_title: "Spot Signal TTL: Why RefineX Expires Stale Market Data"
date: "2026-05-17"
description: "RefineX expires spot signals built on stale pricing data every minute. Learn why 15-minute-old recommendations become historical trivia, not actionable intelligence."
slug: "spot-signal-ttl-expiry-stale-data"
tags: ['aws', 'spot', 'signal-design']
schema:
  type: Article
  datePublished: "2026-05-17"
  author: "Keith Brown"
  publisher: "RefineX"
canonical: "https://www.refinex.io/blog/spot-signal-ttl-expiry-stale-data"
published: false
---

A spot recommendation built on 15-minute-old pricing data is not advice. It is historical trivia. When AWS spot prices shift by 40% in under ten minutes, which happens regularly during repricing events, signals derived from stale inputs become worse than useless. They become misleading.

RefineX addresses this through aggressive time-to-live (TTL) enforcement. Every signal carries an expiration timestamp, and our maintenance worker expires old signals every 60 seconds. When a signal expires, it transitions from active to suppressed state. No exceptions.

## What Is Signal TTL?

Signal TTL is the maximum lifespan of a spot market recommendation. Each signal in our system contains a `ttl` field (measured in seconds) and an `expires_at` timestamp. Once the current time exceeds `expires_at`, the signal becomes inactive regardless of how attractive the underlying price spread appears.

The TTL system ensures that recommendations reflect current market conditions. A signal suggesting migration from us-east-1a to us-east-1c based on a 60% savings opportunity means nothing if that spread closed 20 minutes ago. We suppress such signals before they reach API consumers.

## How RefineX Enforces Signal Expiration

Our expiration enforcement runs on a one-minute interval via APScheduler. The maintenance worker queries all active signals where `expires_at` has passed and marks them inactive. The process logs every expiration event for audit purposes.

The `expire_old_signals()` function executes this logic deterministically. It queries the signals table, identifies expired records, and updates their `is_active` status to false. No machine learning models influence this process. Time comparison is binary: either `expires_at` is in the past or it is not.

Our Redis cache layer respects these TTL boundaries automatically. When a signal expires in the database, the corresponding cache entry expires via its own TTL mechanism. This prevents stale data from persisting in fast-access storage layers.

## Why Aggressive TTL Prevents False Confidence

Spot markets exhibit three pricing regimes: stable, elevated, and critical volatility. During stable periods, spot prices change gradually and signals remain valid longer. During critical periods, repricing events can invalidate multiple signals within minutes.

We saw this pattern during the us-west-2 repricing event on March 15th. Between 14:20 and 14:35 UTC, r5.large spot prices increased 78% across three availability zones. Signals generated at 14:15 became dangerous by 14:25. Our TTL system expired 23 active signals during this window, preventing delivery of recommendations that would have led to immediate interruptions.

The alternative approach is extending TTL duration to reduce expiration rates. This creates false confidence. A 30-minute TTL might preserve more signals for delivery, but those signals carry hidden staleness risk. We choose conservative defaults because discipline is the product.

## Signal Suppression During Market Volatility

Our public transparency log shows how TTL expiration interacts with confidence thresholds. During today's market conditions, our suppression rate reached 49.3% over the past two hours. This means we blocked nearly half of all potential signals before delivery.

Some suppressions result from confidence scores below 0.5. Others result from TTL expiration. Both suppressions serve the same purpose: preventing delivery of unreliable recommendations. The [transparency log](https://www.refinex.io/transparency) provides real-time visibility into suppression reasons and rates.

When AWS announces regional repricing events, our TTL expiry rates spike immediately. This is correct behavior. Rapid market changes invalidate existing signals faster than usual. Our system adapts by suppressing more aggressively rather than maintaining artificial signal availability.

## Implementation Details Matter

Our signals table includes explicit `expires_at` and `is_active` columns. The public API endpoint derives suppression reasons from available data since we do not store explicit suppression reasons. Signals with `confidence < 0.5` show "confidence_below_threshold" suppression. Signals that expired due to TTL show "ttl_expired" suppression.

The maintenance scheduler runs as a blocking process with job replacement enabled. If signal expiration takes longer than 60 seconds, the next job replaces the running one. This prevents queue buildup during high-volume suppression periods.

We index on `is_active`, `expires_at`, and market identifiers for fast expiration queries. The composite index `idx_active_signals` covers the most common access pattern: finding active signals for specific cloud regions and instance types.

## Why We Expire Rather Than Refresh

The obvious alternative to expiration is signal refresh. Instead of marking old signals inactive, we could update them with current market data. We chose expiration because refresh introduces temporal inconsistencies.

A refreshed signal appears continuous but represents discontinuous market conditions. The original confidence calculation used different inputs than the refresh calculation. This creates false precision. A signal showing 85% confidence across a 20-minute lifespan might have started at 85% and dropped to 45% during refresh.

Expiration preserves signal integrity. Each signal represents a specific market snapshot with specific confidence bounds. When conditions change enough to invalidate that snapshot, we expire the signal and generate a new one. This approach trades signal availability for signal accuracy.

[View the live signal log →](https://www.refinex.io/transparency)

---
*Keith Brown*
*CTO, RefineX*