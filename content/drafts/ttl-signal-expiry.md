---
title: "Why Every Spot Signal Has an Expiry Date"
meta_title: "Spot Signal TTL Expiry: Why RefineX Kills Stale Market Data"
date: "2026-05-08"
description: "RefineX expires every spot interruption signal after its TTL window. Stale pricing data becomes historical trivia, not actionable advice."
slug: "spot-signal-ttl-expiry-stale-data"
tags: ['aws', 'spot', 'signal-design']
schema:
  type: Article
  datePublished: "2026-05-08"
  author: "Keith Brown"
  publisher: "RefineX"
canonical: "https://www.refinex.io/blog/spot-signal-ttl-expiry-stale-data"
published: false
---

What happens when a spot interruption signal sits too long before delivery? It gets killed. Every signal RefineX generates carries an expiry timestamp, and we run an automated job every minute to expire anything past its TTL window. A spot recommendation built on 15-minute-old pricing data is not advice. It is historical trivia.

The AWS Spot market reprices continuously. Instance availability shifts between regions. What looked like a confident signal at 14:32 UTC becomes suspect at 14:47 UTC. Rather than deliver questionable guidance, we suppress signals that outlive their usefulness.

## How Signal TTL Works in Practice

Every signal we score gets a TTL value in seconds and an explicit `expires_at` timestamp. Our expiration worker runs on a one-minute interval, checking the database for any signals where `expires_at` has passed. When it finds expired signals, it flips their `is_active` status to false.

The expiration job logs how many signals it killed in each run. During normal market conditions, we typically expire 3-5 signals per minute. When AWS reprices aggressively across multiple regions, that number can spike to 15-20 as more signals hit their TTL before customers can act on them.

We currently expire signals after 15 minutes for spot arbitrage opportunities and 10 minutes for interruption risk alerts. These windows reflect how quickly the underlying market data can shift. A c5.large signal in us-east-1a that looked attractive at $0.034 per hour might be priced at $0.052 fifteen minutes later.

## Why We Kill Signals Instead of Refreshing Them

The obvious alternative would be refreshing signals with new data when they approach expiry. We chose suppression instead. Refreshing a signal requires re-scoring with fresh market data, which changes the confidence band and expected savings. At that point, you have a different signal, not an updated one.

More importantly, a signal that needs refreshing suggests the original scoring window was too narrow. Better to suppress it and let the next scoring cycle generate a fresh signal if market conditions still warrant one. This approach prevents us from chasing price movements with constant updates.

Our [transparency log](https://www.refinex.io/transparency) shows the mix of delivered and suppressed signals, including those killed for TTL expiry. When spot markets move quickly, you will see more `ttl_expired` entries in the suppression reasons. This is the system working correctly, not a failure.

## The Expiry Rate as Market Signal

We track expiry rates as a secondary market indicator. When 30-40% of signals expire before delivery, it usually means spot markets are repricing faster than normal. Either AWS is adjusting capacity across regions, or demand patterns are shifting rapidly.

During the last major repricing event in March, our expiry rate hit 52% as signals expired faster than we could deliver them. Rather than loosen our TTL windows, we maintained the 10-15 minute limits. Better to deliver fewer signals with higher confidence than flood customers with stale recommendations.

Current expiry patterns also inform our scoring models. If c5.xlarge signals consistently expire in us-west-2, it suggests that instance family is more volatile in that region. We factor this historical expiry data into future confidence calculations.

## Implementation Details

The expiration worker uses APScheduler to run every minute. It calls a repository method that bulk-updates expired signals and logs the count. We do not manually invalidate Redis cache entries since they carry their own TTL and expire naturally.

Signal expiry happens at the database level through a simple status flip. Expired signals remain in the database for audit purposes, but they no longer appear in active signal queries. The transparency endpoint shows both active and expired signals to maintain full visibility into our suppression decisions.

Each signal carries its evidence payload and expected value calculations, so expired signals preserve the reasoning that originally justified their creation. This lets us analyze why certain signals expired unused and adjust our scoring models accordingly.

The expiration logic treats any signal past its `expires_at` timestamp as stale, regardless of confidence score or potential savings. A 0.94 confidence signal with 67% projected savings gets the same treatment as a marginal 0.51 confidence signal. TTL expiry is absolute.

We suppress expired signals with the reason `ttl_expired` in our audit trail. During volatile market periods, this becomes one of our top suppression categories, sometimes accounting for 40% of all suppressions in a given hour.

[View the live signal log →](https://www.refinex.io/transparency)

---
*Keith Brown*
*CTO, RefineX*