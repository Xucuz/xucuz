export type LicensedCityPhoto={title:string;imageUrl:string;originalUrl:string;filePage:string;license:string;licenseUrl:string;artist:string};
type CommonsImage={title?:string;imageinfo?:Array<{thumburl?:string;url?:string;descriptionurl?:string;extmetadata?:Record<string,{value?:string}>}>};

function plainText(value:string|undefined){return (value??'').replace(/<[^>]*>/g,' ').replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').replace(/&#039;/g,"'").replace(/&quot;/g,'"').replace(/\s+/g,' ').trim();}
function reusableLicense(name:string,url:string){return /\bCC\s*(BY|BY-SA)|creative commons attribution|public domain|cc0/i.test(name+' '+url)&&!/\bNC\b|\bND\b|non.?commercial|no.?derivative/i.test(name+' '+url);}

export async function getLicensedCityPhotos(search:string,limit=8):Promise<LicensedCityPhoto[]>{
 try{
  const api=new URL('https://commons.wikimedia.org/w/api.php');
  api.searchParams.set('action','query');api.searchParams.set('generator','search');api.searchParams.set('gsrsearch',search);api.searchParams.set('gsrnamespace','6');api.searchParams.set('gsrlimit','30');api.searchParams.set('prop','imageinfo');api.searchParams.set('iiprop','url|extmetadata');api.searchParams.set('iiurlwidth','900');api.searchParams.set('format','json');api.searchParams.set('origin','*');
  const response=await fetch(api,{next:{revalidate:86400},headers:{'Api-User-Agent':'Xucuz.com City Guide/1.0 (https://xucuz.com/81-il-rehberi)'}});
  if(!response.ok)return [];
  const body=await response.json() as {query?:{pages?:Record<string,CommonsImage>}};
  return Object.values(body.query?.pages??[]).flatMap(page=>{
   const image=page.imageinfo?.[0];if(!image?.thumburl||!image.descriptionurl)return[];
   const metadata=image.extmetadata??{};const license=plainText(metadata.LicenseShortName?.value);const licenseUrl=plainText(metadata.LicenseUrl?.value);const artist=plainText(metadata.Artist?.value)||plainText(metadata.Credit?.value);
   if(!license||!licenseUrl||!artist||!reusableLicense(license,licenseUrl))return[];
   return[{title:plainText(page.title),imageUrl:image.thumburl,originalUrl:image.url??image.thumburl,filePage:image.descriptionurl,license,licenseUrl,artist}];
  }).slice(0,limit);
 }catch{return [];}
}

export async function getCityGuidePhotos(city:string,topic='city',limit=8):Promise<LicensedCityPhoto[]>{
 const searches:Record<string,string[]>={
  city:[`${city} Turkey`,`${city} Turkey landscape`,`${city} Turkey architecture`],
  food:city==='Adana'?['Adana kebab','Adana kebabı','Turkish kebab food','Turkish cuisine food']: [`${city} traditional food Turkey`,`${city} cuisine Turkey`,'Turkish traditional food'],
  sights:[`${city} Turkey landmark`,`${city} historic site Turkey`,`${city} landscape Turkey`],
  products:[`${city} Turkey handicraft`,`${city} local products Turkey`],
  clothing:[`${city} Turkey traditional clothing`,`${city} Turkey textile`],
 };
 const candidates=await Promise.all((searches[topic]??searches.city).map(search=>getLicensedCityPhotos(search,limit)));
 const unique=new Map<string,LicensedCityPhoto>();
 for(const photo of candidates.flat())if(!unique.has(photo.filePage))unique.set(photo.filePage,photo);
 return [...unique.values()].slice(0,limit);
}
