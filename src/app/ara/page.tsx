import type {Metadata} from 'next';
import {ProductWebSearch} from '@/components/product-web-search';

export const metadata:Metadata={title:'Ürün fiyatlarını karşılaştır',description:'Bağlı ürün kaynaklarındaki mağaza tekliflerini fiyat, kaynak ve güncelleme zamanıyla karşılaştır.',robots:{index:false,follow:true}};

export default async function ProductSearchPage({searchParams}:{searchParams:Promise<{q?:string}>}){
 const {q=''}=await searchParams;
 return <main className="product-web-page"><a className="product-web-brand" href="/">Xucuz<span>.com</span></a><h1>Ürününü ara,<br/>mağaza fiyatlarını karşılaştır.</h1><p className="product-web-intro">Ürün adını yaz; bağlı kaynaklardaki teklifleri hemen gör.</p><ProductWebSearch initialQuery={q.slice(0,150)}/></main>;
}
