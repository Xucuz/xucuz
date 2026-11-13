import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {PhoneLookupDemo} from '@/components/phone-lookup-demo';

export const metadata:Metadata={
  title:'Numara sorgulama — geliştirme demosu',
  description:'Xucuz telefon sorgulama modülü geliştirme önizlemesi.',
  robots:{index:false,follow:false}
};

export default function Page(){
  if(process.env.PHONE_LOOKUP_DEMO_ENABLED !== 'true') notFound();
  return <PhoneLookupDemo/>;
}
