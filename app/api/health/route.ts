import { NextResponse } from 'next/server';

export async function GET() {
  const API_URL = process.env.REFINEX_API_URL || 'http://localhost:8000';
  const ADMIN_TOKEN = process.env.REFINEX_ADMIN_TOKEN || '';

  try {
    const res = await fetch(`${API_URL}/v1/trinity/health`, {
      headers: { 'X-Admin-Token': ADMIN_TOKEN },
      next: { revalidate: 30 },
    });

    if (!res.ok) {
      return NextResponse.json({ ok: false }, { status: 200 });
    }

    const data = await res.json();
    return NextResponse.json({
      ok: data.issues_detected === 0,
      checks: data.checks_run ?? 0,
      issues: data.issues_detected ?? 0,
    });
  } catch {
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}
