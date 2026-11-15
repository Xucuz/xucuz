import type {Metadata,Viewport} from 'next';
import {NetworkHome} from '@/components/network-landing';
import './network.css';
export const metadata:Metadata={title:'Xucuz — Ücretsiz iş ortaklığı ağı',description:'Mağazalar, yayıncılar, içerik üreticileri ve ajanslar için ücretsiz iş ortaklığı ağı. Xucuz platform komisyonu %0.',alternates:{canonical:'/'}};
export const viewport:Viewport={themeColor:'#176bc5',width:'device-width',initialScale:1,viewportFit:'cover'};
export default function Home(){return <NetworkHome/>;}
