---
title: "How We Score Spot Confidence in 3 Deterministic Signals"
date: "2026-03-08"
description: "Most spot tools treat confidence scoring as a black box. RefineX computes it from three measurable inputs with no machine learning and no probabilistic guessing."
tags: ["aws", "spot", "signal-design", "confidence-scoring"]
published: true
---

## Why we do not use machine learning for scoring

The first engineering decision we made about confidence scoring was that it would have no ML component. That constraint was not arbitrary.

ML models for spot market confidence require labeled training data, which means you need a history of signals where you know whether the outcome was good or bad. In spot arbitrage, labeling is genuinely difficult: an interrupted workload might have been caused by your signal, by a region-wide reprice, or by unrelated demand surge. The signal was not necessarily wrong. The outcome was not cleanly attributable.

A model trained on ambiguous labels learns ambiguous patterns. We chose a different path: compute confidence from raw, observable inputs using fixed, auditable weights. You can read the formula. You can reproduce the score. You can argue with the weights.

## Signal 1: historical price stability

The first input is how stable the spot price has been for this specific combination of cloud, region, and instance type over the last 30 days.

We pull every normalized hourly price observation from our database for that combination. For each observation, we check whether the price fell within plus or minus 10 percent of the 30-day rolling average. The stability score is the fraction of observations that passed that test.

If us-east-1 c7g.xlarge maintained stable pricing in 650 of 720 hourly observations over the past month, the stability score is 0.90. If it bounced outside the band across 200 of those hours, the score falls to 0.72.

This signal carries a 30 percent weight in the final confidence calculation. It is the largest single component because sustained historical stability is the strongest predictor of near-term pricing behavior we have access to. Past pricing does not guarantee future pricing, but an instance type that maintained consistent spot rates across thousands of observations is structurally different from one that spikes weekly.

## Signal 2: market depth

The second input estimates liquidity. We proxy it using the number of raw price observations we have collected for this combination.

The logic is direct: regions and instance types with dense price history are more actively traded and more likely to produce predictable behavior. Thin markets with few observations are harder to read, and a confidence score built on 40 data points should not carry the same weight as one built on 600.

We classify market depth in three tiers. More than 600 observations maps to a score of 1.0. Between 300 and 600 maps to 0.60. Fewer than 300 maps to 0.30.

This signal carries a 25 percent weight. We also apply a parallel sample size adjustment at 20 percent, which scales linearly from 0 to 1 as observations approach 720 — the theoretical maximum for a 30-day hourly window. Together, depth and sample size account for 45 percent of the final score. That weighting is deliberate: data richness matters, and a sparse dataset should discount the output regardless of how favorable the raw spread looks.

## Signal 3: price volatility

The third input is current price volatility, defined as the standard deviation of recent spot prices divided by the average price.

A low ratio means the market is pricing consistently across availability zones and time windows. A high ratio means pricing is fragmented or moving fast. We invert this input, so lower volatility produces a higher signal contribution, and we cap the volatility value at 1.0 to prevent outliers from collapsing the entire score.

Volatility carries a 15 percent weight in the formula. We also apply a fixed 10 percent component representing the baseline interruption rate. For the current build, we use a conservative 5 percent default, which means this component starts at 0.95 and stays there until we integrate per-region interruption data feeds.

## How the three signals combine

The final confidence score is a weighted sum computed in sequence:

```
confidence = (
    0.30 * historical_stability    # 30-day price band consistency
  + 0.25 * market_depth_score      # observation count tier
  + 0.20 * sample_size_weight      # linear coverage fraction
  + 0.15 * (1 - volatility)        # inverted std_dev / avg_price
  + 0.10 * (1 - interruption_rate) # baseline risk discount
)
```

The output is clamped to the range 0.0 to 1.0. If the engine has no price history for a given combination, it returns 0.5 as a neutral default and logs a warning. A signal without history never activates — it stays in the queue and waits.

Signals become eligible for delivery only when the final confidence score exceeds 0.70. Below that threshold, the signal is logged and suppressed. Above it, the signal enters the delivery layer where TTL expiry, regime classification, and deduplication apply separately.

## What deterministic means in practice

Every number in this formula is derived from a count, a ratio, or a historical average. There are no probabilities inferred from a model. There is no embedding lookup. No parameters drift over time. The formula produces the same output given the same inputs at 2am or 2pm, on 10 signals or 10,000.

This is an engineering tradeoff. A trained ML model might produce better accuracy on historical data under the right conditions. It would also require retraining infrastructure, labeled outcome datasets, and ongoing drift monitoring. For infrastructure tooling in production, explainability is not optional. An engineer needs to be able to ask why a signal scored 0.72 and not 0.83 — and the answer needs to be a formula, not a model weight from a checkpoint file.

The scoring logic is embedded in the codebase. The inputs are logged with every score. The suppression log is public. If you disagree with the weight distribution, the math is in front of you.

[View the live signal log →](https://www.refinex.io/transparency)

---
*Keith Brown*
*CTO, RefineX*
