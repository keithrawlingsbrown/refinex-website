/**
 * Build-time blog post manifest generator.
 *
 * WHY THIS EXISTS (ADR — April 10, 2026):
 * ─────────────────────────────────────────
 * Next.js `output: 'standalone'` only includes files that are traced via
 * import/require. Blog posts are read with fs.readFileSync at runtime,
 * which means they are NOT included in the standalone output.
 *
 * Previous attempts to fix:
 * 1. (Session 17) outputFileTracingIncludes — partially worked but unreliable.
 *    Only traced files that Next.js happened to touch during build, not all posts.
 * 2. (Session 18) Same approach — still only 3 of 9 posts traced.
 *
 * ROOT CAUSE: The standalone trace depends on which files are actually read
 * during `next build`. Since blog pages use `force-dynamic`, not all posts
 * are read at build time, so not all are traced.
 *
 * PERMANENT FIX: This script runs BEFORE `next build` and bakes all post
 * content into a JSON manifest. The blog pages read from the manifest
 * (a regular import) instead of the filesystem. The manifest is always
 * included in the standalone output because it's imported, not fs.read'd.
 *
 * This is deployment-agnostic: works on Render, Vercel, Docker, anywhere.
 *
 * USAGE: Called automatically via `npm run build` (prebuild script).
 *
 * HISTORY:
 * - 2026-04-10: Created to permanently fix missing blog posts on Render
 * - Previous fixes: outputFileTracingIncludes (partial), Dockerfile COPY (Docker only)
 */

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const POSTS_DIR = path.join(__dirname, '..', 'content', 'posts');
const OUTPUT_FILE = path.join(__dirname, '..', 'lib', 'posts-manifest.json');

function calcReadingTime(content) {
  const words = content.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

function buildManifest() {
  if (!fs.existsSync(POSTS_DIR)) {
    console.warn('[build-posts-manifest] No posts directory found at:', POSTS_DIR);
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify({ posts: [], generatedAt: new Date().toISOString() }, null, 2));
    return;
  }

  const files = fs.readdirSync(POSTS_DIR).filter(f => f.endsWith('.md') || f.endsWith('.mdx'));

  const posts = files
    .map(filename => {
      const slug = filename.replace(/\.mdx?$/, '');
      const filePath = path.join(POSTS_DIR, filename);
      const raw = fs.readFileSync(filePath, 'utf-8');
      const { data, content } = matter(raw);

      return {
        slug,
        title: data.title ?? slug,
        date: data.date ? String(data.date) : '',
        description: data.description ?? data.excerpt ?? '',
        meta_title: data.meta_title ?? '',
        author: data.author ?? undefined,
        tags: Array.isArray(data.tags) ? data.tags : [],
        schema: data.schema ?? null,
        readingTime: calcReadingTime(content),
        published: data.published !== false,
        content,
      };
    })
    .filter(p => p.published)
    .sort((a, b) => (a.date < b.date ? 1 : -1));

  const manifest = {
    posts,
    generatedAt: new Date().toISOString(),
    count: posts.length,
  };

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(manifest, null, 2));
  console.log(`[build-posts-manifest] Generated manifest: ${posts.length} posts → ${OUTPUT_FILE}`);
}

buildManifest();
