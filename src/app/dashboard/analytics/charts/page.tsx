import { Metadata } from 'next';
import ChartsPanel from '../_components/ChartsPanel';

export const metadata: Metadata = {
  title: 'Analytics Charts — KrishiFlow AI',
};

export default function ChartsPage() {
  return (
    <div className="animate-fade-in">
      <ChartsPanel />
    </div>
  );
}
