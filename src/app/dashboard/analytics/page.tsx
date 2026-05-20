import { Suspense } from 'react';
import { Metadata } from 'next';
import StatsRow from './_components/StatsRow';
import ChartsPanel from './_components/ChartsPanel';
import TicketsTable from './_components/TicketsTable';
import { StatCardSkeleton, ChartSkeleton } from './_components/Skeleton';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { BarChart3, TableIcon, Activity } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Analytics Dashboard — KrishiFlow AI',
  description: 'Enterprise analytics dashboard for agriculture officers',
};

export default function AnalyticsOverviewPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stats row */}
      <Suspense fallback={
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <StatCardSkeleton key={i} />)}
        </div>
      }>
        <StatsRow />
      </Suspense>

      {/* Tabbed content */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="h-9">
          <TabsTrigger value="overview" className="gap-1.5 text-xs px-3 py-1.5">
            <Activity className="w-3.5 h-3.5" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="charts" className="gap-1.5 text-xs px-3 py-1.5">
            <BarChart3 className="w-3.5 h-3.5" />
            Charts
          </TabsTrigger>
          <TabsTrigger value="tickets" className="gap-1.5 text-xs px-3 py-1.5">
            <TableIcon className="w-3.5 h-3.5" />
            Tickets Table
          </TabsTrigger>
        </TabsList>

        {/* Overview = charts + mini table */}
        <TabsContent value="overview" className="space-y-6">
          <Suspense fallback={
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {Array.from({ length: 4 }).map((_, i) => <ChartSkeleton key={i} height={220} />)}
            </div>
          }>
            <ChartsPanel />
          </Suspense>
        </TabsContent>

        {/* Full charts */}
        <TabsContent value="charts">
          <Suspense fallback={
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {Array.from({ length: 4 }).map((_, i) => <ChartSkeleton key={i} height={220} />)}
            </div>
          }>
            <ChartsPanel />
          </Suspense>
        </TabsContent>

        {/* Full tickets table */}
        <TabsContent value="tickets">
          <TicketsTable />
        </TabsContent>
      </Tabs>
    </div>
  );
}
