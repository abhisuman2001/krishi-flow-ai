'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, Clock, ChevronUp, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EscalationLevel {
  label: string;
  role: string;
  hoursThreshold: number;
  color: string;
  bg: string;
  border: string;
}

const ESCALATION_LEVELS: EscalationLevel[] = [
  {
    label: 'District Officer',
    role: 'Agriculture Officer',
    hoursThreshold: 48,
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/30',
  },
  {
    label: 'Senior Officer',
    role: 'Senior Agriculture Officer',
    hoursThreshold: 72,
    color: 'text-orange-400',
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/30',
  },
  {
    label: 'State Admin',
    role: 'State Agriculture Commissioner',
    hoursThreshold: 96,
    color: 'text-red-400',
    bg: 'bg-red-500/10',
    border: 'border-red-500/30',
  },
];

interface EscalationTimerProps {
  /** ISO string of ticket creation time */
  createdAt?: string;
  severity?: 'Low' | 'Medium' | 'High' | 'Critical';
  compact?: boolean;
}

function pad(n: number) {
  return String(n).padStart(2, '0');
}

function formatCountdown(ms: number) {
  if (ms <= 0) return '00:00:00';
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

export default function EscalationTimer({
  createdAt,
  severity = 'Medium',
  compact = false,
}: EscalationTimerProps) {
  const [now, setNow] = useState(Date.now());
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  // For demo: use a simulated creation time 2h ago if not provided
  const base = createdAt ? new Date(createdAt).getTime() : now - 2 * 3600 * 1000;
  const elapsedMs = now - base;
  const elapsedHours = elapsedMs / 3600000;

  // Determine current escalation level
  const currentLevel = ESCALATION_LEVELS.reduce<EscalationLevel | null>((acc, lvl) => {
    if (elapsedHours >= lvl.hoursThreshold) return lvl;
    return acc;
  }, null);

  // Next escalation
  const nextLevel = ESCALATION_LEVELS.find((lvl) => elapsedHours < lvl.hoursThreshold);
  const timeToNextMs = nextLevel
    ? base + nextLevel.hoursThreshold * 3600000 - now
    : 0;

  // Critical severity halves the threshold
  const multiplier = severity === 'Critical' ? 0.5 : severity === 'High' ? 0.75 : 1;
  const adjustedTimeToNext = timeToNextMs * multiplier;

  const isEscalated = currentLevel !== null;
  const isUrgent = adjustedTimeToNext > 0 && adjustedTimeToNext < 3600000; // < 1h

  if (compact) {
    return (
      <div
        className={cn(
          'flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-mono',
          isEscalated
            ? 'bg-red-500/15 border-red-500/30 text-red-400'
            : isUrgent
            ? 'bg-orange-500/15 border-orange-500/30 text-orange-400'
            : 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400'
        )}
      >
        <Clock className="w-3 h-3" />
        {isEscalated ? (
          <span>Escalated → {currentLevel?.label}</span>
        ) : (
          <span>Escalates in: {formatCountdown(adjustedTimeToNext)}</span>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/60 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-slate-900/80">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-orange-400" />
          <span className="text-sm font-semibold text-white">Escalation Engine</span>
        </div>
        <button
          onClick={() => setShowNotification(true)}
          className="relative p-1.5 rounded-lg hover:bg-white/5 transition-colors"
        >
          <Bell className="w-4 h-4 text-slate-400" />
          {isUrgent && (
            <span className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          )}
        </button>
      </div>

      {/* Notification popup */}
      {showNotification && (
        <div className="mx-4 mt-3 p-3 rounded-xl bg-orange-500/10 border border-orange-500/30 text-xs text-orange-300 animate-fade-in">
          <div className="flex items-start justify-between gap-2">
            <p>⚠️ Ticket approaching escalation threshold. Assign officer immediately.</p>
            <button
              onClick={() => setShowNotification(false)}
              className="text-orange-400 hover:text-orange-200 shrink-0"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <div className="p-4 space-y-4">
        {/* Countdown */}
        <div className="text-center">
          {isEscalated ? (
            <div>
              <p className="text-xs text-slate-500 mb-1">Currently escalated to</p>
              <p className={cn('text-xl font-bold', currentLevel?.color)}>
                {currentLevel?.label}
              </p>
              <p className="text-xs text-slate-600 mt-0.5">{currentLevel?.role}</p>
            </div>
          ) : (
            <div>
              <p className="text-xs text-slate-500 mb-1">Escalates in</p>
              <p
                className={cn(
                  'text-3xl font-bold font-mono tracking-wider',
                  isUrgent ? 'text-red-400' : 'text-orange-400'
                )}
              >
                {formatCountdown(adjustedTimeToNext)}
              </p>
              <p className="text-xs text-slate-600 mt-1">
                → {nextLevel?.label ?? 'No further escalation'}
              </p>
            </div>
          )}
        </div>

        {/* Escalation ladder */}
        <div className="space-y-2">
          {ESCALATION_LEVELS.map((lvl, i) => {
            const reached = elapsedHours >= lvl.hoursThreshold * multiplier;
            const isCurrent = currentLevel?.label === lvl.label;

            return (
              <div
                key={lvl.label}
                className={cn(
                  'flex items-center gap-3 p-2.5 rounded-xl border transition-all',
                  isCurrent && `${lvl.bg} ${lvl.border} shadow-sm`,
                  reached && !isCurrent && 'border-white/5 bg-white/3 opacity-60',
                  !reached && 'border-white/5 bg-white/3 opacity-40'
                )}
              >
                <div
                  className={cn(
                    'w-6 h-6 rounded-full flex items-center justify-center border text-xs font-bold shrink-0',
                    reached ? `${lvl.bg} ${lvl.border} ${lvl.color}` : 'bg-white/5 border-white/10 text-slate-600'
                  )}
                >
                  {reached ? <ChevronUp className="w-3 h-3" /> : i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn('text-xs font-medium', reached ? lvl.color : 'text-slate-600')}>
                    {lvl.label}
                  </p>
                  <p className="text-xs text-slate-700 truncate">{lvl.role}</p>
                </div>
                <span className="text-xs text-slate-700 font-mono shrink-0">
                  {lvl.hoursThreshold * multiplier}h
                </span>
              </div>
            );
          })}
        </div>

        {/* Severity badge */}
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-600">Severity multiplier</span>
          <span
            className={cn(
              'px-2 py-0.5 rounded-full border font-medium',
              severity === 'Critical'
                ? 'bg-red-500/15 border-red-500/30 text-red-400'
                : severity === 'High'
                ? 'bg-orange-500/15 border-orange-500/30 text-orange-400'
                : 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400'
            )}
          >
            {severity} — {multiplier}×
          </span>
        </div>
      </div>
    </div>
  );
}
