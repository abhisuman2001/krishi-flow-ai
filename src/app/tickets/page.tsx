import { Metadata } from 'next';
import TicketsList from './TicketsList';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Tickets — KrishiFlow AI',
  description: 'View and manage all farmer support tickets',
};

export default function TicketsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">All Tickets</h1>
          <p className="text-slate-400 mt-1">Manage and track all farmer support tickets</p>
        </div>
        <TicketsList />
      </div>
    </div>
  );
}
