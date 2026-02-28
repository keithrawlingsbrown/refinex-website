import { getPost, getAllPosts } from '@/lib/posts';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';

export async function generateStaticParams() {
  return getAllPosts().map(p => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const post = getPost(params.slug);
  if (!post) return {};
  return { title: `${post.title} — RefineX`, description: post.description };
}

export default function PostPage({ params }: { params: { slug: string } }) {
  const post = getPost(params.slug);
  if (!post) notFound();

  return (
    <main className="min-h-screen px-6 py-24" style={{ background: '#0A0F1E' }}>
      <div className="max-w-2xl mx-auto">
        <Link href="/blog" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-blue-400 mb-12 transition-colors">
          ← Back to blog
        </Link>
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
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
        <hr style={{ borderColor: 'rgba(255,255,255,0.06)', marginBottom: '2.5rem' }} />
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
        <div className="mt-16 pt-8" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <p className="text-slate-500 text-sm mb-4">Want to see the signals behind this analysis?</p>
          <div className="flex gap-4">
            <Link href="/transparency"
              className="px-4 py-2 rounded-lg text-sm font-medium text-blue-400 transition-colors"
              style={{ background: 'rgba(37,99,235,0.15)', border: '1px solid rgba(37,99,235,0.3)' }}>
              View live signal log →
            </Link>
            <Link href="/portal"
              className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors"
              style={{ background: '#2563EB' }}>
              Get API access →
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
