'use client';

import { useState } from 'react';

interface ShareButtonsProps {
  url: string;
  title: string;
  description: string;
}

export function ShareButtons({ url, title, description }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const encodedUrl  = encodeURIComponent(url);
  const encodedText = encodeURIComponent(`${title}\n\n${description}`);
  const encodedTitle = encodeURIComponent(title);

  const xHref        = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodedUrl}&via=getrefinex`;
  const linkedinHref = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
  const emailHref    = `mailto:?subject=${encodedTitle}&body=${encodedText}%0A%0A${encodedUrl}`;
  const smsHref      = `sms:?body=${encodeURIComponent(title + ' ' + url)}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const el = document.createElement('textarea');
      el.value = url;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const btnBase: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 12px',
    borderRadius: '8px',
    fontSize: '12px',
    fontWeight: 500,
    cursor: 'pointer',
    textDecoration: 'none',
    border: '1px solid rgba(255,255,255,0.08)',
    background: 'rgba(255,255,255,0.04)',
    color: '#94A3B8',
    transition: 'all 0.15s ease',
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
      <span style={{ fontSize: '11px', color: '#475569', marginRight: '4px', fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
        Share
      </span>

      {/* X / Twitter */}
      <a href={xHref} target="_blank" rel="noopener noreferrer" style={btnBase}
        onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(255,255,255,0.2)'; (e.currentTarget as HTMLAnchorElement).style.color = '#F8FAFC'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(255,255,255,0.08)'; (e.currentTarget as HTMLAnchorElement).style.color = '#94A3B8'; }}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
        Post on X
      </a>

      {/* LinkedIn */}
      <a href={linkedinHref} target="_blank" rel="noopener noreferrer" style={btnBase}
        onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(255,255,255,0.2)'; (e.currentTarget as HTMLAnchorElement).style.color = '#F8FAFC'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(255,255,255,0.08)'; (e.currentTarget as HTMLAnchorElement).style.color = '#94A3B8'; }}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
        </svg>
        LinkedIn
      </a>

      {/* Email */}
      <a href={emailHref} style={btnBase}
        onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(255,255,255,0.2)'; (e.currentTarget as HTMLAnchorElement).style.color = '#F8FAFC'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(255,255,255,0.08)'; (e.currentTarget as HTMLAnchorElement).style.color = '#94A3B8'; }}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="4" width="20" height="16" rx="2"/>
          <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
        </svg>
        Email
      </a>

      {/* SMS */}
      <a href={smsHref} style={btnBase}
        onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(255,255,255,0.2)'; (e.currentTarget as HTMLAnchorElement).style.color = '#F8FAFC'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(255,255,255,0.08)'; (e.currentTarget as HTMLAnchorElement).style.color = '#94A3B8'; }}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
        SMS
      </a>

      {/* Copy link */}
      <button onClick={handleCopy} style={{ ...btnBase, background: copied ? 'rgba(16,185,129,0.12)' : 'rgba(255,255,255,0.04)', borderColor: copied ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.08)', color: copied ? '#10B981' : '#94A3B8' }}
        onMouseEnter={e => { if (!copied) { (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.2)'; (e.currentTarget as HTMLButtonElement).style.color = '#F8FAFC'; } }}
        onMouseLeave={e => { if (!copied) { (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.08)'; (e.currentTarget as HTMLButtonElement).style.color = '#94A3B8'; } }}>
        {copied ? (
          <>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6 9 17l-5-5"/>
            </svg>
            Copied!
          </>
        ) : (
          <>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
              <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
            </svg>
            Copy link
          </>
        )}
      </button>
    </div>
  );
}
