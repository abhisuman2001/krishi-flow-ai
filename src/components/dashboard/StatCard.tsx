import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: { value: number; label: string };
  color?: 'green' | 'blue' | 'orange' | 'red' | 'purple';
  className?: string;
}

const colorMap = {
  green: {
    bg: 'from-green-500/20 to-emerald-500/10',
    icon: 'bg-green-500/20 text-green-400',
    border: 'border-green-500/20',
    trend: 'text-green-400',
  },
  blue: {
    bg: 'from-blue-500/20 to-cyan-500/10',
    icon: 'bg-blue-500/20 text-blue-400',
    border: 'border-blue-500/20',
    trend: 'text-blue-400',
  },
  orange: {
    bg: 'from-orange-500/20 to-amber-500/10',
    icon: 'bg-orange-500/20 text-orange-400',
    border: 'border-orange-500/20',
    trend: 'text-orange-400',
  },
  red: {
    bg: 'from-red-500/20 to-rose-500/10',
    icon: 'bg-red-500/20 text-red-400',
    border: 'border-red-500/20',
    trend: 'text-red-400',
  },
  purple: {
    bg: 'from-purple-500/20 to-violet-500/10',
    icon: 'bg-purple-500/20 text-purple-400',
    border: 'border-purple-500/20',
    trend: 'text-purple-400',
  },
};

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  color = 'green',
  className,
}: StatCardProps) {
  const colors = colorMap[color];

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl border bg-gradient-to-br p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl',
        colors.bg,
        colors.border,
        className
      )}
    >
      {/* Background glow */}
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />

      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <div className={cn('p-2.5 rounded-xl', colors.icon)}>
            <Icon className="w-5 h-5" />
          </div>
          {trend && (
            <span className={cn('text-xs font-medium px-2 py-1 rounded-full bg-white/5', colors.trend)}>
              {trend.value > 0 ? '+' : ''}{trend.value}% {trend.label}
            </span>
          )}
        </div>

        <div>
          <p className="text-3xl font-bold text-white mb-1">{value}</p>
          <p className="text-sm font-medium text-slate-300">{title}</p>
          {subtitle && (
            <p className="text-xs text-slate-500 mt-1">{subtitle}</p>
          )}
        </div>
      </div>
    </div>
  );
}
