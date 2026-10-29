import {NextRequest,NextResponse} from 'next/server';
export async function POST(request:NextRequest){const response=NextResponse.redirect(new URL('/sohbet',request.url),303);response.cookies.delete('xucuz_member');return response;}
