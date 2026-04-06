import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ ticket_id: string }> }
) {
  try {
    const { ticket_id } = await params;
    const db = getDb();

    // 1. Get the ticket
    const ticketStmt = db.prepare('SELECT * FROM tickets WHERE ticket_id = ?');
    const ticketRow = ticketStmt.get(ticket_id) as any;

    // We do NOT return 404 here anymore, because the worker might not have created the ticket yet.
    // Instead we load inbound events and action traces. If EVERYTHING is empty, we can return 404 at the end.

    if (ticketRow) {
        // Parse JSON columns naturally stored as strings by SQLite
        if (typeof ticketRow.messages === 'string') {
            try { ticketRow.messages = JSON.parse(ticketRow.messages); } catch(e){}
        }
        if (typeof ticketRow.signal_history === 'string') {
            try { ticketRow.signal_history = JSON.parse(ticketRow.signal_history); } catch(e){}
        }
        if (typeof ticketRow.payment_data_snapshot === 'string') {
            try { ticketRow.payment_data_snapshot = JSON.parse(ticketRow.payment_data_snapshot); } catch(e){}
        }
        if (typeof ticketRow.metadata === 'string') {
            try { ticketRow.metadata = JSON.parse(ticketRow.metadata); } catch(e){}
        }
    }

    // 2. Get the inbound events status for observability
    const eventsStmt = db.prepare('SELECT * FROM inbound_events WHERE ticket_id = ? ORDER BY created_at DESC');
    const events = eventsStmt.all(ticket_id) as any[];
    
    for (let event of events) {
        if (typeof event.payment_data === 'string') {
            try { event.payment_data = JSON.parse(event.payment_data); } catch(e){}
        }
    }

    // 3. Get exact executed ticket actions for webhook observability (actions that Negotiator took)
    const actionsStmt = db.prepare('SELECT * FROM ticket_actions WHERE ticket_id = ? ORDER BY created_at DESC');
    const actions = actionsStmt.all(ticket_id) as any[];

    for (let action of actions) {
        if (typeof action.payload === 'string') {
            try { action.payload = JSON.parse(action.payload); } catch(e){}
        }
    }

    // 4. Get outbound messages
    const outboundStmt = db.prepare('SELECT * FROM outbound_messages WHERE ticket_id = ? ORDER BY created_at DESC');
    const outbound_messages = outboundStmt.all(ticket_id) as any[];

    if (!ticketRow && events.length === 0 && actions.length === 0 && outbound_messages.length === 0) {
        return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    return NextResponse.json({
      ticket: ticketRow || null,
      inbound_events: events,
      ticket_actions: actions,
      outbound_messages,
    });
  } catch (error: any) {
    console.error('API /tickets error:', error);
    
    // Check if the error is missing table (DB initialized but empty)
    if (error.message.includes('no such table')) {
        return NextResponse.json({ error: 'Database schema not found. Ensure SQLite DB is initialized.' }, { status: 500 });
    }
    
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
