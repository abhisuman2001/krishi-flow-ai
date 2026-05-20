'use client';

import { useState } from 'react';
import {
  MessageSquare,
  Tag,
  GitBranch,
  AlertTriangle,
  BarChart3,
  FileText,
  Cpu,
  ArrowRight,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Agent {
  id: string;
  name: string;
  role: string;
  description: string;
  capabilities: string[];
  icon: React.ElementType;
  color: string;
  glow: string;
  bg: string;
  border: string;
  connects: string[];
}

const AGENTS: Agent[] = [
  {
    id: 'farmer',
    name: 'Farmer Agent',
    role: 'Input Interface',
    description: 'Receives farmer queries via web portal, WhatsApp, or voice input in 8 Indian languages.',
    capabilities: ['Multi-language NLP', 'Voice-to-text', 'Context extraction', 'Query validation'],
    icon: MessageSquare,
    color: 'text-blue-400',
    glow: 'shadow-blue-500/30',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
    connects: ['classification'],
  },
  {
    id: 'classification',
    name: 'Classification Agent',
    role: 'AI Classifier',
    description: 'Uses Groq Llama 3.3 70B to classify issues by category, severity, and crop type.',
    capabilities: ['7 issue categories', 'Severity scoring', 'Crop identification', 'Confidence scoring'],
    icon: Tag,
    color: 'text-purple-400',
    glow: 'shadow-purple-500/30',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/30',
    connects: ['routing'],
  },
  {
    id: 'routing',
    name: 'Routing Agent',
    role: 'Smart Router',
    description: 'Intelligently routes tickets to the right department and officer based on classification.',
    capabilities: ['Department matching', 'Officer assignment', 'Load balancing', 'Priority queuing'],
    icon: GitBranch,
    color: 'text-cyan-400',
    glow: 'shadow-cyan-500/30',
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/30',
    connects: ['escalation'],
  },
  {
    id: 'escalation',
    name: 'Escalation Agent',
    role: 'Auto-Escalator',
    description: 'Monitors ticket resolution timelines and auto-escalates to senior officers when needed.',
    capabilities: ['SLA monitoring', 'Auto-escalation', 'Multi-level routing', 'Alert generation'],
    icon: AlertTriangle,
    color: 'text-orange-400',
    glow: 'shadow-orange-500/30',
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/30',
    connects: ['analytics'],
  },
  {
    id: 'analytics',
    name: 'Analytics Agent',
    role: 'Data Intelligence',
    description: 'Aggregates data across all tickets to generate insights, trends, and district-level reports.',
    capabilities: ['Real-time analytics', 'Trend detection', 'District heatmaps', 'Performance KPIs'],
    icon: BarChart3,
    color: 'text-indigo-400',
    glow: 'shadow-indigo-500/30',
    bg: 'bg-indigo-500/10',
    border: 'border-indigo-500/30',
    connects: ['summary'],
  },
  {
    id: 'summary',
    name: 'Summary Agent',
    role: 'Report Generator',
    description: 'Generates AI-powered resolution summaries and downloadable report cards for each resolved ticket.',
    capabilities: ['Resolution summaries', 'PDF reports', 'Follow-up recommendations', 'Knowledge base'],
    icon: FileText,
    color: 'text-emerald-400',
    glow: 'shadow-emerald-500/30',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    connects: [],
  },
];

export default function MultiAgentArchitecture() {
  const [activeAgent, setActiveAgent] = useState<string | null>(null);
  const [hoveredAgent, setHoveredAgent] = useState<string | null>(null);

  const selected = AGENTS.find((a) => a.id === (activeAgent ?? hoveredAgent));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-400 text-sm font-medium mb-3">
          <Cpu className="w-4 h-4" />
          Multi-Agent AI Architecture
        </div>
        <p className="text-slate-400 text-sm max-w-lg mx-auto">
          Six specialized AI agents work autonomously in a coordinated pipeline to process every farmer query end-to-end.
        </p>
      </div>

      {/* Agent pipeline */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {AGENTS.map((agent, i) => {
          const Icon = agent.icon;
          const isActive = activeAgent === agent.id || hoveredAgent === agent.id;
          const isLast = i === AGENTS.length - 1;

          return (
            <div key={agent.id} className="flex items-center gap-2">
              <button
                onClick={() => setActiveAgent(activeAgent === agent.id ? null : agent.id)}
                onMouseEnter={() => setHoveredAgent(agent.id)}
                onMouseLeave={() => setHoveredAgent(null)}
                className={cn(
                  'flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all duration-300 w-28',
                  'hover:scale-105 active:scale-95',
                  isActive
                    ? `${agent.bg} ${agent.border} shadow-xl ${agent.glow}`
                    : 'border-white/10 bg-white/3 hover:bg-white/5'
                )}
              >
                <div
                  className={cn(
                    'w-12 h-12 rounded-xl flex items-center justify-center border transition-all',
                    isActive ? `${agent.bg} ${agent.border}` : 'bg-white/5 border-white/10'
                  )}
                >
                  <Icon className={cn('w-6 h-6', isActive ? agent.color : 'text-slate-500')} />
                </div>
                <div className="text-center">
                  <p className={cn('text-xs font-semibold leading-tight', isActive ? 'text-white' : 'text-slate-500')}>
                    {agent.name}
                  </p>
                  <p className={cn('text-[10px] mt-0.5', isActive ? agent.color : 'text-slate-700')}>
                    {agent.role}
                  </p>
                </div>
              </button>

              {!isLast && (
                <div className="flex items-center">
                  <div className="w-4 h-px bg-white/15" />
                  <ArrowRight className="w-3 h-3 text-white/20" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Detail panel */}
      <div
        className={cn(
          'rounded-2xl border p-5 transition-all duration-300',
          selected
            ? `${selected.bg} ${selected.border} shadow-xl ${selected.glow}`
            : 'border-white/10 bg-slate-900/40'
        )}
      >
        {selected ? (
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div
                className={cn(
                  'w-14 h-14 rounded-2xl flex items-center justify-center border-2 shrink-0',
                  selected.bg,
                  selected.border
                )}
              >
                <selected.icon className={cn('w-7 h-7', selected.color)} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">{selected.name}</h3>
                <p className={cn('text-sm font-medium', selected.color)}>{selected.role}</p>
                <p className="text-sm text-slate-400 mt-1">{selected.description}</p>
              </div>
            </div>
            <div>
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-2">Capabilities</p>
              <div className="flex flex-wrap gap-2">
                {selected.capabilities.map((cap) => (
                  <span
                    key={cap}
                    className={cn(
                      'text-xs px-3 py-1 rounded-full border font-medium',
                      selected.bg,
                      selected.border,
                      selected.color
                    )}
                  >
                    <Zap className="w-2.5 h-2.5 inline mr-1" />
                    {cap}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-slate-600 text-sm">
              Click or hover an agent to see its capabilities
            </p>
          </div>
        )}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
        {[
          { label: 'Agents', value: '6', color: 'text-purple-400' },
          { label: 'Languages', value: '8', color: 'text-blue-400' },
          { label: 'Categories', value: '7', color: 'text-cyan-400' },
          { label: 'Avg Latency', value: '~1s', color: 'text-green-400' },
          { label: 'Uptime', value: '99.9%', color: 'text-emerald-400' },
          { label: 'Model', value: '70B', color: 'text-indigo-400' },
        ].map((stat) => (
          <div
            key={stat.label}
            className="text-center p-3 rounded-xl border border-white/10 bg-white/3"
          >
            <p className={cn('text-lg font-bold', stat.color)}>{stat.value}</p>
            <p className="text-xs text-slate-600">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
