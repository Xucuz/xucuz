'use client';

import {usePathname} from 'next/navigation';
import {LiveQA} from './live-qa';

export function LiveQaRoute(){
 const pathname=usePathname();
 return pathname==='/'?null:<LiveQA/>;
}
