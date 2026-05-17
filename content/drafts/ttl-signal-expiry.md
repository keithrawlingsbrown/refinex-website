---
title: "Why Every Spot Signal Has an Expiry Date"
meta_title: "Spot Signal TTL System: Why AWS Recommendations Expire"
date: "2026-05-17"
description: "RefineX signals expire within minutes to prevent stale data delivery. Learn how TTL systems ensure spot recommendations reflect current market conditions."
slug: "spot-signal-ttl-expiry-system"
tags: ['aws', 'spot', 'signal-design']
schema:
  type: Article
  datePublished: "2026-05-17"
  author: "Keith Brown"
  publisher: "RefineX"
canonical: "https://www.refinex.io/blog/spot-signal-ttl-expiry-system"
published: false
---

A spot recommendation built on 15-minute-old pricing data is not advice. It is historical trivia. Every signal RefineX delivers carries an explicit expiry timestamp, and signals derived from stale inputs are suppressed rather than delivered regardless of how attractive the underlying spread appears. This is not caution. This is architecture.

What is signal TTL? Time-to-live represents the maximum age at which a signal remains actionable. When AWS spot prices shift, especially during regional repricing events, the market conditions that generated a signal can disappear within minutes. A signal recommending m5.large in us-east-1a becomes worthless if the pricing snapshot that created it reflects market state from 20 minutes ago.

## How RefineX Implements Signal Expiry

Our expiry system runs as a scheduled job that executes every minute. The code is straightforward. We query for signals where the current timestamp exceeds the expires_at field, mark them as inactive, and log the expiration count. No complex logic. No grace periods. When time expires, the signal dies.

The expire_old_signals function handles this process deterministically. It opens a database session, calls the repository method that identifies expired records, and logs the count of expired signals. The scheduler runs this function every 60 seconds using APScheduler, ensuring that stale signals are removed from circulation consistently.

This expiry job operates independently of signal generation. While our scoring engines produce new signals based on fresh market data, the maintenance worker simultaneously removes signals that have outlived their usefulness. The two processes never interfere with each other.

## Why Signals Expire Fast in Volatile Markets

During AWS pricing shifts, our suppression rate can spike to 48.6% in a two-hour window as signals expire faster than usual. This happens because spot market volatility reduces the effective lifespan of pricing-based recommendations. When us-west-2 experiences rapid repricing across multiple instance families, signals that might normally remain valid for 15 minutes become stale within 5 minutes.

We set TTL values based on instance family and availability zone characteristics. Compute-optimized instances in high-traffic zones get shorter TTLs because their pricing changes more frequently. Memory-optimized instances in stable zones get longer TTLs because their markets move more predictably. The TTL field in our signal model stores this value in seconds, and the expires_at timestamp is calculated when the signal is created.

The evidence column captures the market conditions that existed when the signal was generated. When a signal expires, this evidence becomes a historical record rather than actionable intelligence. We preserve expired signals in the database for analysis but mark them as inactive so they never reach customer endpoints.

## What Happens When Signals Expire

Expired signals are not deleted. They are marked inactive and removed from API responses. Our public signals endpoint shows both delivered and suppressed signals for transparency, but expired signals carry suppression reasons that explain why they were pulled from circulation. Common reasons include confidence_below_threshold, stale_data, and ttl_expired.

The public transparency log at our [transparency page](https://www.refinex.io/transparency) displays this suppression data openly. When you see 312 signals suppressed in a week with 88 delivered, those numbers include signals that expired before delivery. This gives you the complete picture of our signal discipline rather than a curated success story.

Cache invalidation happens naturally through TTL rather than manual clearing. When signals expire in the database, the Redis cache entries expire on their own timeline. This prevents the complexity of coordinated cache invalidation across multiple data stores while ensuring that stale signals do not persist in cached responses.

## Signal Freshness as a Feature

Conservative TTL values are a product feature, not a limitation. We could extend signal lifespans to increase delivery volume, but volume is not the objective. Accuracy is the objective. A signal that expires after 8 minutes serves you better than a signal that delivers after 18 minutes but reflects outdated market conditions.

Every minute, our expiry job runs and logs how many signals were removed from circulation. These logs feed into our monitoring systems and help us understand market volatility patterns. When expiry counts spike, it usually indicates that spot markets are moving faster than usual, which affects our TTL calibration for future signals.

The current state shows 3 active signals with an 85% average confidence score. This low count reflects our willingness to suppress signals rather than deliver questionable recommendations. Signal discipline means saying no more often than saying yes.

[View the live signal log →](https://www.refinex.io/transparency)

---
*Keith Brown*
*CTO, RefineX*