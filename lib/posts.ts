import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const POSTS_DIR = path.join(process.cwd(), 'content', 'posts');

export interface PostMeta {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  author?: string;
  tags?: string[];
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

export function getAllPosts(): PostMeta[] {
  ensurePostsDir();

  const files = fs.readdirSync(POSTS_DIR).filter(f => f.endsWith('.md') || f.endsWith('.mdx'));

  const posts = files
    .map(filename => {
      const slug = filename.replace(/\.mdx?$/, '');
      const filePath = path.join(POSTS_DIR, filename);
      const raw = fs.readFileSync(filePath, 'utf-8');
      const { data } = matter(raw);

      return {
        slug,
        title: data.title ?? slug,
        date: data.date ? String(data.date) : '',
        excerpt: data.excerpt ?? '',
        author: data.author ?? undefined,
        tags: Array.isArray(data.tags) ? data.tags : [],
        published: data.published !== false, // default true unless explicitly false
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
    excerpt: data.excerpt ?? '',
    author: data.author ?? undefined,
    tags: Array.isArray(data.tags) ? data.tags : [],
    published: true,
    content,
  };
}
