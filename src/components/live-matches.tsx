'use client';

import {useCallback,useEffect,useState} from 'react';
import {Activity,Clock3,RefreshCw} from 'lucide-react';
import {useLanguage} from './language-provider';

type Match={id:number;league:string;country:string;home:string;away:string;homeLogo:string|null;awayLogo:string|null;homeGoals:number|null;awayGoals:number|null;minute:number|null;extraMinute:number|null;status:string;date:string|null};
type Result={status:'ok'|'not_configured'|'provider_error';matches:Match[];updatedAt?:string};
const copy={
 tr:{title:'Canlı maçlar',lead:'Şu anda oynanan futbol maçları ve skorlar.',live:'CANLI',refresh:'Yenile',updated:'Son kontrol',loading:'Canlı skorlar alınıyor…',empty:'Şu anda canlı maç bulunmuyor.',notConfigured:'Canlı skor servisi bu ortamda yapılandırılmamış.',providerError:'Canlı skor servisine şu anda ulaşılamıyor. Biraz sonra yeniden dene.',source:'Veri kaynağı: API-Football. Skorlar servis sağlayıcısının güncelleme sıklığına bağlıdır.',minute:(m:number,e:number|null)=>`${m}${e?`+${e}`:''}′`},
 en:{title:'Live matches',lead:'Football matches and scores happening now.',live:'LIVE',refresh:'Refresh',updated:'Last checked',loading:'Loading live scores…',empty:'There are no live matches right now.',notConfigured:'Live scores are not configured in this environment.',providerError:'The live scores service is unavailable right now. Try again shortly.',source:'Data source: API-Football. Scores update according to the provider schedule.',minute:(m:number,e:number|null)=>`${m}${e?`+${e}`:''}′`},
 ru:{title:'Матчи в эфире',lead:'Футбольные матчи и текущие счета.',live:'В ЭФИРЕ',refresh:'Обновить',updated:'Проверено',loading:'Загрузка текущих счетов…',empty:'Сейчас нет матчей в эфире.',notConfigured:'Текущие счета не настроены в этой среде.',providerError:'Сервис текущих счетов временно недоступен. Попробуйте позже.',source:'Источник данных: API-Football. Частота обновления зависит от поставщика.',minute:(m:number,e:number|null)=>`${m}${e?`+${e}`:''}′`}
};

export function LiveMatches(){
 const {language}=useLanguage();const t=copy[language];
 const [data,setData]=useState<Result>({status:'ok',matches:[]});const [loading,setLoading]=useState(true);const [checkedAt,setCheckedAt]=useState('');
 const load=useCallback(async()=>{setLoading(true);try{const response=await fetch('/api/live-matches',{cache:'no-store'});const result=await response.json() as Result;setData(result);setCheckedAt(new Date().toISOString());}catch{setData({status:'provider_error',matches:[]});}finally{setLoading(false);}},[]);
 useEffect(()=>{const initial=window.setTimeout(()=>void load(),0);const timer=window.setInterval(()=>void load(),60_000);return()=>{window.clearTimeout(initial);window.clearInterval(timer);};},[load]);
 const locale=language==='en'?'en-GB':language==='ru'?'ru-RU':'tr-TR';
 return <section className="live-matches-page" aria-labelledby="live-matches-title">
  <div className="live-matches-head"><div><p className="live-matches-kicker"><Activity size={14}/>{t.live}</p><h1 id="live-matches-title">{t.title}</h1><p>{t.lead}</p></div><button className="live-matches-refresh" onClick={()=>void load()} disabled={loading}><RefreshCw size={16} className={loading?'is-spinning':''}/><span>{t.refresh}</span></button></div>
  <div className="live-matches-meta"><span className="live-matches-indicator"><i/>{t.live}</span>{checkedAt&&<span><Clock3 size={13}/>{t.updated}: {new Intl.DateTimeFormat(locale,{hour:'2-digit',minute:'2-digit'}).format(new Date(checkedAt))}</span>}</div>
  {loading?<div className="live-matches-empty" role="status">{t.loading}</div>:data.status==='not_configured'?<div className="live-matches-empty" role="status">{t.notConfigured}</div>:data.status==='provider_error'?<div className="live-matches-empty" role="alert">{t.providerError}</div>:data.matches.length===0?<div className="live-matches-empty" role="status">{t.empty}</div>:<div className="live-matches-list">{data.matches.map(match=><article className="live-match-card" key={match.id}>
   <div className="live-match-league">{match.country&&<span>{match.country}</span>}{match.country&&match.league?' · ':''}{match.league}</div>
   <div className="live-match-teams"><div className="live-match-team">{match.homeLogo&&<TeamLogo src={match.homeLogo}/>}<strong>{match.home}</strong></div><div className="live-match-score"><strong>{match.homeGoals??'–'} : {match.awayGoals??'–'}</strong><span>{match.minute!==null?t.minute(match.minute,match.extraMinute):match.status}</span></div><div className="live-match-team away">{match.awayLogo&&<TeamLogo src={match.awayLogo}/>}<strong>{match.away}</strong></div></div>
  </article>)}</div>}
  <p className="live-matches-source">{t.source}</p>
 </section>;
}

function TeamLogo({src}:{src:string}){
 // Team badges are supplied as external URLs by API-Football; Next's image optimizer is not needed for these small icons.
 // eslint-disable-next-line @next/next/no-img-element
 return <img src={src} alt="" loading="lazy" referrerPolicy="no-referrer"/>;
}
