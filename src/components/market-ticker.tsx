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
export async function MarketTicker(){
 const data=await getRates();
 const usd=data?data.rates.TRY/data.rates.USD:null;
 const eur=data?.rates.TRY;
 const fmt=(n:number)=>new Intl.NumberFormat('tr-TR',{minimumFractionDigits:2,maximumFractionDigits:4}).format(n);
 const items=[usd?`USD/TRY \${fmt(usd)} ₺`:'USD/TRY: veri alınamadı',eur?`EUR/TRY \${fmt(eur)} ₺`:'EUR/TRY: veri alınamadı','Gram altın: lisanslı veri kaynağı bekleniyor'];
 return <aside className="market-ticker" aria-label="Döviz ve altın bilgi bandı"><span className="market-ticker-label">PİYASALAR</span><div className="market-ticker-window"><div className="market-ticker-track">{[0,1].map(copy=><span key={copy} className="market-ticker-group" aria-hidden={copy===1}>{items.map((item,i)=><span key={i}>{item}</span>)}<span>{data?`Referans tarih: \${data.date}`:'Güncel referans verisi alınamadı'}</span></span>)}</div></div><a className="market-ticker-source" href="https://frankfurter.dev/" target="_blank" rel="noopener noreferrer">Kaynak: Frankfurter · Referans kur</a></aside>;
}
