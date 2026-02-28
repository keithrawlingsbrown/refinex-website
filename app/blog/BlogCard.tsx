'use client';

import Link from 'next/link';
import { PostMeta } from '@/lib/posts';

export function BlogCard({ post }: { post: PostMeta }) {
  return (
    <Link href={`/blog/${post.slug}`} className="block group">
      <article
        className="rounded-xl p-6 transition-all duration-200"
        style={{ background: '#0F172A', border: '1px solid rgba(255,255,255,0.06)' }}
        onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(37,99,235,0.4)')}
        onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)')}
      >
        <div className="flex items-center gap-3 mb-3">
          <span className="text-xs text-slate-500">{post.date}</span>
          <span className="text-xs text-slate-600">·</span>
          <span className="text-xs text-slate-500">{post.readingTime} min read</span>
          {post.tags.slice(0, 2).map(tag => (
            <span
              key={tag}
              className="text-xs px-2 py-0.5 rounded"
              style={{ background: 'rgba(37,99,235,0.15)', color: '#3B82F6' }}
            >
              {tag}
            </span>
          ))}
        </div>
        <h2 className="text-lg font-semibold text-white mb-2 group-hover:text-blue-400 transition-colors">
          {post.title}
        </h2>
        <p className="text-slate-400 text-sm leading-relaxed">{post.description}</p>
      </article>
    </Link>
  );
}
