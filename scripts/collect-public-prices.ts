import {mkdir,writeFile,readFile} from 'node:fs/promises';
import {crawlAll} from '../src/lib/public-prices/crawl';
import type {Offer} from '../src/lib/types';
async function main(){const snapshot=await crawlAll();await mkdir('data',{recursive:true});await writeFile('data/public-offers.json',JSON.stringify(snapshot,null,2)+'\n');let history:{offerId:string;price:number;currency:string;observedAt:string}[]=[];try{history=JSON.parse(await readFile('data/price-history.json','utf8'));}catch{}history.push(...snapshot.offers.map((o:Offer)=>({offerId:o.id,price:o.price,currency:o.currency,observedAt:o.updatedAt})));await writeFile('data/price-history.json',JSON.stringify(history.slice(-5000),null,2)+'\n');console.log(JSON.stringify({count:snapshot.offers.length,statuses:snapshot.statuses},null,2));if(!snapshot.offers.length)process.exitCode=1;}
main().catch(()=>{console.error('Toplama tamamlanamadı. Hiçbir fiyat uydurulmadı.');process.exitCode=1;});
