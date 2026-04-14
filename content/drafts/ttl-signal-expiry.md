---
title: "Why Every Spot Signal Has an Expiry Date"
meta_title: "Spot Signal TTL: Why AWS Pricing Data Expires in Minutes"
date: "2026-04-14"
description: "RefineX expires spot signals after minutes, not hours. Stale pricing data becomes historical trivia, not actionable intelligence."
slug: "spot-signal-ttl-expiry-aws-pricing"
tags: ['aws', 'spot', 'signal-design']
schema:
  type: Article
  datePublished: "2026-04-14"
  author: "Keith Brown"
  publisher: "RefineX"
canonical: "https://www.refinex.io/blog/spot-signal-ttl-expiry-aws-pricing"
published: false
---

A spot recommendation built on 15-minute-old pricing data is not advice. It is historical trivia. When AWS reprices a market, the window between useful signal and outdated noise measures in minutes, not hours. This is why RefineX assigns every signal a time-to-live value and expires them aggressively rather than letting stale recommendations accumulate in the system.

## What Is Signal TTL?

Signal TTL (time-to-live) defines how long a spot market recommendation remains valid before expiry. Our system calculates TTL based on market volatility and data freshness, typically ranging from 5 to 30 minutes. When a signal expires, it moves from active to suppressed state automatically, ensuring users never receive recommendations based on outdated market conditions.

The `expire_signals.py` worker runs every minute, checking the `expires_at` timestamp against current time. Expired signals have their `is_active` flag set to false, removing them from API responses while preserving them in the audit trail. This creates a clean separation between actionable intelligence and historical data.

## How RefineX Calculates Signal Expiry

Every signal generated for an AWS EC2 instance family and availability zone receives an expiry timestamp calculated from three factors: data collection time, market volatility, and regional pricing stability. The system tracks when spot pricing data was last updated and assigns shorter TTL values to signals derived from rapidly changing markets.

Our current implementation in the Signal model stores both `ttl` seconds and an absolute `expires_at` datetime. The maintenance worker queries for signals where `expires_at < now()` and marks them inactive. Today we maintained 2 active signals with an average confidence of 0.85, while suppressing 46.4% of potential signals over the past two hours due to various quality filters including TTL expiry.

The evidence JSON field captures the market conditions at signal creation time, allowing us to reconstruct why a particular TTL was assigned. When markets reprice rapidly, we see TTL expiry rates spike as the system correctly identifies that recent pricing shifts have invalidated earlier recommendations.

## Why Stale Data Gets Suppressed

A signal recommending m5.large instances in us-east-1a based on pricing from 20 minutes ago serves no operational purpose. Spot markets can reprice within seconds, making the original recommendation irrelevant or potentially harmful. Rather than deliver questionable intelligence, we suppress expired signals entirely.

The suppression logic appears in our public signals endpoint, which derives suppression reasons from available data. Signals with `confidence < 0.5` get flagged as "confidence_below_threshold" while those exceeding their TTL receive "ttl_expired" or "stale_data" classifications. This transparency allows users to understand exactly why a potential signal was withheld.

Our [public transparency log](https://www.refinex.io/transparency) shows both delivered and suppressed signals with their suppression reasons. This week we blocked signals that would have recommended spot instances just minutes before AWS repriced those markets upward. The suppression prevented users from receiving advice that was technically accurate when generated but obsolete when delivered.

## The Cost of Conservative Defaults

Aggressive TTL policies mean we suppress more signals than we deliver. This is intentional architecture, not operational limitation. Every suppressed signal represents a choice to prioritize accuracy over volume, ensuring that delivered recommendations reflect current market reality rather than historical snapshots.

The tradeoff appears in our metrics: higher suppression rates during volatile market periods, fewer total signals delivered, but significantly higher accuracy for signals that do ship. When AWS reprices multiple regions simultaneously, our TTL system correctly identifies that most pending signals have become unreliable and suppresses them rather than flooding users with outdated recommendations.

This conservative approach means RefineX users receive fewer signals overall but can trust that each delivered signal reflects current market conditions. The alternative would be higher volume with lower reliability, effectively shifting the burden of validating signal freshness to users rather than handling it systematically.

## Signal Freshness During Market Volatility

Regional repricing events test TTL policies most severely. When AWS adjusts spot pricing across multiple availability zones, signals generated before the repricing become instantly stale. Our expiry system identifies these conditions and suppresses affected signals automatically rather than requiring manual intervention.

The scheduler runs every 60 seconds, but during high volatility periods we observe signals expiring closer to their minimum TTL values. The system adapts by assigning shorter expiry windows to new signals generated in rapidly changing markets, maintaining signal quality at the cost of signal longevity.

Recent market activity demonstrates this dynamic: 6 interruption signals generated in the past 2 hours, with several experiencing shortened TTL due to concurrent pricing changes. The system correctly identified that market conditions were shifting too rapidly for standard expiry windows and adjusted accordingly.

[View the live signal log →](https://www.refinex.io/transparency)

---
*Keith Brown*
*CTO, RefineX*