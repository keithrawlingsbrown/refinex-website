# ADR-001: Blog Posts Build-Time Manifest

**Date:** 2026-04-10
**Status:** Accepted
**Decision:** Replace runtime filesystem reads with build-time JSON manifest for blog posts.

## Context

Blog posts were intermittently missing from the deployed site on Render. This was debugged twice:

### Attempt 1 (Session 17)
- **Symptom:** Only a subset of posts appeared on refinex.io/blog
- **Diagnosis:** Next.js `output: 'standalone'` only includes files traced via import/require. Blog posts read with `fs.readFileSync` were not traced.
- **Fix tried:** `outputFileTracingIncludes` in next.config.js
- **Result:** Partially worked — traced some files but not all

### Attempt 2 (Session 18)
- **Symptom:** Same issue recurred. 6 of 9 posts showing.
- **Diagnosis:** `outputFileTracingIncludes` traces files that Next.js touches during build. Blog uses `force-dynamic`, so not all posts are read at build time, so not all are traced.
- **Fix tried:** Same `outputFileTracingIncludes` approach
- **Result:** Still only 3 posts in standalone trace

### Root Cause
The standalone output trace is build-time-dependent. It includes files that the build process actually reads. Since blog pages use `export const dynamic = 'force-dynamic'`, Next.js doesn't statically generate all blog pages at build time, which means it doesn't read all post files, which means it doesn't trace them.

The Dockerfile handled this correctly with an explicit `COPY` command, but Render uses native Node.js builds (not Docker).

## Decision

Replace runtime filesystem reads with a **build-time JSON manifest**.

### How it works:
1. `scripts/build-posts-manifest.js` runs as a `prebuild` npm script
2. It reads all posts from `content/posts/` and writes them to `lib/posts-manifest.json`
3. `lib/posts.ts` imports from the manifest (a regular file read of a known path)
4. The manifest is always included in standalone output because it's in `lib/`
5. Fallback to filesystem reads preserved for local dev (`npm run dev`)

### Files changed:
- `scripts/build-posts-manifest.js` — new, generates manifest
- `lib/posts.ts` — rewritten, reads from manifest with filesystem fallback
- `package.json` — added `prebuild` script
- `next.config.js` — removed `outputFileTracingIncludes` (no longer needed)
- `.gitignore` — added `lib/posts-manifest.json`

## Consequences

### Positive
- **Deployment-agnostic:** Works on Render, Vercel, Docker, any platform
- **No more missing posts:** All posts are baked into the build output
- **Scales:** Adding new posts just requires a rebuild (which Render does on every push)
- **Local dev unaffected:** Filesystem fallback means `npm run dev` works without prebuild

### Negative
- Posts are not live-updatable without a rebuild (acceptable for a static blog)
- Manifest could get large with many posts (not a concern at <100 posts)

### Neutral
- Content strategist auto-publishing flow unchanged — it pushes to GitHub, Render rebuilds, manifest regenerates

## Why Not These Alternatives?

| Alternative | Why Not |
|-------------|---------|
| Use Render Docker builds | Adds complexity, Render native builds are simpler and faster |
| Use `getStaticProps` / remove `force-dynamic` | Would break other dynamic features on blog pages |
| Copy content/ in a custom Render build script | Fragile, Render-specific, not portable |
| Move to a CMS (Contentful, Sanity) | Overkill for current scale, adds cost and dependency |
