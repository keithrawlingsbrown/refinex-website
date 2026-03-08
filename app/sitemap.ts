import { MetadataRoute } from 'next';
import { getAllPosts } from '@/lib/posts';

const BASE_URL = 'https://www.refinex.io';

const STATIC_PAGES: MetadataRoute.Sitemap = [
  { url: BASE_URL, lastModified: new Date(), changeFrequency: 'weekly', priority: 1.0 },
  { url: `${BASE_URL}/blog`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
  { url: `${BASE_URL}/pricing`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
  { url: `${BASE_URL}/transparency`, lastModified: new Date(), changeFrequency: 'always', priority: 0.8 },
  { url: `${BASE_URL}/docs`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
  { url: `${BASE_URL}/docs/quickstart`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
  { url: `${BASE_URL}/api-reference`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
  { url: `${BASE_URL}/enterprise`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
  { url: `${BASE_URL}/specs`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getAllPosts();
  const postEntries: MetadataRoute.Sitemap = posts.map(post => ({
    url: `${BASE_URL}/blog/${post.slug}`,
    lastModified: post.date ? new Date(post.date) : new Date(),
    changeFrequency: 'monthly',
    priority: 0.8,
  }));

  return [...STATIC_PAGES, ...postEntries];
}
