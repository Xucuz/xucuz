// RFC 9309 essentials: selected user-agent group, longest matching path, Allow wins ties.
export function robotsAllowed(body:string,path:string,agent='xucuzpricebot'){
 const groups:{agents:string[];rules:{allow:boolean;pattern:string}[];delay:number}[]=[];let group:typeof groups[number]|undefined;let sawRules=false;
 for(const raw of body.split(/\r?\n/)){const line=raw.split('#')[0].trim();const colon=line.indexOf(':');if(colon<0)continue;const key=line.slice(0,colon).trim().toLowerCase();const value=line.slice(colon+1).trim();if(key==='user-agent'){if(!group||sawRules){group={agents:[],rules:[],delay:0};groups.push(group);sawRules=false;}group.agents.push(value.toLowerCase());}else if(group){if(key==='allow'||key==='disallow'){sawRules=true;if(value)group.rules.push({allow:key==='allow',pattern:value});}if(key==='crawl-delay'){sawRules=true;group.delay=Math.max(group.delay,Number(value)||0);}}}
 const matching=groups.filter(g=>g.agents.some(a=>a!=='*'&&agent.toLowerCase().includes(a)));const selected=matching.length?matching:groups.filter(g=>g.agents.includes('*'));let best=-1;let allowed=true;
 for(const rule of selected.flatMap(g=>g.rules)){const end=rule.pattern.endsWith('$');const p=end?rule.pattern.slice(0,-1):rule.pattern;const regex='^'+p.split('*').map(part=>part.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('.*')+(end?'$':'');if(new RegExp(regex).test(path)){const length=p.replace(/\*/g,'').length;if(length>best||length===best&&rule.allow){best=length;allowed=rule.allow;}}}
 return {allowed,delaySeconds:Math.max(0,...selected.map(g=>g.delay))};
}
