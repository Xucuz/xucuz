import type {Metadata} from 'next';
import {CommunityPriceResults} from '@/components/community-price-results';
export const dynamic='force-dynamic';
export const metadata:Metadata={title:'Topluluk fiyat gözlemleri',description:'81 ilde topluluk tarafından fotoğrafla bildirilen, yönetici incelemesinden geçmiş güncel fiyat gözlemleri.',robots:{index:false,follow:true},alternates:{canonical:'/fiyatlar'}};
export default async function Page({searchParams}:{searchParams:Promise<{q?:string;city?:string}>}){const params=await searchParams;return <CommunityPriceResults initialQuery={(params.q??'').slice(0,120)} initialCity={(params.city??'').slice(0,40)}/>;}
