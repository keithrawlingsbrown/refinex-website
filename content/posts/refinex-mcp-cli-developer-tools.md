---
title: "Two pip installs. Live AWS spot data in Claude Code and your terminal."
meta_title: "refinex-mcp and refinex-cli: Live AWS Spot Signals for Developers"
date: "2026-03-28"
description: "refinex-mcp wraps the RefineX REST API as 6 MCP tools for Claude Code and Cursor. refinex-cli puts the same live AWS spot data in your terminal. Both on PyPI today."
slug: "refinex-mcp-cli-developer-tools"
tags: ['aws', 'spot', 'mcp', 'cli', 'developer-tools']
schema:
  type: Article
  datePublished: "2026-03-28"
  author: "Keith Brown"
  publisher: "RefineX"
canonical: "https://www.refinex.io/blog/refinex-mcp-cli-developer-tools"
published: true
---

Two things shipped today:

```bash
pip install refinex-mcp   # Claude Code / Cursor
pip install refinex-cli   # terminal
```

Both wrap the same live AWS spot signal API. Both work with zero credentials for the public tools. Here's what each one does and why we built them.

## The problem: spot data is one curl away but nobody does it

The RefineX public endpoint has been live since March 26:

```bash
curl https://refinex-api.onrender.com/v1/signals/now
```

Real AWS data. No auth. The best active spot arbitrage signal in under a second. But a curl command buried in a README is not a distribution strategy. Engineers need to encounter spot data where they already are — inside their editor, inside their terminal session. That's what `refinex-mcp` and `refinex-cli` solve.

## refinex-mcp: spot signals inside Claude Code

`refinex-mcp` is a Model Context Protocol server. Install it, add two lines to `~/.claude/settings.json`, and Claude Code can query live spot data without leaving your editor.

```json
{
  "mcpServers": {
    "refinex": {
      "command": "refinex-mcp",
      "env": { "REFINEX_API_KEY": "your-key" }
    }
  }
}
```

Six tools are registered:

| Tool | Auth | What it returns |
|------|------|-----------------|
| `get_live_signal` | None | Best active signal right now |
| `get_suppression_log` | None | Delivered + suppressed signals |
| `get_health` | None | API health + last ingestion time |
| `list_signals` | API key | Paginated signal list with filters |
| `get_signal_for_instance` | API key | Best action for cloud/region/instance |
| `get_signals_summary` | API key | Aggregate: avg savings, top instance types |

`get_live_signal` and `get_suppression_log` need no credentials. If you're evaluating RefineX, those two tools give you real data — live AWS prices, real suppression counts — before you generate an API key.

The practical use case: you're writing a Terraform module or a Karpenter NodePool config, and you want to know which instance type is cheapest in which AZ right now. Instead of switching to a browser or firing a curl command, you ask Claude Code. The answer comes back with a confidence score, a TTL, and the count of signals we held back.

That last number — `suppressed_last_6h` — is a first-class output. Right now it's 119. We detected 120 arbitrage opportunities in the last six hours and surfaced one. That discipline is the product.

## refinex-cli: spot signals in your terminal

`refinex-cli` uses Typer and Rich. Install it once, use it anywhere.

```bash
pip install refinex-cli

# No API key required
refinex now          # best signal, rich panel output
refinex log          # suppression log, color-coded table
refinex health       # API health + last AWS ingestion
refinex watch        # poll every N seconds, print on change

# API key required
refinex signals --region us-east-1 --confidence 0.80
refinex signals --summary
```

`refinex now` output:

```
┌──────────────────── BUY SPOT ─────────────────────┐
│                                                    │
│   Cloud        AWS                                 │
│   Region       us-west-2  us-west-2b               │
│   Instance     c6i.xlarge                          │
│   Spot price   $0.0626/hr                          │
│   On-demand    $0.1700/hr                          │
│   Discount     63.2%                               │
│   Confidence   0.72                                │
│   TTL          28 min                              │
│   Suppressed   119 in last 6h                      │
│                                                    │
└────────────────────────────────────────────────────┘
```

All commands support `--json` for piping:

```bash
refinex now --json | jq .discount_pct
# 63.18

refinex log --json | jq '.suppression_rate'
# 100.0
```

`refinex watch` is the one I find most useful. It runs a polling loop, prints a new panel only when the signal changes, and logs a one-line timestamp on every quiet poll. You can leave it running in a tmux pane during infrastructure work.

## Why both? Different surfaces, same data

The MCP server is for the editor — it meets engineers where they're writing code. The CLI is for the terminal — it meets them where they're running commands. The REST API is for production — Kubernetes controllers, CI/CD pipelines, Terraform provisioners.

Same deterministic confidence scoring. Same suppression log. Same live AWS data flowing from the spot_poller every 10 minutes. Three surfaces, one signal layer.

## What's not here yet

The authenticated tools (`list_signals`, `get_signal_for_instance`, `get_signals_summary`) require a RefineX API key. Early Access is free for 90 days — no credit card, no cloud credentials.

Homebrew distribution is next. `brew install refinex-cli` will make sense once the CLI has more users. PyPI first.

## Links

- `refinex-mcp`: [PyPI](https://pypi.org/project/refinex-mcp/) · [GitHub](https://github.com/keithrawlingsbrown/refinex-mcp)
- `refinex-cli`: [PyPI](https://pypi.org/project/refinex-cli/) · [GitHub](https://github.com/keithrawlingsbrown/refinex-cli)
- Live signal (no auth): [refinex-api.onrender.com/v1/signals/now](https://refinex-api.onrender.com/v1/signals/now)
- Early Access: [refinex.io/pricing](https://www.refinex.io/pricing)
