import {mode} from '@/lib/providers/engine';
import {Saved} from '@/components/saved';
export const metadata={title:'Ürün karşılaştırma',robots:{index:false,follow:false}};
export default function Page(){return <Saved compare dataMode={mode()}/>;}
