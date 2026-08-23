---
title: "How Redis Cuts Autoscaler Response Time to Under 10ms"
meta_title: "Redis Cuts Autoscaler Response Time to Under 10ms for AWS Spot"
date: "2026-05-13"
description: "RefineX caches active Spot signals in Redis with TTL-bounded freshness to serve autoscaler API calls in under 10ms instead of 200ms database queries."
slug: "redis-cuts-autoscaler-response-time-under-10ms"
tags: ['aws', 'spot', 'infrastructure', 'redis']
schema:
  type: Article
  datePublished: "2026-05-13"
  author: "Keith Brown"
  publisher: "RefineX"
canonical: "https://www.refinex.io/blog/redis-cuts-autoscaler-response-time-under-10ms"
published: false
---

When an autoscaler calls `/signals/active`, it cannot wait 200ms for a database query. Autoscalers make scaling decisions in milliseconds, and API latency directly impacts their effectiveness. RefineX now caches active Spot interruption signals in Redis, serving cache hits in under 10ms and only falling back to PostgreSQL when the cache is cold.

What is Redis caching for autoscaler APIs? It is storing frequently accessed data in memory to eliminate database round trips. For infrastructure APIs that serve autoscaling systems, this transforms unusable 200ms response times into sub-10ms responses that fit within autoscaler decision cycles.

We run this caching job every 5 minutes. The scheduler pulls all active signals from PostgreSQL, serializes them to JSON, and stores them in Redis with TTL values matching the shortest signal expiration time. Our current cache holds 3 active signals with an average confidence of 0.85.

## How RefineX Caches Spot Risk Signals

The caching implementation creates two Redis key patterns for each signal. The primary key follows the format `signal:{cloud}:{region}:{instance_type}`, allowing direct lookups by infrastructure parameters. The secondary key uses `signal:id:{signal_id}` for direct signal ID queries.

Our Redis cache stores the complete signal payload including signal ID, cloud provider, region, availability zone, instance type, current Spot price, on-demand price, confidence score, expected value, recommended action, TTL, expiration timestamp, and supporting evidence. This eliminates the need for database joins during API calls.

The TTL strategy uses the minimum TTL from all active signals or defaults to 300 seconds. If the shortest-lived signal expires in 180 seconds, the entire cache expires in 180 seconds. This prevents serving stale signals that have already expired in the database.

When the cache refresh job runs, it queries PostgreSQL once, processes all signals, and batch-writes them to Redis. This amortizes the database cost across all cached signals instead of paying it per API request.

## Cache Hit Performance vs Database Queries

Cache hits serve in under 10ms because Redis stores data in memory and the serialized JSON requires no processing. The API endpoint deserializes the JSON and returns it directly without database connections, query execution, or result marshaling.

Database queries take 150-250ms because they require connection pool allocation, query parsing, index traversal, row marshaling, and connection return. On our current PostgreSQL instance, the active signals query averages 180ms including connection overhead.

Cache misses still fall back to the database gracefully. The API endpoint tries Redis first, and if no data exists, it queries PostgreSQL directly. This ensures the API remains functional during Redis outages or cache invalidation windows.

We log every cache operation with structured logging. Cache successes log the signal count. Cache failures log the error and affected key. This provides visibility into cache hit rates and Redis connectivity issues.

## Signal Expiration and Cache Invalidation

Signals expire based on their TTL values, not fixed schedules. A signal created with 300-second TTL expires exactly 300 seconds later. The cache must respect these individual expiration times while maintaining reasonable refresh intervals.

Our current approach uses conservative TTL values for the entire cache. When signals have TTLs of 180, 240, and 360 seconds, the cache expires after 180 seconds. This ensures no cached signal outlives its database counterpart.

The cache refresh job runs every 5 minutes, but cache TTL can be shorter. If all signals expire within 2 minutes, the cache becomes empty after 2 minutes even though the refresh job runs every 5 minutes. The next API call triggers a database fallback until the refresh job repopulates the cache.

We suppress 48.1% of potential signals before they reach the cache. Only signals meeting confidence thresholds and recency requirements get cached. This keeps the cache size small and ensures cached signals have high quality. Our [transparency log](https://www.refinex.io/transparency) shows the complete suppression record.

## Autoscaler Latency Requirements

Infrastructure autoscalers typically make decisions every 15-30 seconds and need API responses within their polling cycles. A 200ms API response consumes 1.3% of a 15-second decision cycle. A 10ms response consumes 0.07%.

This latency reduction allows autoscalers to query multiple regions or instance families within a single decision cycle. Instead of querying one region per cycle due to latency constraints, autoscalers can query 10-15 regions and make better-informed scaling decisions.

The sub-10ms response time also enables real-time integrations that were previously impossible. Kubernetes controllers, AWS Auto Scaling groups, and custom scaling logic can incorporate Spot risk signals without impacting their core decision loops.

We maintain cache hit rates above 90% during normal operations. The 5-minute refresh interval and 5-minute average signal TTL create good cache utilization. Cache misses occur primarily during Redis restarts or after extended periods with no active signals.

[View the live signal log →](https://www.refinex.io/transparency)

---
*Keith Brown*
*CTO, RefineX*