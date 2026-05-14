---
title: "How We Meter API Usage Without Adding Latency to the Hot Path"
meta_title: "API Metering Without Latency: RefineX Implementation"
date: "2026-05-14"
description: "How RefineX records API usage for billing without adding latency to signal delivery endpoints that autoscalers call under timing constraints."
slug: "api-metering-without-latency-hot-path"
tags: ['aws', 'api-design', 'billing', 'infrastructure']
schema:
  type: Article
  datePublished: "2026-05-14"
  author: "Keith Brown"
  publisher: "RefineX"
canonical: "https://www.refinex.io/blog/api-metering-without-latency-hot-path"
published: false
---

Every RefineX signal delivery records usage for billing, quota enforcement, and customer analytics. But metering cannot add latency to endpoints that autoscalers call under timing constraints. When your EC2 Spot interruption signal takes 200ms instead of 50ms because we are writing billing records, that delay cascades through your entire scaling decision.

We solved this by moving usage recording outside the critical response path while keeping quota checks in the hot path where they belong. The signal endpoint returns immediately after delivering the JSON response. Usage recording happens asynchronously afterward.

## What is API Metering in the Hot Path

Hot path metering means writing usage records synchronously within the request handler before returning the HTTP response. This approach guarantees accurate billing because every request that returns a 200 status has a corresponding usage record. The tradeoff is latency. Database writes add 10-30ms to response times depending on connection pooling and transaction overhead.

Cold path metering moves usage recording outside the request handler. The API returns immediately, then records usage in a background process. This preserves response time at the cost of potential data loss if the background process fails.

## How RefineX Handles Quota Checks

Quota enforcement stays in the hot path because it must block requests that exceed limits. Our MeteringService checks monthly usage before the signal query executes. If the API key has exceeded its monthly quota, we return a 429 status immediately without generating a signal.

The check_quota method queries the current month's usage count and compares it against the API key's monthly_quota field. API keys with no quota limit bypass this check entirely. This design keeps quota enforcement fast while maintaining billing accuracy.

We query usage records with a filter on timestamp greater than or equal to the start of the current month. The database maintains an index on api_key_id and timestamp to keep these queries under 10ms even for high-volume customers.

## Usage Recording After Response Delivery

Signal delivery recording happens after we return the HTTP response. The record_usage method writes a UsageRecord with the API key ID, endpoint path, HTTP method, status code, and response time. This data supports both billing calculations and customer analytics.

The critical design decision is error handling. If usage recording fails, we log the error but never fail the original request. The database rollback only affects the usage record, not the signal delivery. This preserves the signal delivery guarantee while accepting the risk of billing data loss on database failures.

We wrap the entire record_usage method in a try-catch block that logs failures to our structured logging system. These logs feed into billing reconciliation processes that can detect and recover missing usage records from API gateway logs if necessary.

## Response Time Impact Measurement

Our signals endpoint currently averages 85ms response time including confidence scoring and database queries. Adding synchronous usage recording would increase this to approximately 110ms based on our database write benchmarks. For customers calling this endpoint from autoscaling logic, that 25ms difference compounds across multiple availability zone queries.

The asynchronous approach maintains the 85ms average while recording usage within 100ms after response delivery in 99% of cases. We monitor usage recording delays and alert if the lag exceeds 5 seconds, which would indicate database connection pool exhaustion.

## When 429 Responses Are Correct

Rate limiting returns HTTP 429 when quota is exhausted, not HTTP 403 or 400. The 429 status tells the client that the request was valid but temporarily unavailable due to rate limits. Clients can retry after the quota period resets or after upgrading their plan.

Our quota check returns a tuple with the boolean result and an error message that becomes the response body. The error message includes current usage and quota limit to help customers understand their consumption patterns without requiring a separate usage query endpoint.

## Billing Reconciliation

We reconcile billing data weekly by comparing usage record counts against API gateway request logs. This process catches any usage records lost due to database failures or application crashes. The reconciliation runs as a scheduled job that processes the previous week's data and generates alerts for discrepancies over 1%.

Customer usage dashboards query the same UsageRecord table that billing uses, ensuring consistency between what customers see and what they are charged for. The monthly usage calculation uses the identical query logic in both contexts.

Every signal delivery creates an audit trail from the initial request through quota check, signal generation, usage recording, and billing calculation. This transparency builds the trust that DevOps teams require when integrating external services into critical infrastructure decisions. You can see our current signal delivery and suppression rates at our [transparency log](https://www.refinex.io/transparency).

[View the live signal log →](https://www.refinex.io/transparency)

---
*Keith Brown*
*CTO, RefineX*