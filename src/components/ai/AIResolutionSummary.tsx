'use client';

import { useState } from 'react';
import { FileText, Download, Brain, CheckCircle, Calendar, Leaf, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Ticket } from '@/lib/types';

interface AIResolutionSummaryProps {
  ticket?: Partial<Ticket>;
  summary?: string;
  isGenerating?: boolean;
  onGenerate?: () => void;
}

const SAMPLE_SUMMARIES: Record<string, string> = {
  'Crop Disease':
    'Early blight (Alternaria solani) identified in tomato crop. Farmer advised to apply copper-based fungicide (Mancozeb 75% WP @ 2g/L) within 48 hours. Infected leaves removed and destroyed. Drainage improved around field perimeter. Follow-up field visit recommended after 7 days to assess recovery. Preventive spray schedule established for the season.',
  'Pest Attack':
    'Pink bollworm (Pectinophora gossypiella) infestation confirmed in cotton crop. Emergency pheromone traps deployed (5 traps/acre). Recommended insecticide: Emamectin Benzoate 5% SG @ 0.4g/L applied immediately. Farmer educated on monitoring protocol. Neighboring farms alerted. Insurance claim documentation initiated. Follow-up in 5 days.',
  Irrigation:
    'Drip irrigation system failure diagnosed — blocked emitters and low pump pressure. Emitters cleaned with 10% HCl solution. Pump pressure restored to 2.5 bar. Damaged drip lines (120m) replaced. System flushed and tested. Farmer trained on monthly maintenance protocol. Water use efficiency improved by estimated 35%.',
  Fertilizer:
    'Nitrogen and phosphorus deficiency identified through leaf analysis and soil test. Applied urea (46% N) @ 50 kg/acre as top dressing. Recommended DAP application before next irrigation. Micronutrient mix (Zinc Sulphate + Boron) applied as foliar spray. Expected yield improvement: 20-25%. Next soil test scheduled in 45 days.',
  'Soil Health':
    'Soil compaction and poor drainage identified as primary issues. Deep plowing (30cm) performed to break hardpan. Organic matter (FYM @ 5 tonnes/acre) incorporated. Gypsum applied to improve soil structure. Germination rate expected to improve to 85%+ in next sowing. Soil health card issued with recommendations.',
  Weather:
    'Hailstorm damage assessment completed — 40% crop loss documented with photographic evidence. Insurance claim (PM Fasal Bima Yojana) filed with district office. Damage assessment report submitted to tehsildar. Compensation of ₹18,500/acre recommended. Replanting advisory issued for remaining viable crop. Government relief application submitted.',
  'Seed Quality':
    'Seed germination test confirmed substandard quality (22% vs 85% standard). Complaint filed with State Seed Certification Agency. Seed supplier notified and replacement seeds arranged (certified variety). Legal notice issued to supplier. Farmer compensated with emergency seed supply. Case registered for quality violation.',
};

export default function AIResolutionSummary({
  ticket,
  summary: externalSummary,
  isGenerating = false,
  onGenerate,
}: AIResolutionSummaryProps) {
  const [localSummary, setLocalSummary] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  const displaySummary = externalSummary ?? localSummary;
  const isLoading = isGenerating || generating;

  const handleGenerate = async () => {
    if (onGenerate) {
      onGenerate();
      return;
    }
    setGenerating(true);
    await new Promise((r) => setTimeout(r, 1800));
    const category = ticket?.category ?? 'Crop Disease';
    setLocalSummary(SAMPLE_SUMMARIES[category] ?? SAMPLE_SUMMARIES['Crop Disease']);
    setGenerating(false);
  };

  const handleDownload = () => {
    if (!displaySummary) return;
    const content = [
      '═══════════════════════════════════════════════════',
      '         KRISHIFLOW AI — RESOLUTION REPORT',
      '═══════════════════════════════════════════════════',
      '',
      `Ticket ID    : ${ticket?.ticketId ?? 'KF-2024-XXXX'}`,
      `Farmer       : ${ticket?.farmerName ?? 'N/A'}`,
      `Crop         : ${ticket?.crop ?? 'N/A'}`,
      `Category     : ${ticket?.category ?? 'N/A'}`,
      `Severity     : ${ticket?.severity ?? 'N/A'}`,
      `District     : ${ticket?.district ?? 'N/A'}, ${ticket?.state ?? 'N/A'}`,
      `Department   : ${ticket?.department ?? 'N/A'}`,
      `Status       : ${ticket?.status ?? 'Resolved'}`,
      `Generated    : ${new Date().toLocaleString('en-IN')}`,
      '',
      '─── AI RESOLUTION SUMMARY ─────────────────────────',
      '',
      displaySummary,
      '',
      '─── SUGGESTED FOLLOW-UP ────────────────────────────',
      '',
      ticket?.suggestedAction ?? 'Follow up as recommended by the assigned officer.',
      '',
      '═══════════════════════════════════════════════════',
      '  Powered by KrishiFlow AI | Groq Llama 3.3 70B',
      '═══════════════════════════════════════════════════',
    ].join('\n');

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${ticket?.ticketId ?? 'resolution'}-report.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/60 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-slate-900/80">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-emerald-400" />
          <span className="text-sm font-semibold text-white">AI Resolution Summary</span>
        </div>
        {displaySummary && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            className="gap-1.5 text-xs h-7"
          >
            <Download className="w-3 h-3" />
            Download Report
          </Button>
        )}
      </div>

      <div className="p-4 space-y-4">
        {/* Ticket meta */}
        {ticket && (
          <div className="grid grid-cols-2 gap-2">
            {[
              { icon: Leaf, label: ticket.crop ?? 'N/A', sub: 'Crop' },
              { icon: Building2, label: ticket.department ?? 'N/A', sub: 'Department' },
              { icon: Calendar, label: ticket.district ?? 'N/A', sub: 'District' },
              {
                icon: CheckCircle,
                label: ticket.status ?? 'Resolved',
                sub: 'Status',
              },
            ].map(({ icon: Icon, label, sub }) => (
              <div
                key={sub}
                className="flex items-center gap-2 p-2 rounded-xl bg-white/3 border border-white/5"
              >
                <Icon className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs font-medium text-white truncate">{label}</p>
                  <p className="text-[10px] text-slate-600">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Summary content */}
        {isLoading ? (
          <div className="flex flex-col items-center gap-3 py-6">
            <div className="w-12 h-12 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
              <Brain className="w-6 h-6 text-purple-400 animate-pulse" />
            </div>
            <p className="text-sm text-slate-400">Generating AI summary...</p>
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="w-2 h-2 rounded-full bg-purple-400 animate-bounce"
                  style={{ animationDelay: `${i * 150}ms` }}
                />
              ))}
            </div>
          </div>
        ) : displaySummary ? (
          <div className="space-y-3">
            <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Brain className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-semibold text-emerald-400">AI-Generated Summary</span>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">{displaySummary}</p>
            </div>
            {ticket?.suggestedAction && (
              <div className="p-3 rounded-xl bg-green-500/5 border border-green-500/20">
                <p className="text-xs text-green-400 font-semibold mb-1">💡 Suggested Follow-up</p>
                <p className="text-xs text-slate-400">{ticket.suggestedAction}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-6">
            <div className="w-12 h-12 rounded-xl bg-slate-800 border border-white/10 flex items-center justify-center mx-auto mb-3">
              <FileText className="w-6 h-6 text-slate-600" />
            </div>
            <p className="text-sm text-slate-500 mb-4">
              Generate an AI-powered resolution summary for this ticket
            </p>
            <Button
              variant="gradient"
              size="sm"
              onClick={handleGenerate}
              className="gap-2"
            >
              <Brain className="w-4 h-4" />
              Generate Summary
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
