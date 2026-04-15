---
title: "The Evidence Field: Why Every Signal Ships Its Own Reasoning"
meta_title: "Evidence Field: Signal Reasoning for AWS Spot Interruption Risk"
date: "2026-04-15"
description: "Every RefineX signal includes an evidence object containing the inputs used to generate it. Learn why observable signal reasoning is critical for infrastructure tooling."
slug: "evidence-field-signal-reasoning-aws-spot"
tags: ['aws', 'spot', 'signal-design', 'observability']
schema:
  type: Article
  datePublished: "2026-04-15"
  author: "Keith Brown"
  publisher: "RefineX"
canonical: "https://www.refinex.io/blog/evidence-field-signal-reasoning-aws-spot"
published: false
---

Every signal RefineX delivers includes an evidence field that contains the exact inputs used to generate that signal. This is not metadata or logging. It is the audit trail that lets engineers verify the signal's reasoning without trusting a black box.

## What is the Evidence Field?

The evidence field is a JSON object attached to every signal that documents the specific calculations and thresholds used to generate that signal's score. For spot arbitrage signals, the evidence contains the savings percentage calculation. For interruption risk signals, it contains the volatility coefficient that triggered the alert.

When we detect a spot arbitrage opportunity on an m5.large instance in us-east-1a with 67% savings versus on-demand pricing, the evidence field shows exactly how we calculated that 67% figure. When we flag high interruption risk based on a volatility coefficient of 0.31, that coefficient appears in the evidence object alongside the signal.

## How Does RefineX Score Spot Risk?

Our interruption risk detector calculates the coefficient of variation across 24-hour price windows. The coefficient equals standard deviation divided by mean price. When this coefficient exceeds 0.25, we generate an interruption risk signal.

The evidence field captures this calculation. A signal flagging high volatility on c5.xlarge instances includes evidence like `{"volatility_coefficient": 0.3142}`. The receiving system can verify that 0.3142 exceeds our 0.25 threshold and understand exactly why this signal fired.

This deterministic scoring runs independently of any LLM or machine learning model. The evidence field documents the mathematical operations that produced each score, making the entire process auditable by the engineers consuming these signals.

## Signal Evidence in Production

Our spot arbitrage detector examines pricing data from the last 10 minutes and flags opportunities with savings above 50% versus on-demand pricing. The evidence field contains the exact savings calculation for each flagged opportunity.

When we identify a spot price of $0.034 per hour against an on-demand price of $0.096 for an m5.large instance, the evidence documents this as `{"savings_percent": 0.646, "spot_price": 0.034, "on_demand_price": 0.096}`. Engineers receiving this signal can reproduce the 64.6% savings calculation and verify it meets our 50% threshold.

The evidence field serves as the bridge between signal generation and signal consumption. DevOps teams running spot workloads need to understand why a particular signal triggered, especially when making decisions about instance migrations or fleet scaling.

## Observable Signal Architecture

The evidence field represents a design principle for infrastructure tooling. Automated systems that recommend actions or flag risks must explain their reasoning. This explanation cannot be a summary or interpretation. It must be the actual inputs and calculations.

We log every signal with its evidence to our [transparency log](https://www.refinex.io/transparency), creating a public audit trail of our scoring decisions. Engineers can examine any historical signal and verify that our scoring logic operated correctly on the documented inputs.

This observability extends to suppressed signals as well. When we suppress a signal because its confidence score falls below our threshold, we log both the signal and the suppression reason. The evidence field shows what calculations we performed, even for signals we chose not to deliver.

## Evidence vs Explainability

The evidence field differs from explainable AI approaches because it documents deterministic calculations rather than model interpretations. Machine learning explainability tools attempt to describe why a model made a particular prediction. Our evidence field simply records the mathematical operations we performed.

This distinction matters for infrastructure tooling. DevOps engineers need to verify signal accuracy, not understand model behavior. They care whether our volatility calculation used the correct price data and applied the right formula. The evidence field provides exactly this verification capability.

When we calculate a 72% savings opportunity on spot instances, the evidence field contains the spot price, on-demand price, and resulting percentage. Engineers can reproduce this calculation independently and confirm our arithmetic. This verification process builds trust through mathematical precision rather than model interpretation.

## Implementation Details

Our signal model stores evidence as a JSON column alongside confidence scores and expected values. Each signal type populates this field with its specific calculation inputs. Arbitrage signals include pricing data and savings percentages. Interruption risk signals include volatility coefficients and price statistics.

The evidence field updates whenever we refresh an existing signal. If spot pricing changes and we recalculate a savings opportunity, the new evidence replaces the old evidence, maintaining a current record of our reasoning. This ensures the evidence always matches the current signal score.

We designed this field structure to support future signal types. Network latency signals would include ping statistics. Cost optimization signals would include usage patterns and pricing comparisons. The evidence field adapts to whatever inputs each signal type requires for its calculations.

[View the live signal log →](https://www.refinex.io/transparency)

---
*Keith Brown*
*CTO, RefineX*