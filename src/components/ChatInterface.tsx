"use client";

import { useState, useRef, useEffect } from "react";

interface ChatInterfaceProps {
  ticketData: any;
  webhooks?: any[];
  loading: boolean;
  onSendMessage: (msg: string) => void;
}

export default function ChatInterface({ ticketData, webhooks = [], loading, onSendMessage }: ChatInterfaceProps) {
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Helper to safely parse dates that might be missing 'T' or 'Z'
  const safeParseTime = (ts: string) => {
    if (!ts) return 0;
    let safeTs = ts.replace(" ", "T");
    if (!safeTs.includes("Z") && !safeTs.includes("+") && !safeTs.includes("-", 10)) {
      safeTs += "Z";
    }
    const d = new Date(safeTs).getTime();
    return isNaN(d) ? 0 : d;
  };

  // 1. Map user inputs from inbound_events
  const inboundEvents = ticketData?.inbound_events || [];
  const userMessages = inboundEvents.map((ev: any) => ({
    id: ev.event_id,
    timestamp: safeParseTime(ev.created_at),
    role: "user",
    content: ev.message_text
  }));

  // 2. Map outgoing system messages and tools from intercepted webhooks
  const webhookMessages = webhooks.map((wh: any) => {
    // Determine if it's a message or an action based on action route
    const isMessage = wh.type === "message" || wh.action === "messages/send";
    
    if (isMessage) {
      return {
        id: wh.id,
        timestamp: safeParseTime(wh.received_at),
        role: "assistant",
        content: wh.payload?.message_text || ""
      };
    } else {
      return {
        id: wh.id,
        timestamp: safeParseTime(wh.received_at),
        role: "assistant",
        tool_calls: [
          {
            function: {
              name: wh.action?.split("/").pop()?.toUpperCase() || "ACTION",
              arguments: JSON.stringify(wh.payload, null, 2)
            }
          }
        ]
      };
    }
  });

  // 3. Combine and sort
  const stream = [...userMessages, ...webhookMessages].sort((a, b) => a.timestamp - b.timestamp);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [stream]);

  const handleSend = () => {
    if (!inputText.trim()) return;
    onSendMessage(inputText);
    setInputText("");
  };

  return (
    <main className="panel glass-panel" style={{ display: 'flex', flexDirection: 'column' }}>
      <div className="panel-header" style={{ borderBottomColor: 'var(--border-color)', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span>Playground Dialogue</span>
          {ticketData?.ticket?.status && (
            <span className={`badge ${ticketData.ticket.status === 'CLOSED' ? 'badge-warning' : ticketData.ticket.status === 'FINALIZED' ? 'badge-success' : 'badge-pending'}`}>
              {ticketData.ticket.status}
            </span>
          )}
        </div>
        {loading && <span style={{ fontSize: '0.75rem', color: 'var(--accent-hover)' }}>Polling...</span>}
      </div>

      <div className="panel-content" style={{ flex: 1, padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {stream.length === 0 ? (
          <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
            No conversation loaded or started yet. Enter a Ticket ID.
          </div>
        ) : (
          stream.map((msg: any, i: number) => {
            if (msg.role === 'user') {
              return (
                <div key={msg.id} className="message-bubble message-user animate-fade-in">
                  <strong>User:</strong>
                  <p style={{ whiteSpace: 'pre-wrap', marginTop: '0.25rem' }}>{msg.content}</p>
                </div>
              );
            }

            if (msg.role === 'assistant') {
              if (msg.content) {
                return (
                  <div key={msg.id} className="message-bubble message-assistant animate-fade-in">
                    <strong style={{ color: 'var(--accent-hover)' }}>System:</strong>
                    <p style={{ whiteSpace: 'pre-wrap', marginTop: '0.25rem' }}>{msg.content}</p>
                  </div>
                );
              }
              if (msg.tool_calls) {
                return msg.tool_calls.map((tc: any, j: number) => (
                  <details key={`${msg.id}-${j}`} className="tool-call-banner animate-fade-in" open>
                    <summary style={{ outline: 'none' }}>
                      ⚡ <strong>Requested Action:</strong> {tc.function.name}
                    </summary>
                    <pre className="code-block" style={{ marginTop: '0.5rem', fontSize: '0.75rem' }}>
                      {tc.function.arguments}
                    </pre>
                  </details>
                ));
              }
            }

            return null;
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <div style={{ padding: '1.25rem', borderTop: '1px solid var(--border-color)', background: 'rgba(0,0,0,0.2)' }}>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <textarea 
            className="input-field" 
            placeholder="Type a user message..." 
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            rows={3}
            style={{ resize: 'vertical', minHeight: '60px', fontFamily: 'inherit' }}
          />
          <button className="btn" onClick={handleSend} disabled={!ticketData || ticketData.ticket?.status === 'FINALIZED'}>
            Send
          </button>
        </div>
      </div>
    </main>
  );
}
