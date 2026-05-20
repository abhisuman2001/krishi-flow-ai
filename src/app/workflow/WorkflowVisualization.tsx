'use client';

import { useState } from 'react';
import {
  MessageSquare,
  Brain,
  Ticket,
  UserCheck,
  CheckCircle,
  FileText,
  ArrowDown,
  Zap,
  Clock,
  AlertTriangle,
  GitBranch,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface WorkflowStep {
  id: number;
  icon: React.ElementType;
  title: string;
  description: string;
  detail: string;
  color: string;
  bg: string;
  border: string;
  duration: string;
  status: 'idle' | 'active' | 'completed';
}

const WORKFLOW_STEPS: Omit<WorkflowStep, 'status'>[] = [
  {
    id: 1,
    icon: MessageSquare,
    title: 'Farmer Submits Issue',
    description: 'Farmer describes their crop problem via web portal or WhatsApp-like chat',
    detail: 'Supports 8 Indian languages. Captures farmer details, location, crop type, and issue description.',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
    duration: '< 1 min',
  },
  {
    id: 2,
    icon: Brain,
    title: 'Groq AI Classification',
    description: 'Llama 3.3 70B analyzes the issue and classifies it instantly',
    detail: 'AI determines: crop name, issue category, severity level (Low/Medium/High/Critical), responsible department, and suggested action.',
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/30',
    duration: '~1 second',
  },
  {
    id: 3,
    icon: Ticket,
    title: 'Ticket Generation',
    description: 'Unique ticket ID created with full AI classification metadata',
    detail: 'Ticket stored in MongoDB with all farmer details, AI classification, timestamps, and workflow state.',
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/30',
    duration: '< 1 sec',
  },
  {
    id: 4,
    icon: UserCheck,
    title: 'Officer Assignment',
    description: 'Ticket automatically routed to the right department and officer',
    detail: 'Based on category and district, the system assigns the most appropriate agriculture officer. Critical cases get priority routing.',
    color: 'text-green-400',
    bg: 'bg-green-500/10',
    border: 'border-green-500/30',
    duration: 'Automatic',
  },
  {
    id: 5,
    icon: AlertTriangle,
    title: 'Escalation (if needed)',
    description: 'Critical issues automatically escalated to senior officers',
    detail: 'If severity is Critical or issue remains unresolved after 48 hours, automatic escalation to district agriculture officer.',
    color: 'text-orange-400',
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/30',
    duration: 'Auto / 48h',
  },
  {
    id: 6,
    icon: CheckCircle,
    title: 'Issue Resolution',
    description: 'Officer provides solution and marks ticket as resolved',
    detail: 'Officer visits farm or provides remote guidance. Solution documented in the system for future reference.',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    duration: '1-5 days',
  },
  {
    id: 7,
    icon: FileText,
    title: 'AI Summary Generation',
    description: 'AI generates a resolution summary for records and learning',
    detail: 'Groq AI creates a concise summary of the issue, actions taken, and outcome. Used for analytics and improving future responses.',
    color: 'text-pink-400',
    bg: 'bg-pink-500/10',
    border: 'border-pink-500/30',
    duration: '< 2 sec',
  },
];

const AI_FEATURES = [
  { icon: Zap, title: 'Ultra-fast', desc: 'Groq inference in ~1 second', color: 'text-yellow-400' },
  { icon: Brain, title: 'Llama 3.3 70B', desc: 'State-of-the-art language model', color: 'text-purple-400' },
  { icon: GitBranch, title: '7 Categories', desc: 'Precise issue classification', color: 'text-blue-400' },
  { icon: Clock, title: '24/7 Available', desc: 'Always-on AI assistance', color: 'text-green-400' },
];

export default function WorkflowVisualization() {
  const [steps, setSteps] = useState<WorkflowStep[]>(
    WORKFLOW_STEPS.map((s) => ({ ...s, status: 'idle' as const }))
  );
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);

  const runAnimation = async () => {
    setIsRunning(true);
    setCurrentStep(-1);
    setSteps(WORKFLOW_STEPS.map((s) => ({ ...s, status: 'idle' })));

    for (let i = 0; i < WORKFLOW_STEPS.length; i++) {
      setCurrentStep(i);
      setSteps((prev) =>
        prev.map((s, idx) => ({
          ...s,
          status: idx === i ? 'active' : idx < i ? 'completed' : 'idle',
        }))
      );
      await new Promise((r) => setTimeout(r, 1200));
    }

    setSteps(WORKFLOW_STEPS.map((s) => ({ ...s, status: 'completed' })));
    setCurrentStep(-1);
    setIsRunning(false);
  };

  const reset = () => {
    setIsRunning(false);
    setCurrentStep(-1);
    setSteps(WORKFLOW_STEPS.map((s) => ({ ...s, status: 'idle' })));
  };

  return (
    <div className="space-y-8">
      {/* Controls */}
      <div className="flex items-center justify-center gap-4">
        <Button
          variant="gradient"
          size="lg"
          onClick={runAnimation}
          disabled={isRunning}
          className="gap-2"
        >
          <Zap className="w-5 h-5" />
          {isRunning ? 'Running Workflow...' : 'Simulate Workflow'}
        </Button>
        <Button variant="outline" size="lg" onClick={reset} disabled={isRunning}>
          Reset
        </Button>
      </div>

      {/* AI Features */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {AI_FEATURES.map((f) => {
          const Icon = f.icon;
          return (
            <div key={f.title} className="p-4 rounded-xl border border-white/10 bg-white/5 text-center">
              <Icon className={cn('w-6 h-6 mx-auto mb-2', f.color)} />
              <p className="text-sm font-semibold text-white">{f.title}</p>
              <p className="text-xs text-slate-500 mt-0.5">{f.desc}</p>
            </div>
          );
        })}
      </div>

      {/* Workflow Steps */}
      <div className="space-y-3">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = step.status === 'active';
          const isCompleted = step.status === 'completed';

          return (
            <div key={step.id}>
              <div
                className={cn(
                  'rounded-2xl border p-5 transition-all duration-500',
                  isActive && `${step.bg} ${step.border} shadow-lg scale-[1.01]`,
                  isCompleted && 'border-green-500/20 bg-green-500/5',
                  !isActive && !isCompleted && 'border-white/10 bg-slate-900/40 opacity-60'
                )}
              >
                <div className="flex items-start gap-4">
                  {/* Step number / icon */}
                  <div className={cn(
                    'w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300',
                    isActive && `${step.bg} border ${step.border}`,
                    isCompleted && 'bg-green-500/20 border border-green-500/30',
                    !isActive && !isCompleted && 'bg-white/5 border border-white/10'
                  )}>
                    {isCompleted ? (
                      <CheckCircle className="w-6 h-6 text-green-400" />
                    ) : (
                      <Icon className={cn('w-6 h-6', isActive ? step.color : 'text-slate-500')} />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-xs text-slate-600 font-mono">Step {step.id}</span>
                      <h3 className={cn(
                        'font-semibold transition-colors',
                        isActive ? 'text-white' : isCompleted ? 'text-green-400' : 'text-slate-500'
                      )}>
                        {step.title}
                      </h3>
                      <span className={cn(
                        'ml-auto text-xs px-2 py-0.5 rounded-full border',
                        isActive && `${step.bg} ${step.border} ${step.color}`,
                        isCompleted && 'bg-green-500/20 border-green-500/30 text-green-400',
                        !isActive && !isCompleted && 'bg-white/5 border-white/10 text-slate-600'
                      )}>
                        {isCompleted ? '✓ Done' : isActive ? '⚡ Processing' : step.duration}
                      </span>
                    </div>
                    <p className={cn('text-sm', isActive ? 'text-slate-300' : 'text-slate-500')}>
                      {step.description}
                    </p>
                    {(isActive || isCompleted) && (
                      <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                        {step.detail}
                      </p>
                    )}
                  </div>
                </div>

                {/* Active animation bar */}
                {isActive && (
                  <div className="mt-3 h-1 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full rounded-full animate-pulse"
                      style={{ backgroundColor: step.color.replace('text-', '').replace('-400', ''), width: '60%' }}
                    />
                  </div>
                )}
              </div>

              {/* Arrow between steps */}
              {index < steps.length - 1 && (
                <div className="flex justify-center my-1">
                  <ArrowDown className={cn(
                    'w-4 h-4 transition-colors',
                    isCompleted ? 'text-green-500/50' : 'text-white/10'
                  )} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Completion message */}
      {steps.every((s) => s.status === 'completed') && (
        <div className="text-center p-8 rounded-2xl border border-green-500/20 bg-green-500/5">
          <div className="text-4xl mb-3">🎉</div>
          <h3 className="text-xl font-bold text-white mb-2">Workflow Complete!</h3>
          <p className="text-slate-400">
            The farmer&apos;s issue has been successfully processed from submission to resolution.
          </p>
        </div>
      )}
    </div>
  );
}
