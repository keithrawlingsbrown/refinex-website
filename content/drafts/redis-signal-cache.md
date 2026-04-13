---
title: "How Redis Cuts Autoscaler Response Time to Under 10ms"
meta_title: "Redis Autoscaler Response Time Under 10ms - RefineX Cache"
date: "2026-04-13"
description: "RefineX uses Redis to cache active Spot signals with TTL-bounded freshness, serving autoscaler queries in under 10ms instead of 200ms database calls."
slug: "redis-autoscaler-response-time-10ms-cache"
tags: ['aws', 'spot', 'infrastructure', 'redis']
schema:
  type: Article
  datePublished: "2026-04-13"
  author: "Keith Brown"
  publisher: "RefineX"
canonical: "https://www.refinex.io/blog/redis-autoscaler-response-time-10ms-cache"
published: false
---

When an autoscaler calls RefineX `/signals/active`, it cannot wait 200ms for a database query. Autoscaling decisions happen in milliseconds, not hundreds of milliseconds. We cache active signals in Redis with TTL-bounded freshness, serving cache hits directly and falling back to the database only when the cache is cold.

The problem is straightforward. PostgreSQL queries for active signals across multiple regions and instance families take 150-250ms under load. Kubernetes cluster autoscalers calling our API every 30 seconds cannot tolerate this latency when they need to make scaling decisions. Redis gets us to sub-10ms response times for cache hits while maintaining data freshness through careful TTL management.

## What Is TTL-Bounded Cache Freshness?

TTL-bounded cache freshness means we set Redis expiration times based on the shortest TTL of the signals being cached, not a fixed duration. Each signal has its own expiration time stored in the `expires_at` field. When caching a batch of signals, we calculate the minimum TTL across all signals and use that as our Redis expiration.

Our `cache_active_signals()` method in `redis_cache.py` takes the minimum TTL from all active signals or defaults to 300 seconds if no signals exist. This ensures cached data never outlives the underlying signal validity period. The cache stays fresh automatically without manual invalidation logic.

## How RefineX Structures Signal Cache Keys

We use two cache key patterns for different lookup scenarios. The primary pattern is `signal:{cloud}:{region}:{instance_type}`, which matches how autoscalers typically query for signals. The secondary pattern is `signal:id:{signal_id}` for direct signal lookups.

The cache stores full signal data as JSON, including confidence scores, expected savings percentages, and evidence metadata. When an autoscaler requests signals for `us-east-1` and `m5.large`, we can return the cached result immediately instead of querying across our signals table.

We also cache a summary at `signals:summary` with total signal count and timestamp. This powers our [transparency page](https://www.refinex.io/transparency) metrics without hitting the database for every page load.

## How Cache Invalidation Works With Signal Expiration

We do not use traditional cache invalidation. Instead, we let Redis TTL handle expiration automatically. Every 5 minutes, our scheduler runs `cache_active_signals()` to refresh the entire cache with current active signals. This approach is simpler than tracking individual signal state changes and invalidating specific keys.

The scheduler queries all active signals from PostgreSQL, serializes them to JSON with ISO timestamps, and pushes them to Redis with the calculated TTL. Old signals that expired since the last refresh simply disappear from the cache naturally when their TTL expires.

This refresh cycle means cache data can be up to 5 minutes behind database state in worst case. For autoscaling use cases, 5-minute staleness is acceptable since Spot interruption signals typically have TTL values measured in hours, not minutes.

## What Latency Profile Autoscalers Should Expect

Cache hits return in 3-8ms from our Redis cluster. Cache misses fall back to PostgreSQL and take 150-250ms depending on query complexity and table size. Cold cache scenarios happen during the first few minutes after deployment or after Redis restarts.

We log all cache operations with structured logging to track hit rates and performance. Current cache hit rate runs above 85% during normal operations. The remaining 15% represents new signal combinations not yet cached or queries during cache refresh windows.

Autoscalers should implement timeout values of at least 500ms to handle both cache hits and occasional database fallbacks. Most queries complete well under 100ms, but network conditions and database load can extend response times.

## How We Handle Redis Connection Failures

The cache service degrades gracefully when Redis is unreachable. All cache operations are wrapped in try-catch blocks that log errors and continue execution. If Redis connection fails during a signal lookup, we fall back to direct database queries without failing the API request.

Our `ping()` method checks Redis connectivity, and the initialization code tests the connection on startup. When Redis is unavailable, the service continues operating with database-only queries while we restore the cache layer.

This fallback approach ensures signal delivery continues even when caching infrastructure fails. Autoscalers experience higher latency during Redis outages but maintain access to current signal data.

[View the live signal log →](https://www.refinex.io/transparency)

---
*Keith Brown*
*CTO, RefineX*