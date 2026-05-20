'use client';

import { useEffect, useState } from 'react';
import {
  Brain,
  Flame,
  Users,
  Clock,
  Building2,
  TrendingUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ClassificationResult } from '@/lib/types';

interface AIConfidenceCardsProps {
  classification?: ClassificationResult | null;
  isLoading?: boolean;
}

function AnimatedCounter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    setValue(0);
    const duration = 1200;
    const steps = 40;
    const increment = target / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setValue(target);
        clearInterval(timer);
      } else {
        setValue(Math.round(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [target]);

  return (
    <span>
      {value}
      {suffix}
    </span>
  );
}

function ProgressRing({
  value,
  color,
  size = 64,
}: {
  value: number;
  color: string;
  size?: number;
}) {
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const [offset, setOffset] = useState(circumference);

  useEffect(() => {
    const timer = setTimeout(() => {
      setOffset(circumference - (value / 100) * circumference);
    }, 100);
    return () => clearTimeout(timer);
  }, [value, circumference]);

  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="rgba(255,255,255,0.08)"
        strokeWidth={4}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={4}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 1.2s ease-out' }}
      />
    </svg>
  );
}

const URGENCY_CONFIG = {
  Low: { color: '#22c55e', bg: 'bg-green-500/15', border: 'border-green-500/30', text: 'text-green-400', score: 25 },
  Medium: { color: '#eab308', bg: 'bg-yellow-500/15', border: 'border-yellow-500/30', text: 'text-yellow-400', score: 55 },
  High: { color: '#f97316', bg: 'bg-orange-500/15', border: 'border-orange-500/30', text: 'text-orange-400', score: 78 },
  Critical: { color: '#ef4444', bg: 'bg-red-500/15', border: 'border-red-500/30', text: 'text-red-400', score: 96 },
};

const RESOLUTION_TIME: Record<string, string> = {
  Low: '5–7 days',
  Medium: '2–4 days',
  High: '24–48 hours',
  Critical: '< 12 hours',
};

const FARMER_IMPACT: Record<string, string> = {
  Low: '~50 farmers',
  Medium: '~200 farmers',
  High: '~800 farmers',
  Critical: '~2,000+ farmers',
};

export default function AIConfidenceCards({
  classification,
  isLoading = false,
}: AIConfidenceCardsProps) {
  const severity = classification?.severity ?? 'Medium';
  const urgency = URGENCY_CONFIG[severity] ?? URGENCY_CONFIG.Medium;
  const confidence = Math.round((classification?.confidence ?? 0.82) * 100);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-white/10 bg-slate-900/60 p-4 h-28 shimmer"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {/* AI Confidence */}
      <div className="rounded-2xl border border-purple-500/30 bg-purple-500/10 p-4 flex flex-col items-center gap-2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent pointer-events-none" />
        <div className="relative">
          <ProgressRing value={confidence} color="#a855f7" size={56} />
          <div className="absolute inset-0 flex items-center justify-center">
            <Brain className="w-4 h-4 text-purple-400" />
          </div>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-white">
            <AnimatedCounter target={confidence} suffix="%" />
          </p>
          <p className="text-xs text-slate-500">AI Confidence</p>
        </div>
      </div>

      {/* Urgency Score */}
      <div
        className={cn(
          'rounded-2xl border p-4 flex flex-col items-center gap-2 relative overflow-hidden',
          urgency.bg,
          urgency.border
        )}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/3 to-transparent pointer-events-none" />
        <div className="relative">
          <ProgressRing value={urgency.score} color={urgency.color} size={56} />
          <div className="absolute inset-0 flex items-center justify-center">
            <Flame className={cn('w-4 h-4', urgency.text)} />
          </div>
        </div>
        <div className="text-center">
          <p className={cn('text-lg font-bold', urgency.text)}>
            <AnimatedCounter target={urgency.score} />
          </p>
          <p className="text-xs text-slate-500">Urgency Score</p>
        </div>
      </div>

      {/* Farmer Impact */}
      <div className="rounded-2xl border border-blue-500/30 bg-blue-500/10 p-4 flex flex-col items-center gap-2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent pointer-events-none" />
        <div className="w-14 h-14 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
          <Users className="w-6 h-6 text-blue-400" />
        </div>
        <div className="text-center">
          <p className="text-sm font-bold text-white">{FARMER_IMPACT[severity]}</p>
          <p className="text-xs text-slate-500">Est. Impact</p>
        </div>
      </div>

      {/* Resolution Time */}
      <div className="rounded-2xl border border-cyan-500/30 bg-cyan-500/10 p-4 flex flex-col items-center gap-2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent pointer-events-none" />
        <div className="w-14 h-14 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center">
          <Clock className="w-6 h-6 text-cyan-400" />
        </div>
        <div className="text-center">
          <p className="text-sm font-bold text-white">{RESOLUTION_TIME[severity]}</p>
          <p className="text-xs text-slate-500">Resolution Time</p>
        </div>
      </div>

      {/* Suggested Department */}
      <div className="rounded-2xl border border-green-500/30 bg-green-500/10 p-4 flex flex-col items-center gap-2 relative overflow-hidden col-span-2 sm:col-span-1">
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent pointer-events-none" />
        <div className="w-14 h-14 rounded-xl bg-green-500/20 border border-green-500/30 flex items-center justify-center">
          <Building2 className="w-6 h-6 text-green-400" />
        </div>
        <div className="text-center">
          <p className="text-xs font-bold text-white leading-tight">
            {classification?.department ?? 'Plant Protection'}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">Department</p>
        </div>
        <div className="flex items-center gap-1 text-xs text-green-400">
          <TrendingUp className="w-3 h-3" />
          <span>Best match</span>
        </div>
      </div>
    </div>
  );
}
