import Link from 'next/link';
import { Leaf, ExternalLink, X, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-slate-950/80 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
              <Leaf className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold text-white">
              Krishi<span className="text-green-400">Flow</span>
              <span className="text-xs ml-1 text-green-500 font-normal">AI</span>
            </span>
          </div>
          <p className="text-sm text-slate-500 text-center">
            AI-powered agricultural workflow automation for farmers and officers
          </p>
          <div className="flex items-center gap-3">
            <a href="#" className="text-slate-500 hover:text-white transition-colors">
              <ExternalLink className="w-4 h-4" />
            </a>
            <a href="#" className="text-slate-500 hover:text-white transition-colors">
              <X className="w-4 h-4" />
            </a>
            <a href="#" className="text-slate-500 hover:text-white transition-colors">
              <Mail className="w-4 h-4" />
            </a>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-white/5 text-center">
          <p className="text-xs text-slate-600">
            © 2024 KrishiFlow AI. Built for Indian Agriculture. Powered by Groq AI.
          </p>
        </div>
      </div>
    </footer>
  );
}
