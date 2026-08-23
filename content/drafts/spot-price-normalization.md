---
title: "How We Normalize AWS Spot Prices Before Scoring"
meta_title: "Spot Price Normalization: How RefineX Handles Raw AWS Data"
date: "2026-05-12"
description: "Raw AWS Spot prices contain noise that distorts confidence scores. RefineX normalizes prices into hourly buckets with mean and standard deviation before deterministic scoring."
slug: "spot-price-normalization-aws-data-refinex"
tags: ['aws', 'spot', 'data-engineering', 'confidence-scoring']
schema:
  type: Article
  datePublished: "2026-05-12"
  author: "Keith Brown"
  publisher: "RefineX"
canonical: "https://www.refinex.io/blog/spot-price-normalization-aws-data-refinex"
published: false
---

Raw AWS Spot price data is noisy by design. A single m5.large instance in us-east-1a might report prices every few minutes, but brief repricing events can create outliers that skew confidence calculations. RefineX normalizes all raw price observations into hourly buckets before scoring. This preprocessing step removes noise while preserving the statistical properties we need for deterministic confidence bands.

## What Is Price Normalization in Spot Markets?

Price normalization transforms individual spot price observations into statistical summaries over fixed time windows. Instead of scoring against raw prices like $0.0464, $0.0891, $0.0422 collected at random intervals, we aggregate these into hourly buckets containing mean, standard deviation, min, max, and sample count. The confidence scorer then operates on normalized data rather than raw observations.

## Why Raw Prices Distort Confidence Scores

AWS publishes spot price changes as they occur. An availability zone might see three price updates in one hour and seventeen in the next, depending on supply and demand fluctuations. Our raw price collector captures these observations in the `raw_prices` table with exact timestamps.

The problem emerges during confidence calculation. A brief spike to $0.15 for m5.large in us-west-2b, surrounded by stable $0.05 prices, will artificially inflate the volatility component if treated as equivalent to sustained price increases. Single outliers from millisecond-level repricing events carry the same statistical weight as hour-long price levels.

We solve this by bucketing raw observations into hour-aligned windows. The normalization worker runs every hour, aggregating the previous hour's raw prices by cloud, region, and instance type. Each bucket produces a `NormalizedPrice` record containing statistical summaries rather than individual observations.

## How RefineX Normalizes Hourly Buckets

Our normalization process runs in `src/workers/process/normalize_prices.py` as an hourly cron job. The worker queries raw prices from the previous completed hour and groups them by instance family and availability zone. For each group, we calculate mean spot price, standard deviation, min, max, and total sample count.

The aggregation query uses PostgreSQL's statistical functions directly. We compute `func.avg(RawPrice.spot_price)` for the hourly mean and `func.stddev(RawPrice.spot_price)` for population standard deviation. Sample count comes from `func.count(RawPrice.id)` to track how many individual price observations contributed to each normalized record.

Standard deviation gets special handling since PostgreSQL returns NULL for single-observation groups. The code sets `std_dev_value = float(agg.std_dev or 0.0)` to ensure confidence calculations don't fail on sparse data. A zero standard deviation correctly represents perfect price stability within that hour.

We store normalized data in the `normalized_prices` table with an `hour_bucket` timestamp aligned to hour boundaries. The confidence scorer queries this table instead of raw prices when building 30-day historical profiles for stability calculations.

## How Normalized Data Improves Confidence Scoring

The confidence scorer in `src/workers/score/confidence_scorer.py` pulls 30 days of normalized prices when evaluating signal reliability. Instead of processing potentially thousands of raw price points, it operates on 720 hourly summaries maximum.

Historical stability calculation compares each hour's average price against the 30-day mean. Hours where the average stayed within 10% of the historical average count as stable periods. The stability score becomes the percentage of stable hours, ranging from 0.0 to 1.0.

Volatility calculation uses the average standard deviation across all hourly buckets, divided by average price to create a coefficient of variation. This metric captures intra-hour price fluctuations while remaining comparable across different absolute price levels.

Sample size weighting factors in the total number of hourly observations available. Confidence scores for instance types with 720 hours of normalized data receive full sample size weight, while newer instance families with limited history get proportional weighting.

The composite confidence formula combines these normalized components with fixed weights: 30% historical stability, 25% market depth, 20% sample size, 15% volatility, and 10% interruption rate. All inputs derive from normalized hourly data rather than raw observations.

## Conservative Defaults for Missing Data

Instance types without sufficient normalization history default to 0.5 confidence rather than failing score calculation. This conservative approach prevents new AWS instance families from generating high-confidence signals until we accumulate meaningful normalized price history.

The normalization worker includes duplicate detection to prevent reprocessing completed hourly buckets. Each run checks for existing `NormalizedPrice` records matching the target hour before running aggregation queries. This idempotency ensures consistent normalized data even if the worker runs multiple times.

Our current suppression rate of 48.5% over the past two hours reflects this conservative approach. Signals score against normalized data, but confidence thresholds remain high enough to suppress borderline cases. The public [transparency log](https://www.refinex.io/transparency) shows every suppression decision with the calculated confidence score that triggered the suppression.

Normalization creates the foundation for deterministic scoring. Raw prices contain essential market information, but hourly statistical summaries provide the stable input layer our confidence algorithms require. The preprocessing step costs processing time but eliminates noise-driven scoring errors that would reduce signal reliability.

[View the live signal log →](https://www.refinex.io/transparency)

---
*Keith Brown*
*CTO, RefineX*