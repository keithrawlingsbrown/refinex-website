import { cache } from 'react';

const API_URL = process.env.REFINEX_API_URL || 'https://refinex-api.onrender.com';
const API_KEY = process.env.REFINEX_API_KEY || '';
const ADMIN_TOKEN = process.env.REFINEX_ADMIN_TOKEN || '';

export async function getActiveSignal(): Promise<any> {
  try {
    const res = await fetch(
      `${API_URL}/v1/signals/active?cloud=aws&region=us-east-1&instance_type=c5.2xlarge`,
      { headers: { 'X-API-Key': API_KEY }, next: { revalidate: 60 } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const s = data.signal || data;
    return {
      region: s.source?.region ?? s.region ?? '—',
      instance_type: s.asset?.instance_type ?? s.instance_type ?? '—',
      confidence: s.confidence ?? 0,
      savings_pct: s.expected_value?.savings_percent ?? s.savings_pct ?? null,
      action: s.action ?? '—',
      suppressed: s.suppressed ?? false,
      regime: s.regime ?? s.market_regime ?? '—',
      expires_at: s.expires_at ?? null,
    };
  } catch { return null; }
}

export async function getSignalHistory(): Promise<any[]> {
  try {
    const res = await fetch(
      `${API_URL}/v1/signals?limit=20`,
      { headers: { 'X-API-Key': API_KEY }, next: { revalidate: 60 } }
    );
    if (!res.ok) return [];
    const data = await res.json();
    const signals = data.signals || data || [];
    return signals.map((s: any) => ({
      region: s.source?.region ?? s.region ?? '—',
      instance_type: s.asset?.instance_type ?? s.instance_type ?? '—',
      confidence: s.confidence ?? 0,
      savings_pct: s.expected_value?.savings_percent ?? s.savings_pct ?? null,
      action: s.action ?? '—',
      suppressed: s.suppressed ?? false,
      regime: s.regime ?? s.market_regime ?? '—',
      expires_at: s.expires_at ?? null,
    }));
  } catch { return []; }
}

export async function getSuppressedSignals(): Promise<any[]> {
  try {
    const res = await fetch(
      `${API_URL}/v1/signals?limit=20&suppressed=true`,
      { headers: { 'X-API-Key': API_KEY }, next: { revalidate: 60 } }
    );
    if (!res.ok) return [];
    const data = await res.json();
    const signals = data.signals || data || [];
    return signals.map((s: any) => ({
      region: s.source?.region ?? s.region ?? '—',
      instance_type: s.asset?.instance_type ?? s.instance_type ?? '—',
      confidence: s.confidence ?? 0,
      savings_pct: s.expected_value?.savings_percent ?? s.savings_pct ?? null,
      action: s.action ?? '—',
      suppressed: true,
      regime: s.regime ?? s.market_regime ?? '—',
    }));
  } catch { return []; }
}

export async function getPublicSignalHistory(): Promise<{
  signals: any[];
  suppression_rate: number;
  delivered: number;
  suppressed: number;
}> {
  try {
    const res = await fetch(
      `${API_URL}/v1/signals/public?limit=20`,
      { next: { revalidate: 60 } }
    );
    if (!res.ok) return { signals: [], suppression_rate: 0, delivered: 0, suppressed: 0 };
    const data = await res.json();
    const signals = (data.signals || []).map((s: any) => ({
      region: s.region ?? '—',
      instance_type: s.instance_type ?? '—',
      confidence: s.confidence ?? 0,
      savings_pct: s.savings_pct ?? null,
      action: s.action ?? '—',
      suppressed: s.suppressed ?? false,
      suppression_reason: s.suppression_reason ?? null,
      created_at: s.created_at ?? null,
    }));
    return {
      signals,
      suppression_rate: data.suppression_rate ?? 0,
      delivered: data.delivered ?? 0,
      suppressed: data.suppressed ?? 0,
    };
  } catch {
    return { signals: [], suppression_rate: 0, delivered: 0, suppressed: 0 };
  }
}

export async function getSystemHealth(): Promise<any> {
  try {
    const res = await fetch(
      `${API_URL}/v1/trinity/health`,
      { headers: { 'X-Admin-Token': ADMIN_TOKEN }, next: { revalidate: 60 } }
    );
    if (!res.ok) return null;
    return await res.json();
  } catch { return null; }
}

export async function getDashboardSnapshot(): Promise<any> {
  try {
    const res = await fetch(
      `${API_URL}/v1/trinity/dashboard`,
      { headers: { 'X-Admin-Token': ADMIN_TOKEN }, next: { revalidate: 60 } }
    );
    if (!res.ok) return null;
    return await res.json();
  } catch { return null; }
}
