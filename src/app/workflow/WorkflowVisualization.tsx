'use client';

import { useState, useCallback } from 'react';
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
  Cpu,
  Activity,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import AIActivityFeed, { ActivityEvent } from '@/components/ai/AIActivityFeed';
import WorkflowPipeline from '@/components/ai/WorkflowPipeline';
import AIConfidenceCards from '@/components/ai/AIConfidenceCards';
import DemoScenarios, { DemoScenario } from '@/components/ai/DemoScenarios';
import MultiAgentArchitecture from '@/components/ai/MultiAgentArchitecture';
import EscalationTimer from '@/components/ai/EscalationTimer';
import AIResolutionSummary from '@/components/ai/AIResolutionSummary';
import { ClassificationResult } from '@/lib/types';

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
  { icon: Cpu, title: 'Multi-Agent', desc: '6 specialized AI agents', color: 'text-cyan-400' },
  { icon: Activity, title: 'Real-time', desc: 'Live workflow monitoring', color: 'text-pink-400' },
];

const ACTIVITY_SEQUENCE: Omit<ActivityEvent, 'id' | 'timestamp'>[] = [
  { type: 'query_received', message: 'Farmer query received', detail: 'Ramesh Kumar — Nashik, Maharashtra', status: 'completed' },
  { type: 'ai_analyzing', message: 'AI analyzing issue', detail: 'Groq Llama 3.3 70B processing...', status: 'processing' },
  { type: 'crop_detected', message: 'Crop detected: Tomato', detail: 'Confidence: 94% — Early Blight pattern', status: 'completed' },
  { type: 'severity_classified', message: 'Severity classified: HIGH', detail: 'Immediate intervention recommended', status: 'completed' },
  { type: 'department_assigned', message: 'Department assigned', detail: 'Plant Protection Division → Nashik', status: 'completed' },
  { type: 'officer_routed', message: 'Officer routed', detail: 'Dr. Priya Sharma — Senior Officer', status: 'completed' },
  { type: 'escalation_enabled', message: 'Escalation monitoring enabled', detail: 'Auto-escalate if unresolved in 48h', status: 'completed' },
  { type: 'ticket_created', message: 'Ticket KF-2024-0042 created', detail: 'Stored in MongoDB — notified officer', status: 'completed' },
  { type: 'resolution_generated', message: 'Resolution summary generated', detail: 'Apply copper-based fungicide within 24h', status: 'completed' },
];

export default function WorkflowVisualization() {
  const [steps, setSteps] = useState<WorkflowStep[]>(
    WORKFLOW_STEPS.map((s) => ({ ...s, status: 'idle' as const }))
  );
  const [isRunning, setIsRunning] = useState(false);
  const [activeStepIdx, setActiveStepIdx] = useState(-1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [activityEvents, setActivityEvents] = useState<ActivityEvent[]>([]);
  const [classification, setClassification] = useState<ClassificationResult | null>(null);
  const [isClassifying, setIsClassifying] = useState(false);
  const [activeTab, setActiveTab] = useState<'pipeline' | 'agents' | 'escalation' | 'summary'>('pipeline');
  const [selectedScenario, setSelectedScenario] = useState<DemoScenario | null>(null);

  const addEvent = useCallback((event: Omit<ActivityEvent, 'id' | 'timestamp'>) => {
    setActivityEvents((prev) => [
      ...prev,
      { ...event, id: `${Date.now()}-${Math.random()}`, timestamp: new Date() },
    ]);
  }, []);

  const runAnimation = async () => {
    setIsRunning(true);
    setActiveStepIdx(-1);
    setCompletedSteps([]);
    setActivityEvents([]);
    setSteps(WORKFLOW_STEPS.map((s) => ({ ...s, status: 'idle' })));

    for (let i = 0; i < WORKFLOW_STEPS.length; i++) {
      setActiveStepIdx(i);
      setSteps((prev) =>
        prev.map((s, idx) => ({
          ...s,
          status: idx === i ? 'active' : idx < i ? 'completed' : 'idle',
        }))
      );
      setCompletedSteps(Array.from({ length: i }, (_, k) => k));

      // Add activity event
      if (ACTIVITY_SEQUENCE[i]) {
        addEvent(ACTIVITY_SEQUENCE[i]);
      }

      await new Promise((r) => setTimeout(r, 1200));
    }

    setSteps(WORKFLOW_STEPS.map((s) => ({ ...s, status: 'completed' })));
    setCompletedSteps(WORKFLOW_STEPS.map((_, i) => i));
    setActiveStepIdx(-1);
    setIsRunning(false);
  };

  const reset = () => {
    setIsRunning(false);
    setActiveStepIdx(-1);
    setCompletedSteps([]);
    setActivityEvents([]);
    setSteps(WORKFLOW_STEPS.map((s) => ({ ...s, status: 'idle' })));
    setClassification(null);
    setSelectedScenario(null);
  };

  const handleDemoScenario = async (scenario: DemoScenario) => {
    setSelectedScenario(scenario);
    setIsClassifying(true);
    setActivityEvents([]);
    setCompletedSteps([]);
    setActiveStepIdx(-1);
    setSteps(WORKFLOW_STEPS.map((s) => ({ ...s, status: 'idle' })));

    addEvent({ type: 'query_received', message: `Query received from ${scenario.farmerName}`, detail: `${scenario.district}, ${scenario.state}`, status: 'completed' });
    addEvent({ type: 'ai_analyzing', message: 'AI analyzing issue...', detail: `Crop: ${scenario.crop}`, status: 'processing' });

    try {
      const res = await fetch('/api/ai/classify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ issue: scenario.issue, crop: scenario.crop, language: scenario.language }),
      });
      const data = await res.json();
      const cls: ClassificationResult = data.classification;
      setClassification(cls);

      addEvent({ type: 'crop_detected', message: `Crop detected: ${cls.crop}`, detail: `Confidence: ${Math.round(cls.confidence * 100)}%`, status: 'completed' });
      addEvent({ type: 'severity_classified', message: `Severity: ${cls.severity}`, detail: cls.issueCategory, status: 'completed' });
      addEvent({ type: 'department_assigned', message: `Department: ${cls.department}`, detail: 'Auto-assigned by routing agent', status: 'completed' });
      addEvent({ type: 'officer_routed', message: 'Officer routed', detail: `${scenario.district} district officer`, status: 'completed' });
      addEvent({ type: 'escalation_enabled', message: 'Escalation monitoring enabled', detail: `SLA: ${cls.severity === 'Critical' ? '12h' : cls.severity === 'High' ? '24h' : '48h'}`, status: 'completed' });
      addEvent({ type: 'ticket_created', message: 'Ticket created successfully', detail: 'Stored in MongoDB', status: 'completed' });

      // Animate pipeline
      for (let i = 0; i < WORKFLOW_STEPS.length; i++) {
        setActiveStepIdx(i);
        setCompletedSteps(Array.from({ length: i }, (_, k) => k));
        await new Promise((r) => setTimeout(r, 600));
      }
      setCompletedSteps(WORKFLOW_STEPS.map((_, i) => i));
      setActiveStepIdx(-1);
    } catch {
      addEvent({ type: 'system', message: 'Using mock classification', detail: 'API key not configured', status: 'completed' });
    } finally {
      setIsClassifying(false);
    }
  };

  const isComplete = steps.every((s) => s.status === 'completed');

  return (
    <div className="space-y-8">
      {/* Demo Scenarios */}
      <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5">
        <DemoScenarios onSelect={handleDemoScenario} isLoading={isClassifying || isRunning} />
      </div>

      {/* Pipeline visualization */}
      <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5 overflow-hidden">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="w-4 h-4 text-green-400" />
          <h3 className="text-sm font-semibold text-white">Live Workflow Pipeline</h3>
          {(isRunning || isClassifying) && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 border border-green-500/30 animate-pulse">
              RUNNING
            </span>
          )}
        </div>
        <WorkflowPipeline
          activeStep={activeStepIdx}
          completedSteps={completedSteps}
        />
      </div>

      {/* AI Confidence Cards — shown after classification */}
      {(classification || isClassifying) && (
        <div className="space-y-3 animate-fade-in">
          <div className="flex items-center gap-2">
            <Brain className="w-4 h-4 text-purple-400" />
            <h3 className="text-sm font-semibold text-white">AI Intelligence Report</h3>
          </div>
          <AIConfidenceCards classification={classification} isLoading={isClassifying} />
        </div>
      )}

      {/* Main controls */}
      <div className="flex items-center justify-center gap-4">
        <Button
          variant="gradient"
          size="lg"
          onClick={runAnimation}
          disabled={isRunning || isClassifying}
          className="gap-2"
        >
          <Zap className="w-5 h-5" />
          {isRunning ? 'Running Workflow...' : 'Simulate Full Workflow'}
        </Button>
        <Button variant="outline" size="lg" onClick={reset} disabled={isRunning || isClassifying}>
          Reset
        </Button>
      </div>

      {/* AI Features */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {AI_FEATURES.map((f) => {
          const Icon = f.icon;
          return (
            <div key={f.title} className="p-4 rounded-xl border border-white/10 bg-white/5 text-center hover:bg-white/8 transition-colors">
              <Icon className={cn('w-6 h-6 mx-auto mb-2', f.color)} />
              <p className="text-sm font-semibold text-white">{f.title}</p>
              <p className="text-xs text-slate-500 mt-0.5">{f.desc}</p>
            </div>
          );
        })}
      </div>

      {/* Two-column: Steps + Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Workflow Steps */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <GitBranch className="w-4 h-4 text-cyan-400" />
            Workflow Steps
          </h3>
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = step.status === 'active';
            const isCompleted = step.status === 'completed';

            return (
              <div key={step.id}>
                <div
                  className={cn(
                    'rounded-2xl border p-4 transition-all duration-500',
                    isActive && `${step.bg} ${step.border} shadow-lg scale-[1.01]`,
                    isCompleted && 'border-green-500/20 bg-green-500/5',
                    !isActive && !isCompleted && 'border-white/10 bg-slate-900/40 opacity-60'
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      'w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300',
                      isActive && `${step.bg} border ${step.border}`,
                      isCompleted && 'bg-green-500/20 border border-green-500/30',
                      !isActive && !isCompleted && 'bg-white/5 border border-white/10'
                    )}>
                      {isCompleted ? (
                        <CheckCircle className="w-5 h-5 text-green-400" />
                      ) : (
                        <Icon className={cn('w-5 h-5', isActive ? step.color : 'text-slate-500')} />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs text-slate-600 font-mono">Step {step.id}</span>
                        <h3 className={cn(
                          'font-semibold text-sm transition-colors',
                          isActive ? 'text-white' : isCompleted ? 'text-green-400' : 'text-slate-500'
                        )}>
                          {step.title}
                        </h3>
                        <span className={cn(
                          'ml-auto text-xs px-2 py-0.5 rounded-full border shrink-0',
                          isActive && `${step.bg} ${step.border} ${step.color}`,
                          isCompleted && 'bg-green-500/20 border-green-500/30 text-green-400',
                          !isActive && !isCompleted && 'bg-white/5 border-white/10 text-slate-600'
                        )}>
                          {isCompleted ? '✓ Done' : isActive ? '⚡ Active' : step.duration}
                        </span>
                      </div>
                      <p className={cn('text-xs', isActive ? 'text-slate-300' : 'text-slate-500')}>
                        {step.description}
                      </p>
                      {(isActive || isCompleted) && (
                        <p className="text-xs text-slate-600 mt-1 leading-relaxed">{step.detail}</p>
                      )}
                    </div>
                  </div>

                  {isActive && (
                    <div className="mt-2 h-0.5 rounded-full bg-white/10 overflow-hidden">
                      <div className="h-full w-3/5 rounded-full animate-pulse" style={{ backgroundColor: 'currentColor' }} />
                    </div>
                  )}
                </div>

                {index < steps.length - 1 && (
                  <div className="flex justify-center my-1">
                    <ArrowDown className={cn(
                      'w-3 h-3 transition-colors',
                      isCompleted ? 'text-green-500/50' : 'text-white/10'
                    )} />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Right column: Activity Feed + Tabs */}
        <div className="space-y-4">
          {/* Activity Feed */}
          <AIActivityFeed
            events={activityEvents.length > 0 ? activityEvents : undefined}
            autoPlay={activityEvents.length === 0}
          />

          {/* Tab switcher */}
          <div className="flex gap-1 p-1 rounded-xl bg-slate-900/60 border border-white/10">
            {([
              { id: 'escalation', label: 'Escalation', icon: AlertTriangle },
              { id: 'summary', label: 'AI Summary', icon: FileText },
              { id: 'agents', label: 'Agents', icon: Cpu },
            ] as const).map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all',
                    activeTab === tab.id
                      ? 'bg-green-600/20 text-green-400 border border-green-600/30'
                      : 'text-slate-500 hover:text-white hover:bg-white/5'
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {activeTab === 'escalation' && (
            <EscalationTimer
              severity={classification?.severity ?? 'High'}
            />
          )}

          {activeTab === 'summary' && (
            <AIResolutionSummary
              ticket={
                selectedScenario
                  ? {
                      crop: selectedScenario.crop,
                      farmerName: selectedScenario.farmerName,
                      district: selectedScenario.district,
                      state: selectedScenario.state,
                      category: classification?.category,
                      severity: classification?.severity,
                      department: classification?.department,
                      suggestedAction: classification?.suggestedAction,
                      status: 'Resolved',
                    }
                  : undefined
              }
            />
          )}

          {activeTab === 'agents' && (
            <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
              <MultiAgentArchitecture />
            </div>
          )}
        </div>
      </div>

      {/* Completion message */}
      {isComplete && (
        <div className="text-center p-8 rounded-2xl border border-green-500/20 bg-green-500/5 animate-fade-in">
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
