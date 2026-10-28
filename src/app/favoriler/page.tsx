import {mode} from '@/lib/providers/engine';
import {Saved} from '@/components/saved';
export const metadata={title:'Favorilerim',robots:{index:false,follow:false}};
export default function Page(){return <Saved dataMode={mode()}/>;}
