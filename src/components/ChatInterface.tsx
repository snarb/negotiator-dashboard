"use client";

import { useState, useRef, useEffect } from "react";

interface ChatInterfaceProps {
  ticketData: any;
  loading: boolean;
  onSendMessage: (msg: string) => void;
}

export default function ChatInterface({ ticketData, loading, onSendMessage }: ChatInterfaceProps) {
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const messages = ticketData?.ticket?.messages || [];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (!inputText.trim()) return;
    onSendMessage(inputText);
    setInputText("");
  };

  return (
    <main className="panel glass-panel" style={{ display: 'flex', flexDirection: 'column' }}>
      <div className="panel-header" style={{ borderBottomColor: 'var(--border-color)', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span>Chat Conversation</span>
          {ticketData?.ticket?.status && (
            <span className={`badge ${ticketData.ticket.status === 'CLOSED' ? 'badge-warning' : ticketData.ticket.status === 'FINALIZED' ? 'badge-success' : 'badge-pending'}`}>
              {ticketData.ticket.status}
            </span>
          )}
        </div>
        {loading && <span style={{ fontSize: '0.75rem', color: 'var(--accent-hover)' }}>Polling...</span>}
      </div>

      <div className="panel-content" style={{ flex: 1, padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {messages.length === 0 ? (
          <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
            No conversation loaded or started yet. Enter a Ticket ID.
          </div>
        ) : (
          messages.map((msg: any, i: number) => {
            if (msg.role === 'user') {
              return (
                <div key={i} className="message-bubble message-user animate-fade-in">
                  <strong>User:</strong>
                  <p style={{ whiteSpace: 'pre-wrap', marginTop: '0.25rem' }}>{msg.content}</p>
                </div>
              );
            }

            if (msg.role === 'assistant') {
              if (msg.content) {
                return (
                  <div key={i} className="message-bubble message-assistant animate-fade-in">
                    <strong style={{ color: 'var(--accent-hover)' }}>Assistant:</strong>
                    <p style={{ whiteSpace: 'pre-wrap', marginTop: '0.25rem' }}>{msg.content}</p>
                  </div>
                );
              }
              if (msg.tool_calls) {
                // Tool calls!
                return msg.tool_calls.map((tc: any, j: number) => (
                  <details key={`${i}-${j}`} className="tool-call-banner animate-fade-in">
                    <summary style={{ outline: 'none' }}>
                      ⚡ <strong>Tool Call:</strong> {tc.function.name}
                    </summary>
                    <div className="code-block" style={{ marginTop: '0.5rem' }}>
                      {tc.function.arguments}
                    </div>
                  </details>
                ));
              }
            }

            if (msg.role === 'tool') {
              return (
                <details key={i} className="tool-call-banner animate-fade-in" style={{ opacity: 0.8, background: 'rgba(255, 255, 255, 0.05)' }}>
                  <summary style={{ outline: 'none', color: '#9ca3af' }}>
                    ↩️ <strong>Tool Result</strong> ({msg.tool_call_id?.slice(0, 12)}...)
                  </summary>
                  <div className="code-block" style={{ marginTop: '0.5rem', borderColor: '#444' }}>
                    {msg.content}
                  </div>
                </details>
              );
            }

            return null;
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <div style={{ padding: '1.25rem', borderTop: '1px solid var(--border-color)', background: 'rgba(0,0,0,0.2)' }}>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <input 
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
          />
          <button className="btn" onClick={handleSend} disabled={!ticketData || ticketData.ticket?.status === 'FINALIZED'}>
            Send
          </button>
        </div>
      </div>
    </main>
  );
}
