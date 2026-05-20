'use client';

import { Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface DemoScenario {
  id: string;
  label: string;
  emoji: string;
  crop: string;
  issue: string;
  farmerName: string;
  district: string;
  state: string;
  language: string;
  color: string;
  bg: string;
  border: string;
}

export const DEMO_SCENARIOS: DemoScenario[] = [
  {
    id: 'wheat-disease',
    label: 'Wheat Disease',
    emoji: '🌾',
    crop: 'Wheat',
    farmerName: 'Ramesh Kumar',
    district: 'Nashik',
    state: 'Maharashtra',
    language: 'hi',
    issue:
      'My wheat crop is showing yellow rust symptoms. The leaves have orange-yellow pustules and the crop is wilting rapidly. About 60% of my 5-acre field is affected. This started 3 days ago after heavy rain.',
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/30',
  },
  {
    id: 'pest-attack',
    label: 'Pest Attack',
    emoji: '🐛',
    crop: 'Cotton',
    farmerName: 'Sunita Devi',
    district: 'Amravati',
    state: 'Maharashtra',
    language: 'mr',
    issue:
      'Cotton crop is being severely attacked by pink bollworm. Many bolls are damaged and I can see larvae inside. About 70% of bolls are infested. I am losing my entire crop. Need emergency help.',
    color: 'text-red-400',
    bg: 'bg-red-500/10',
    border: 'border-red-500/30',
  },
  {
    id: 'irrigation-failure',
    label: 'Irrigation Failure',
    emoji: '💧',
    crop: 'Sugarcane',
    farmerName: 'Suresh Jadhav',
    district: 'Aurangabad',
    state: 'Maharashtra',
    language: 'mr',
    issue:
      'My drip irrigation system has completely stopped working. The main pump is making noise but no water is coming out. My sugarcane crop is drying up in this heat. I have 8 acres that need water urgently.',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
  },
  {
    id: 'fertilizer-issue',
    label: 'Fertilizer Issue',
    emoji: '🌱',
    crop: 'Tomato',
    farmerName: 'Meena Bai',
    district: 'Pune',
    state: 'Maharashtra',
    language: 'hi',
    issue:
      'My tomato plants are showing severe yellowing of leaves starting from the bottom. The plants look weak and fruits are small. I applied urea 2 weeks ago but no improvement. Soil test shows low nitrogen and phosphorus.',
    color: 'text-green-400',
    bg: 'bg-green-500/10',
    border: 'border-green-500/30',
  },
  {
    id: 'soil-deficiency',
    label: 'Soil Deficiency',
    emoji: '🪨',
    crop: 'Soybean',
    farmerName: 'Prakash Rao',
    district: 'Nagpur',
    state: 'Maharashtra',
    language: 'hi',
    issue:
      'My soybean field soil has become very hard and compact. Seeds are not germinating properly, only 20% germination rate. The soil is cracking and water is not absorbing. I think there is a serious soil health problem.',
    color: 'text-orange-400',
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/30',
  },
];

interface DemoScenariosProps {
  onSelect: (scenario: DemoScenario) => void;
  isLoading?: boolean;
  compact?: boolean;
}

export default function DemoScenarios({
  onSelect,
  isLoading = false,
  compact = false,
}: DemoScenariosProps) {
  return (
    <div className={cn('space-y-2', compact ? '' : 'space-y-3')}>
      {!compact && (
        <div className="flex items-center gap-2 mb-1">
          <Zap className="w-4 h-4 text-yellow-400" />
          <p className="text-sm font-semibold text-white">Quick Demo Scenarios</p>
          <span className="text-xs text-slate-600">— click to auto-fill</span>
        </div>
      )}
      <div className={cn('grid gap-2', compact ? 'grid-cols-5' : 'grid-cols-2 sm:grid-cols-5')}>
        {DEMO_SCENARIOS.map((scenario) => (
          <button
            key={scenario.id}
            onClick={() => onSelect(scenario)}
            disabled={isLoading}
            className={cn(
              'flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all duration-200',
              'hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed',
              scenario.bg,
              scenario.border,
              'hover:brightness-125'
            )}
          >
            <span className={cn('text-xl', compact ? 'text-base' : 'text-2xl')}>
              {scenario.emoji}
            </span>
            <span className={cn('font-medium text-center leading-tight', scenario.color, compact ? 'text-[10px]' : 'text-xs')}>
              {scenario.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
