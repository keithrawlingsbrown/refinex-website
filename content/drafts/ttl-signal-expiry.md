---
title: "Why Every Spot Signal Has an Expiry Date"
meta_title: "Spot Signal TTL: Why RefineX Expires Stale Market Data"
date: "2026-05-19"
description: "RefineX expires spot signals every minute to prevent stale pricing data from becoming recommendations. Here's how our TTL system works."
slug: "spot-signal-expiry-ttl-system"
tags: ['aws', 'spot', 'signal-design']
schema:
  type: Article
  datePublished: "2026-05-19"
  author: "Keith Brown"
  publisher: "RefineX"
canonical: "https://www.refinex.io/blog/spot-signal-expiry-ttl-system"
published: false
---

## What is Signal TTL?

Signal TTL (time-to-live) ensures that RefineX spot recommendations reflect current market conditions by automatically expiring signals built on outdated pricing data. A spot recommendation derived from 15-minute-old AWS pricing is not actionable advice. It is historical trivia. Our system runs expiration checks every 60 seconds to prevent stale signals from reaching engineers who need real-time market intelligence.

When AWS spot markets reprice rapidly during high-demand periods, signal freshness becomes critical. Today's active signals show a 42.9% suppression rate over the past two hours, with 3 interruption signals delivered at an average confidence of 0.85. These numbers reflect our TTL system working as designed, blocking outdated signals before they can mislead infrastructure decisions.

## How RefineX Handles Signal Expiration

Our expiration worker runs as a scheduled job that queries the signals table every minute. The `expire_old_signals()` function identifies records where `expires_at` has passed and marks them as inactive by setting `is_active = False`. This prevents expired signals from appearing in API responses while preserving the full audit trail for our [transparency log](https://www.refinex.io/transparency).

The scheduler operates independently of signal generation. When the pricing ingestion pipeline creates a new signal, it calculates `expires_at` by adding the TTL value to the current timestamp. Most spot arbitrage signals get a 300-second TTL. Interruption risk signals receive longer TTLs because the underlying capacity data changes less frequently than pricing data.

This separation means expired signals cannot accidentally resurface if the expiration job experiences delays. Once `is_active` switches to false, that signal disappears from all customer-facing endpoints regardless of system load or processing backlogs.

## Why We Suppress Instead of Refresh

RefineX suppresses expired signals rather than attempting to refresh them with newer data. This design choice prevents us from shipping signals that mix old confidence calculations with fresh pricing inputs. Signal confidence derives from multiple data sources collected at specific timestamps. Refreshing only the pricing component while keeping stale confidence metrics would create hybrid signals that misrepresent actual market conditions.

Our suppression approach also maintains signal integrity for audit purposes. When we suppress a signal due to TTL expiration, the original evidence and confidence calculation remain unchanged in the database. Engineers reviewing past decisions can see exactly what data informed each signal at the time of generation.

The alternative approach of refreshing expired signals would require re-running the complete confidence calculation pipeline. This would consume computational resources on signals that may have already lost relevance due to changed market conditions or infrastructure requirements.

## TTL Varies by Signal Type

Different signal types receive different TTL values based on the volatility of their underlying data sources. Spot arbitrage signals tracking price spreads between on-demand and spot instances get shorter TTLs because AWS spot pricing can change every few minutes during high-demand periods.

Interruption risk signals receive longer TTLs because they rely on capacity trend analysis rather than immediate pricing snapshots. An interruption risk assessment for `m5.large` instances in `us-east-1a` remains valid longer than a pricing arbitrage calculation that depends on the current spot rate.

The TTL assignment happens during signal creation based on the signal type field. Our evidence shows that 30-day interruption patterns change more slowly than 5-minute pricing patterns, so the TTL values reflect this difference in data stability.

## Monitoring Expiration Rates

We track expiration rates as a signal quality metric. High expiration rates during normal market conditions indicate that our TTL values may be too conservative, causing us to discard potentially valid signals. Low expiration rates during volatile periods suggest our signals may be staying active longer than market conditions warrant.

The current 42.9% suppression rate over the past two hours reflects a mix of TTL expiration, confidence threshold suppression, and duplicate detection. TTL expiration accounts for approximately 60% of our suppressions during stable market periods, rising to 80% during AWS repricing events.

Our public suppression log records the specific reason for each suppressed signal, including those expired due to TTL. This transparency allows engineers to understand whether suppression resulted from stale data, low confidence, or other quality controls.

## Database Design for TTL

The signals table includes both `ttl` and `expires_at` columns to support different expiration strategies. The `ttl` field stores the original time-to-live value in seconds, while `expires_at` contains the calculated expiration timestamp. This design allows us to analyze TTL effectiveness across different signal types and market conditions.

Our expiration query uses an index on `is_active` and `expires_at` to efficiently identify expired signals without scanning the entire table. The query performance remains consistent even as signal volume grows, ensuring expiration checks complete within their 60-second execution window.

The `is_active` boolean provides fast filtering for API responses. Instead of calculating expiration status on each request, we pre-compute it during the scheduled expiration job and store the result as a database field.

[View the live signal log →](https://www.refinex.io/transparency)

---
*Keith Brown*
*CTO, RefineX*