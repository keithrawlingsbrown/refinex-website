import { getAllPosts } from '@/lib/posts';
import { BlogCard } from './BlogCard';

export const metadata = {
  title: 'Blog — RefineX',
  description: 'Engineering insights on spot markets, signal design, and infrastructure cost intelligence.',
  openGraph: {
    title: 'Blog — RefineX',
    description: 'Engineering insights on spot markets, signal design, and infrastructure cost intelligence.',
    type: 'website',
    url: 'https://www.refinex.io/blog',
    siteName: 'RefineX',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blog — RefineX',
    description: 'Engineering insights on spot markets, signal design, and infrastructure cost intelligence.',
    site: '@getrefinex',
  },
};

export default function BlogIndex() {
  const posts = getAllPosts();
  return (
    <main className="min-h-screen px-6 py-24" style={{ background: '#0A0F1E' }}>
      <div className="max-w-3xl mx-auto">
        <div className="mb-16">
          <span
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold mb-4"
            style={{ background: 'rgba(37,99,235,0.15)', color: '#3B82F6', border: '1px solid rgba(37,99,235,0.3)' }}
          >
            ENGINEERING BLOG
          </span>
          <h1 className="text-4xl font-bold text-white mb-4">Signal Intelligence</h1>
          <p className="text-slate-400 text-lg">
            How RefineX thinks about spot markets, suppression logic, and infrastructure cost signals.
          </p>
        </div>
        {posts.length === 0 ? (
          <p className="text-slate-500">No posts yet.</p>
        ) : (
          <div className="space-y-6">
            {posts.map(post => (
              <BlogCard key={post.slug} post={post} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
