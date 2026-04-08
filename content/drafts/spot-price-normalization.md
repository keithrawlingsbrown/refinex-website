---
title: "How We Normalize Spot Prices Before Scoring"
meta_title: "Spot Price Normalization: How RefineX Preprocesses AWS Data"
date: "2026-04-08"
description: "Raw AWS spot prices contain outliers that distort confidence scores. Here's how RefineX normalizes price data into hourly buckets before scoring."
slug: "spot-price-normalization-before-scoring"
tags: ['aws', 'spot', 'data-engineering', 'confidence-scoring']
schema:
  type: Article
  datePublished: "2026-04-08"
  author: "Keith Brown"
  publisher: "RefineX"
canonical: "https://www.refinex.io/blog/spot-price-normalization-before-scoring"
published: false
---

Raw AWS spot prices are noisy. A single pricing event in an availability zone can create outlier observations that distort confidence scores if fed directly into scoring algorithms. We normalize all spot price data into hourly buckets before calculating confidence scores. This preprocessing step removes noise and creates stable inputs for deterministic scoring.

## What Is Spot Price Normalization?

Spot price normalization is the process of aggregating raw price observations into time-based buckets and computing statistical measures for each bucket. Instead of scoring against individual price points that may represent brief market anomalies, we score against hourly aggregates that smooth out transient fluctuations while preserving genuine market signals.

Our normalization worker runs every hour and processes all raw prices from the previous hour. For each combination of cloud provider, region, and instance type, we calculate the average, minimum, maximum, standard deviation, and sample count. These normalized values become the foundation for confidence scoring.

## How Raw Prices Become Hourly Buckets

The `normalize_hourly_prices()` function in our processing pipeline handles the aggregation logic. We query all raw prices from the previous hour and group them by cloud, region, and instance type. The SQL aggregation computes five key metrics: average spot price, minimum spot price, maximum spot price, standard deviation, and sample count.

We store these aggregates in the `NormalizedPrice` table with an `hour_bucket` timestamp that marks the start of the hour window. This creates a clean time series where each row represents one hour of market activity for a specific instance type in a specific region.

The normalization process includes duplicate detection. Before processing an hour bucket, we check if normalized data already exists for that time window. This prevents double-processing if the worker runs multiple times or recovers from failures. The structured logging captures both successful normalizations and any skipped duplicates.

## Why Standard Deviation Matters for Confidence

Standard deviation within each hourly bucket tells us how stable prices were during that hour. A low standard deviation means prices stayed consistent throughout the hour, indicating stable market conditions. High standard deviation suggests volatility or pricing events that could signal increased interruption risk.

Our confidence scoring algorithm uses the average standard deviation across 30 days of hourly buckets as one input. We calculate historical volatility by dividing the average standard deviation by the average price, creating a normalized volatility metric that works across different price ranges.

The `calculate_confidence()` function weighs volatility as 15% of the total confidence score. Lower volatility increases confidence, while higher volatility decreases it. This volatility component works alongside historical stability, market depth, and sample size to create the final confidence band.

## Market Depth Estimation from Sample Counts

Sample count within each normalized bucket indicates market depth. More price observations per hour suggest an active market with multiple capacity sources. Fewer observations may indicate limited capacity or a thin market where individual events have larger impact.

We estimate market depth using sample count thresholds. Buckets with more than 600 samples get a market depth score of 1.0. Buckets with 300 to 600 samples score 0.6. Below 300 samples scores 0.3. These thresholds come from observing typical sample distributions across major AWS regions and instance families.

Market depth contributes 25% to the overall confidence calculation. High-sample-count buckets increase confidence because they represent more robust price discovery. Low-sample-count buckets decrease confidence because they may not capture the full market picture.

## Historical Stability Across 30-Day Windows

Historical stability measures how often normalized prices stayed within 10% of their 30-day average. We query 30 days of hourly buckets for each instance type and region combination, then calculate what percentage of hours had prices within the stability band.

The `calculate_stability()` function iterates through the historical buckets and counts stable hours. If 80% of hours over 30 days had prices within 10% of average, the stability score is 0.8. This stability score contributes 30% to the final confidence calculation.

We chose 10% as the stability threshold based on typical spot price behavior in stable markets. Prices can fluctuate due to normal capacity adjustments without indicating increased interruption risk. The 30-day window captures seasonal patterns and medium-term trends without being overly sensitive to recent volatility.

## Conservative Defaults When History Is Missing

When we encounter an instance type and region combination with no historical data, the confidence scorer returns 0.5 as the default confidence level. This conservative approach prevents us from claiming high confidence about market conditions we have not observed.

New instance types, regions, or availability zones start with this default confidence until we accumulate enough normalized data to calculate meaningful historical metrics. This default often triggers our suppression logic, which blocks signals below confidence thresholds from reaching users.

All confidence calculations and suppressions get logged to our [public transparency log](https://www.refinex.io/transparency) with specific reasons. Users can audit why particular signals were suppressed and when enough data accumulates to enable scoring for new market segments.

[View the live signal log →](https://www.refinex.io/transparency)

---
*Keith Brown*
*CTO, RefineX*