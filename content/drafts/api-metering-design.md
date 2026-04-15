---
title: "How We Meter API Usage Without Adding Latency to the Hot Path"
meta_title: "API Metering Without Latency: RefineX Signal Infrastructure"
date: "2026-04-15"
description: "RefineX records every signal delivery for billing without slowing API response times. See how quota checks run before queries and usage recording happens after."
slug: "api-metering-without-latency"
tags: ['aws', 'api-design', 'billing', 'infrastructure']
schema:
  type: Article
  datePublished: "2026-04-15"
  author: "Keith Brown"
  publisher: "RefineX"
canonical: "https://www.refinex.io/blog/api-metering-without-latency"
published: false
---

Every RefineX signal delivery records usage data for billing, quota enforcement, and customer analytics. But metering cannot add latency to an endpoint that autoscalers and deployment pipelines call under timing constraints. We record every API request without slowing down signal responses by separating quota checks from usage recording and treating database failures as non-blocking events.

## What is API Metering in Signal Intelligence?

API metering tracks how many signal requests each customer makes per month for billing purposes. Unlike traditional APIs where response time matters less, spot interruption signals feed into autoscaling decisions that happen in seconds. A slow metering system would delay critical infrastructure decisions, making the entire signal worthless.

Our metering service handles two distinct operations. Quota checking happens before we query signals, blocking requests that would exceed monthly limits with a 429 status code. Usage recording happens after the signal response, capturing successful deliveries without affecting response time.

## How We Check Quotas Before Signal Queries

The quota check runs in the request path because it determines whether to serve the signal at all. Our MeteringService queries the current month's usage count and compares it against the API key's monthly quota. If usage exceeds the limit, we return a 429 response immediately without executing the expensive signal query.

The check_quota method returns a tuple indicating whether the request should proceed and an error message for blocked requests. When an API key has no monthly_quota value, we allow unlimited requests. This design choice means new customers start with no artificial limits while paid plans enforce specific quotas.

We cache monthly usage counts in Redis with a 60-second TTL to avoid database queries on every request. The cache key combines the API key ID with the current month, ensuring counts reset automatically when the billing period rolls over.

## How Usage Recording Stays Outside the Hot Path

Usage recording happens after the signal response through a fire-and-forget pattern. The record_usage method creates a UsageRecord with the endpoint, HTTP method, status code, and response time, then commits it to the database. If this database write fails, we log the error but never fail the original request.

This approach creates an accuracy tradeoff. Database failures mean we might under-count usage, potentially allowing customers to exceed quotas. We accept this risk because the alternative would be signal delivery failures when the billing database has issues.

The usage recording includes response_time_ms for each request, giving us data on API performance over time. We use this data internally to identify slow endpoints and optimize signal query performance, but it never affects billing calculations.

## Why 429 is the Correct Response for Quota Exhaustion

When quota checks fail, we return HTTP 429 (Too Many Requests) instead of 403 (Forbidden) or 402 (Payment Required). The 429 status tells clients that the request limit has been reached, which is exactly what happened. Many HTTP client libraries automatically handle 429 responses with exponential backoff, reducing the load on our API when customers hit their limits.

The error message includes the current usage count and quota limit, giving customers specific information about their consumption. This transparency helps with quota planning and prevents confusion about why requests are being rejected.

## How We Handle Billing Database Failures

The usage recording method wraps database operations in a try-catch block that never propagates exceptions to the API response. If the database connection fails or the insert times out, we roll back the transaction and log the error, but the signal delivery continues normally.

This design prioritizes signal availability over billing accuracy. Spot interruption signals inform decisions about running production workloads. Missing a few usage records is acceptable, but failing to deliver a valid signal because the billing database is slow would be a product failure.

We reconcile usage data through audit logs that capture every API request regardless of database state. These logs provide a backup source for usage calculations when the primary metering system has gaps.

## Real Numbers from Our Current Implementation

Today we show 0 active signals with a 50% suppression rate over the past 2 hours. Our [transparency log](https://www.refinex.io/transparency) records every signal decision, including the ones we suppress due to low confidence scores.

The metering service processes every request to our signal endpoints, including the public transparency feed that requires no authentication. Public endpoints still record usage for analytics, but they bypass quota checks since they serve public data.

We maintain the current monthly quota usage count through database queries with Redis caching. The cache reduces database load while ensuring quota enforcement stays accurate within a 60-second window.

[View the live signal log →](https://www.refinex.io/transparency)

---
*Keith Brown*
*CTO, RefineX*