import type { Metadata } from 'next';
import { SportsCenter } from '@/components/sports-center';

export const metadata: Metadata = {
  title: 'Canlı Futbol ve Basketbol Maçları',
  description: 'Futbol ve basketbol maçlarının sağlayıcıdan gelen canlı skorlarını ve maç durumlarını takip edin.',
  alternates: { canonical: '/canli-maclar' },
};

export default function LiveMatchesPage() {
  return <SportsCenter />;
}
