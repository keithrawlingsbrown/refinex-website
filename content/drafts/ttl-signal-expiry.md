---
title: "Why Every Spot Signal Has an Expiry Date"
meta_title: "AWS Spot Signal TTL: Why Every Signal Expires | RefineX"
date: "2026-05-21"
description: "Every AWS Spot signal at RefineX expires after minutes. Stale pricing data becomes historical trivia, not actionable intelligence."
slug: "aws-spot-signal-ttl-expiry-system"
tags: ['aws', 'spot', 'signal-design']
schema:
  type: Article
  datePublished: "2026-05-21"
  author: "Keith Brown"
  publisher: "RefineX"
canonical: "https://www.refinex.io/blog/aws-spot-signal-ttl-expiry-system"
published: false
---

A spot recommendation built on 15-minute-old pricing data is not advice. It is historical trivia. Every signal RefineX delivers carries an expiry timestamp, and signals derived from stale inputs are suppressed rather than delivered regardless of how attractive the underlying spread appears. Today we track 6 active signals with a 47.3% suppression rate over the past two hours.

What is signal TTL? Time-to-live determines how long a spot market signal remains actionable before the underlying data becomes too old to trust. When spot markets reprice rapidly during AWS regional events, signal freshness becomes critical and TTL expiry rates spike accordingly.

## How TTL Prevents Stale Data Delivery

Our expiration scheduler runs every minute, systematically marking signals as inactive when they exceed their TTL window. The expire_old_signals function queries the database for any signal where expires_at has passed, then marks is_active as false. We log every expiration event with a count of how many signals expired in that cycle.

The TTL value itself is calculated when each signal is created, factoring in data source freshness and market volatility indicators. A signal generated from 10-minute-old spot pricing data in us-east-1 during normal conditions might receive a 5-minute TTL. The same signal during a regional repricing event would expire in 2 minutes.

Expired signals never reach the API response. When a client requests signals for a specific instance family and availability zone combination, the repository layer filters out any record where is_active is false. The public transparency endpoint shows both delivered and suppressed signals, with suppression reasons derived from the signal state at query time.

## Why We Suppress Rather Than Warn

RefineX makes a binary choice on every signal: deliver it or suppress it. We do not deliver signals with warning labels about staleness. A signal with questionable freshness fails our confidence threshold and gets marked as suppressed with reason "stale_data" in the public log.

This approach eliminates the temptation to act on marginal intelligence. When a signal shows 40% savings on m5.large instances in us-west-2a, but the underlying pricing data is 12 minutes old, we suppress the entire signal. The savings calculation becomes irrelevant when the input data cannot be trusted.

Our suppression logic checks multiple conditions during signal evaluation. Confidence below 0.5 triggers "confidence_below_threshold" suppression. Signals where expires_at falls within 5 minutes of created_at get suppressed as "stale_data". Signals that expire after creation but before delivery show as "ttl_expired" in our [transparency log](https://www.refinex.io/transparency).

## The One-Minute Expiration Cycle

Signal expiration runs on a strict one-minute schedule using APScheduler. The process is deterministic and mechanical. Every minute, the expire_old_signals function executes, marks expired signals as inactive, and logs the count. Cache entries expire naturally via their own TTL values, requiring no manual invalidation.

This frequency ensures that stale signals are removed from circulation quickly, but it also means signals with very short TTL values might expire between generation and client retrieval. We accept this tradeoff deliberately. Better to suppress a potentially valuable signal than deliver questionable intelligence.

The scheduler logs both successful completions and failures. A typical log entry shows "signal_expiration_success" with an expired_count of 15 during active market periods, or 3 during stable conditions. These logs feed into our internal monitoring but also contribute to the public transparency record.

## TTL During Market Volatility

When AWS reprices spot capacity across multiple availability zones simultaneously, our TTL calculations become more aggressive. Signals that would normally remain valid for 8 minutes might expire in 3 minutes during high-volatility periods. We detect these conditions through pricing change velocity and adjust TTL values accordingly.

The most recent example occurred during a us-east-1 repricing event where spot prices for compute-optimized instances shifted 15% within a 10-minute window. Our TTL system automatically shortened expiration windows, leading to a temporary suppression rate of 67% as signals expired faster than normal. This prevented delivery of recommendations based on pre-event pricing data.

Regional events like these validate our approach to conservative TTL management. When market conditions change rapidly, shorter signal lifespans become a feature rather than a limitation. We would rather suppress 200 signals than deliver 10 based on outdated assumptions.

## Signal Lifecycle in Practice

Each signal carries its expiry timestamp from the moment of creation. The expires_at field is calculated as created_at plus TTL seconds, and this calculation happens before any confidence scoring or suppression logic runs. Signals that would expire too quickly never make it past initial validation.

Our current confidence average of 0.85 across active signals reflects this filtering approach. Low-confidence signals get suppressed, and signals with insufficient TTL margins never reach the scoring phase. The signals that survive both filters represent our highest-conviction opportunities with adequate time windows for client action.

The result is a signal feed where every delivered recommendation reflects current market conditions, not historical patterns. Clients can trust that any signal in their API response remains actionable for its stated TTL period.

[View the live signal log →](https://www.refinex.io/transparency)

---
*Keith Brown*
*CTO, RefineX*