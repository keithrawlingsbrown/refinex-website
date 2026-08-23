---
title: "When RefineX Recommends On-Demand: The Fallback Decision Tree"
meta_title: "Spot API Fallback Logic: On-Demand vs Wait vs 404"
date: "2026-05-15"
description: "How RefineX handles API requests when no qualifying spot signal exists: on_demand, wait, or 404 responses based on your fallback parameter."
slug: "spot-api-fallback-on-demand-wait-404"
tags: ['aws', 'spot', 'api-design', 'reliability']
schema:
  type: Article
  datePublished: "2026-05-15"
  author: "Keith Brown"
  publisher: "RefineX"
canonical: "https://www.refinex.io/blog/spot-api-fallback-on-demand-wait-404"
published: false
---

A spot intelligence API that only says "buy spot" is incomplete. When RefineX has no qualifying signal for your requested region and instance family, you get a structured fallback response instead of silence. The API separates signal absence from signal failure through three distinct fallback modes: on_demand, wait, or a clean 404.

## What Happens When No Spot Signal Exists

RefineX returns fallback guidance when we cannot deliver a qualifying spot signal. This occurs when all available signals fall below our confidence threshold or when market conditions suppress signal generation entirely. Our current suppression rate runs at 48.6% over the past two hours, meaning nearly half of potential signals are blocked before delivery.

The fallback parameter in your API request determines what you receive when no spot signal qualifies. Setting fallback=on_demand returns a structured recommendation to use On-Demand instances. Setting fallback=wait tells you to retry the request later. Setting fallback=none returns a 404 with no guidance.

## The Three Fallback Modes

The on_demand fallback mode provides the most actionable response. When you request a signal for m5.large in us-east-1a and no qualifying spot signal exists, the API returns a JSON structure recommending On-Demand instances for that specific combination. This gives your infrastructure automation a concrete next step rather than leaving it to guess.

The wait fallback acknowledges that spot markets change rapidly. A suppressed signal at 14:00 might qualify for delivery at 14:30 when confidence bands shift. The wait response includes a suggested retry interval based on historical signal generation patterns for your requested instance family and region.

The 404 fallback serves teams that prefer explicit error handling. When no qualifying signal exists and you set fallback=none, you receive a standard HTTP 404 with a clear reason code. Your application logic decides whether to retry, fall back to On-Demand, or take another action entirely.

## When Each Fallback Makes Sense

On-Demand fallbacks work best for production workloads that cannot wait for spot availability. If your deployment pipeline requests a spot signal and receives an on_demand fallback, it can immediately provision On-Demand instances without manual intervention. This maintains deployment velocity while still attempting to capture spot savings when signals qualify.

Wait fallbacks suit workloads with flexible timing requirements. Batch processing jobs, development environments, and non-critical services can defer instance launches until spot conditions improve. The wait response includes timing guidance based on historical signal patterns in your target availability zone.

The 404 fallback serves teams with complex orchestration logic that need explicit control over failure modes. When no signal exists, these systems might check multiple regions, adjust instance family requirements, or escalate to human operators. The 404 provides a clean integration point for custom decision trees.

## Implementation Details from the Signal Path

Our signal repository queries active signals by region and instance type, then applies confidence filtering before considering fallback logic. The confidence threshold currently runs at 0.5, meaning signals below 50% confidence trigger fallback responses regardless of market conditions.

The public signal feed at our [transparency page](https://www.refinex.io/transparency) shows this filtering in action. Suppressed signals appear with specific suppression reasons: confidence_below_threshold, stale_data, or ttl_expired. This append-only log provides visibility into when fallbacks activate and why.

The savings percentage calculation draws from either the expected_value structure for recent signals or the evidence structure for historical records. This backward compatibility ensures consistent fallback calculations as our signal schema evolves.

## Why Fallbacks Are Not Failures

Structured fallbacks represent disciplined API design rather than system limitations. A spot intelligence service that always returns "buy spot" regardless of market conditions would be unreliable. Conservative defaults and clear fallback guidance build trust with infrastructure automation that cannot afford ambiguous responses.

The separation between signal absence and signal failure prevents false positives in monitoring systems. A 404 fallback response indicates no qualifying signal exists, not that the API experienced an error. Your alerting logic can distinguish between these conditions and respond appropriately.

RefineX delivered 1 active signal today while suppressing others based on confidence thresholds. The fallback logic ensures your automation receives actionable guidance even when spot conditions do not warrant a positive recommendation. This approach treats reliability as a feature rather than a constraint.

[View the live signal log →](https://www.refinex.io/transparency)

---
*Keith Brown*
*CTO, RefineX*