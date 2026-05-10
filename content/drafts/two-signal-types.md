---
title: "Two Signal Types, One API: Arbitrage vs Interruption Risk"
meta_title: "AWS Spot Arbitrage vs Interruption Risk Signals - RefineX API"
date: "2026-05-10"
description: "RefineX delivers spot_arbitrage buy opportunities and interruption_risk warnings through one API. Different detection logic, same JSON format."
slug: "spot-arbitrage-vs-interruption-risk-signals"
tags: ['aws', 'spot', 'signal-design', 'api-design']
schema:
  type: Article
  datePublished: "2026-05-10"
  author: "Keith Brown"
  publisher: "RefineX"
canonical: "https://www.refinex.io/blog/spot-arbitrage-vs-interruption-risk-signals"
published: false
---

The RefineX API delivers two distinct signal types through identical endpoints: spot_arbitrage signals that identify buy opportunities and interruption_risk signals that warn about volatile regions to avoid. They use different detection algorithms, different confidence inputs, and trigger different recommended actions. We unified them into a single delivery format because both answer the same question: when is it safe to run on Spot?

## What Are Arbitrage vs Interruption Risk Signals?

Arbitrage signals detect price gaps where Spot instances cost at least 50% less than on-demand pricing. Our spot_arbitrage_detector.py scans the latest price data every 10 minutes and creates signals when savings_pct exceeds the ARBITRAGE_THRESHOLD of 0.50. The action field returns "buy_spot" and the expected_value JSON contains savings_percent and savings_usd_per_hour calculations.

Interruption risk signals identify regions with high price volatility, which correlates with interruption probability. The interruption_predictor.py calculates coefficient of variation (standard deviation divided by mean price) across 24-hour windows. When this volatility metric exceeds 0.25, we generate an interruption_risk signal with action "migrate_spot" or "fallback_on_demand" depending on confidence level.

## How Detection Logic Differs Between Signal Types

The arbitrage detector queries RawPrice records and groups by cloud, region, availability_zone, and instance_type. It joins against the latest timestamps to get current pricing, then calculates immediate savings opportunities. If an existing spot_arbitrage signal covers the same location, we update the current_spot_price and on_demand_price fields rather than creating duplicates.

Interruption prediction operates on NormalizedPrice hourly buckets instead of raw pricing data. We pull 24 hours of price history and calculate volatility coefficients per region and instance type. High coefficient of variation indicates price instability, which AWS documentation confirms correlates with interruption frequency. The evidence JSON stores the actual volatility_coefficient value for audit purposes.

Both detectors write to the same signals table with identical schema. The type column distinguishes "spot_arbitrage" from "interruption_risk" records. TTL values differ: arbitrage signals expire within 5-10 minutes since pricing changes rapidly, while interruption risk signals persist for hours since volatility patterns evolve more slowly.

## Why One API Endpoint for Both Signal Types

We considered separate /arbitrage and /interruption endpoints but chose unified delivery for three reasons. First, DevOps teams need both signal types to make informed Spot decisions. You want to know if savings justify risk and whether current conditions suggest stable or volatile periods ahead.

Second, confidence scoring works identically across signal types. Both use 0.0-1.0 deterministic confidence bands with the same suppression logic. Signals below our confidence threshold get blocked before delivery regardless of type. Our [transparency log](https://www.refinex.io/transparency) shows suppression decisions for both arbitrage and interruption signals using identical reasoning.

Third, the action field provides clear differentiation. Arbitrage signals return "buy_spot" actions when savings exceed risk. Interruption signals return "migrate_spot" or "wait" actions when volatility suggests caution. API consumers can filter by signal type or action depending on their automation needs.

## How to Handle Each Signal Type in Your Code

The GET /signals endpoint returns both types in the same JSON structure. Check the type field to determine handling logic. For spot_arbitrage signals, examine the expected_value object for savings calculations and current_spot_price for exact pricing. For interruption_risk signals, the evidence object contains volatility metrics and historical context.

Arbitrage signals work best for launch decisions. When you see type: "spot_arbitrage" with confidence above 0.7, the economics favor Spot over on-demand. Check savings_percent in expected_value to calculate cost impact for your workload size.

Interruption signals inform migration timing. When type: "interruption_risk" appears with action: "migrate_spot", current conditions suggest moving workloads to different availability zones within the same region. The volatility_coefficient in evidence shows the mathematical basis for this recommendation.

We maintain separate confidence calculations because arbitrage and interruption risk have different error costs. False positive arbitrage signals waste optimization opportunities. False positive interruption signals trigger unnecessary migrations. Our thresholds reflect these asymmetric costs: we suppress arbitrage signals more aggressively than interruption warnings.

Active signals currently number 4 with 48.1% suppression rate over the past 2 hours. Interruption signals specifically show 12 active warnings with 0.85 average confidence. These numbers demonstrate that unified delivery works at scale while maintaining signal quality through disciplined suppression.

[View the live signal log →](https://www.refinex.io/transparency)

---
*Keith Brown*
*CTO, RefineX*