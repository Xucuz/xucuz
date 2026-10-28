import {createHmac} from 'node:crypto';
export function visitorMonth(now=new Date()){return new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Istanbul',year:'numeric',month:'2-digit'}).format(now);}
export function metricsConfigured(){return process.env.VISITOR_METRICS_ENABLED!=='0'&&!!process.env.DATABASE_URL&&(process.env.VISITOR_METRICS_SECRET?.length??0)>=32;}
export function visitorHash(id:string,month:string,secret:string){if(secret.length<32)throw new Error('Metrics secret missing');return createHmac('sha256',secret).update(`${month}:${id}`).digest('hex');}
