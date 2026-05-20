import type { ReactNode } from 'react';
import DashboardSidebar from './_components/DashboardSidebar';
import DashboardTopbar from './_components/DashboardTopbar';

export default function DashboardAnalyticsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-slate-950">
      {/* Sidebar */}
      <DashboardSidebar />

      {/* Main content area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <DashboardTopbar />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
