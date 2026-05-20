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
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const features = [
  {
    icon: Brain,
    title: 'AI Classification',
    description: 'Groq-powered AI instantly classifies crop issues by category, severity, and department.',
    color: 'text-purple-400',
    bg: 'bg-purple-500/10 border-purple-500/20',
  },
  {
    icon: GitBranch,
    title: 'Workflow Automation',
    description: 'Automatic ticket routing, officer assignment, and escalation workflows.',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10 border-blue-500/20',
  },
  {
    icon: BarChart3,
    title: 'Analytics Dashboard',
    description: 'Real-time insights on ticket trends, resolution rates, and district-wise analytics.',
    color: 'text-green-400',
    bg: 'bg-green-500/10 border-green-500/20',
  },
  {
    icon: MessageSquare,
    title: 'WhatsApp-like Interface',
    description: 'Familiar chat UI for farmers to submit issues in their native language.',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10 border-emerald-500/20',
  },
  {
    icon: Shield,
    title: 'Ticket Escalation',
    description: 'Automatic escalation for critical issues with multi-level officer assignment.',
    color: 'text-orange-400',
    bg: 'bg-orange-500/10 border-orange-500/20',
  },
  {
    icon: Globe,
    title: 'Multilingual Support',
    description: 'Support for Hindi, Marathi, Telugu, Kannada, Tamil, Gujarati, and more.',
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10 border-cyan-500/20',
  },
];

const stats = [
  { value: '10,000+', label: 'Farmers Served', icon: Users },
  { value: '94%', label: 'Resolution Rate', icon: CheckCircle },
  { value: '2.4 days', label: 'Avg Resolution Time', icon: Clock },
  { value: '35%', label: 'Faster Response', icon: TrendingUp },
];

const workflow = [
  { step: '01', title: 'Farmer Submits Issue', desc: 'Via web portal or WhatsApp-like chat interface' },
  { step: '02', title: 'AI Classifies', desc: 'Groq AI analyzes and categorizes the issue instantly' },
  { step: '03', title: 'Ticket Generated', desc: 'Unique ticket ID created with full classification' },
  { step: '04', title: 'Officer Assigned', desc: 'Routed to the right department and officer' },
  { step: '05', title: 'Issue Resolved', desc: 'Officer provides solution and closes ticket' },
  { step: '06', title: 'AI Summary', desc: 'AI generates resolution summary for records' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
        <div className="absolute inset-0">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-green-600/5 rounded-full blur-3xl" />
        </div>

        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '50px 50px',
          }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24">
          {/* Badge */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-green-500/30 bg-green-500/10 text-green-400 text-sm font-medium">
              <Zap className="w-4 h-4" />
              Powered by Groq AI — Ultra-fast inference
            </div>
          </div>

          {/* Headline */}
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              AI-Powered{' '}
              <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                Agricultural
              </span>
              <br />
              Workflow Platform
            </h1>
            <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
              KrishiFlow AI helps farmers report crop issues and connects them with agriculture officers through intelligent AI-driven workflow automation.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/submit">
                <Button size="xl" variant="gradient" className="gap-2 group">
                  Submit Farm Issue
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button size="xl" variant="outline" className="gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Officer Dashboard
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-20 grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="text-center p-4 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm">
                  <Icon className="w-5 h-5 text-green-400 mx-auto mb-2" />
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
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Everything you need to manage{' '}
              <span className="text-green-400">agricultural issues</span>
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              A complete platform for farmers, agriculture officers, and district administrators.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className={`p-6 rounded-2xl border ${feature.bg} hover:scale-[1.02] transition-all duration-300 group`}
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

      {/* Workflow */}
      <section className="py-24 bg-gradient-to-b from-slate-950 to-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              How <span className="text-green-400">KrishiFlow AI</span> Works
            </h2>
            <p className="text-slate-400">From issue submission to resolution in 6 automated steps</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workflow.map((item, index) => (
              <div key={item.step} className="relative p-6 rounded-2xl border border-white/10 bg-white/5 hover:border-green-500/30 transition-all group">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-green-600/20 border border-green-600/30 flex items-center justify-center shrink-0 group-hover:bg-green-600/30 transition-colors">
                    <span className="text-green-400 font-bold text-sm">{item.step}</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-1">{item.title}</h3>
                    <p className="text-sm text-slate-400">{item.desc}</p>
                  </div>
                </div>
                {index < workflow.length - 1 && (
                  <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 z-10">
                    <ArrowRight className="w-5 h-5 text-green-600/50" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-slate-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="relative p-12 rounded-3xl border border-green-500/20 bg-gradient-to-br from-green-500/10 to-emerald-500/5 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-green-600/5 to-transparent" />
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-green-600/20 border border-green-600/30 flex items-center justify-center mx-auto mb-6">
                <Leaf className="w-8 h-8 text-green-400" />
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Ready to transform agricultural support?
              </h2>
              <p className="text-slate-400 mb-8 max-w-xl mx-auto">
                Join thousands of farmers and officers already using KrishiFlow AI to resolve agricultural issues faster.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/submit">
                  <Button size="lg" variant="gradient" className="gap-2">
                    <MessageSquare className="w-5 h-5" />
                    Submit Your Issue
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
