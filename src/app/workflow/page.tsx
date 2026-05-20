import { Metadata } from 'next';
import WorkflowVisualization from './WorkflowVisualization';

export const metadata: Metadata = {
  title: 'AI Workflow — KrishiFlow AI',
  description: 'Visualize the AI-powered agricultural workflow automation',
};

export default function WorkflowPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-400 text-sm font-medium mb-4">
            🤖 AI-Powered Automation
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
            Workflow Visualization
          </h1>
          <p className="text-slate-400 max-w-xl mx-auto">
            See how KrishiFlow AI automatically processes farmer issues from submission to resolution.
          </p>
        </div>
        <WorkflowVisualization />
      </div>
    </div>
  );
}
