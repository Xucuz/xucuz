import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {isAdmin} from '@/lib/auth';
import {PhoneModerationDemo} from '@/components/phone-moderation-demo';

export const dynamic='force-dynamic';
export const metadata:Metadata={title:'Telefon bildirimleri — yönetici demosu',robots:{index:false,follow:false}};

export default async function Page(){
  if(process.env.PHONE_LOOKUP_DEMO_ENABLED!=='true') notFound();
  if(!(await isAdmin())) notFound();
  return <PhoneModerationDemo/>;
}
