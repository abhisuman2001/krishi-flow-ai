'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Brain,
  Zap,
  CheckCircle,
  AlertTriangle,
  UserCheck,
  FileText,
  MessageSquare,
  Cpu,
  Activity,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ActivityEvent {
  id: string;
  type:
    | 'query_received'
    | 'ai_analyzing'
    | 'crop_detected'
    | 'severity_classified'
    | 'department_assigned'
    | 'officer_routed'
    | 'escalation_enabled'
    | 'resolution_generated'
    | 'ticket_created'
    | 'system';
  message: string;
  detail?: string;
  timestamp: Date;
  status: 'processing' | 'completed' | 'warning';
}

const EVENT_CONFIG: Record<
  ActivityEvent['type'],
  { icon: React.ElementType; color: string; glow: string; bg: string }
> = {
  query_received: {
    icon: MessageSquare,
    color: 'text-blue-400',
    glow: 'shadow-blue-500/40',
    bg: 'bg-blue-500/10 border-blue-500/30',
  },
  ai_analyzing: {
    icon: Brain,
    color: 'text-purple-400',
    glow: 'shadow-purple-500/40',
    bg: 'bg-purple-500/10 border-purple-500/30',
  },
  crop_detected: {
    icon: Zap,
    color: 'text-cyan-400',
    glow: 'shadow-cyan-500/40',
    bg: 'bg-cyan-500/10 border-cyan-500/30',
  },
  severity_classified: {
    icon: AlertTriangle,
    color: 'text-orange-400',
    glow: 'shadow-orange-500/40',
    bg: 'bg-orange-500/10 border-orange-500/30',
  },
  department_assigned: {
    icon: Cpu,
    color: 'text-indigo-400',
    glow: 'shadow-indigo-500/40',
    bg: 'bg-indigo-500/10 border-indigo-500/30',
  },
  officer_routed: {
    icon: UserCheck,
    color: 'text-green-400',
    glow: 'shadow-green-500/40',
    bg: 'bg-green-500/10 border-green-500/30',
  },
  escalation_enabled: {
    icon: AlertTriangle,
    color: 'text-red-400',
    glow: 'shadow-red-500/40',
    bg: 'bg-red-500/10 border-red-500/30',
  },
  resolution_generated: {
    icon: FileText,
    color: 'text-emerald-400',
    glow: 'shadow-emerald-500/40',
    bg: 'bg-emerald-500/10 border-emerald-500/30',
  },
  ticket_created: {
    icon: CheckCircle,
    color: 'text-green-400',
    glow: 'shadow-green-500/40',
    bg: 'bg-green-500/10 border-green-500/30',
  },
  system: {
    icon: Activity,
    color: 'text-slate-400',
    glow: 'shadow-slate-500/20',
    bg: 'bg-slate-500/10 border-slate-500/20',
  },
};

const DEMO_EVENTS: Omit<ActivityEvent, 'id' | 'timestamp'>[] = [
  {
    type: 'query_received',
    message: 'Farmer query received',
    detail: 'Ramesh Kumar — Nashik, Maharashtra',
    status: 'completed',
  },
  {
    type: 'ai_analyzing',
    message: 'AI analyzing issue',
    detail: 'Groq Llama 3.3 70B processing...',
    status: 'processing',
  },
  {
    type: 'crop_detected',
    message: 'Crop detected: Tomato',
    detail: 'Confidence: 94% — Early Blight pattern',
    status: 'completed',
  },
  {
    type: 'severity_classified',
    message: 'Severity classified: HIGH',
    detail: 'Immediate intervention recommended',
    status: 'completed',
  },
  {
    type: 'department_assigned',
    message: 'Department assigned',
    detail: 'Plant Protection Division → Nashik',
    status: 'completed',
  },
  {
    type: 'officer_routed',
    message: 'Officer routed',
    detail: 'Dr. Priya Sharma — Senior Officer',
    status: 'completed',
  },
  {
    type: 'escalation_enabled',
    message: 'Escalation monitoring enabled',
    detail: 'Auto-escalate if unresolved in 48h',
    status: 'completed',
  },
  {
    type: 'resolution_generated',
    message: 'Resolution summary generated',
    detail: 'Apply copper-based fungicide within 24h',
    status: 'completed',
  },
];

interface AIActivityFeedProps {
  events?: ActivityEvent[];
  autoPlay?: boolean;
  compact?: boolean;
}

export default function AIActivityFeed({
  events: externalEvents,
  autoPlay = true,
  compact = false,
}: AIActivityFeedProps) {
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [isLive, setIsLive] = useState(autoPlay);
  const feedRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const indexRef = useRef(0);

  const addDemoEvent = () => {
    if (indexRef.current >= DEMO_EVENTS.length) {
      indexRef.current = 0;
      setEvents([]);
    }
    const template = DEMO_EVENTS[indexRef.current];
    const event: ActivityEvent = {
      ...template,
      id: `${Date.now()}-${indexRef.current}`,
      timestamp: new Date(),
    };
    setEvents((prev) => [...prev.slice(-19), event]);
    indexRef.current++;
  };

  useEffect(() => {
    if (externalEvents) {
      setEvents(externalEvents);
      return;
    }
    if (!isLive) return;

    const schedule = () => {
      timerRef.current = setTimeout(() => {
        addDemoEvent();
        schedule();
      }, 1800 + Math.random() * 1200);
    };

    // Seed first event immediately
    addDemoEvent();
    schedule();

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLive, externalEvents]);

  // Auto-scroll
  useEffect(() => {
    if (feedRef.current) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight;
    }
  }, [events]);

  const formatTime = (d: Date) =>
    d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });

  return (
    <div
      className={cn(
        'rounded-2xl border border-white/10 overflow-hidden',
        'bg-slate-950/80 backdrop-blur-xl',
        compact ? 'h-64' : 'h-96'
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-slate-900/60">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Activity className="w-4 h-4 text-green-400" />
            {isLive && (
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            )}
          </div>
          <span className="text-sm font-semibold text-white">AI Activity Feed</span>
          {isLive && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 border border-green-500/30 animate-pulse">
              LIVE
            </span>
          )}
        </div>
        <button
          onClick={() => setIsLive((v) => !v)}
          className={cn(
            'text-xs px-2 py-1 rounded-lg border transition-all',
            isLive
              ? 'border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20'
              : 'border-green-500/30 bg-green-500/10 text-green-400 hover:bg-green-500/20'
          )}
        >
          {isLive ? 'Pause' : 'Resume'}
        </button>
      </div>

      {/* Feed */}
      <div
        ref={feedRef}
        className="overflow-y-auto h-[calc(100%-48px)] px-3 py-3 space-y-2 scrollbar-hide"
      >
        {events.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <p className="text-xs text-slate-600">Waiting for activity...</p>
          </div>
        )}
        {events.map((event, i) => {
          const cfg = EVENT_CONFIG[event.type];
          const Icon = cfg.icon;
          const isLatest = i === events.length - 1;

          return (
            <div
              key={event.id}
              className={cn(
                'flex items-start gap-3 p-2.5 rounded-xl border transition-all duration-500',
                'animate-fade-in',
                isLatest && event.status === 'processing'
                  ? `${cfg.bg} shadow-lg ${cfg.glow}`
                  : 'border-white/5 bg-white/3 hover:bg-white/5'
              )}
            >
              {/* Icon */}
              <div
                className={cn(
                  'w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border',
                  isLatest && event.status === 'processing' ? cfg.bg : 'bg-white/5 border-white/10'
                )}
              >
                {event.status === 'processing' && isLatest ? (
                  <Icon className={cn('w-3.5 h-3.5 animate-pulse', cfg.color)} />
                ) : (
                  <Icon
                    className={cn(
                      'w-3.5 h-3.5',
                      event.status === 'completed' ? cfg.color : 'text-slate-600'
                    )}
                  />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p
                    className={cn(
                      'text-xs font-medium truncate',
                      isLatest ? 'text-white' : 'text-slate-400'
                    )}
                  >
                    {event.message}
                  </p>
                  {event.status === 'processing' && isLatest && (
                    <span className="shrink-0 flex gap-0.5">
                      {[0, 1, 2].map((d) => (
                        <span
                          key={d}
                          className="w-1 h-1 rounded-full bg-purple-400 animate-bounce"
                          style={{ animationDelay: `${d * 150}ms` }}
                        />
                      ))}
                    </span>
                  )}
                </div>
                {event.detail && (
                  <p className="text-xs text-slate-600 truncate mt-0.5">{event.detail}</p>
                )}
              </div>

              {/* Timestamp */}
              <span className="text-xs text-slate-700 shrink-0 font-mono">
                {formatTime(event.timestamp)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
