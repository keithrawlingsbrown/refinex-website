import { getPost, getAllPosts } from '@/lib/posts';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import { ShareButtons } from '@/components/blog/ShareButtons';
import fs from 'fs';
import path from 'path';

const SITE_URL = 'https://www.refinex.io';

// Force dynamic so posts render at request-time (filesystem always correct at runtime)
export const dynamic = 'force-dynamic';

export async function generateStaticParams() {
  return getAllPosts().map(p => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  return {
    title: `${post.title} — RefineX`,
    description: post.description,
    authors: [{ name: 'Keith Brown', url: 'https://www.refinex.io/blog' }],
    openGraph: {
      title: post.title,
      description: post.description,
      type: 'article',
      url: `${SITE_URL}/blog/${post.slug}`,
      siteName: 'RefineX',
      authors: ['Keith Brown'],
      publishedTime: post.date ? new Date(post.date).toISOString() : undefined,
      tags: post.tags,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
      site: '@getrefinex',
      creator: '@getrefinex',
    },
  };
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const postUrl = `${SITE_URL}/blog/${post.slug}`;

  return (
    <main className="min-h-screen px-6 py-24" style={{ background: '#0A0F1E' }}>
      <div className="max-w-2xl mx-auto">

        {/* Back link */}
        <Link href="/blog" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-blue-400 mb-12 transition-colors">
          ← Back to blog
        </Link>

        {/* Post header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <span className="text-xs text-slate-500">{post.date}</span>
            <span className="text-xs text-slate-600">·</span>
            <span className="text-xs text-slate-500">{post.readingTime} min read</span>
            {post.tags.map(tag => (
              <span key={tag} className="text-xs px-2 py-0.5 rounded"
                style={{ background: 'rgba(37,99,235,0.15)', color: '#3B82F6' }}>
                {tag}
              </span>
            ))}
          </div>
          <h1 className="text-3xl font-bold text-white mb-4">{post.title}</h1>
          <p className="text-slate-400 text-lg leading-relaxed">{post.description}</p>
        </div>

        {/* Audio version */}
        {(() => {
          const audioMap: Record<string, string> = {
            'when-data-center-in-war-zone': '/audio/blog/blog-01-when-data-center-in-war-zone.mp3',
            'ceasefire-was-not-a-signal': '/audio/blog/blog-02-ceasefire-was-not-a-signal.mp3',
            'april-22-ceasefire-expires': '/audio/blog/blog-05-april-22-ceasefire-expires.mp3',
          };
          const audioSrc = audioMap[post.slug];
          if (!audioSrc) return null;
          return (
            <div className="rounded-lg p-4 mb-8"
              style={{ background: 'rgba(37,99,235,0.06)', border: '1px solid rgba(37,99,235,0.15)' }}>
              <div className="flex items-center gap-3 mb-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                  <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                </svg>
                <span className="text-sm font-medium" style={{ color: '#3B82F6' }}>Listen to this post</span>
                <span className="text-xs" style={{ color: '#475569' }}>Narrated by Keith Brown</span>
              </div>
              <audio controls className="w-full" style={{ height: '36px' }} preload="none">
                <source src={audioSrc} type="audio/mpeg" />
              </audio>
            </div>
          );
        })()}

        <hr style={{ borderColor: 'rgba(255,255,255,0.06)', marginBottom: '2.5rem' }} />

        {/* Post body */}
        <div className="prose prose-invert prose-slate max-w-none
          prose-headings:text-white prose-headings:font-semibold
          prose-p:text-slate-300 prose-p:leading-relaxed
          prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline
          prose-code:text-blue-300 prose-code:bg-slate-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
          prose-pre:bg-slate-900 prose-pre:border prose-pre:border-slate-700
          prose-strong:text-white
          prose-blockquote:border-blue-500 prose-blockquote:text-slate-400">
          <ReactMarkdown>{post.content}</ReactMarkdown>
        </div>

        {/* Share row — sits right below article body */}
        <div className="mt-10 mb-12">
          <ShareButtons url={postUrl} title={post.title} description={post.description} />
        </div>

        {/* Conversion CTA */}
        <div className="rounded-2xl p-8"
          style={{ background: 'linear-gradient(135deg, rgba(37,99,235,0.12) 0%, rgba(15,23,42,0.8) 100%)', border: '1px solid rgba(37,99,235,0.25)' }}>
          <div className="flex items-start gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(37,99,235,0.2)', border: '1px solid rgba(37,99,235,0.3)' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m3 11 19-9-9 19-2-8-8-2z"/>
              </svg>
            </div>
            <div>
              <p className="text-white font-semibold text-base mb-1">See this analysis live</p>
              <p className="text-slate-400 text-sm leading-relaxed">
                The data behind this post comes from the RefineX signal engine — running in real time, logging every signal it generates and every one it suppresses. Free to inspect, no account required.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 mt-6">
            <Link href="/transparency"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-blue-400 transition-all"
              style={{ background: 'rgba(37,99,235,0.15)', border: '1px solid rgba(37,99,235,0.3)' }}
              onMouseEnter={undefined}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
              </svg>
              View live signal log
            </Link>

            <Link href="/portal"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white transition-all"
              style={{ background: '#2563EB' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" x2="3" y1="12" y2="12"/>
              </svg>
              Start free — 90 days
            </Link>

            <Link href="/docs"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#94A3B8' }}>
              Read the docs →
            </Link>
          </div>

          <p className="mt-4 text-xs text-slate-600">
            Advisory signals only — not financial or infrastructure advice.
          </p>
        </div>

        {/* Bottom share + nav */}
        <div className="mt-10 flex items-center justify-between flex-wrap gap-4">
          <ShareButtons url={postUrl} title={post.title} description={post.description} />
          <Link href="/blog" className="text-sm text-slate-500 hover:text-blue-400 transition-colors">
            ← More posts
          </Link>
        </div>

      </div>
    </main>
  );
}
