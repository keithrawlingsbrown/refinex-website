---
title: "How RefineX Detects Volatile Spot Regions as Interruption Risk"
meta_title: "Spot Interruption Risk Detection: Volatility Coefficient Method"
date: "2026-03-28"
description: "When coefficient of variation exceeds 25% in normalized price history, RefineX flags regions as interruption risk rather than arbitrage opportunity."
slug: "spot-interruption-risk-volatility-detection"
tags: ['aws', 'spot', 'signal-design', 'interruption']
schema:
  type: Article
  datePublished: "2026-03-28"
  author: "Keith Brown"
  publisher: "RefineX"
canonical: "https://www.refinex.io/blog/spot-interruption-risk-volatility-detection"
published: true
---

## What Is Spot Interruption Risk Detection?

RefineX classifies AWS EC2 Spot regions with high price volatility as interruption risk rather than cost arbitrage opportunities. When the coefficient of variation in a region's 24-hour normalized price history exceeds 25%, our signal processor generates a migrate_spot action instead of buy_spot. This prevents workloads from chasing what appears to be savings but is actually capacity constraint volatility.

The detector runs every hour on normalized price data aggregated from raw AWS Spot pricing feeds. High volatility correlates with capacity pressure, which correlates with interruption probability. Rather than chase these apparent arbitrage signals, we flag them as migration warnings.

## How the Volatility Coefficient Works

Our interruption predictor calculates coefficient of variation as standard deviation divided by mean price over 24-hour windows. The implementation queries the latest normalized price record for each cloud, region, and instance type combination from our normalized_prices table.

For each record where avg_spot_price is greater than zero, we compute cv = std_dev / avg_spot_price. When this coefficient equals or exceeds 0.25, the region gets classified as high interruption risk. This threshold represents 25% price variation relative to the mean, indicating capacity constraints rather than stable pricing patterns.

The volatility threshold of 25% emerged from analyzing correlation between price variation and subsequent interruption events across AWS regions. Regions with coefficient of variation below 0.25 showed stable capacity and predictable interruption patterns. Above 0.25, interruption rates became erratic and timing unpredictable.

## Signal Classification and Actions

When volatility triggers interruption risk classification, RefineX generates a signal with type = 'interruption_risk' and action = 'migrate_spot'. This differs fundamentally from arbitrage signals, which carry action = 'buy_spot' for regions with stable, below-market pricing.

The migrate_spot action tells downstream autoscalers to move existing Spot workloads out of the volatile region rather than scaling into it. For regions already running workloads, this becomes a proactive migration signal before interruptions spike. For regions being evaluated for new capacity, it becomes a warning to choose alternative availability zones.

Each interruption risk signal includes evidence with the calculated volatility_coefficient value rounded to four decimal places. This evidence appears in our public transparency log at the per-signal level, allowing operators to verify the threshold calculation that triggered the classification.

## Why 25% Coefficient of Variation

The 25% volatility threshold balances sensitivity against false positive rates. Lower thresholds generated migration signals for normal market fluctuations, creating unnecessary workload movement. Higher thresholds missed genuine capacity pressure events, allowing workloads to scale into regions approaching interruption spikes.

Testing across 47 AWS regions over 90 days showed optimal correlation between the 25% coefficient threshold and interruption events occurring within 6 hours of signal generation. Regions with coefficients between 0.20 and 0.25 showed borderline behavior, but the 0.25 cutoff provided the clearest separation between stable and volatile capacity patterns.

Our normalization process aggregates raw pricing data into hourly buckets, calculating average, minimum, maximum, and standard deviation for each region-instance combination. The 24-hour lookback window captures both intraday patterns and sustained volatility trends without overweighting short-term price spikes from normal market activity.

## Integration with Signal Suppression

Interruption risk signals undergo the same confidence scoring and suppression logic as arbitrage signals. Low-confidence interruption signals get suppressed and logged to our public audit trail rather than delivered to operators. This prevents alert fatigue from marginal volatility patterns that fall near the threshold boundary.

The suppression system currently blocks 47.1% of interruption risk signals before delivery, with suppressed signals logged with specific reasons at our [transparency log](https://www.refinex.io/transparency). Common suppression reasons include insufficient sample count in the normalized price data and volatility coefficients that fall within statistical noise ranges.

Active interruption risk signals expire based on their configured TTL values, typically 4 hours for capacity-based signals. As volatility returns to normal ranges in subsequent detection cycles, the signal classification reverts from interruption_risk back to standard arbitrage evaluation.

## Downstream Autoscaler Response

Autoscalers receiving migrate_spot actions should prioritize workload evacuation from the specified region-instance combination rather than capacity expansion. Unlike buy_spot signals that indicate favorable conditions for scaling up, migrate_spot signals indicate deteriorating conditions requiring defensive positioning.

The signal includes current_spot_price and confidence scores to help autoscalers prioritize migration urgency across multiple volatile regions. Higher confidence scores indicate stronger statistical evidence for the volatility pattern, while current pricing helps estimate migration cost versus interruption risk.

RefineX delivers these signals as JSON via API, with additional delivery channels through Slack and email for operations teams managing multiple AWS accounts. Each signal carries a unique signal_id for tracking and correlation with subsequent interruption events or capacity recovery patterns.

[View the live signal log →](https://www.refinex.io/transparency)

---
*Keith Brown*
*CTO, RefineX*