'use client';

import posthog from 'posthog-js';
import { PostHogProvider as PHProvider } from 'posthog-js/react';
import { useEffect, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

// Key and host are passed as props from layout.tsx (a Server Component).
// Server Components reliably inline process.env.NEXT_PUBLIC_* at build time.
// Turbopack does NOT inline them in 'use client' files regardless of scope.

function PostHogPageview() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (pathname && typeof posthog?.capture === 'function') {
      let url = window.origin + pathname;
      const search = searchParams?.toString();
      if (search) url += `?${search}`;
      posthog.capture('$pageview', { $current_url: url });
    }
  }, [pathname, searchParams]);

  return null;
}

interface PostHogProviderProps {
  children: React.ReactNode;
  posthogKey: string;
  posthogHost: string;
}

export function PostHogProvider({ children, posthogKey, posthogHost }: PostHogProviderProps) {
  useEffect(() => {
    if (!posthogKey) return;

    posthog.init(posthogKey, {
      api_host: '/ingest',
      ui_host: 'https://us.posthog.com',
      capture_pageview: false, // handled manually via PostHogPageview
      capture_pageleave: true,
      autocapture: true,
      persistence: 'localStorage+cookie',
    });
  }, [posthogKey, posthogHost]);

  return (
    <PHProvider client={posthog}>
      <Suspense fallback={null}>
        <PostHogPageview />
      </Suspense>
      {children}
    </PHProvider>
  );
}
