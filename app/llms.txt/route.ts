import { NextResponse } from 'next/server';

const LLMS_TXT = `# RefineX

> Deterministic AWS EC2 Spot market signals with suppression discipline. API-first. Advisory-only. Built for FinOps teams, Kubernetes autoscalers, and CI/CD pipelines.

RefineX monitors AWS EC2 Spot instance pricing across regions in real time, scores arbitrage opportunities using a deterministic confidence model, and surfaces only the signals that clear a suppression threshold. The system fires fewer, better signals — suppressed_last_6h is a first-class metric, not a bug.

## What RefineX is

- A signal layer, not an analytics OS, not an advisor, not a platform
- Every score is deterministic — no LLM calls in the scoring path
- Every suppression has a reason — auditable, append-only log
- Advisory-only by design — proposes, never executes autonomously
- Not currently offered publicly, at any tier — see refinex.io/pricing for updates

## What RefineX is not

- Not a cost dashboard (no RI/Savings Plans analysis)
- Not a scheduler or autoscaler (does not execute Spot requests)
- Not a prediction engine (deterministic scoring, not ML forecasting)
- Not "AI-powered" (scoring is arithmetic, not probabilistic)

## Core Concepts

**Signal**: A scored arbitrage opportunity. Fields: instance_type, region, availability_zone, spot_price_usd, on_demand_price_usd, discount_pct, confidence (0–1), action (buy_spot / hold / avoid), ttl_minutes, suppressed_last_6h.

**Confidence band**: A deterministic score (0–1) computed from price history volatility and interruption frequency. High confidence = stable discount. Low confidence = noisy or shrinking spread.

**Suppression**: The system detects far more opportunities than it surfaces. Signals below the confidence threshold or with insufficient spread are suppressed. suppressed_last_6h counts these. The suppression log is a public trust surface.

**Regime**: Market context label (e.g. high-volatility, stable-discount). Used to add interpretive context to raw scores.

**Audit trail**: Append-only. No UPDATE or DELETE on signal or suppression records. The log is permanent.

## Developer Tools (packages published, public access currently suspended)

CLI — refinex-cli is published on PyPI, but public data access is currently
suspended (no-auth commands will not return data right now):
  pip install refinex-cli
  GitHub: https://github.com/keithrawlingsbrown/refinex-cli
  PyPI: https://pypi.org/project/refinex-cli/

MCP server — refinex-mcp is published on PyPI, same status:
  pip install refinex-mcp
  GitHub: https://github.com/keithrawlingsbrown/refinex-mcp
  PyPI: https://pypi.org/project/refinex-mcp/

## Public API

RefineX is not currently offered publicly, at any tier. No endpoint —
including previously no-auth ones — currently returns live signal data.
Requests to the API return HTTP 503 with a "not currently available"
message.

## Surfaces

- https://www.refinex.io/live — currently unavailable
- https://www.refinex.io/transparency — public suppression log (may be affected by the current suspension)
- https://www.refinex.io/blog — technical blog (spot signal deduplication, autoscaler API design)
- https://www.refinex.io/api-reference — full API reference
- https://www.refinex.io/docs — integration guides
- https://www.refinex.io/pricing — not currently available; check for updates

## Target Audience

- Platform engineers and FinOps teams managing AWS EC2 Spot workloads
- Kubernetes teams running Karpenter, Cluster Autoscaler, or KEDA
- CI/CD pipelines that need spot availability signals before provisioning
- Engineering leads at companies spending $30K–$300K/month on EC2

## Key Vocabulary

suppressed, confidence band, regime, audit trail, advisory-only, deterministic, append-only, signal TTL, interruption risk, spot arbitrage, FinOps, Karpenter, KEDA, autoscaler

## Company

- Website: https://www.refinex.io
- API: https://refinex-api.onrender.com
- Twitter/X: https://x.com/getrefinex
- Founded: 2026 | Phase: pre-revenue, not currently offered publicly
`;

export async function GET() {
  return new NextResponse(LLMS_TXT, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400',
    },
  });
}
