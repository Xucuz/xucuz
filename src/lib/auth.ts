import {cookies} from 'next/headers';
import {validSession} from './security';
export async function isAdmin(){return validSession((await cookies()).get('xucuz_session')?.value);}
