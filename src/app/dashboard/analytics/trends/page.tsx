import { Metadata } from 'next';
import ChartsPanel from '../_components/ChartsPanel';

export const metadata: Metadata = { title: 'Trends — KrishiFlow AI' };

export default function TrendsPage() {
  return (
    <div className="animate-fade-in">
      <ChartsPanel />
    </div>
  );
}
