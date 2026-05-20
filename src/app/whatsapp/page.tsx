import { Metadata } from 'next';
import WhatsAppDemo from './WhatsAppDemo';

export const metadata: Metadata = {
  title: 'WhatsApp Demo — KrishiFlow AI',
  description: 'Simulate farmer chat with AI assistant',
};

export default function WhatsAppPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-green-500/30 bg-green-500/10 text-green-400 text-sm font-medium mb-4">
            📱 WhatsApp-like Demo
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            Farmer Chat Interface
          </h1>
          <p className="text-slate-400 text-sm">
            Simulate how farmers interact with KrishiBot AI to report issues
          </p>
        </div>
        <WhatsAppDemo />
      </div>
    </div>
  );
}
