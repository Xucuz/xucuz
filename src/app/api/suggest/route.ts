import {NextResponse} from 'next/server';
import {categories,normalize} from '@/lib/categories';
import {demoOffers} from '@/lib/demo';
import {mode} from '@/lib/providers/engine';
import {rateLimit} from '@/lib/security';
export function GET(request:Request){if(!rateLimit('suggest',180))return NextResponse.json([],{status:429});const p=new URL(request.url).searchParams;const q=normalize((p.get('q')??'').slice(0,150));if(q.length<2)return NextResponse.json([]);const cat=p.get('category');const values=[...categories.filter(c=>[c.name,...c.aliases].some(v=>normalize(v).includes(q))).map(c=>c.name),...(mode()==='demo'?demoOffers.filter(o=>(!cat||o.category===cat)&&normalize(o.title).includes(q)).map(o=>o.title):[])];return NextResponse.json([...new Set(values)].slice(0,8));}
