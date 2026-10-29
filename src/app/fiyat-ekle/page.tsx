import type {Metadata} from 'next';
import {CommunityPriceForm} from '@/components/community-price-form';
export const metadata:Metadata={title:'Fiyat gözlemi paylaş',description:'Fiş, raf etiketi veya ürün fotoğrafıyla bir fiyat gözlemini topluluğa bildir.',robots:{index:false,follow:true},alternates:{canonical:'/fiyat-ekle'}};
export default function Page(){return <CommunityPriceForm/>;}
