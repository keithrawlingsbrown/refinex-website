---
title: "Confidence Bands vs Binary Signals: Why Most Spot Tools Give You a Coin Flip"
date: "2026-03-01"
description: "Binary buy/avoid recommendations ignore the most important variable in spot market arbitrage — how confident the signal actually is. Here is what that costs you."
tags: ["aws", "spot", "signal-design", "elastigroup"]
published: true
---

## The signal most tools do not send you

There is a number missing from almost every spot market tool: how confident the recommendation actually is.

AWS Instance Advisor gives you five interruption frequency buckets — <5%, 5–10%, 10–15%, 15–20%, >20% — based on trailing 30-day averages. Spot.io's Elastigroup, now part of Flexera's VM optimization platform, tells you it uses "AI-driven selection" and guarantees "99.999% service availability." Both tools give you a direction. Neither tells you how much to trust it.

That gap is the problem.

## What a bucket is not

The AWS approach is a sensible starting point. Interruption frequency over 30 days is real data. The problem is that a 30-day average is not a confidence score — it is a historical summary.

AWS acknowledges this directly: "the actual interruption rate for your workloads will depend on point-in-time available capacity." The bucket tells you what happened last month. It does not tell you what is happening right now in us-east-2 for c6i.xlarge with the current regime state.

Spot markets reprice continuously. A <5% interruption bucket built on 30-day trailing data tells you nothing useful about a Tuesday afternoon pricing spike. The bucket is static. The market is not. AWS's own guidance redirects users to a separate tool — Spot Placement Score — for real-time likelihood assessments, which means the Advisor alone is an incomplete picture.

## What Elastigroup shows and does not show

Elastigroup's positioning centers on "AI-driven selection and predictive rebalancing" that "predicts interruptions before they happen." There is no public methodology for how that prediction works. No confidence scores. No suppression log. No visibility into what the system chose not to recommend, and why.

The interface presents a recommendation. The user is expected to act on it.

This is the black-box model. It optimizes for ease of use, and there is a market for that. But engineers running production workloads on spot need to know when not to trust a recommendation as much as when to follow one. A 99.999% SLA claim attached to an opaque signal system is a marketing number, not a design document.

## What confidence bands actually are

RefineX uses three confidence bands instead of raw scores. The distinction matters in practice.

Raw scores — 0.68 or 0.81 — feel precise but require calibration that most users should not need to do. What does 0.68 mean in a VOLATILE market versus a STABLE_DISCOUNT market? The answer changes depending on regime state, and a raw number without regime context is incomplete information.

Confidence bands absorb the regime adjustment:

**HIGH (≥ 0.75)** — Delivered to autoscaler. Regime is stable, price spread is significant, false positive risk is low. Act on this.

**MEDIUM (0.50–0.74)** — Delivered with advisory flag. Conditions are favorable but regime shows early instability markers. Monitor closely.

**WATCH (< 0.50)** — Suppressed. Signal detected, confidence insufficient for delivery. Logged for audit.

The bands are not static thresholds. A signal that scores HIGH in a STABLE_DISCOUNT regime may be reclassified to WATCH if volatility increases before delivery. The band reflects current conditions at evaluation time — not a historical average applied after the fact.

## Why the suppression rate tells you more than the signal count

The [RefineX transparency page](https://www.refinex.io/transparency) shows 20 signals logged in the most recent cycle — 0 delivered, 20 suppressed. 100% suppression rate.

That number is not a system failure. It is the system working correctly.

The suppressed signals include instances like c6i.xlarge in us-east-2 with MEDIUM confidence and 68% estimated savings versus on-demand — attractive on paper. They were suppressed because their TTL expired before delivery. The underlying pricing data was no longer fresh enough to act on. A signal derived from stale inputs is not a signal. It is noise with a timestamp.

An autoscaler acting on a stale spot signal does not just miss a saving. It can trigger a migration into a market about to reprice, generating an interruption that costs more than the spread it was chasing. That failure mode is worse than not acting. The suppression gate exists because of that failure mode.

The transparency page logs all of this: the region, the instance type, the confidence band, the savings estimate, the suppression flag, and the reason. You can verify the engine's decision-making directly — signal by signal.

## The asymmetry that matters

Most spot tools report the signals they generated. RefineX reports the signals it chose not to send — and explains each one.

AWS's five buckets do not tell you when the model's confidence in its own historical data is low. Elastigroup's AI does not show you whether it suppressed anything or why. The RefineX suppression log is public, updated every 60 seconds, and includes the reason for every signal that did not ship.

That asymmetry is the design. Overfiring destroys trust faster than underfiring. One bad signal and engineers disable the integration. The suppression rate is not a metric to minimize — it is evidence of discipline.

[View the live signal log →](https://www.refinex.io/transparency)
