# RefineX Website — Claude Code Context
Last updated: Feb 22, 2026

## Status: LAUNCH READY
Build: clean, 15 routes, zero errors
Pushed: origin/master

## What Is Complete
- Full redesign: no vibe code, no neon, no fake counters
- Connected to refinex-mvp backend (port 8000)
- Signal Transparency page: live backend data, revalidates 60s
- Hero signal card: live data with SAMPLE fallback
- System status pill: polls /api/health every 60s
- Mobile nav: working hamburger menu
- OG metadata: set for social sharing
- Privacy + Terms pages: exist with advisory-only language
- Pricing page: Pro tier elevated, no dead links
- Favicon: public/favicon.svg

## Backend Connection
API URL: http://localhost:8000 (dev) / https://api.refinex.io (prod)
API Key: rxk_web_* (sandbox, read-only, in .env.local — never commit)
Admin Token: in .env.local — never commit

## What Needs To Happen At Domain Launch
1. Update REFINEX_API_URL in .env.local to production backend URL
2. Update REFINEX_API_KEY to a live-tier key (not sandbox)
3. Set metadataBase in layout.tsx to https://refinex.io
4. Add OG image: create public/og.png (1200x630)
5. Point domain DNS to deployment host

## What Is Deferred
- OG image (needs design asset)
- /api-reference full content
- /docs full content
- /enterprise full content
- Daily public signal digest (locked per master doc)

## Commands
npm run dev     # starts on port 3000 (or next available)
npm run build   # verify before any deploy
npm run start   # production server

## Do Not Touch
- .env.local (never commit)
- lib/refinex-api.ts (do not add new endpoints without instruction)
- app/transparency/page.tsx ISR revalidate setting (60s is intentional)
