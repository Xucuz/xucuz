import {redirect} from 'next/navigation';

export default async function ProductSearchPage({searchParams}:{searchParams:Promise<{q?:string}>}){
 const {q=''}=await searchParams;
 redirect(`/xucuz-ai${q?`?q=${encodeURIComponent(q.slice(0,1200))}`:''}`);
}
