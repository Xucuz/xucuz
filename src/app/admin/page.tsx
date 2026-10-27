import {isAdmin} from '@/lib/auth';
import {Admin} from '@/components/admin';
export const dynamic='force-dynamic';
export const metadata={title:'Yönetim',robots:{index:false,follow:false}};
export default async function Page(){return <Admin authenticated={await isAdmin()}/>;}
