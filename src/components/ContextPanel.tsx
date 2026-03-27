"use client";

import { useEffect, useState } from "react";

interface ContextPanelProps {
  ticketId: string;
  setTicketId: (id: string) => void;
  paymentData: string;
  setPaymentData: (data: string) => void;
}

export default function ContextPanel({ ticketId, setTicketId, paymentData, setPaymentData }: ContextPanelProps) {
  const [localTicketId, setLocalTicketId] = useState(ticketId);
  const [isValidJson, setIsValidJson] = useState(true);

  // Synchronize internal state
  useEffect(() => {
    setLocalTicketId(ticketId);
  }, [ticketId]);

  const validateJson = (val: string) => {
    try {
      JSON.parse(val);
      setIsValidJson(true);
    } catch {
      setIsValidJson(false);
    }
    setPaymentData(val);
  };

  return (
    <aside className="panel glass-panel">
      <div className="panel-header" style={{ borderBottomColor: 'var(--border-color)' }}>
        Context & Billing
      </div>
      <div className="panel-content" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: 500 }}>
            Ticket ID
          </label>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input 
              className="input-field" 
              placeholder="e.g. TICK-12345" 
              value={localTicketId}
              onChange={(e) => setLocalTicketId(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && setTicketId(localTicketId)}
            />
            <button className="btn" style={{ padding: '0.5rem 1rem' }} onClick={() => setTicketId(localTicketId)}>
              Set
            </button>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            Enter a new ID to start a conversation, or an existing ID to resume/reopen.
          </p>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
             <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>
              Payment Data (JSON)
            </label>
            {!isValidJson && (
              <span className="badge badge-error" style={{ fontSize: '0.65rem' }}>Invalid JSON</span>
            )}
          </div>
          <textarea 
            className="input-field" 
            style={{ 
              flex: 1, 
              resize: 'none', 
              fontFamily: 'monospace', 
              borderColor: isValidJson ? 'var(--border-color)' : 'var(--error-color)',
              minHeight: '200px'
            }}
            value={paymentData}
            onChange={(e) => validateJson(e.target.value)}
          />
        </div>
      </div>
    </aside>
  );
}
