import type {Metadata,Viewport} from 'next';
import {XucuzWorldHome} from '@/components/xucuz-world-home';
export const metadata:Metadata={title:'Explore the world. Choose with clarity.',description:'Xucuz World brings together verified price observations, travel discovery, and your digital world passport.',alternates:{canonical:'/'}};
export const viewport:Viewport={themeColor:'#07172c',width:'device-width',initialScale:1,viewportFit:'cover'};
export default function Home(){return <XucuzWorldHome/>;}
