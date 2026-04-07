---
title: "Why /signals/active Returns One Action, Not a List"
meta_title: "API Design: Single Action vs List - RefineX /signals/active"
date: "2026-04-07"
description: "Most infrastructure APIs return all data and let callers decide. RefineX /signals/active returns one highest-confidence action with fallback. Here's why."
slug: "api-design-single-action-vs-list-signals-active"
tags: ['aws', 'spot', 'api-design']
schema:
  type: Article
  datePublished: "2026-04-07"
  author: "Keith Brown"
  publisher: "RefineX"
canonical: "https://www.refinex.io/blog/api-design-single-action-vs-list-signals-active"
published: false
---

Most infrastructure APIs follow the same pattern: return all available data and let the caller filter, rank, and decide. Need EC2 pricing? AWS returns hundreds of prices per region. Need container metrics? Prometheus returns thousands of time series. The RefineX `/signals/active` endpoint does the opposite. It returns exactly one action with a fallback parameter.

## What Is Single-Action API Design?

Single-action API design means the endpoint makes exactly one recommendation per call instead of returning a list for the caller to process. When you call `/signals/active` for `m5.large` in `us-east-1a`, you get back either `buy_spot`, `migrate_spot`, `wait`, or `fallback_on_demand`. Not a ranked list of possibilities with confidence scores to interpret.

The endpoint examines all active signals for your query, applies confidence thresholds, checks for suppression conditions, and returns the highest-confidence action that passes our filters. If no signal meets the confidence threshold, it returns your specified fallback action.

## How RefineX Chooses the Single Action

The selection logic runs deterministically through our signal scoring pipeline. Our Signal model stores each recommendation with a confidence score from 0.0 to 1.0, an action field containing the specific recommendation, and lifecycle metadata including `is_active` and `expires_at` timestamps.

When `/signals/active` executes, it queries active signals matching your region and instance type, filters out any below our confidence threshold, and ranks the remaining candidates by confidence score. The highest-scoring signal becomes your returned action. We suppress signals below 0.5 confidence automatically, and expired signals get marked inactive before the ranking step.

The evidence field in each signal contains the underlying spot pricing data, interruption risk factors, and regime classification that produced the confidence score. This transparency allows you to audit why a particular action was recommended, but the API decision point remains singular.

## Why Autoscalers Need Opinionated APIs

Autoscalers consume external signals to make scaling decisions under time pressure. A Kubernetes cluster autoscaler checking spot availability has seconds to decide whether to provision new nodes via spot instances or fall back to on-demand. Receiving a list of ranked possibilities introduces decision latency the autoscaler must resolve.

Consider the alternative API design. If `/signals/active` returned five signals with confidence scores of 0.87, 0.82, 0.79, 0.74, and 0.71, your autoscaler code now needs threshold logic, tie-breaking rules, and error handling for empty lists. The complexity moves from our deterministic scoring engine into your autoscaler where debugging becomes harder.

The single-action approach moves that decision complexity into RefineX where we can optimize, test, and audit the selection logic centrally. Your autoscaler receives `buy_spot` or `fallback_on_demand` and acts immediately.

## How the Fallback Parameter Works

The fallback parameter handles cases where no signal meets our confidence requirements. Instead of returning empty responses or error states, `/signals/active?fallback=wait` returns `wait` when all signals are suppressed. This prevents your autoscaler from making uninformed decisions during signal gaps.

We typically see three fallback strategies in production. Development clusters use `fallback=wait` to avoid spot risk during testing. Cost-optimized workloads use `fallback=buy_spot` to maintain spot usage even during uncertain periods. Mission-critical services use `fallback=on_demand` to guarantee capacity when signal confidence drops.

The fallback mechanism also handles regional signal gaps. If us-west-2 experiences pricing volatility that suppresses all our signals, your autoscaler receives your specified fallback instead of timing out or crashing on empty responses.

## When Single Actions Create Problems

Single-action APIs trade flexibility for simplicity. If your infrastructure management system needs to evaluate multiple spot strategies simultaneously, receiving only the highest-confidence recommendation limits your options. Complex financial modeling or multi-region orchestration might benefit from seeing the full signal distribution.

We address this through endpoint specialization rather than parameter complexity. Teams needing full signal context can use our `/signals/public` endpoint to see delivered and suppressed signals with their confidence scores and suppression reasons. This preserves the simplicity of `/signals/active` while providing transparency through our [public signal log](https://www.refinex.io/transparency).

The single-action design also assumes you trust our confidence scoring and suppression logic. If you disagree with our thresholds or want custom ranking algorithms, the opinionated API becomes a constraint rather than a feature.

## API Design for Infrastructure Automation

Infrastructure automation benefits from APIs that make decisions rather than provide options. The `/signals/active` endpoint represents this philosophy: receive one recommendation, verify it meets your requirements, and execute. The decision complexity stays in systems designed for optimization rather than spreading into your automation logic.

We handle uncertainty through conservative defaults and transparent suppression rather than pushing ambiguity to API consumers. When confidence drops, we suppress the signal and return your fallback. When data goes stale, we mark signals inactive before they appear in responses.

This approach requires trust in our decision-making process, but that trust operates on verifiable evidence. Every suppressed signal appears in our public log with reasons. Every delivered signal includes the evidence that generated it.

[View the live signal log →](https://www.refinex.io/transparency)

---
*Keith Brown*
*CTO, RefineX*