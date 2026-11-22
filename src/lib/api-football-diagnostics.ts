export function apiFootballFailureStatus(errors:unknown){
 const message=JSON.stringify(errors??'').toLowerCase();
 if(/rate|limit|quota/.test(message))return'rate_limited';
 if(/subscription|not subscribed|plan|access/.test(message))return'subscription_required';
 return'provider_error';
}

export function logApiFootballFailure(endpoint:string,status:number,detail:unknown){
 let message=typeof detail==='string'?detail:JSON.stringify(detail??'');
 message=message
  .replace(/("?(?:api[_-]?key|authorization|token|secret|password)"?\s*[:=]\s*)"?[^",}\s]+"?/gi,'$1[REDACTED]')
  .replace(/[A-Za-z0-9_-]{40,}/g,'[REDACTED]')
  .slice(0,700);
 console.error('[API-Football diagnostic]',JSON.stringify({endpoint,status,detail:message}));
}
