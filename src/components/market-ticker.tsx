type Rates={date:string;rates:Record<string,number>};
async function getRates():Promise<Rates|null>{
 try{
  const response=await fetch('https://api.frankfurter.dev/v1/latest?base=EUR&symbols=TRY,USD',{next:{revalidate:3600}});
  if(!response.ok)return null;
  const data:unknown=await response.json();
  if(!data||typeof data!=='object'||!('rates'in data)||!('date'in data))return null;
  const rates=(data as Rates).rates;
  if(!rates||!Number.isFinite(rates.TRY)||!Number.isFinite(rates.USD)||rates.USD<=0)return null;
  return data as Rates;
 }catch{return null;}
}
async function getGold():Promise<number|null>{
 const key=process.env.METALS_DEV_API_KEY;
 if(!key)return null;
 try{
  const url=new URL('https://api.metals.dev/v1/latest');
  url.searchParams.set('api_key',key);
  url.searchParams.set('currency','TRY');
  url.searchParams.set('unit','g');
  const response=await fetch(url.toString(),{next:{revalidate:43200}});
  if(!response.ok)return null;
  const data:unknown=await response.json();
  if(!data||typeof data!=='object'||!('metals'in data))return null;
  const gold=(data as {metals?:{gold?:unknown}}).metals?.gold;
  return typeof gold==='number'&&Number.isFinite(gold)&&gold>0?gold:null;
 }catch{return null;}
}
type NewsItem={title:string;url:string};
async function getNews():Promise<NewsItem[]>{
 try{
  const response=await fetch('https://www.press.org.tr/ajans/feed.json',{next:{revalidate:900},signal:AbortSignal.timeout(6000)});
  if(!response.ok)return [];
  const data:unknown=await response.json();
  if(!data||typeof data!=='object'||!('items'in data))return [];
  const items=(data as {items?:unknown}).items;
  if(!Array.isArray(items))return [];
  return items.filter((item):item is {title:string;url:string}=>!!item&&typeof item==='object'&&typeof item.title==='string'&&typeof item.url==='string'&&item.title.trim().length>0&&item.url.startsWith('https://www.press.org.tr/')).slice(0,5).map(item=>({title:item.title.slice(0,140),url:item.url}));
 }catch{return [];}
}
export async function MarketTicker(){
 const [data,gold,news]=await Promise.all([getRates(),getGold(),getNews()]);
 const usd=data?data.rates.TRY/data.rates.USD:null;
 const eur=data?.rates.TRY;
 const fmt=(n:number)=>new Intl.NumberFormat('tr-TR',{minimumFractionDigits:2,maximumFractionDigits:4}).format(n);
 const items=[usd?`USD/TRY ${fmt(usd)} ₺`:'USD/TRY: veri alınamadı',eur?`EUR/TRY ${fmt(eur)} ₺`:'EUR/TRY: veri alınamadı',gold?'Gram altın spot '+fmt(gold)+' ₺':'Gram altın: veri bekleniyor'];
 return <aside className="market-ticker" aria-label="Döviz, altın ve haber bilgi bandı"><span className="market-ticker-label">PİYASALAR</span><div className="market-ticker-window"><div className="market-ticker-track">{[0,1].map(copy=><span key={copy} className="market-ticker-group" aria-hidden={copy===1}>{items.map((item,i)=><span key={i}>{item}</span>)}{news.map((item,i)=><a key={'news-'+i} href={item.url} target="_blank" rel="noopener noreferrer">HABER · {item.title} (PHA)</a>)}<span>{data?`Referans tarih: ${data.date}`:'Güncel referans verisi alınamadı'}</span></span>)}</div></div><a className="market-ticker-source" href="https://frankfurter.dev/" target="_blank" rel="noopener noreferrer">Döviz: Frankfurter · Referans kur</a></aside>;
}
