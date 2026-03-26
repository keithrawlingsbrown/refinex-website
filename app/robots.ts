import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // Baseline: allow all crawlers
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/'],
      },
      // OpenAI (ChatGPT, GPT-4o browsing, SearchGPT)
      { userAgent: 'GPTBot', allow: '/' },
      { userAgent: 'ChatGPT-User', allow: '/' },
      { userAgent: 'OAI-SearchBot', allow: '/' },
      // Anthropic (Claude)
      { userAgent: 'ClaudeBot', allow: '/' },
      { userAgent: 'anthropic-ai', allow: '/' },
      // Google (Gemini, AI Overviews)
      { userAgent: 'Google-Extended', allow: '/' },
      // Perplexity
      { userAgent: 'PerplexityBot', allow: '/' },
      // Meta AI
      { userAgent: 'meta-externalagent', allow: '/' },
      // You.com
      { userAgent: 'YouBot', allow: '/' },
      // Cohere
      { userAgent: 'cohere-ai', allow: '/' },
      // Common Crawl (used by many LLM training pipelines)
      { userAgent: 'CCBot', allow: '/' },
    ],
    sitemap: 'https://www.refinex.io/sitemap.xml',
  };
}
