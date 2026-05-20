import { Metadata } from 'next';
import SubmitForm from './SubmitForm';

export const metadata: Metadata = {
  title: 'Submit Farm Issue — KrishiFlow AI',
  description: 'Submit your agricultural issue and get AI-powered assistance',
};

export default function SubmitPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-green-500/30 bg-green-500/10 text-green-400 text-sm font-medium mb-4">
            🌾 Farmer Issue Portal
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
            Submit Your Farm Issue
          </h1>
          <p className="text-slate-400 max-w-xl mx-auto">
            Describe your agricultural problem and our AI will classify it and connect you with the right expert.
          </p>
        </div>

        <SubmitForm />
      </div>
    </div>
  );
}
