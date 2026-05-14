---
title: "The Evidence Field: Why Every Signal Ships Its Own Reasoning"
meta_title: "Evidence Field: Why Every AWS Spot Signal Ships Its Reasoning"
date: "2026-05-14"
description: "Every RefineX signal includes an evidence object with the inputs used to generate it. This audit trail lets engineers verify signal reasoning without trusting a black box."
slug: "evidence-field-signal-reasoning-audit-trail"
tags: ['aws', 'spot', 'signal-design', 'observability']
schema:
  type: Article
  datePublished: "2026-05-14"
  author: "Keith Brown"
  publisher: "RefineX"
canonical: "https://www.refinex.io/blog/evidence-field-signal-reasoning-audit-trail"
published: false
---

Every signal RefineX delivers carries its own audit trail. The evidence field contains the actual inputs we used to generate the signal score, confidence band, and action recommendation. This is not metadata or documentation. It is the raw reasoning that lets you verify our work without trusting a black box.

What is the evidence field? It is a JSON object attached to every signal that shows the mathematical inputs behind the score. When we detect spot arbitrage with 72% savings between m5.large spot and on-demand pricing in us-east-1a, the evidence field shows the exact spot price, on-demand price, and calculated savings percentage. When we flag interruption risk for c5.xlarge instances, the evidence field contains the volatility coefficient that triggered the alert.

## How RefineX Scores Spot Risk

Our signal scoring follows two deterministic paths. Spot arbitrage signals fire when savings exceed 50% versus on-demand pricing. The detector pulls the latest prices from the last 10 minutes, calculates the savings percentage as (on_demand_price - spot_price) / on_demand_price, and generates a signal only when this value exceeds 0.50.

Interruption risk signals trigger on high price volatility. We calculate the coefficient of variation (standard deviation divided by mean price) across the last 24 hours of normalized pricing data. When this coefficient exceeds 0.25, we generate an interruption risk signal. The evidence field contains this exact volatility coefficient rounded to four decimal places.

Every signal includes current_spot_price, on_demand_price, confidence score, expected_value calculations, and the evidence object. The evidence field varies by signal type but always contains the core mathematical inputs that drove the scoring decision.

## What Evidence Fields Contain

Spot arbitrage signals carry evidence showing savings calculations. A typical evidence object contains the savings percentage, hourly savings in USD, and the timestamp when we captured the pricing data. When you receive a signal recommending m5.large instances in us-west-2b with 67% savings, the evidence field shows the $0.045 spot price, $0.137 on-demand price, and $0.092 hourly savings calculation.

Interruption risk signals contain volatility measurements. The evidence field includes the volatility coefficient that triggered the alert, the time window we analyzed, and the number of data points in our calculation. A signal flagging high interruption risk for c5.xlarge instances includes the specific coefficient like 0.3247 that crossed our 0.25 threshold.

Both signal types include confidence scores between 0.0 and 1.0. Signals below our confidence threshold get suppressed before delivery. Every suppression gets logged to our public transparency log at /transparency with the specific reason and threshold that blocked delivery.

## Why Observable Signal Reasoning Matters

Infrastructure signals require the same "show your work" discipline that we demand from ML models in production. When an automated system tells you to migrate workloads or change instance types, you need to verify the reasoning behind that recommendation. The evidence field provides this verification path without requiring API calls or external lookups.

We designed evidence fields as audit trails, not convenience features. Every signal we deliver can be reconstructed and verified using the evidence data. You can take our spot arbitrage signal, plug the evidence values into the same calculation, and confirm the 67% savings percentage. You can verify interruption risk signals by checking whether the volatility coefficient actually exceeds our 0.25 threshold.

This approach scales beyond individual signals. When you receive multiple signals for the same instance family across different availability zones, the evidence fields let you compare the underlying volatility coefficients or savings percentages. You can build your own risk models using our evidence data as inputs rather than treating our signals as opaque recommendations.

## Evidence Fields in Practice

Our current signal generation shows this evidence transparency in action. Today we have 7 active signals with an average confidence of 0.85. Our suppression rate over the last 2 hours reached 48.1%, meaning nearly half of potential signals failed to meet our confidence thresholds. The 3 interruption signals we delivered in the last 2 hours each include volatility coefficients between 0.26 and 0.41.

The evidence field architecture extends to signal lifecycle management. When we update existing signals with new pricing data, the evidence field reflects the updated inputs. When signals expire after their TTL period, the evidence data provides a historical record of the reasoning that drove each recommendation.

Evidence fields transform signals from recommendations into verifiable data points. You decide whether to act on the signal, but you can always verify the mathematical reasoning that generated it. This is infrastructure tooling designed for engineers who read API documentation and verify calculations, not executives who approve based on ROI projections.

[View the live signal log →](https://www.refinex.io/transparency)

---
*Keith Brown*
*CTO, RefineX*