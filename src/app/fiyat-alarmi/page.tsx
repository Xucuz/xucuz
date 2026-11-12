import type {Metadata} from 'next';
import {PriceAlerts} from '@/components/price-alerts';
export const metadata:Metadata={title:'Fiyat Alarmı | Xucuz',description:'Hedef fiyatını kaydet ve onaylı fiyat gözlemlerini kontrol et.'};
export default function Page(){return <PriceAlerts/>;}
