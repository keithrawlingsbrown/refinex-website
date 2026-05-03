---
title: "Two Signal Types, One API: How RefineX Handles Arbitrage vs Interruption Risk"
meta_title: "AWS Spot Signal Types: Arbitrage vs Interruption Risk API Design"
date: "2026-05-03"
description: "RefineX exposes spot_arbitrage and interruption_risk signals through unified endpoints. Different detection logic, same delivery format."
slug: "spot-signal-types-arbitrage-interruption-risk-api"
tags: ['aws', 'spot', 'signal-design', 'api-design']
schema:
  type: Article
  datePublished: "2026-05-03"
  author: "Keith Brown"
  publisher: "RefineX"
canonical: "https://www.refinex.io/blog/spot-signal-types-arbitrage-interruption-risk-api"
published: false
---

## What Are RefineX Signal Types?

RefineX delivers two distinct signal types through the same API endpoints: spot_arbitrage for buy opportunities and interruption_risk for volatile regions to avoid. Each signal type has different detection algorithms, different confidence inputs, and different recommended actions. But they share a unified JSON delivery format through our signals API.

The spot_arbitrage detector scans for prices with greater than 50% savings versus on-demand. The interruption_predictor identifies regions with volatility coefficients above 0.25. Both create Signal records with the same schema but populate the evidence field with type-specific data.

## How Does Arbitrage Detection Work?

Our arbitrage detector runs every 10 minutes against the latest spot price feed. The logic is deterministic: find instances where `(on_demand_price - spot_price) / on_demand_price >= 0.50`. We set the threshold at 50% because anything lower generates too much noise for practical use.

The detector queries RawPrice records from the last 10 minutes, groups by cloud, region, availability zone, and instance type, then takes the most recent price for each combination. When savings exceed the threshold, we create a spot_arbitrage signal with action set to "buy_spot" and populate expected_value with savings_percent and savings_usd_per_hour.

Each arbitrage signal gets a 1800-second TTL by default. If an existing signal already covers the same instance type and region, we update the existing record rather than creating duplicates.

## How Does Interruption Risk Detection Work?

The interruption predictor operates on NormalizedPrice records aggregated into hourly buckets. We calculate the coefficient of variation (standard deviation divided by mean) for spot prices over the last 24 hours. When this volatility measure exceeds 0.25, we generate an interruption_risk signal.

High volatility indicates unstable capacity allocation in that availability zone. AWS typically interrupts instances when demand spikes drive prices up quickly. The coefficient of variation captures this pattern better than absolute price changes because it normalizes for the instance type's baseline cost.

Interruption signals get action set to "migrate_spot" or "fallback_on_demand" depending on severity. The evidence field stores the calculated volatility_coefficient value for audit purposes.

## Why One API for Two Signal Types?

We unified both signal types under the same endpoints because they represent opposite sides of the same decision. DevOps teams need to know both where to deploy new workloads (arbitrage opportunities) and where to move existing workloads away from (interruption risk). Forcing separate API calls would fragment this decision context.

The Signal model schema supports both types through polymorphic fields. The type column distinguishes spot_arbitrage from interruption_risk. The action field provides type-appropriate recommendations. The evidence field stores type-specific detection data. Everything else (confidence, TTL, pricing) follows the same structure.

Our public signals endpoint at /signals/public shows both types in the same feed. This gives users and our [transparency log](https://www.refinex.io/transparency) a complete view of market conditions without requiring separate queries.

## How Should Callers Handle Each Signal Type?

Arbitrage signals should trigger deployment decisions. When you receive a spot_arbitrage signal with high confidence and significant savings, that indicates a good time to launch new spot capacity in that region and instance family. The expected_value field tells you exactly how much you would save per hour.

Interruption signals should trigger migration decisions. When you receive an interruption_risk signal for a region where you are currently running spot instances, consider moving those workloads to a more stable zone or switching to on-demand temporarily.

Both signal types respect the same confidence thresholds. We suppress signals below 0.5 confidence regardless of type. When we suppress signals, the suppression appears in our public log with the specific reason. This week we suppressed 30 interruption signals and 0 arbitrage signals, with an overall suppression rate of 50.0%.

The TTL field applies to both types but with different implications. Arbitrage opportunities tend to be shorter-lived, so those signals typically get 30-minute TTLs. Interruption risk evolves more slowly, so those signals get 2-hour TTLs by default.

Both signal types populate the same JSON structure when delivered via our API, Slack, or email. Your automation can handle them with the same parsing logic while switching behavior based on the type field.

[View the live signal log →](https://www.refinex.io/transparency)

---
*Keith Brown*
*CTO, RefineX*