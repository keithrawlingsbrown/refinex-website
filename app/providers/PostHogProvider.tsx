'use client';

import posthog from 'posthog-js';
import { PostHogProvider as PHProvider } from 'posthog-js/react';
import { useEffect, useState, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

/**
 * PostHog Analytics Provider with Cookie Consent Gating
 *
 * PostHog only initializes AFTER the user grants analytics consent.
 * This is GDPR/CCPA compliant — no tracking cookies are set until
 * explicit opt-in via the cookie consent banner (Termly).
 *
 * How it works:
 * 1. On mount, check if analytics consent was previously granted
 * 2. Listen for consent changes from the cookie banner (Termly)
 * 3. Only call posthog.init() when consent is granted
 * 4. If consent is revoked, opt out and clear cookies
 *
 * Termly integration:
 * - Termly fires a custom event when consent changes
 * - This provider listens for that event
 * - Category name: "analytics" (matches Termly's default)
 *
 * Without Termly (pre-integration):
 * - Falls back to checking a localStorage key: "refinex_analytics_consent"
 * - Set to "granted" to enable, "denied" to disable
 */

// Key and host are passed as props from layout.tsx (a Server Component).
// Server Components reliably inline process.env.NEXT_PUBLIC_* at build time.
// Turbopack does NOT inline them in 'use client' files regardless of scope.

const CONSENT_KEY = 'refinex_analytics_consent';

function getStoredConsent(): boolean {
  if (typeof window === 'undefined') return false;

  // Check Termly consent first
  try {
    const termlyConsent = (window as any).Termly?.getConsentState?.();
    if (termlyConsent) {
      return termlyConsent.analytics === true;
    }
  } catch {
    // Termly not loaded yet
  }

  // Fallback to localStorage
  return localStorage.getItem(CONSENT_KEY) === 'granted';
}

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
  const [consentGranted, setConsentGranted] = useState(false);

  useEffect(() => {
    // Check initial consent state
    setConsentGranted(getStoredConsent());

    // Listen for Termly consent changes
    const handleConsentChange = () => {
      const granted = getStoredConsent();
      setConsentGranted(granted);

      if (!granted && typeof posthog?.opt_out_capturing === 'function') {
        posthog.opt_out_capturing();
        posthog.reset();
      }
    };

    // Termly fires this event when user interacts with the consent banner
    window.addEventListener('termly:consent', handleConsentChange);

    // Also listen for localStorage-based consent (pre-Termly fallback)
    window.addEventListener('storage', (e) => {
      if (e.key === CONSENT_KEY) {
        handleConsentChange();
      }
    });

    return () => {
      window.removeEventListener('termly:consent', handleConsentChange);
    };
  }, []);

  useEffect(() => {
    if (!posthogKey || !consentGranted) return;

    // Only initialize PostHog after consent is granted
    if (!posthog.__loaded) {
      posthog.init(posthogKey, {
        api_host: '/ingest',
        ui_host: 'https://us.posthog.com',
        capture_pageview: false, // handled manually via PostHogPageview
        capture_pageleave: true,
        autocapture: true,
        persistence: 'localStorage+cookie',
        opt_out_capturing_by_default: false, // we gate on consent above
      });
    } else {
      // Already initialized — opt back in if they re-consented
      posthog.opt_in_capturing();
    }
  }, [posthogKey, posthogHost, consentGranted]);

  return (
    <PHProvider client={posthog}>
      {consentGranted && (
        <Suspense fallback={null}>
          <PostHogPageview />
        </Suspense>
      )}
      {children}
    </PHProvider>
  );
}
