import Link from 'next/link';
import {ArrowUpRight,Refrigerator,Laptop,Smartphone,Tags,CreditCard,Wind} from 'lucide-react';
import type {Guide} from '@/lib/guides';
const icons={vacuum:Wind,fridge:Refrigerator,laptop:Laptop,phone:Smartphone,discount:Tags,payment:CreditCard};
export function GuideCard({guide:g}:{guide:Guide}){const Icon=icons[g.icon];return <Link href={`/rehberler/${g.slug}`} className={`guide-card guide-${g.topic}`}><div className="guide-visual" aria-hidden="true"><Icon size={58} strokeWidth={1.3}/><span>ÖNCE İHTİYACIN</span><ArrowUpRight size={21}/></div><div className="guide-card-copy"><span className="guide-meta">{g.category} · {g.minutes} dk okuma</span><h3>{g.title}</h3><p>{g.summary}</p><span className="text-link">Rehberi oku →</span></div></Link>;}
