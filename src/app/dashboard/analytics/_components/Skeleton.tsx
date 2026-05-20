import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'rounded-lg bg-white/5 shimmer',
        className
      )}
    />
  );
}

export function StatCardSkeleton() {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 space-y-4">
      <div className="flex items-start justify-between">
        <Skeleton className="w-10 h-10 rounded-xl" />
        <Skeleton className="w-20 h-6 rounded-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="w-16 h-8" />
        <Skeleton className="w-24 h-4" />
        <Skeleton className="w-32 h-3" />
      </div>
    </div>
  );
}

export function ChartSkeleton({ height = 240 }: { height?: number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-6">
      <Skeleton className="w-40 h-5 mb-2" />
      <Skeleton className="w-56 h-3 mb-6" />
      <Skeleton className="w-full rounded-xl" style={{ height }} />
    </div>
  );
}

export function TableRowSkeleton() {
  return (
    <tr className="border-b border-white/5">
      {[40, 100, 80, 70, 80, 90, 80, 60].map((w, i) => (
        <td key={i} className="px-4 py-3">
          <Skeleton className="h-4 rounded" style={{ width: w }} />
        </td>
      ))}
    </tr>
  );
}
