import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

// Resolve content directory — try env var first, then cwd-relative, then /app absolute
function resolvePostsDir(): string {
  if (process.env.POSTS_DIR) return process.env.POSTS_DIR;
  const cwdRelative = path.join(process.cwd(), 'content', 'posts');
  if (fs.existsSync(cwdRelative)) return cwdRelative;
  return '/app/content/posts'; // Docker container absolute fallback
}
const POSTS_DIR = resolvePostsDir();

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

function ensurePostsDir() {
  if (!fs.existsSync(POSTS_DIR)) {
    fs.mkdirSync(POSTS_DIR, { recursive: true });
  }
}

function calcReadingTime(content: string): number {
  const words = content.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

export function getAllPosts(): PostMeta[] {
  ensurePostsDir();

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
        author: data.author ?? undefined,
        tags: Array.isArray(data.tags) ? data.tags : [],
        readingTime: calcReadingTime(content),
        published: data.published !== false,
      } as PostMeta;
    })
    .filter(p => p.published)
    .sort((a, b) => (a.date < b.date ? 1 : -1));

  return posts;
}

export function getPost(slug: string): Post | null {
  ensurePostsDir();

  const extensions = ['.mdx', '.md'];
  let filePath: string | null = null;

  for (const ext of extensions) {
    const candidate = path.join(POSTS_DIR, `${slug}${ext}`);
    if (fs.existsSync(candidate)) {
      filePath = candidate;
      break;
    }
  }

  if (!filePath) return null;

  const raw = fs.readFileSync(filePath, 'utf-8');
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
