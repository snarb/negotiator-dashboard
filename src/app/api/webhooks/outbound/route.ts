import { NextRequest, NextResponse } from "next/server";
import { getWebhooks, addWebhook } from "@/lib/webhookStore";

export const dynamic = 'force-dynamic';

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
      type: "generic_webhook"
    };

    addWebhook(logEntry);

    return NextResponse.json({
      status: "ok",
      message: "Webhook intercepted securely by Playground",
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const ticketId = url.searchParams.get("ticket_id");

  let results = getWebhooks();

  if (ticketId) {
    results = results.filter((w) => w.ticket_id === ticketId);
  }

  // Most recent first for observability logs (we might invert this in chat but this matches previous GET logic)
  results = results.slice().reverse();

  return NextResponse.json({ webhooks: results });
}
