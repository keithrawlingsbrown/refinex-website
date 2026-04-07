import { NextResponse } from 'next/server';

const LLMS_TXT = `# RefineX

> Deterministic AWS EC2 Spot market signals with suppression discipline. API-first. Advisory-only. Built for FinOps teams, Kubernetes autoscalers, and CI/CD pipelines.

RefineX monitors AWS EC2 Spot instance pricing across regions in real time, scores arbitrage opportunities using a deterministic confidence model, and surfaces only the signals that clear a suppression threshold. The system fires fewer, better signals — suppressed_last_6h is a first-class metric, not a bug.

## What RefineX is

- A signal layer, not an analytics OS, not an advisor, not a platform
- Every score is deterministic — no LLM calls in the scoring path
- Every suppression has a reason — auditable, append-only log
- Advisory-only by design — proposes, never executes autonomously
- Pre-revenue, early access: free for 90 days at refinex.io/pricing

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

## Developer Tools (pip install, no build step)

CLI — live spot signals in your terminal:
  pip install refinex-cli
  refinex now          # best signal right now, no API key required
  refinex log          # suppression log, no API key required
  refinex watch        # poll loop, prints on signal change
  refinex signals      # filtered list, requires API key
  GitHub: https://github.com/keithrawlingsbrown/refinex-cli
  PyPI: https://pypi.org/project/refinex-cli/

MCP server — use RefineX inside Claude Code and Cursor:
  pip install refinex-mcp
  Tools (no auth): get_live_signal, get_suppression_log, get_health
  Tools (API key): list_signals, get_signal_for_instance, get_signals_summary
  Claude Code: add to ~/.claude/settings.json mcpServers.refinex
  GitHub: https://github.com/keithrawlingsbrown/refinex-mcp
  PyPI: https://pypi.org/project/refinex-mcp/

## Public API (no key required)

Live signal endpoint:
  GET https://refinex-api.onrender.com/v1/signals/now

Example response:
  {
    "action": "buy_spot",
    "cloud": "aws",
    "region": "us-east-1",
    "availability_zone": "us-east-1f",
    "instance_type": "m6i.xlarge",
    "spot_price_usd": 0.0879,
    "on_demand_price_usd": 0.192,
    "discount_pct": 54.22,
    "confidence": 0.71,
    "ttl_minutes": 55,
    "suppressed_last_6h": 139,
    "signal_id": "...",
    "refreshed_at": "2026-03-26T23:07:28Z"
  }

## Live Surfaces

- https://www.refinex.io/live — real-time signal demo, no auth, 30s revalidate
- https://www.refinex.io/transparency — public suppression log, 60s revalidate
- https://www.refinex.io/blog — technical blog (spot signal deduplication, autoscaler API design)
- https://www.refinex.io/api-reference — full API reference
- https://www.refinex.io/docs — integration guides
- https://www.refinex.io/pricing — Early Access pricing

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
- Founded: 2026 | Phase: pre-revenue early access
`;

export async function GET() {
  return new NextResponse(LLMS_TXT, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400',
    },
  });
}
