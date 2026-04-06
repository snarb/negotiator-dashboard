import { NextRequest, NextResponse } from "next/server";
import { addWebhook } from "@/lib/webhookStore";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ action: string[] }> }
) {
  try {
    const resolvedParams = await params;
    const actionPath = resolvedParams.action.join("/");
    const body = await request.json();
    const headers = Object.fromEntries(request.headers);
    const isMessage = actionPath === "messages/send";

    const logEntry = {
      id: Math.random().toString(36).substring(2, 9),
      action: actionPath,
      received_at: new Date().toISOString(),
      headers,
      payload: body,
      ticket_id: body?.ticket_id || body?.data?.ticket_id || null,
      type: isMessage ? "message" : "action",
    };

    addWebhook(logEntry);

    return NextResponse.json({
      status: "ok",
      external_action_id: `ext_act_${logEntry.id}`,
    });
  } catch (err: any) {
    console.error("External API action failed:", err);
    return NextResponse.json(
      {
        status: "error",
        error_code: "action_failed",
        message: err.message || "external action failed",
      },
      { status: 400 }
    );
  }
}
