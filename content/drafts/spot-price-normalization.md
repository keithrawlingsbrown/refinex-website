---
title: "How We Normalize Spot Prices Before Scoring"
meta_title: "Spot Price Normalization: How RefineX Preprocesses AWS Data"
date: "2026-05-02"
description: "RefineX buckets raw AWS spot prices into hourly windows with mean and standard deviation before confidence scoring. Here's our deterministic approach."
slug: "spot-price-normalization-before-scoring"
tags: ['aws', 'spot', 'data-engineering', 'confidence-scoring']
schema:
  type: Article
  datePublished: "2026-05-02"
  author: "Keith Brown"
  publisher: "RefineX"
canonical: "https://www.refinex.io/blog/spot-price-normalization-before-scoring"
published: false
---

Raw AWS spot prices are noisy. A brief repricing event in us-east-1a can spike m5.large from $0.032 to $0.089 for six minutes, then drop back to baseline. Without normalization, that single outlier observation would distort our confidence scores.

What is spot price normalization? It is the process of aggregating raw spot price observations into time-bucketed statistical summaries before scoring. RefineX collects raw prices every few minutes but normalizes them into hourly buckets containing mean, standard deviation, min, max, and sample count. This preprocessing step removes noise while preserving the statistical properties we need for deterministic confidence calculation.

## Why Raw Prices Cannot Be Scored Directly

Our workers collect spot price data from the AWS EC2 API continuously. Each observation contains cloud, region, availability zone, instance type, spot price, on-demand price, and timestamp. These raw observations land in the `raw_prices` table indexed by cloud, region, instance type, and timestamp.

The problem is volatility. In a single hour, we might see 12 price observations for m5.large in us-east-1a ranging from $0.032 to $0.089 and back. If we scored confidence on each raw observation, temporary spikes would trigger false signals. A cluster running stable workloads would receive interruption warnings during routine AWS repricing events.

Our confidence scorer needs statistical stability over time windows, not point-in-time snapshots. This requires aggregation first, scoring second.

## Hourly Bucketing Process

The `normalize_hourly_prices()` function runs every hour and processes the previous hour's raw data. We bucket observations by hour, then aggregate by cloud, region, and instance type combination.

Each hourly bucket contains the average spot price, minimum observed price, maximum observed price, standard deviation, and total sample count for that instance type in that region during that hour. The hour bucket timestamp represents the start of the hour being normalized.

For example, all m5.large observations in us-east-1 between 14:00 and 14:59 UTC get aggregated into a single normalized record with hour bucket 14:00. If we collected 12 raw observations during that hour with prices ranging from $0.032 to $0.041, the normalized record shows average $0.037, min $0.032, max $0.041, standard deviation $0.003, and sample count 12.

The normalization worker checks if we have already processed a given hour bucket to avoid duplicate work. Once normalized, the hourly aggregates feed into our confidence scoring pipeline.

## Statistical Foundation for Confidence Scoring

Our confidence calculation requires 30-day historical stability analysis. The `calculate_confidence()` function queries normalized prices, not raw prices, for the target instance type and region combination over the past 30 days.

Historical stability gets calculated as the percentage of hourly buckets where the average price stayed within 10 percent of the overall 30-day average. Market depth estimation uses the total sample count across all hourly buckets. Sample size weighting divides the available hourly buckets by 720, which represents 30 days times 24 hours.

Volatility calculation takes the average standard deviation across all hourly buckets, then divides by the average price to get a normalized volatility ratio. Without hourly normalization, this volatility calculation would be meaningless because raw price observations include both legitimate market moves and temporary AWS repricing noise.

The confidence formula combines historical stability (30 percent weight), market depth score (25 percent), sample size weight (20 percent), inverse volatility (15 percent), and inverse interruption rate (10 percent). Each component requires normalized price data to produce reliable results.

## Implementation Details

The normalization pipeline uses SQLAlchemy aggregation functions including `func.avg()`, `func.min()`, `func.max()`, `func.stddev()`, and `func.count()` grouped by cloud, region, and instance type. Standard deviation handling includes a null check because PostgreSQL returns null when calculating standard deviation on a single value.

Each normalized record gets stored with the hour bucket timestamp truncated to the hour boundary. Our database indexes cover cloud, region, instance type, and hour bucket for efficient historical queries during confidence scoring.

We suppress signals with confidence scores below our threshold, and every suppression gets logged to our public transparency log at [/transparency](https://www.refinex.io/transparency). This includes suppressions caused by insufficient normalized price history for new instance types or regions.

Current market state shows 48.6 percent suppression rate over the past two hours, with average confidence of 0.85 across active signals. This suppression rate reflects our conservative approach to signal quality, which starts with proper price normalization before any scoring occurs.

[View the live signal log →](https://www.refinex.io/transparency)

---
*Keith Brown*
*CTO, RefineX*