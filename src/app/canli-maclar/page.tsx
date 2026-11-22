import type {Metadata} from 'next';
import {LiveMatches} from '@/components/live-matches';
import './live-matches.css';

export const metadata:Metadata={title:'Canlı Maçlar',description:'API-Football üzerinden güncellenen canlı futbol maçları ve skorları.'};

export default function LiveMatchesPage(){return <LiveMatches/>;}
