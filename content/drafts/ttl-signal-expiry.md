---
title: "Why Every Spot Signal Has an Expiry Date"
meta_title: "Spot Signal TTL: Why AWS Pricing Recommendations Expire"
date: "2026-05-19"
description: "RefineX expires every Spot signal after 15 minutes. Here's why stale pricing data creates false signals and how TTL prevents bad recommendations."
slug: "spot-signal-ttl-expiry-aws-pricing"
tags: ['aws', 'spot', 'signal-design']
schema:
  type: Article
  datePublished: "2026-05-19"
  author: "Keith Brown"
  publisher: "RefineX"
canonical: "https://www.refinex.io/blog/spot-signal-ttl-expiry-aws-pricing"
published: false
---

A spot recommendation built on 15-minute-old pricing data is not advice. It is historical trivia. RefineX assigns every signal a time-to-live value and expires it automatically rather than delivering stale recommendations that reflect market conditions from the recent past instead of the present moment.

What is signal TTL? Time-to-live determines how long a spot pricing signal remains valid before expiry. RefineX calculates this value based on market volatility for each instance family and availability zone combination. A signal for m5.large in us-east-1a might have a TTL of 900 seconds during stable periods, but drops to 300 seconds when repricing events create rapid price movements across the region.

## How RefineX Calculates Signal TTL

Our signal generation process assigns TTL values based on three factors: current market regime, instance family volatility, and regional pricing patterns. The TTL calculation happens at signal creation time and determines the expires_at timestamp stored in our database.

The Signal model includes both ttl and expires_at columns. The TTL represents the original duration in seconds, while expires_at marks the specific moment when the signal becomes invalid. This dual approach allows us to track both the intended lifespan and the precise expiry time for each recommendation.

When we generate a signal for c5.xlarge in us-west-2b, the system examines recent price movements for that specific combination. If pricing has remained stable over the past hour, the signal receives a longer TTL. If we detect frequent repricing events or unusual spread patterns, the TTL decreases accordingly.

## The Every-Minute Expiration Process

RefineX runs an expiration job every 60 seconds that identifies and marks expired signals. The expire_signals.py worker queries all active signals where expires_at has passed the current timestamp. Rather than deleting these records, we mark them as inactive by setting is_active to false.

This preservation approach serves our transparency requirements. Every expired signal remains visible in our public signal log at /transparency, where users can verify both delivered and suppressed recommendations. The expiration count gets logged with each run, providing visibility into how many signals we invalidate due to staleness.

Our scheduler uses APScheduler to run this process consistently. The one-minute interval ensures that expired signals cannot remain active for longer than 60 seconds past their intended expiry time. This creates a maximum staleness window that we consider acceptable for our signal delivery guarantees.

## Why Expiry Matters More Than Accuracy

During AWS repricing events, we observe signal expiry rates spike above 60 percent as market conditions change faster than normal. These spikes indicate that our TTL calculations are working correctly. The system recognizes unstable conditions and shortens signal lifespans accordingly.

We suppress expired signals rather than extending their lifespans because stale data creates false confidence. A signal showing 40 percent savings based on 20-minute-old pricing data might reflect a spread that no longer exists. Delivering this signal misleads users about current market conditions.

The current suppression rate of 48.2 percent over the past two hours demonstrates this principle in action. Nearly half of our generated signals expired before delivery because market conditions changed enough to invalidate the original analysis. We consider this discipline, not waste.

## TTL Implementation in the API

Our signals API endpoint respects expiry timestamps when serving recommendations. The get_public_signals function queries signals ordered by creation time but includes both active and expired entries for transparency purposes. Active signals show as delivered while expired signals display with suppression reasons.

The suppression_reason derivation logic checks multiple conditions to explain why a signal was blocked. Signals expired due to TTL receive the "ttl_expired" reason, while those expired due to insufficient confidence show "confidence_below_threshold". This differentiation helps users understand whether suppression resulted from timing or quality concerns.

Each API response includes delivered and suppressed counts along with the current suppression rate. This real-time visibility into our filtering process demonstrates how many signals we block compared to those we deliver. Users can verify that we apply the same expiry rules consistently across all recommendations.

## Conservative Defaults by Design

RefineX defaults to shorter TTL values rather than longer ones. When market conditions are unclear, we choose faster expiry over extended signal lifespans. This conservative approach means we suppress more signals than necessary, but ensures delivered recommendations reflect current market state.

The expires_at index on our signals table supports efficient expiry queries as signal volume grows. We can identify expired signals quickly without scanning the entire table, maintaining consistent performance as we process more instance family and availability zone combinations.

Every expired signal contributes to our understanding of market dynamics. High expiry rates signal volatile conditions while low rates indicate stable pricing periods. This data feeds back into our TTL calculation process, creating a feedback loop that improves expiry timing over time.

[View the live signal log →](https://www.refinex.io/transparency)

---
*Keith Brown*
*CTO, RefineX*