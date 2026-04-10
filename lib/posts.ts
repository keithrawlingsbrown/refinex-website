/**
 * Blog post loader — reads from build-time manifest.
 *
 * WHY MANIFEST INSTEAD OF FILESYSTEM:
 * ───────────────────────────────────
 * Next.js `output: 'standalone'` does not reliably include files read via
 * fs.readFileSync. Blog posts were missing on Render deploys because the
 * standalone trace only includes files it can statically analyze.
 *
 * The manifest (lib/posts-manifest.json) is generated at build time by
 * scripts/build-posts-manifest.js and imported here. Since it's a regular
 * import, it's always included in the standalone output.
 *
 * See scripts/build-posts-manifest.js for full ADR and history.
 *
 * FALLBACK: If the manifest doesn't exist (local dev without prebuild),
 * falls back to filesystem reads so `npm run dev` works without running
 * the prebuild script.
 */

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

// ── Types ────────────────────────────────────────────────────────────────────

export interface PostMeta {
  slug: string;
  title: string;
  date: string;
  description: string;
  author?: string;
  tags: string[];
  readingTime: number;
  published?: boolean;
}

export interface Post extends PostMeta {
  content: string;
}

interface ManifestPost extends PostMeta {
  content: string;
}

interface PostsManifest {
  posts: ManifestPost[];
  generatedAt: string;
  count: number;
}

// ── Manifest loader ──────────────────────────────────────────────────────────

let _manifestCache: PostsManifest | null = null;

function loadManifest(): PostsManifest | null {
  if (_manifestCache) return _manifestCache;

  try {
    // Try to load the build-time manifest
    const manifestPath = path.join(process.cwd(), 'lib', 'posts-manifest.json');
    if (fs.existsSync(manifestPath)) {
      const raw = fs.readFileSync(manifestPath, 'utf-8');
      _manifestCache = JSON.parse(raw) as PostsManifest;
      return _manifestCache;
    }

    // Also check standalone path
    const standalonePath = path.join(__dirname, 'posts-manifest.json');
    if (fs.existsSync(standalonePath)) {
      const raw = fs.readFileSync(standalonePath, 'utf-8');
      _manifestCache = JSON.parse(raw) as PostsManifest;
      return _manifestCache;
    }
  } catch (e) {
    console.warn('[posts] Failed to load manifest, falling back to filesystem:', e);
  }

  return null;
}

// ── Filesystem fallback (local dev) ──────────────────────────────────────────

function resolvePostsDir(): string {
  if (process.env.POSTS_DIR) return process.env.POSTS_DIR;
  const cwdRelative = path.join(process.cwd(), 'content', 'posts');
  if (fs.existsSync(cwdRelative)) return cwdRelative;
  return '/app/content/posts';
}

function calcReadingTime(content: string): number {
  const words = content.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

function getAllPostsFromFilesystem(): PostMeta[] {
  const postsDir = resolvePostsDir();
  if (!fs.existsSync(postsDir)) return [];

  const files = fs.readdirSync(postsDir).filter(f => f.endsWith('.md') || f.endsWith('.mdx'));

  return files
    .map(filename => {
      const slug = filename.replace(/\.mdx?$/, '');
      const filePath = path.join(postsDir, filename);
      const raw = fs.readFileSync(filePath, 'utf-8');
      const { data, content } = matter(raw);

      return {
        slug,
        title: data.title ?? slug,
        date: data.date ? String(data.date) : '',
        description: data.description ?? data.excerpt ?? '',
        author: data.author ?? undefined,
        tags: Array.isArray(data.tags) ? data.tags : [],
        readingTime: calcReadingTime(content),
        published: data.published !== false,
      } as PostMeta;
    })
    .filter(p => p.published)
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

function getPostFromFilesystem(slug: string): Post | null {
  const postsDir = resolvePostsDir();
  const extensions = ['.mdx', '.md'];

  for (const ext of extensions) {
    const candidate = path.join(postsDir, `${slug}${ext}`);
    if (fs.existsSync(candidate)) {
      const raw = fs.readFileSync(candidate, 'utf-8');
      const { data, content } = matter(raw);

      if (data.published === false) return null;

      return {
        slug,
        title: data.title ?? slug,
        date: data.date ? String(data.date) : '',
        description: data.description ?? data.excerpt ?? '',
        author: data.author ?? undefined,
        tags: Array.isArray(data.tags) ? data.tags : [],
        readingTime: calcReadingTime(content),
        published: true,
        content,
      };
    }
  }

  return null;
}

// ── Public API ────────────────────────────────────────────────────────────────

export function getAllPosts(): PostMeta[] {
  const manifest = loadManifest();
  if (manifest) {
    return manifest.posts.map(({ content, ...meta }) => meta);
  }
  // Fallback to filesystem (local dev)
  return getAllPostsFromFilesystem();
}

export function getPost(slug: string): Post | null {
  const manifest = loadManifest();
  if (manifest) {
    const post = manifest.posts.find(p => p.slug === slug);
    if (!post) return null;
    return post;
  }
  // Fallback to filesystem (local dev)
  return getPostFromFilesystem(slug);
}
