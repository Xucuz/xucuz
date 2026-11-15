import {NextResponse} from 'next/server';
import {getCityGuide} from '@/lib/city-guide';

export const revalidate=86400;
type CommonsImage={title?:string;imageinfo?:Array<{thumburl?:string;url?:string;descriptionurl?:string;extmetadata?:Record<string,{value?:string}>}>};
function plainText(value:string|undefined){return (value??'').replace(/<[^>]*>/g,' ').replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').replace(/&#039;/g,"'").replace(/&quot;/g,'"').replace(/\s+/g,' ').trim();}
function reusableLicense(name:string,url:string){return /\bCC\s*(BY|BY-SA)|creative commons attribution|public domain|cc0/i.test(name+' '+url)&&!/\bNC\b|\bND\b|non.?commercial|no.?derivative/i.test(name+' '+url);}

export async function GET(_request:Request,{params}:{params:Promise<{slug:string}>}){const {slug}=await params;const city=getCityGuide(slug);if(!city)return NextResponse.json({error:'Şehir bulunamadı.'},{status:404});
 try{const api=new URL('https://commons.wikimedia.org/w/api.php');api.searchParams.set('action','query');api.searchParams.set('generator','search');api.searchParams.set('gsrsearch',`${city.name} Turkey`);api.searchParams.set('gsrnamespace','6');api.searchParams.set('gsrlimit','12');api.searchParams.set('prop','imageinfo');api.searchParams.set('iiprop','url|extmetadata');api.searchParams.set('iiurlwidth','900');api.searchParams.set('format','json');api.searchParams.set('origin','*');
  const response=await fetch(api,{next:{revalidate:86400},headers:{'Api-User-Agent':'Xucuz.com City Guide/1.0 (https://xucuz.com/81-il-rehberi)'}});if(!response.ok)throw new Error(`Commons HTTP ${response.status}`);const body=await response.json() as {query?:{pages?:Record<string,CommonsImage>}};
  const photos=Object.values(body.query?.pages??[]).flatMap(page=>{const image=page.imageinfo?.[0];if(!image?.thumburl||!image.descriptionurl)return[];const metadata=image.extmetadata??{};const license=plainText(metadata.LicenseShortName?.value);const licenseUrl=plainText(metadata.LicenseUrl?.value);const artist=plainText(metadata.Artist?.value)||plainText(metadata.Credit?.value);if(!license||!licenseUrl||!artist||!reusableLicense(license,licenseUrl))return[];return[{title:plainText(page.title),imageUrl:image.thumburl,originalUrl:image.url??image.thumburl,filePage:image.descriptionurl,license,licenseUrl,artist}];}).slice(0,8);
  return NextResponse.json({photos,source:'Wikimedia Commons',city:city.name},{headers:{'Cache-Control':'public, s-maxage=86400, stale-while-revalidate=604800'}});
 }catch{return NextResponse.json({error:'Fotoğraf kaynağına şu anda ulaşılamadı.',photos:[]},{status:502,headers:{'Cache-Control':'no-store'}});}}
