import { Metadata } from 'next';
import TicketsTable from '../_components/TicketsTable';

export const metadata: Metadata = {
  title: 'Ticket Management — KrishiFlow AI',
};

export default function TicketsManagementPage() {
  return (
    <div className="animate-fade-in">
      <TicketsTable />
    </div>
  );
}
