---
title: "Why Every Spot Signal Has an Expiry Date"
meta_title: "Spot Signal TTL: Why RefineX Expires Stale AWS Pricing Data"
date: "2026-05-10"
description: "RefineX expires spot signals after 15 minutes to prevent stale pricing data from reaching customers. See how TTL prevents historical trivia."
slug: "spot-signal-ttl-expiry-stale-data"
tags: ['aws', 'spot', 'signal-design']
schema:
  type: Article
  datePublished: "2026-05-10"
  author: "Keith Brown"
  publisher: "RefineX"
canonical: "https://www.refinex.io/blog/spot-signal-ttl-expiry-stale-data"
published: false
---

A spot recommendation built on 15-minute-old pricing data is not advice. It is historical trivia. When AWS spot markets reprice every few minutes, signals derived from stale inputs become worse than useless because they carry the appearance of current intelligence while reflecting obsolete market conditions.

This is why every RefineX signal carries a time-to-live value and an explicit expiry timestamp. Signals that outlive their TTL are marked inactive and suppressed from delivery, regardless of how attractive the underlying cost savings appear on paper.

## What is Signal TTL in Spot Markets?

Signal TTL (time-to-live) is the maximum duration a spot market signal remains valid after creation. In RefineX, every signal includes a `ttl` field measured in seconds and an `expires_at` timestamp calculated from creation time plus TTL. Once a signal passes its expiry timestamp, it is automatically marked inactive and excluded from API responses.

The current suppression rate of 46.3% over the past two hours reflects active TTL enforcement. Many signals with high confidence scores are being blocked because they aged past their useful life, not because their underlying analysis was flawed.

## How RefineX Enforces Signal Expiry

Signal expiry runs on a one-minute scheduler that queries the database for any active signals where `expires_at` has passed. The maintenance worker in `expire_signals.py` executes this query and flips the `is_active` flag to false for expired signals.

```python
scheduler.add_job(
    expire_old_signals,
    'interval',
    minutes=1,
    id='expire_signals',
    replace_existing=True
)
```

This aggressive expiry schedule ensures that stale signals are removed within 60 seconds of their expiry time. The scheduler logs the count of expired signals on each run, contributing to the transparency data visible on our public signal feed.

When the API serves signals, it filters by the `is_active` flag, which means expired signals are automatically excluded from customer responses. The database retains expired signals for audit purposes, but they never reach production workloads that might act on outdated market intelligence.

## Why Stale Pricing Data Creates False Signals

AWS spot pricing changes frequently based on supply and demand within each availability zone. A signal that shows 60% savings for m5.large instances in us-west-2a might be accurate at creation time but completely wrong 20 minutes later if demand has shifted or AWS has repriced the market.

Delivering aged signals creates a specific type of operational risk. Engineering teams receive what appears to be current market intelligence, make infrastructure decisions based on that data, and then discover the actual spot pricing no longer matches the signal. This leads to either failed spot requests or unexpected cost increases when fallback scenarios trigger.

The `expected_value` field in our signal model includes `savings_percent` and `savings_usd_per_hour` calculations that become misleading once the underlying spot prices have moved. Rather than delivering these stale calculations, we suppress the entire signal and log the suppression reason for audit.

## Signal Suppression vs Signal Expiry

Not all suppressed signals result from TTL expiry. Our public transparency log at [https://www.refinex.io/transparency](https://www.refinex.io/transparency) shows three primary suppression reasons: confidence below threshold, stale data, and TTL expired.

Confidence-based suppression occurs when a signal's confidence score falls below 0.5, indicating insufficient certainty for production use. Stale data suppression happens when input data sources are older than acceptable thresholds, even if the signal itself has not expired. TTL expiry is the final backstop that removes signals based purely on age.

The distinction matters because TTL expiry can remove high-confidence signals that were accurate at creation time but have simply aged past their useful life. These signals appear in our audit logs with full scoring details but are marked as suppressed due to expiry, not quality.

## The Cost of Conservative Signal Discipline

Aggressive TTL enforcement means we suppress signals that might still be accurate. A 20-minute-old signal showing 45% savings could theoretically still reflect current market conditions, but we cannot verify that without real-time repricing of all input data.

This creates a tension between signal freshness and signal volume. Shorter TTL values increase suppression rates but improve accuracy for delivered signals. Longer TTL values increase delivery volume but risk sending stale market intelligence to production systems.

We resolve this tension by defaulting to conservative TTL values and logging every suppression decision. The 5 active signals currently in our system represent the subset that passed both confidence thresholds and TTL checks within the past few minutes. The suppressed signals provide transparency into what we chose not to deliver and why.

Signal expiry is not a limitation of our system. It is the core mechanism that ensures every delivered signal reflects current AWS spot market conditions rather than historical pricing patterns that no longer apply.

[View the live signal log →](https://www.refinex.io/transparency)

---
*Keith Brown*
*CTO, RefineX*