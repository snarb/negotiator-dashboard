"use client";

interface ActionLogMonitorProps {
  ticketData: any;
  webhooks?: any[];
}

export default function ActionLogMonitor({ ticketData, webhooks = [] }: ActionLogMonitorProps) {
  const events = ticketData?.inbound_events || [];
  const actions = ticketData?.ticket_actions || [];

  return (
    <aside className="panel glass-panel" style={{ background: 'rgba(15, 23, 42, 0.85)' }}>
      <div className="panel-header" style={{ borderBottomColor: 'var(--border-color)', fontSize: '0.95rem' }}>
        System Observability
      </div>
      <div className="panel-content" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '1rem' }}>
        
        {/* Inbound Events Status */}
        <section>
          <h3 style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem', fontWeight: 600 }}>
            Inbound Events (Pipeline)
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {events.length === 0 ? (
              <span style={{ fontSize: '0.8rem', color: '#666' }}>No events recorded.</span>
            ) : events.map((ev: any) => (
              <div key={ev.event_id} style={{ padding: '0.75rem', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                  <span style={{ fontSize: '0.75rem', color: '#9ca3af', fontFamily: 'monospace' }}>
                    {ev.event_id.slice(0, 8)}
                  </span>
                  <span className={`badge ${ev.status === 'PROCESSED' ? 'badge-success' : ev.status === 'FAILED' ? 'badge-error' : 'badge-pending'}`}>
                    {ev.status}
                  </span>
                </div>
                <div style={{ fontSize: '0.8rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  "{ev.message_text}"
                </div>
              </div>
            ))}
          </div>
        </section>

        <hr style={{ borderColor: 'var(--border-color)', borderTop: 0 }} />

        {/* Action Traces (Mock Outbound Effects) */}
        <section>
          <h3 style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem', fontWeight: 600 }}>
            Intercepted Actions
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {actions.length === 0 ? (
              <span style={{ fontSize: '0.8rem', color: '#666' }}>No system actions taken yet.</span>
            ) : actions.map((act: any) => (
              <div key={act.ticket_action_id} style={{ padding: '0.75rem', background: 'rgba(59, 130, 246, 0.05)', borderRadius: '8px', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <strong style={{ fontSize: '0.8rem', color: 'var(--accent-hover)' }}>{act.action_name}</strong>
                  <span className={`badge ${act.status === 'SUCCEEDED' ? 'badge-success' : act.status === 'FAILED' ? 'badge-error' : 'badge-pending'}`} style={{ fontSize: '0.65rem' }}>
                    {act.status}
                  </span>
                </div>
                <pre className="code-block" style={{ marginTop: '0.25rem', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: '0.7rem' }}>
                  {JSON.stringify(act.payload, null, 2)}
                </pre>
              </div>
            ))}
          </div>
        </section>

        <hr style={{ borderColor: 'var(--border-color)', borderTop: 0 }} />

        {/* Intercepted API Webhooks */}
        <section>
          <h3 style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem', fontWeight: 600 }}>
            Intercepted Webhooks (API)
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {webhooks.length === 0 ? (
              <span style={{ fontSize: '0.8rem', color: '#666' }}>No webhooks intercepted.</span>
            ) : webhooks.map((wh: any) => (
              <div key={wh.id} style={{ padding: '0.75rem', background: 'rgba(245, 158, 11, 0.05)', borderRadius: '8px', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <strong style={{ fontSize: '0.8rem', color: 'var(--warning-color)' }}>POST /webhooks/outbound</strong>
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                  {new Date(wh.received_at).toLocaleTimeString()}
                </div>
                <pre className="code-block" style={{ marginTop: '0.25rem', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: '0.7rem' }}>
                  {JSON.stringify(wh.payload, null, 2)}
                </pre>
              </div>
            ))}
          </div>
        </section>

      </div>
    </aside>
  );
}
