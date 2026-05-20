import { Metadata } from 'next';
import LoginForm from './LoginForm';
import { Leaf, Shield, Brain, BarChart3 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Officer Login — KrishiFlow AI',
  description: 'Sign in to the KrishiFlow AI officer portal',
};

const features = [
  { icon: Brain, text: 'AI-powered issue classification' },
  { icon: Shield, text: 'Secure ticket management' },
  { icon: BarChart3, text: 'Real-time analytics dashboard' },
];

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl" />
        </div>
        {/* Grid */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '50px 50px',
          }}
        />

        <div className="relative">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/30">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-white text-2xl">
              Krishi<span className="text-green-400">Flow</span>
              <span className="text-sm ml-1 text-green-500 font-normal">AI</span>
            </span>
          </div>

          <h1 className="text-4xl font-bold text-white mb-4 leading-tight">
            Agricultural Workflow
            <br />
            <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
              Management Portal
            </span>
          </h1>
          <p className="text-slate-400 text-lg mb-12 leading-relaxed">
            Empowering agriculture officers with AI-driven tools to resolve farmer issues faster and smarter.
          </p>

          <div className="space-y-4">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.text} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-green-500/20 border border-green-500/30 flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-green-400" />
                  </div>
                  <span className="text-slate-300 text-sm">{f.text}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="relative">
          <p className="text-slate-600 text-xs">
            © 2024 KrishiFlow AI · Government of Maharashtra · Agricultural Department
          </p>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
              <Leaf className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-white text-lg">
              Krishi<span className="text-green-400">Flow</span>
              <span className="text-xs ml-1 text-green-500 font-normal">AI</span>
            </span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-1">Welcome back</h2>
            <p className="text-slate-400 text-sm">Sign in to your officer account</p>
          </div>

          <LoginForm />

          <p className="text-center text-xs text-slate-600 mt-6">
            For demo access use any account listed on the login form.
          </p>
        </div>
      </div>
    </div>
  );
}
