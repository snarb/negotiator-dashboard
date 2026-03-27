"use client";

import { useState, useEffect, useCallback } from "react";
import ContextPanel from "./ContextPanel";
import ChatInterface from "./ChatInterface";
import ActionLogMonitor from "./ActionLogMonitor";

const POLLING_INTERVAL = Number(process.env.NEXT_PUBLIC_POLLING_INTERVAL_MS) || 180000; // 3 minutes defaults

export default function Playground() {
  const [ticketId, setTicketId] = useState("");
  const [paymentData, setPaymentData] = useState(`{\n  "owned_bundles": []\n}`);
  const [ticketData, setTicketData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [webhooks, setWebhooks] = useState([]);

  const fetchTicketData = useCallback(async () => {
    if (!ticketId) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/tickets/${encodeURIComponent(ticketId)}`);
      if (res.ok) {
        const data = await res.json();
        setTicketData(data);
      } else {
        setTicketData(null);
      }
      
      const hooksRes = await fetch(`/api/webhooks/outbound?ticket_id=${encodeURIComponent(ticketId)}`);
      if (hooksRes.ok) {
        const hooksData = await hooksRes.json();
        setWebhooks(hooksData.webhooks || []);
      }
      
    } catch (e) {
      console.error("Fetch DB error:", e);
    } finally {
      setLoading(false);
    }
  }, [ticketId]);

  useEffect(() => {
    fetchTicketData();
  }, [fetchTicketData]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchTicketData();
    }, POLLING_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchTicketData]);

  const handleSendMessage = async (messageText: string) => {
    if (!ticketId || !messageText.trim()) return;
    
    let parsedPaymentData;
    try {
        parsedPaymentData = JSON.parse(paymentData);
    } catch (e) {
        alert("Invalid JSON in Payment Data");
        return;
    }

    try {
      const res = await fetch('/api/proxy/inbound', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticket_id: ticketId,
          message_text: messageText,
          payment_data: parsedPaymentData
        })
      });
      
      if (res.ok) {
        // Refetch immediately to show the user's message in the stream (optimistic update could be nicer, but this ensures truth)
        setTimeout(fetchTicketData, 500);
      } else {
        alert("Failed to proxy message. Check logs.");
      }
    } catch (e) {
      console.error(e);
      alert("Proxy request totally failed. See console.");
    }
  };

  return (
    <div className="dashboard-layout animate-fade-in">
      <ContextPanel 
        ticketId={ticketId} 
        setTicketId={setTicketId}
        paymentData={paymentData}
        setPaymentData={setPaymentData}
      />
      <ChatInterface 
        ticketData={ticketData}
        loading={loading}
        onSendMessage={handleSendMessage}
      />
      <ActionLogMonitor 
        ticketData={ticketData}
        webhooks={webhooks}
      />
    </div>
  );
}
