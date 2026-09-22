"use client";

import React, { useState } from "react";
import { MessageSquare, X, Send, Loader2 } from "lucide-react";
import { Button } from "./button";

export function AiChatbot({ hideTrigger, forceOpen, onClose }: { hideTrigger?: boolean; forceOpen?: boolean; onClose?: () => void }) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = forceOpen !== undefined ? forceOpen : internalOpen;
  
  const handleClose = () => {
    if (onClose) onClose();
    else setInternalOpen(false);
  };

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [chatLog, setChatLog] = useState<{ role: "user" | "ai"; text: string }[]>([
    { role: "ai", text: "Hi! I am Medhavi, your scholarship assistant. How can I help you today?" }
  ]);

  const sendMessage = async () => {
    if (!message.trim()) return;
    const userMsg = message.trim();
    setMessage("");
    setChatLog((prev) => [...prev, { role: "user", text: userMsg }]);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg }),
      });
      const data = await res.json();
      setChatLog((prev) => [...prev, { role: "ai", text: data.reply || "Error getting response." }]);
    } catch {
      setChatLog((prev) => [...prev, { role: "ai", text: "Connection error. Please try again." }]);
    }
    setLoading(false);
  };

  return (
    <>
      {!hideTrigger && !isOpen && (
        <button
          onClick={() => setInternalOpen(true)}
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-blue-600 text-white shadow-lg flex items-center justify-center hover:scale-105 transition-transform z-50"
        >
          <MessageSquare className="h-6 w-6" />
        </button>
      )}

      {isOpen && (
        <div className="fixed bottom-6 right-6 w-80 sm:w-96 bg-card border rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden animate-fadeIn">
          <div className="bg-blue-600 p-4 flex items-center justify-between text-white">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-full bg-white overflow-hidden border border-white/20">
                <img src="/logo.jpg" alt="Medhavi Logo" className="h-full w-full object-cover" />
              </div>
              <span className="font-semibold text-sm">Medhavi Assistant</span>
            </div>
            <button onClick={handleClose} className="text-white/80 hover:text-white">
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <div className="flex-1 p-4 overflow-y-auto min-h-[300px] max-h-[400px] bg-secondary/10 flex flex-col gap-3">
            {chatLog.map((log, i) => (
              <div key={i} className={`max-w-[80%] p-3 rounded-lg text-sm ${log.role === "user" ? "bg-blue-600 text-white self-end rounded-br-none" : "bg-muted text-foreground self-start rounded-bl-none"}`}>
                {log.text}
              </div>
            ))}
            {loading && (
              <div className="bg-muted text-foreground self-start rounded-lg rounded-bl-none p-3 max-w-[80%]">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            )}
          </div>

          <div className="p-3 bg-card border-t flex items-center gap-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Ask about scholarships..."
              className="flex-1 bg-secondary border-transparent focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-full px-4 py-2 text-sm outline-none transition-all"
            />
            <Button size="icon" className="rounded-full h-10 w-10 bg-blue-600 hover:bg-blue-700 text-white shrink-0" onClick={sendMessage} disabled={loading || !message.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
