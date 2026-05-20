'use client';

import { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  Brain,
  Tag,
  GitBranch,
  AlertTriangle,
  LayoutDashboard,
  FileText,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface PipelineStep {
  id: number;
  icon: React.ElementType;
  label: string;
  sublabel: string;
  color: string;
  glow: string;
  bg: string;
  border: string;
  particle: string;
}

const STEPS: PipelineStep[] = [
  {
    id: 1,
    icon: MessageSquare,
    label: 'Farmer Query',
    sublabel: 'Input received',
    color: 'text-blue-400',
    glow: 'shadow-blue-500/50',
    bg: 'bg-blue-500/15',
    border: 'border-blue-500/40',
    particle: 'bg-blue-400',
  },
  {
    id: 2,
    icon: Brain,
    label: 'AI Analysis',
    sublabel: 'Groq Llama 3.3',
    color: 'text-purple-400',
    glow: 'shadow-purple-500/50',
    bg: 'bg-purple-500/15',
    border: 'border-purple-500/40',
    particle: 'bg-purple-400',
  },
  {
    id: 3,
    icon: Tag,
    label: 'Classification',
    sublabel: 'Category + Severity',
    color: 'text-cyan-400',
    glow: 'shadow-cyan-500/50',
    bg: 'bg-cyan-500/15',
    border: 'border-cyan-500/40',
    particle: 'bg-cyan-400',
  },
  {
    id: 4,
    icon: GitBranch,
    label: 'Routing Agent',
    sublabel: 'Dept. assignment',
    color: 'text-indigo-400',
    glow: 'shadow-indigo-500/50',
    bg: 'bg-indigo-500/15',
    border: 'border-indigo-500/40',
    particle: 'bg-indigo-400',
  },
  {
    id: 5,
    icon: AlertTriangle,
    label: 'Escalation Engine',
    sublabel: 'Auto-monitoring',
    color: 'text-orange-400',
    glow: 'shadow-orange-500/50',
    bg: 'bg-orange-500/15',
    border: 'border-orange-500/40',
    particle: 'bg-orange-400',
  },
  {
    id: 6,
    icon: LayoutDashboard,
    label: 'Officer Dashboard',
    sublabel: 'Action taken',
    color: 'text-green-400',
    glow: 'shadow-green-500/50',
    bg: 'bg-green-500/15',
    border: 'border-green-500/40',
    particle: 'bg-green-400',
  },
  {
    id: 7,
    icon: FileText,
    label: 'Resolution Summary',
    sublabel: 'AI-generated report',
    color: 'text-emerald-400',
    glow: 'shadow-emerald-500/50',
    bg: 'bg-emerald-500/15',
    border: 'border-emerald-500/40',
    particle: 'bg-emerald-400',
  },
];

interface Particle {
  id: number;
  fromStep: number;
  progress: number; // 0–100
}

interface WorkflowPipelineProps {
  activeStep?: number; // 0-indexed, -1 = none
  completedSteps?: number[]; // 0-indexed
  autoAnimate?: boolean;
}

export default function WorkflowPipeline({
  activeStep: externalActive,
  completedSteps: externalCompleted,
  autoAnimate = false,
}: WorkflowPipelineProps) {
  const [activeStep, setActiveStep] = useState(externalActive ?? -1);
  const [completedSteps, setCompletedSteps] = useState<number[]>(externalCompleted ?? []);
  const [particles, setParticles] = useState<Particle[]>([]);
  const particleId = useRef(0);
  const animRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const stepRef = useRef(-1);

  // Sync external props
  useEffect(() => {
    if (externalActive !== undefined) setActiveStep(externalActive);
    if (externalCompleted !== undefined) setCompletedSteps(externalCompleted);
  }, [externalActive, externalCompleted]);

  // Auto-animate particles along connections
  useEffect(() => {
    if (!autoAnimate) return;

    // Advance step every 1.5s
    const stepTimer = setInterval(() => {
      stepRef.current = (stepRef.current + 1) % STEPS.length;
      const s = stepRef.current;
      setActiveStep(s);
      setCompletedSteps((prev) => {
        const next = [...prev, s - 1].filter((x) => x >= 0);
        return [...new Set(next)];
      });
      if (s === 0) setCompletedSteps([]);
    }, 1500);

    // Spawn particles every 600ms
    animRef.current = setInterval(() => {
      const fromStep = stepRef.current;
      if (fromStep >= 0 && fromStep < STEPS.length - 1) {
        const p: Particle = { id: particleId.current++, fromStep, progress: 0 };
        setParticles((prev) => [...prev.slice(-8), p]);
      }
    }, 600);

    // Advance particle progress
    const progressTimer = setInterval(() => {
      setParticles((prev) =>
        prev
          .map((p) => ({ ...p, progress: p.progress + 8 }))
          .filter((p) => p.progress <= 100)
      );
    }, 50);

    return () => {
      clearInterval(stepTimer);
      if (animRef.current) clearInterval(animRef.current);
      clearInterval(progressTimer);
    };
  }, [autoAnimate]);

  return (
    <div className="w-full overflow-x-auto pb-2">
      <div className="flex items-center gap-0 min-w-max mx-auto px-2">
        {STEPS.map((step, i) => {
          const Icon = step.icon;
          const isActive = activeStep === i;
          const isCompleted = completedSteps.includes(i);
          const isIdle = !isActive && !isCompleted;
          const isLast = i === STEPS.length - 1;

          // Find particle on the connector after this step
          const connectorParticle = particles.find((p) => p.fromStep === i);

          return (
            <div key={step.id} className="flex items-center">
              {/* Step node */}
              <div className="flex flex-col items-center gap-2 w-24">
                {/* Icon circle */}
                <div
                  className={cn(
                    'relative w-14 h-14 rounded-2xl flex items-center justify-center border-2 transition-all duration-500',
                    isActive && `${step.bg} ${step.border} shadow-xl ${step.glow}`,
                    isCompleted && 'bg-green-500/15 border-green-500/40 shadow-lg shadow-green-500/30',
                    isIdle && 'bg-white/5 border-white/10'
                  )}
                >
                  <Icon
                    className={cn(
                      'w-6 h-6 transition-all duration-300',
                      isActive && `${step.color} drop-shadow-lg`,
                      isCompleted && 'text-green-400',
                      isIdle && 'text-slate-600'
                    )}
                  />
                  {/* Pulse ring for active */}
                  {isActive && (
                    <span
                      className={cn(
                        'absolute inset-0 rounded-2xl border-2 animate-ping opacity-40',
                        step.border
                      )}
                    />
                  )}
                  {/* Completed dot */}
                  {isCompleted && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-green-500 border-2 border-slate-950 flex items-center justify-center">
                      <span className="text-white text-[8px] font-bold">✓</span>
                    </span>
                  )}
                </div>

                {/* Label */}
                <div className="text-center">
                  <p
                    className={cn(
                      'text-xs font-semibold leading-tight transition-colors',
                      isActive && 'text-white',
                      isCompleted && 'text-green-400',
                      isIdle && 'text-slate-600'
                    )}
                  >
                    {step.label}
                  </p>
                  <p className="text-[10px] text-slate-700 mt-0.5">{step.sublabel}</p>
                </div>
              </div>

              {/* Connector */}
              {!isLast && (
                <div className="relative w-10 h-1 mx-1 rounded-full overflow-visible shrink-0">
                  {/* Base track */}
                  <div
                    className={cn(
                      'absolute inset-0 rounded-full transition-all duration-500',
                      isCompleted ? 'bg-green-500/40' : 'bg-white/8'
                    )}
                  />
                  {/* Animated fill */}
                  {isActive && (
                    <div
                      className={cn('absolute inset-0 rounded-full animate-pulse', step.particle, 'opacity-60')}
                    />
                  )}
                  {/* Moving particle */}
                  {connectorParticle && (
                    <div
                      className={cn(
                        'absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full shadow-lg transition-none',
                        step.particle
                      )}
                      style={{
                        left: `${connectorParticle.progress}%`,
                        transform: 'translateX(-50%) translateY(-50%)',
                        boxShadow: `0 0 6px 2px ${step.particle.replace('bg-', 'var(--tw-shadow-color,')}`,
                      }}
                    />
                  )}
                  {/* Arrow */}
                  <ChevronRight
                    className={cn(
                      'absolute -right-2 top-1/2 -translate-y-1/2 w-3 h-3 transition-colors',
                      isCompleted ? 'text-green-500/60' : 'text-white/15'
                    )}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
