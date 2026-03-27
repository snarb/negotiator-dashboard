import { NextRequest, NextResponse } from 'next/server';

declare global {
  var _mockWebhooks: any[];
}

if (!globalThis._mockWebhooks) {
  globalThis._mockWebhooks = [];
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const headers = Object.fromEntries(request.headers);

    const logEntry = {
      id: Math.random().toString(36).substr(2, 9),
      received_at: new Date().toISOString(),
      headers,
      payload: body,
      // Attempt to extract ticket_id if the webhook shape contains it
      ticket_id: body?.ticket_id || body?.data?.ticket_id || null, 
    };

    globalThis._mockWebhooks.push(logEntry);

    // Keep memory bounded to last 1000 webhooks
    if (globalThis._mockWebhooks.length > 1000) {
      globalThis._mockWebhooks.shift();
    }

    return NextResponse.json({ status: 'ok', message: 'Webhook intercepted securely by Playground' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const ticketId = url.searchParams.get('ticket_id');

  let results = globalThis._mockWebhooks || [];

  if (ticketId) {
    results = results.filter(w => w.ticket_id === ticketId);
  }

  // Most recent first
  results = results.slice().reverse();

  return NextResponse.json({ webhooks: results });
}
