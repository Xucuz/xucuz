export function resolveDataMode(env:{DATA_MODE?:string;VERCEL?:string}):'demo'|'live'{
 // Hosted xucuz never serves fictional prices, even if an old dashboard setting says demo.
 if(env.VERCEL==='1')return 'live';
 const value=env.DATA_MODE??'live';
 if(value!=='demo'&&value!=='live')throw new Error('DATA_MODE must be demo or live');
 return value;
}
