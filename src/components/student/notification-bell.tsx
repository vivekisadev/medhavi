"use client";

import React, { useState } from "react";
import { Bell, Mail, AlertTriangle, CheckCircle, XCircle, RotateCcw, Banknote } from "lucide-react";
import type { Notification, NotificationType } from "@/lib/services/notifications";

const ICONS: Record<NotificationType, React.ReactNode> = {
  application_submitted: <Mail className="h-3.5 w-3.5 text-blue-500" />,
  application_verified: <CheckCircle className="h-3.5 w-3.5 text-green-500" />,
  deficiency_flagged: <AlertTriangle className="h-3.5 w-3.5 text-orange-500" />,
  application_approved: <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />,
  application_rejected: <XCircle className="h-3.5 w-3.5 text-red-500" />,
  resubmission_requested: <RotateCcw className="h-3.5 w-3.5 text-amber-500" />,
  disbursement_initiated: <Banknote className="h-3.5 w-3.5 text-green-600" />,
};

export function NotificationBell({ notifications }: { notifications: Notification[] }) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Notification[]>(notifications);
  const unread = items.filter((n) => !n.read).length;

  const markRead = (id: string) => {
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllRead = () => {
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const timeAgo = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative h-8 w-8 flex items-center justify-center rounded-md hover:bg-secondary transition-colors"
        aria-label="Notifications"
      >
        <Bell className="h-4 w-4 text-muted-foreground" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 h-4 min-w-4 flex items-center justify-center rounded-full bg-red-500 text-white text-[9px] font-bold px-1">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 z-50 w-80 max-h-96 overflow-y-auto rounded-lg border bg-card shadow-lg animate-fadeIn">
            <div className="flex items-center justify-between px-3 py-2 border-b">
              <span className="text-xs font-semibold text-foreground">Notifications</span>
              {unread > 0 && (
                <button onClick={markAllRead} className="text-[10px] text-muted-foreground hover:text-foreground transition-colors">
                  Mark all read
                </button>
              )}
            </div>
            {items.length === 0 ? (
              <div className="px-3 py-6 text-center text-xs text-muted-foreground">No notifications</div>
            ) : (
              items.slice(0, 20).map((notif) => (
                <button
                  key={notif.id}
                  onClick={() => markRead(notif.id)}
                  className={`w-full text-left px-3 py-2.5 border-b last:border-0 hover:bg-secondary/50 transition-colors flex gap-2.5 ${!notif.read ? "bg-secondary/30" : ""}`}
                >
                  <div className="mt-0.5 shrink-0">{ICONS[notif.type]}</div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-medium text-foreground truncate">{notif.title}</p>
                    <p className="text-[10px] text-muted-foreground line-clamp-2 mt-0.5">{notif.body}</p>
                    <p className="text-[9px] text-muted-foreground mt-1">{timeAgo(notif.created_at)}</p>
                  </div>
                  {!notif.read && <div className="h-1.5 w-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />}
                </button>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
