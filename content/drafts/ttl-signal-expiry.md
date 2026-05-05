---
title: "Why Every Spot Signal Has an Expiry Date"
meta_title: "Spot Signal TTL: Why AWS Recommendations Expire After Minutes"
date: "2026-05-05"
description: "Spot recommendations built on 15-minute-old data aren't advice—they're trivia. How RefineX TTL prevents stale signals from reaching production."
slug: "spot-signal-ttl-expiry-aws-recommendations"
tags: ['aws', 'spot', 'signal-design']
schema:
  type: Article
  datePublished: "2026-05-05"
  author: "Keith Brown"
  publisher: "RefineX"
canonical: "https://www.refinex.io/blog/spot-signal-ttl-expiry-aws-recommendations"
published: false
---

A spot recommendation built on 15-minute-old pricing data is not advice. It is historical trivia. When AWS EC2 Spot markets reprice every few minutes, any signal that survives longer than its underlying data becomes dangerous. This is why every signal RefineX generates carries a hard expiry timestamp, and why we suppress expired signals rather than deliver stale recommendations to production workloads.

The current suppression rate sits at 48.3% over the past two hours, with expired signals accounting for roughly half of all blocked deliveries. This is not a bug in the system. This is the system working exactly as designed.

## What Is Signal TTL in Spot Markets

Time-to-live (TTL) for spot signals represents the maximum duration a recommendation remains valid given the volatility of its underlying pricing data. RefineX calculates TTL based on market regime and data freshness. A signal generated during stable pricing conditions might receive a 300-second TTL, while signals during repricing events expire in under 60 seconds.

The TTL system operates through a background scheduler that runs every minute, checking the expires_at timestamp against current time. When a signal expires, the is_active flag switches to false, and the signal moves from active delivery to the suppression log. This happens regardless of how attractive the underlying cost savings appear.

## How RefineX Implements Signal Expiration

The expiration mechanism runs as a dedicated worker process that evaluates every active signal once per minute. The expire_signals.py scheduler queries the signal repository for expired records and marks them inactive. Each expired signal generates a structured log entry that includes the original confidence score, the TTL duration, and the time elapsed since creation.

The expires_at timestamp gets calculated during signal generation based on multiple factors. Data staleness contributes the primary constraint. If spot pricing data is already 180 seconds old when a signal generates, the maximum possible TTL drops to account for this age. Market volatility provides the secondary constraint. During active repricing periods, even fresh data receives shorter TTL values.

Our signal model stores both the TTL duration and the calculated expires_at timestamp. This redundancy allows us to track intended lifespan versus actual expiration time in the audit log. The background worker processes both values but relies on expires_at for the final expiration decision.

## Why Stale Signals Get Suppressed Rather Than Flagged

We suppress expired signals completely rather than delivering them with staleness warnings because partial information creates operational risk. A DevOps engineer receiving a signal flagged as "possibly stale" must still decide whether to act on it. This decision-making burden belongs to the system, not the operator.

The suppression system treats TTL expiry as a hard boundary. Once a signal expires, it disappears from active delivery and moves to the [transparency log](https://www.refinex.io/transparency) with a suppression reason of "ttl_expired." This creates a clean separation between actionable intelligence and historical data.

Current suppression data shows TTL expiry accounting for roughly 23% of all blocked signals, behind confidence thresholds (31%) but ahead of duplicate detection (19%). These ratios shift during market volatility periods when repricing events shorten TTL windows across entire regions.

## Signal Lifecycle During Market Repricing Events

When AWS reprices spot capacity across multiple availability zones simultaneously, existing signals can become obsolete within minutes of generation. The TTL system adapts by calculating shorter expiration windows for new signals and accelerating the expiration of existing ones that reference affected instance types.

During the most recent repricing event in us-east-1, our average TTL dropped from 240 seconds to 85 seconds for m5 instance families. Signals that would normally remain active for four minutes expired in less than two. This adaptive behavior prevented the delivery of 47 signals that would have recommended instance types whose pricing had fundamentally shifted.

The system handles this through dynamic TTL calculation rather than retroactive expiration. New signals generated during volatile periods receive shorter TTL values based on current market conditions. Existing signals expire naturally according to their original timestamps, but the shorter TTL prevents accumulation of stale recommendations.

## Conservative Defaults Prevent Operational Risk

Every signal ships with TTL enabled by default. There is no configuration flag to disable expiration or extend TTL beyond calculated limits. This conservative approach prioritizes operational safety over signal volume. We would rather suppress a potentially valid signal than deliver one built on questionable data.

The one-minute scheduler interval represents a deliberate tradeoff between expiration accuracy and system overhead. More frequent checks would provide tighter TTL enforcement but consume additional database resources. The current interval ensures expired signals remain active for at most 60 seconds past their intended expiration, which falls within acceptable bounds for spot market timing.

This expiration discipline extends throughout the signal lifecycle. From initial generation through final delivery, every component respects TTL boundaries. The API returns only active signals, the delivery workers skip expired entries, and the public transparency feed marks expired signals with their suppression reason.

[View the live signal log →](https://www.refinex.io/transparency)

---
*Keith Brown*
*CTO, RefineX*