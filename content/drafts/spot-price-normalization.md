---
title: "How We Normalize Spot Prices Before Scoring"
meta_title: "Spot Price Normalization: How RefineX Buckets Raw AWS Data"
date: "2026-05-06"
description: "Raw AWS spot prices contain noise from brief repricing events. RefineX normalizes prices into hourly buckets before scoring to prevent outliers from distorting confidence bands."
slug: "spot-price-normalization-hourly-buckets"
tags: ['aws', 'spot', 'data-engineering', 'confidence-scoring']
schema:
  type: Article
  datePublished: "2026-05-06"
  author: "Keith Brown"
  publisher: "RefineX"
canonical: "https://www.refinex.io/blog/spot-price-normalization-hourly-buckets"
published: false
---

Raw AWS spot prices are noisy by design. A single m5.large instance in us-east-1a might report 17 different prices within one hour due to brief repricing events, capacity adjustments, or availability zone rebalancing. These outlier observations can distort confidence scores if fed directly into our scoring algorithm. This is why RefineX normalizes all raw price data into hourly buckets before any signal calculation begins.

## What Is Price Normalization for Spot Markets?

Price normalization transforms raw spot price observations into statistically stable hourly aggregates. Instead of scoring confidence against individual price points that might represent millisecond-level market anomalies, we calculate mean, standard deviation, min, and max values for each hour bucket. This creates a stable foundation for deterministic confidence scoring across all AWS regions and instance families.

Our normalization worker runs every hour and processes the previous hour's raw price data. For us-east-1a m5.large, if we collected 23 price observations between 14:00 and 15:00 UTC, the normalizer calculates the average spot price, standard deviation, and sample count for that hour bucket. These normalized values become the input for confidence calculation.

## How RefineX Buckets Raw Price Data

The normalize_hourly_prices function groups raw observations by cloud provider, region, and instance type within each hour window. We query all RawPrice records from the previous hour and aggregate them using SQL functions. The normalization runs only once per hour bucket to prevent duplicate processing.

Each normalized record contains six statistical measures: average spot price, minimum price, maximum price, standard deviation, sample count, and the hour bucket timestamp. If we collected 23 observations for m5.large in us-east-1a between 14:00 and 15:00, the sample_count field records 23, and std_dev captures the price variance across those observations.

The hour bucket timestamp uses the start of the hour window, not the end. This means prices collected between 14:00 and 15:00 get bucketed with timestamp 14:00. This convention simplifies lookups when the confidence scorer needs 30 days of historical data for a specific instance type and region.

## Why Standard Deviation Matters for Confidence

Standard deviation within each hour bucket reveals price volatility patterns that raw prices cannot surface. An hour with 15 price observations ranging from $0.045 to $0.047 indicates stable pricing. An hour with the same 15 observations ranging from $0.032 to $0.089 signals market instability.

Our confidence scorer uses this standard deviation as one of five weighted factors. The calculate_confidence function pulls 30 days of normalized price history and computes average standard deviation across all hour buckets. Higher volatility reduces confidence scores, while consistent standard deviation values increase confidence.

The standard deviation calculation handles edge cases where only one price observation exists in an hour bucket. Our SQL query uses func.stddev which returns None for single observations. The normalization worker converts None values to 0.0 before database insertion, preventing null reference errors during confidence scoring.

## From Normalized Data to Confidence Bands

Once normalized prices exist for each hour bucket, the confidence scorer can calculate historical stability across any timeframe. The calculate_confidence function queries 30 days of NormalizedPrice records and evaluates five components: historical stability, market depth, sample size weight, volatility, and interruption rate.

Historical stability measures the percentage of hours where average spot price stayed within 10% of the 30-day average. If m5.large in us-east-1a maintained stable pricing in 650 of 720 hour buckets over 30 days, historical stability scores 0.90. This calculation depends entirely on normalized hourly averages, not raw price noise.

Market depth estimation uses the total number of normalized hour buckets as a proxy for market liquidity. Instance types with 600+ hour buckets over 30 days score 1.0 for market depth. Types with 300-599 buckets score 0.6. This prevents confidence inflation for rarely-used instance types with limited price history.

## Suppression Protects Against Incomplete Normalization

Not every instance type and region combination generates sufficient raw price data for reliable normalization. When our collectors find fewer than 10 price observations in an hour bucket, the resulting normalized record carries low statistical confidence. Our suppression system identifies these weak signals and prevents delivery to the API.

Every suppressed signal gets logged to our public transparency log with the specific reason for suppression. Signals suppressed due to insufficient normalization data help users understand which instance types have limited spot market activity in their target regions. This transparency builds trust in the signals that do pass our confidence threshold.

The suppression rate over the past 2 hours stands at 50.0%, meaning half of all potential signals failed to meet our confidence requirements. This conservative approach prevents false signals based on incomplete price normalization. We would rather suppress a questionable signal than deliver one based on insufficient data.

[View the live signal log →](https://www.refinex.io/transparency)

---
*Keith Brown*
*CTO, RefineX*