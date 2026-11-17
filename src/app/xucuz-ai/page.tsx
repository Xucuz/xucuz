import type {Metadata} from 'next';
import {XucuzAiChat} from '@/components/xucuz-ai-chat';
export const metadata:Metadata={title:'Xucuz AI — verified guidance',description:'Ask Xucuz AI about shopping and travel discovery. Price answers use only verified database records.'};
export default function XucuzAiPage(){return <XucuzAiChat/>;}
