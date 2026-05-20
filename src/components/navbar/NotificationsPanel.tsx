'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Bell, X, CheckCheck, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  INITIAL_NOTIFICATIONS,
  AppNotification,
  getNotificationIcon,
  getNotificationColor,
} from '@/lib/notifications';

export default function NotificationsPanel() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>(INITIAL_NOTIFICATIONS);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () =>
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

  const markRead = (id: string) =>
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );

  const dismiss = (id: string) =>
    setNotifications((prev) => prev.filter((n) => n.id !== id));

  return (
    <div className="relative">
      {/* Bell button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 min-w-[16px] h-4 px-0.5 bg-red-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Panel */}
      {open && (
        <div className="absolute right-0 top-12 z-50 w-[360px] max-h-[520px] flex flex-col rounded-2xl border border-white/10 bg-slate-900 shadow-2xl shadow-black/50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 shrink-0">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-slate-400" />
              <span className="font-semibold text-white text-sm">Notifications</span>
              {unreadCount > 0 && (
                <span className="text-xs px-1.5 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
                  {unreadCount} new
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="flex items-center gap-1 text-xs text-green-400 hover:text-green-300 transition-colors"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  Mark all read
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="p-1 rounded-lg text-slate-500 hover:text-white hover:bg-white/5 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="overflow-y-auto flex-1">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="text-3xl mb-3">🔔</div>
                <p className="text-sm font-medium text-white mb-1">All caught up!</p>
                <p className="text-xs text-slate-500">No new notifications</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={cn(
                    'relative flex gap-3 px-4 py-3 border-b border-white/5 border-l-2 transition-colors hover:bg-white/5',
                    getNotificationColor(n.type),
                    !n.read && 'bg-white/[0.03]'
                  )}
                  onClick={() => markRead(n.id)}
                >
                  <span className="text-lg shrink-0 mt-0.5">{getNotificationIcon(n.type)}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={cn('text-sm font-medium', n.read ? 'text-slate-300' : 'text-white')}>
                        {n.title}
                      </p>
                      <button
                        onClick={(e) => { e.stopPropagation(); dismiss(n.id); }}
                        className="shrink-0 text-slate-600 hover:text-slate-400 transition-colors mt-0.5"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{n.message}</p>
                    <div className="flex items-center justify-between mt-1.5">
                      <span className="text-xs text-slate-600">{n.time}</span>
                      {n.ticketDbId && (
                        <Link
                          href={`/tickets/${n.ticketDbId}`}
                          onClick={() => setOpen(false)}
                          className="flex items-center gap-1 text-xs text-green-400 hover:text-green-300 transition-colors"
                        >
                          View ticket
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      )}
                    </div>
                  </div>
                  {!n.read && (
                    <div className="absolute right-3 top-3.5 w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2.5 border-t border-white/10 shrink-0">
            <Link
              href="/tickets"
              onClick={() => setOpen(false)}
              className="flex items-center justify-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
            >
              View all tickets
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
