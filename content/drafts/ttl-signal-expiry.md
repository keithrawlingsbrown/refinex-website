---
title: "Why Every Spot Signal Has an Expiry Date"
meta_title: "Spot Signal TTL: Why AWS Pricing Signals Expire"
date: "2026-05-12"
description: "RefineX spot signals expire within minutes using TTL to prevent stale pricing data from reaching production workloads."
slug: "spot-signal-ttl-expiry-aws-pricing"
tags: ['aws', 'spot', 'signal-design']
schema:
  type: Article
  datePublished: "2026-05-12"
  author: "Keith Brown"
  publisher: "RefineX"
canonical: "https://www.refinex.io/blog/spot-signal-ttl-expiry-aws-pricing"
published: false
---

## What Is Signal TTL in AWS Spot Markets?

Every RefineX signal carries an expiration timestamp. When that moment arrives, the signal dies regardless of how attractive the underlying cost savings appear. This time-to-live system prevents stale pricing data from reaching your production workloads. A spot recommendation built on 15-minute-old data is not advice. It is historical trivia.

AWS Spot prices change every few minutes across hundreds of availability zones. When us-east-1a reprices m5.large instances from $0.045 to $0.089 per hour, any signal based on the old price becomes dangerous to act upon. Our TTL system ensures delivered signals reflect current market conditions rather than yesterday's bargains.

## How RefineX Implements Signal Expiration

The expiration system runs as a background scheduler that checks signal validity every minute. Each signal in our database carries three temporal markers: creation timestamp, TTL duration in seconds, and calculated expiry time. When the scheduler runs, it marks expired signals as inactive and logs the suppression count.

Our expire_old_signals function queries the database for signals where the current time exceeds the expires_at timestamp. The system processes these expiries in batches, updating the is_active flag to false for each expired record. This approach means a signal scoring 0.89 confidence with 47% cost savings gets suppressed the moment its TTL expires.

The scheduler itself operates on a simple interval trigger firing every 60 seconds. This frequency balances freshness requirements with database load. During high volatility periods, when AWS reprices aggressively, we see TTL expiry rates spike above normal background levels as market conditions invalidate signals faster than usual.

## The Cost of Stale Signal Delivery

Consider a signal recommending m5.xlarge instances in us-west-2b at $0.083 per hour when on-demand costs $0.192. The spread suggests 56% savings with high confidence. But if AWS repriced Spot to $0.156 five minutes after signal generation, acting on that stale recommendation means paying 88% more than expected while believing you are saving money.

This scenario drives our conservative TTL defaults. Most RefineX signals carry 5-minute expiry windows. For volatile instance families during peak demand periods, we reduce TTL to 2 minutes. The tradeoff is clear: shorter signal lifespans mean higher suppression rates but eliminate the risk of acting on obsolete market data.

The public transparency log at our [transparency page](https://www.refinex.io/transparency) shows this discipline in action. Recent suppression rates average 47.2% over two-hour windows. Nearly half of generated signals never reach delivery because they fail freshness requirements. This is not a bug in our system. This is the system working correctly.

## Why TTL Matters More Than Confidence Scores

A signal with 0.95 confidence based on 20-minute-old pricing data ranks as less valuable than a 0.65 confidence signal generated 30 seconds ago. Confidence measures our certainty about the analysis. TTL measures the relevance of the underlying market data. Both must pass thresholds for delivery.

Our signal scoring pipeline generates confidence bands using deterministic algorithms analyzing historical interruption patterns, regional capacity indicators, and pricing volatility measures. But even perfect analysis becomes worthless when applied to stale inputs. The TTL system acts as a final gate ensuring temporal relevance regardless of analytical precision.

When signals approach expiry, we do not extend their lifespans or refresh them automatically. Each signal represents a specific market snapshot at a particular moment. Extending expiry times would blur the temporal precision that makes signals actionable. Instead, expired signals trigger new analysis cycles that generate fresh signals reflecting current conditions.

## Signal Lifecycle in Production

The complete signal lifecycle spans generation, validation, delivery, and expiry phases. During generation, our workers collect current spot prices, interruption data, and capacity signals from AWS APIs. Validation applies confidence thresholds and TTL calculations. Delivery pushes qualifying signals to API endpoints, Slack channels, and email notifications.

Expiry represents the final phase where signals transition from active to historical status. The background scheduler marks expired signals inactive but preserves the records for audit purposes. This creates an append-only log showing both delivered recommendations and suppressed signals with timestamps and reasons.

Current production metrics show 2 active signals with average confidence of 0.85. The expiry scheduler processed 6 interruption signals in the past two hours with suppression rates holding steady at 47.2%. These numbers reflect normal market conditions where roughly half of generated signals meet delivery criteria while the remainder get suppressed for various reasons including TTL expiry.

The TTL system ensures that when you receive a RefineX signal, the underlying market data driving that recommendation reflects current AWS pricing rather than historical snapshots. This temporal discipline transforms signals from interesting observations into actionable intelligence for production workloads.

[View the live signal log →](https://www.refinex.io/transparency)

---
*Keith Brown*
*CTO, RefineX*