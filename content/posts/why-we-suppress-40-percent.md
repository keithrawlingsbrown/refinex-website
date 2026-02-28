---
title: "Why We Suppress 85% of Our Own Spot Signals"
date: "2026-02-28"
description: "Most spot market tools optimize for signal volume. We optimize for survivability. Here is why suppression rate is the metric that matters."
tags: ["aws", "spot", "signal-design"]
published: true
---

## The number most spot tools hide

Every spot arbitrage system generates more signals than it delivers. The question is whether you can see the ones that were rejected — and why.

RefineX publishes a public log of every signal the engine processes, including the ones we suppress. As of today, that log shows an 85% suppression rate across the last 20 signals. That number is not a failure metric. It is the point.

## Why overfiring destroys trust faster than underfiring

An autoscaler acting on a bad spot signal does not just miss a saving. It can trigger a migration into a region that is about to reprice, cause a workload interruption, or generate a cascading rebalance that costs more than the original inefficiency.

Engineers learn quickly. One bad signal and the integration gets disabled. The threshold for trust in infrastructure tooling is binary — it either works reliably or it gets removed.

This is why RefineX applies four suppression gates before any signal reaches the delivery layer.

## The four suppression gates

**Confidence below threshold.** Every signal starts with a raw price spread. That spread is then adjusted for the current regime state — STABLE_DISCOUNT, VOLATILE, TRANSITIONING, or COMPRESSED. If the regime-adjusted confidence score falls below 0.75, the signal is suppressed regardless of how large the raw spread is. A 70% savings opportunity in a VOLATILE regime is not an opportunity. It is a trap.

**Six-hour clustering window.** If a higher-confidence signal for the same region and instance type is already active, any subsequent signal for that combination is suppressed. Autoscalers do not need the same recommendation twice. Duplicate signals create noise that degrades the signal-to-noise ratio over time.

**High-volatility regime.** When the market state for a region is classified as VOLATILE or TRANSITIONING, all signals for that region are suppressed at the source. Price spreads in volatile regimes revert faster than the time it takes an autoscaler to act. Delivering a signal into a volatile regime is delivering stale advice.

**Stale underlying data.** Spot prices move in real time. If the source pricing data used to generate a signal is older than the acceptable freshness threshold, the signal is expired and not delivered. RefineX does not deliver signals derived from stale inputs regardless of how compelling the underlying spread appears.

## What the suppression log actually shows

The [live transparency page](https://www.refinex.io/transparency) shows every signal the engine processed in the last cycle, including suppressed output with the reason for suppression.

In the most recent 20 signals: 3 were delivered (HIGH confidence, stable regime, fresh data). 17 were suppressed — 14 due to TTL expiry, 1 due to stale data, 2 due to confidence below threshold after regime adjustment.

That ratio is normal. The AWS spot market in us-east-1 has been in a compressed spread environment this week, meaning raw price differentials exist but regime-adjusted confidence scores are falling below the delivery threshold. The engine is working correctly. It is choosing not to fire.

## The metric that matters

Most spot tools report signals generated. RefineX reports signals delivered — and the suppression rate tells you how disciplined the engine is being.

A suppression rate near zero means the system fires on everything. That is not precision. That is volume.

A suppression rate above 80% during a compressed market period means the engine detected conditions, evaluated them against four quality gates, and made a deliberate choice not to act. That is the behavior you want from infrastructure tooling.

The signal log is public. The suppression reasons are logged. You can verify the behavior yourself.

[View the live signal log →](https://www.refinex.io/transparency)
