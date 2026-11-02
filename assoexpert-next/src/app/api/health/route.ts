import { NextResponse } from 'next/server';

/**
 * Endpoint de supervision pour Uptime Kuma & Coolify (§4 — Lot 1)
 */
export async function GET() {
  return NextResponse.json(
    {
      status: 'ok',
      service: 'assoexpert-ia',
      version: '0.1.0-lot1',
      timestamp: new Date().toISOString()
    },
    { status: 200 }
  );
}

