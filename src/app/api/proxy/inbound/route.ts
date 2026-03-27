import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const targetUrl = process.env.NEGOTIATOR_API_URL || 'http://localhost:8080/api/v1/inbound/messages';
    const token = process.env.NEGOTIATOR_API_TOKEN || '';

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(targetUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    const data = await res.json().catch(() => ({}));

    return NextResponse.json(data, { status: res.status });
  } catch (error: any) {
    console.error('Proxy Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
