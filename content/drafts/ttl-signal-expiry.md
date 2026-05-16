---
title: "Why Every Spot Signal Has an Expiry Date"
meta_title: "Spot Signal TTL System: Why AWS Recommendations Expire"
date: "2026-05-16"
description: "AWS Spot signals built on stale pricing data become historical trivia. RefineX TTL system ensures every delivered signal reflects current market conditions."
slug: "spot-signal-ttl-expiry-system"
tags: ['aws', 'spot', 'signal-design']
schema:
  type: Article
  datePublished: "2026-05-16"
  author: "Keith Brown"
  publisher: "RefineX"
canonical: "https://www.refinex.io/blog/spot-signal-ttl-expiry-system"
published: false
---

A spot recommendation built on 15-minute-old pricing data is not advice. It is historical trivia. When AWS Spot prices shift, any signal derived from previous market conditions becomes worse than useless because it suggests actions based on conditions that no longer exist.

Every RefineX signal carries a TTL that determines when it expires. This is not a convenience feature. It is the core mechanism that prevents stale recommendations from reaching production systems where they could trigger costly mistakes.

## What Is Signal TTL in Spot Markets

Signal TTL defines how long a spot market recommendation remains valid before it must be discarded. Unlike web caching where stale data might slow a page load, stale spot signals can trigger instance launches at prices that no longer exist or suggest availability in zones where capacity has vanished.

Our TTL system runs on a one-minute scheduler that marks signals as inactive when their expiration timestamp passes. The expire_old_signals function queries all active signals, compares their expires_at timestamp to the current time, and deactivates any that have exceeded their lifespan. We suppressed 48.2% of potential signals in the past two hours because their underlying data had aged beyond reliability thresholds.

## How Signal Expiration Prevents Bad Recommendations

The Signal model stores both ttl seconds and an explicit expires_at timestamp. This dual approach prevents edge cases where clock drift or processing delays might keep expired signals active. When a signal ages out, the is_active flag switches to false, which immediately removes it from all API responses.

Expired signals never reach customers. The public signals endpoint shows both delivered and suppressed signals for transparency, but the authenticated API that customers use filters out anything with is_active set to false. This creates a hard boundary between current intelligence and historical data.

Consider a signal recommending m5.large instances in us-east-1a based on a 40% savings versus on-demand. If that signal was generated when spot prices were $0.048 per hour but the current price has jumped to $0.089, acting on the expired signal would result in minimal savings or even losses compared to on-demand pricing.

## TTL Values Reflect Market Volatility

Different signal types carry different TTL values because market conditions change at different rates. Spot arbitrage signals that depend on precise pricing differentials typically expire within 5-10 minutes. Interruption risk signals based on capacity trends might remain valid for 30-60 minutes since underlying capacity changes more slowly than pricing.

The TTL field in our signal model stores the initial lifespan in seconds, while expires_at captures the exact moment when the signal becomes invalid. Our scheduler checks every minute rather than every second because spot market changes operate on minute-scale intervals, not second-scale precision.

Current market conditions show 3 active signals with an average confidence of 0.85. These represent opportunities that passed both freshness and confidence thresholds. The signals that expired over the past hour were not necessarily wrong when generated, but they became unreliable as market conditions shifted.

## Suppression Logs Track Expiry Reasons

Every expired signal appears in our public [transparency log](https://www.refinex.io/transparency) with a suppression reason. The public signals endpoint derives these reasons from signal metadata since we log the decision but not always the specific trigger. Signals suppressed for stale_data had expires_at timestamps that passed before delivery, while ttl_expired indicates the signal aged out during processing.

This creates an audit trail showing not just what signals we delivered, but what signals we blocked and why. When market repricing events cause TTL expiry rates to spike, the suppression log reflects the increased volatility as more signals age out faster than normal.

The transparency extends to our internal operations. The expire_signals scheduler logs every expiration run with the count of signals marked inactive. This creates visibility into both normal operations and unusual conditions where large numbers of signals expire simultaneously due to market disruptions.

## Signal Freshness Over Signal Volume

We could extend TTL values to keep more signals active longer, which would increase delivery volume and appear more responsive to customers. We choose shorter TTL windows instead because fresh signals with limited scope provide more value than comprehensive signals with questionable accuracy.

This design reflects a core principle: discipline in signal management creates trust in signal quality. Every minute our scheduler runs, it evaluates every active signal against current time and deactivates any that have aged beyond reliability. The suppression count often exceeds the delivery count, and this ratio indicates the system is working correctly.

The alternative would be delivering signals regardless of age, which would inflate our delivery metrics while degrading recommendation quality. Better to suppress a signal that might still be useful than deliver one that might be misleading.

[View the live signal log →](https://www.refinex.io/transparency)

---
*Keith Brown*
*CTO, RefineX*