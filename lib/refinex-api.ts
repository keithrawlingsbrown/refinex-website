const API_URL = process.env.REFINEX_API_URL || 'http://localhost:8000';
const API_KEY = process.env.REFINEX_API_KEY || '';
const ADMIN_TOKEN = process.env.REFINEX_ADMIN_TOKEN || '';

async function apiFetch(path: string, useAdmin = false) {
  try {
    const headers: Record<string, string> = useAdmin
      ? { 'X-Admin-Token': ADMIN_TOKEN }
      : { 'X-API-Key': API_KEY };

    const res = await fetch(`${API_URL}${path}`, {
      headers,
      next: { revalidate: 60 },
    });

    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function getActiveSignal() {
  return apiFetch('/v1/signals/active?cloud=aws&region=us-east-1&instance_type=c5.2xlarge');
}

export async function getSignalHistory() {
  return apiFetch('/v1/signals?limit=20');
}

export async function getSystemHealth() {
  return apiFetch('/v1/trinity/health', true);
}

export async function getDashboardSnapshot() {
  return apiFetch('/v1/trinity/dashboard', true);
}
