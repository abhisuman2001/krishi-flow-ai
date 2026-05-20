import Link from 'next/link';
import {
  Leaf,
  Brain,
  GitBranch,
  BarChart3,
  MessageSquare,
  Shield,
  Zap,
  Globe,
  ArrowRight,
  CheckCircle,
  Users,
  TrendingUp,
  Clock,
  Cpu,
  Activity,
  Mic,
  MapPin,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import MultiAgentArchitecture from '@/components/ai/MultiAgentArchitecture';

const features = [
  {
    icon: Brain,
    title: 'AI Classification',
    description: 'Groq-powered Llama 3.3 70B instantly classifies crop issues by category, severity, and department with 94%+ accuracy.',
    color: 'text-purple-400',
    bg: 'bg-purple-500/10 border-purple-500/20',
    glow: 'hover:shadow-purple-500/20',
  },
  {
    icon: GitBranch,
    title: 'Workflow Automation',
    description: 'Automatic ticket routing, officer assignment, and escalation workflows — zero manual intervention needed.',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10 border-blue-500/20',
    glow: 'hover:shadow-blue-500/20',
  },
  {
    icon: BarChart3,
    title: 'Analytics Dashboard',
    description: 'Real-time insights on ticket trends, resolution rates, and district-wise analytics with interactive heatmaps.',
    color: 'text-green-400',
    bg: 'bg-green-500/10 border-green-500/20',
    glow: 'hover:shadow-green-500/20',
  },
  {
    icon: MessageSquare,
    title: 'WhatsApp-like Interface',
    description: 'Familiar chat UI for farmers to submit issues in their native language with auto-ticket creation.',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10 border-emerald-500/20',
    glow: 'hover:shadow-emerald-500/20',
  },
  {
    icon: Shield,
    title: 'Smart Escalation Engine',
    description: 'Automatic escalation with countdown timers — District Officer → Senior Officer → State Admin.',
    color: 'text-orange-400',
    bg: 'bg-orange-500/10 border-orange-500/20',
    glow: 'hover:shadow-orange-500/20',
  },
  {
    icon: Globe,
    title: 'Multilingual + Voice',
    description: 'Support for Hindi, Marathi, Telugu, Kannada, Tamil, Gujarati and more — with browser voice input.',
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10 border-cyan-500/20',
    glow: 'hover:shadow-cyan-500/20',
  },
  {
    icon: Cpu,
    title: 'Multi-Agent Architecture',
    description: '6 specialized AI agents — Farmer, Classification, Routing, Escalation, Analytics, and Summary agents.',
    color: 'text-indigo-400',
    bg: 'bg-indigo-500/10 border-indigo-500/20',
    glow: 'hover:shadow-indigo-500/20',
  },
  {
    icon: Activity,
    title: 'Live Activity Feed',
    description: 'Real-time AI activity monitoring showing every autonomous workflow step as it executes.',
    color: 'text-pink-400',
    bg: 'bg-pink-500/10 border-pink-500/20',
    glow: 'hover:shadow-pink-500/20',
  },
  {
    icon: MapPin,
    title: 'District Heatmaps',
    description: 'Visual district-level analytics showing issue density, escalation hotspots, and resolution trends.',
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/10 border-yellow-500/20',
    glow: 'hover:shadow-yellow-500/20',
  },
];

const stats = [
  { value: '10,000+', label: 'Farmers Served', icon: Users, color: 'text-blue-400' },
  { value: '94%', label: 'AI Accuracy', icon: Brain, color: 'text-purple-400' },
  { value: '~1 sec', label: 'AI Response Time', icon: Zap, color: 'text-yellow-400' },
  { value: '35%', label: 'Faster Resolution', icon: TrendingUp, color: 'text-green-400' },
];

const workflow = [
  { step: '01', title: 'Farmer Submits Issue', desc: 'Via web portal, WhatsApp chat, or voice input in 8 languages', icon: MessageSquare, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
  { step: '02', title: 'AI Classifies', desc: 'Groq Llama 3.3 70B analyzes and categorizes in ~1 second', icon: Brain, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
  { step: '03', title: 'Ticket Generated', desc: 'Unique KF-YYYY-NNNN ticket with full AI metadata', icon: CheckCircle, color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/20' },
  { step: '04', title: 'Officer Assigned', desc: 'Routing agent assigns to right department and officer', icon: Users, color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20' },
  { step: '05', title: 'Escalation Monitoring', desc: 'Auto-escalation if unresolved within SLA threshold', icon: Shield, color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20' },
  { step: '06', title: 'AI Resolution Summary', desc: 'AI generates downloadable resolution report card', icon: Mic, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
        <div className="absolute inset-0">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-green-500/8 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-emerald-500/8 rounded-full blur-3xl animate-float" style={{ animationDelay: '1.5s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-green-600/4 rounded-full blur-3xl" />
          <div className="absolute top-40 right-20 w-64 h-64 bg-purple-500/6 rounded-full blur-3xl animate-float" style={{ animationDelay: '3s' }} />
        </div>

        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '50px 50px',
          }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24">
          {/* Badge */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-green-500/30 bg-green-500/10 text-green-400 text-sm font-medium backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              Powered by Groq AI — Llama 3.3 70B — Ultra-fast inference
            </div>
          </div>

          {/* Headline */}
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              AI-Powered{' '}
              <span className="bg-gradient-to-r from-green-400 via-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                Agricultural
              </span>
              <br />
              Workflow Platform
            </h1>
            <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
              KrishiFlow AI uses 6 specialized AI agents to autonomously process farmer issues — from submission to resolution — with zero manual intervention.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/submit">
                <Button size="xl" variant="gradient" className="gap-2 group shadow-xl shadow-green-600/20">
                  Submit Farm Issue
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/workflow">
                <Button size="xl" variant="outline" className="gap-2 backdrop-blur-sm">
                  <Zap className="w-5 h-5 text-yellow-400" />
                  See AI Workflow
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button size="xl" variant="outline" className="gap-2 backdrop-blur-sm">
                  <BarChart3 className="w-5 h-5" />
                  Dashboard
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-20 grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="text-center p-5 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm hover:bg-white/8 hover:border-white/20 transition-all duration-300 group">
                  <Icon className={`w-5 h-5 ${stat.color} mx-auto mb-2 group-hover:scale-110 transition-transform`} />
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                  <p className="text-xs text-slate-400 mt-1">{stat.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-400 text-sm font-medium mb-4">
              <Cpu className="w-4 h-4" />
              Enterprise AI Features
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Everything you need to manage{' '}
              <span className="text-green-400">agricultural issues</span>
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              A complete AI-powered platform for farmers, agriculture officers, and district administrators.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className={`p-6 rounded-2xl border ${feature.bg} hover:scale-[1.02] hover:shadow-xl ${feature.glow} transition-all duration-300 group cursor-default`}
                >
                  <div className={`w-12 h-12 rounded-xl ${feature.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className={`w-6 h-6 ${feature.color}`} />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Multi-Agent Architecture */}
      <section className="py-24 bg-gradient-to-b from-slate-950 to-slate-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-400 text-sm font-medium mb-4">
              <Brain className="w-4 h-4" />
              AI Architecture
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              6 Specialized <span className="text-indigo-400">AI Agents</span> Working Together
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto">
              Each agent has a specific role in the autonomous workflow pipeline. Click any agent to explore its capabilities.
            </p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-8 backdrop-blur-sm">
            <MultiAgentArchitecture />
          </div>
        </div>
      </section>

      {/* Workflow */}
      <section className="py-24 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-green-500/30 bg-green-500/10 text-green-400 text-sm font-medium mb-4">
              <GitBranch className="w-4 h-4" />
              Automated Pipeline
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              How <span className="text-green-400">KrishiFlow AI</span> Works
            </h2>
            <p className="text-slate-400">From issue submission to resolution in 6 automated steps</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {workflow.map((item, index) => {
              const Icon = item.icon;
              return (
                <div key={item.step} className={`relative p-6 rounded-2xl border ${item.bg} hover:scale-[1.02] transition-all duration-300 group`}>
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl ${item.bg} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                      <Icon className={`w-6 h-6 ${item.color}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono text-slate-600">{item.step}</span>
                        <h3 className="font-semibold text-white">{item.title}</h3>
                      </div>
                      <p className="text-sm text-slate-400">{item.desc}</p>
                    </div>
                  </div>
                  {index < workflow.length - 1 && (
                    <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 z-10">
                      <ArrowRight className="w-5 h-5 text-white/20" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gradient-to-b from-slate-900 to-slate-950">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="relative p-12 rounded-3xl border border-green-500/20 bg-gradient-to-br from-green-500/10 to-emerald-500/5 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-green-600/5 to-transparent" />
            <div className="absolute top-0 left-0 w-full h-full">
              <div className="absolute top-4 left-4 w-32 h-32 bg-green-500/10 rounded-full blur-2xl" />
              <div className="absolute bottom-4 right-4 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl" />
            </div>
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-green-600/20 border border-green-600/30 flex items-center justify-center mx-auto mb-6 animate-float">
                <Leaf className="w-8 h-8 text-green-400" />
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Ready to transform agricultural support?
              </h2>
              <p className="text-slate-400 mb-8 max-w-xl mx-auto">
                Join thousands of farmers and officers already using KrishiFlow AI to resolve agricultural issues faster with AI-powered automation.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/submit">
                  <Button size="lg" variant="gradient" className="gap-2 shadow-xl shadow-green-600/20">
                    <MessageSquare className="w-5 h-5" />
                    Submit Your Issue
                  </Button>
                </Link>
                <Link href="/workflow">
                  <Button size="lg" variant="outline" className="gap-2">
                    <Zap className="w-5 h-5 text-yellow-400" />
                    See AI Workflow Demo
                  </Button>
                </Link>
                <Link href="/whatsapp">
                  <Button size="lg" variant="outline" className="gap-2">
                    Try WhatsApp Demo
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
