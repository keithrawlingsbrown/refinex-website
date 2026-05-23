---
title: "Why Every Spot Signal Has an Expiry Date"
meta_title: "Spot Signal TTL: Why RefineX Expires Old AWS Pricing Data"
date: "2026-05-23"
description: "RefineX expires spot signals after 15 minutes. Stale pricing data becomes historical trivia, not actionable intelligence. Here's how our TTL system works."
slug: "spot-signal-ttl-expiry-system"
tags: ['aws', 'spot', 'signal-design']
schema:
  type: Article
  datePublished: "2026-05-23"
  author: "Keith Brown"
  publisher: "RefineX"
canonical: "https://www.refinex.io/blog/spot-signal-ttl-expiry-system"
published: false
---

A spot recommendation built on 15-minute-old pricing data is not advice. It is historical trivia. When AWS spot prices reprice across availability zones, a signal derived from stale inputs can send you toward an interruption that fresh data would have flagged. Our TTL system ensures every delivered signal reflects current market conditions by expiring signals before they mislead rather than guide.

What is signal TTL? Time-to-live expiry means every spot signal we generate carries an expiration timestamp. When that timestamp passes, the signal becomes inactive and gets suppressed from delivery. The underlying spot opportunity might still exist, but our confidence in the input data has degraded below the threshold where action makes sense.

## How Signal Expiry Works at RefineX

Our expiry system runs on a simple principle: better to suppress a potentially good signal than deliver a definitely stale one. Every signal in our database carries a `ttl` field measured in seconds and an `expires_at` timestamp. When the scheduler runs every minute, it marks expired signals as inactive rather than deleting them. The full history stays visible in our [transparency log](https://www.refinex.io/transparency) for audit purposes.

The expiration scheduler in `expire_signals.py` handles this process deterministically. It queries the database for signals where `expires_at` has passed and flips their `is_active` status to false. Once a signal becomes inactive, our API routes exclude it from delivery but keep it in the historical record. We logged 312 signal expirations this week, with most hitting TTL limits during periods of rapid spot price movement.

Our current TTL defaults vary by signal type and confidence level. High-confidence spot arbitrage signals get longer TTL periods because the underlying economics change more slowly. Interruption risk signals expire faster because capacity constraints shift rapidly across availability zones. The exact TTL calculation lives in the signal generation logic and factors in market volatility, historical repricing frequency, and confidence band thresholds.

## Why Stale Data Becomes Dangerous

Spot markets reprice based on supply and demand dynamics that can shift within minutes. A signal generated when `us-west-2a` had abundant `m5.large` capacity becomes actively misleading if capacity constraints emerge while the signal sits in cache. The 45.3% suppression rate we measured over the past two hours reflects exactly this dynamic. When markets move quickly, our expiry system works harder to maintain signal quality.

Consider what happens without TTL expiry. A signal recommending spot placement in a specific availability zone continues delivering even as the underlying capacity situation deteriorates. Engineers following that guidance face higher interruption risk than the original signal confidence suggested. The alternative approach of extending TTL periods to reduce suppression rates optimizes for signal volume at the expense of signal accuracy.

We choose accuracy over volume. Our signal scoring remains deterministic and grounded in current data because expired signals cannot influence new placement decisions. The seven active signals currently in our system all reflect pricing and capacity data from the past 15 minutes. The suppressed signals from earlier today remain visible for transparency but carry clear expiration markers.

## Signal Lifecycle from Generation to Expiry

When our system generates a new spot signal, it assigns TTL based on the confidence calculation and market conditions. High-confidence signals in stable markets get longer TTL periods. Lower-confidence signals or those generated during volatile periods expire sooner. The `expires_at` timestamp gets written to the database alongside the signal data.

Our public API endpoint shows both delivered and suppressed signals with their expiration status. The `suppression_reason` field distinguishes between signals suppressed for low confidence, stale data, or TTL expiry. This granular tracking lets us measure expiry system performance and adjust TTL parameters based on actual market behavior rather than theoretical models.

The Redis cache layer respects signal TTL automatically. Cached signals expire when their database counterparts do, preventing stale data from persisting in fast-access storage. We do not manually invalidate cache entries because the TTL mechanism handles expiry consistently across both storage layers.

## Conservative Defaults as Architecture

Everything about our TTL system defaults toward caution. Shorter TTL periods mean more suppressions but higher accuracy for delivered signals. Longer periods mean fewer suppressions but higher risk of stale data reaching production systems. We optimize for the engineer who needs to trust that a delivered signal reflects current reality.

Our expiry logs show the tradeoff in practice. During normal market conditions, TTL expiry accounts for roughly 30% of total suppressions. When AWS reprices spot instances across multiple regions simultaneously, that percentage jumps as signals expire faster than the generation system can refresh them with current data. We accept this suppression spike because maintaining signal freshness matters more than maintaining signal volume.

The append-only nature of our signal database means expired signals never disappear from the historical record. This permanence enables post-incident analysis when spot interruptions occur and retrospective validation of TTL parameter choices. We can measure whether signals that expired just before delivery would have generated accurate recommendations or would have led engineers toward suboptimal placement decisions.

[View the live signal log →](https://www.refinex.io/transparency)

---
*Keith Brown*
*CTO, RefineX*