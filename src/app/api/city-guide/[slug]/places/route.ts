import {NextResponse} from 'next/server';
import {cityCoordinates} from '@/lib/city-coordinates';
import {getCityGuide} from '@/lib/city-guide';

export const dynamic='force-dynamic';

type Category='Restoran'|'Alışveriş';
type Place={id:string;name:string;address:string;url:string;category:Category;typeLabel:string;rating?:number;reviewCount?:number};
type GooglePlace={id?:string;displayName?:{text?:string};formattedAddress?:string;rating?:number;userRatingCount?:number;googleMapsUri?:string;primaryTypeDisplayName?:{text?:string}};
type GooglePlacesResponse={places?:GooglePlace[]};
type OsmElement={type:'node'|'way'|'relation';id:number;tags?:Record<string,string>;center?:{lat:number;lon:number};lat?:number;lon?:number};
type OsmResponse={elements?:OsmElement[]};

const openMapHeaders={'Cache-Control':'public, max-age=0, s-maxage=21600, stale-while-revalidate=86400'};

async function searchGooglePlaces(apiKey:string,textQuery:string,category:Category):Promise<Place[]>{
 const response=await fetch('https://places.googleapis.com/v1/places:searchText',{method:'POST',cache:'no-store',headers:{'Content-Type':'application/json','X-Goog-Api-Key':apiKey,'X-Goog-FieldMask':'places.id,places.displayName,places.formattedAddress,places.rating,places.userRatingCount,places.googleMapsUri,places.primaryTypeDisplayName'},body:JSON.stringify({textQuery,languageCode:'tr',regionCode:'TR',pageSize:8,minRating:4})});
 if(!response.ok)throw new Error('Google Places request failed');
 const result=await response.json() as GooglePlacesResponse;
 return (result.places??[]).flatMap(place=>place.id&&place.displayName?.text&&place.formattedAddress&&place.googleMapsUri&&place.rating!==undefined&&place.userRatingCount!==undefined?[{id:place.id,name:place.displayName.text,address:place.formattedAddress,url:place.googleMapsUri,category,typeLabel:place.primaryTypeDisplayName?.text??category,rating:place.rating,reviewCount:place.userRatingCount}]:[]);
}

function osmTypeLabel(tags:Record<string,string>):{category:Category;typeLabel:string}{
 const amenity=tags.amenity;
 if(amenity==='restaurant')return{category:'Restoran',typeLabel:'Restoran'};
 if(amenity==='cafe')return{category:'Restoran',typeLabel:'Kafe'};
 if(amenity==='fast_food')return{category:'Restoran',typeLabel:'Hızlı yemek'};
 const labels:Record<string,string>={mall:'Alışveriş merkezi',supermarket:'Süpermarket',department_store:'Büyük mağaza',convenience:'Market',clothes:'Giyim mağazası',gift:'Hediyelik eşya'};
 return{category:'Alışveriş',typeLabel:labels[tags.shop]??'Yerel işletme'};
}

function osmAddress(tags:Record<string,string>,city:string,element:OsmElement):string{
 const street=tags['addr:street']??tags['addr:place'];
 const number=tags['addr:housenumber'];
 const district=tags['addr:district']??tags['addr:suburb']??tags['addr:neighbourhood'];
 const locality=tags['addr:city']??city;
 const first=street?[`${street}${number?` ${number}`:''}`]:[];
 const parts=[...first,district,locality].filter((part):part is string=>Boolean(part));
 if(parts.length)return parts.join(', ');
 const point=element.center??(element.lat!==undefined&&element.lon!==undefined?{lat:element.lat,lon:element.lon}:undefined);
 return point?`Harita noktası ${point.lat.toFixed(5)}, ${point.lon.toFixed(5)} · Sokak adresi kaydedilmemiş`:`Adres ayrıntısı harita kaydında yok · ${city}`;
}

async function searchOpenStreetMap(city:string):Promise<Place[]>{
 const coordinate=cityCoordinates.find(item=>item.name===city);
 const around=coordinate?`nwr(around:20000,${coordinate.lat},${coordinate.lon})`:'';
 const escapedName=city.replaceAll('\\','\\\\').replaceAll('"','\\"');
 const query=`[out:json][timeout:25];area["name"="${escapedName}"]["boundary"="administrative"]["admin_level"="4"]->.province;(nwr(area.province)["amenity"~"^(restaurant|cafe|fast_food)$"]["name"];nwr(area.province)["shop"~"^(mall|supermarket|department_store|convenience|clothes|gift)$"]["name"];${around?`${around}["amenity"~"^(restaurant|cafe|fast_food)$"]["name"];${around}["shop"~"^(mall|supermarket|department_store|convenience|clothes|gift)$"]["name"];`:''});out center 100;`;
 const response=await fetch('https://overpass-api.de/api/interpreter',{method:'POST',cache:'no-store',headers:{'Content-Type':'application/x-www-form-urlencoded;charset=UTF-8','Accept':'application/json','User-Agent':'Xucuz.com city guide contact: https://xucuz.com/iletisim'},body:`data=${encodeURIComponent(query)}`});
 if(!response.ok)throw new Error('OpenStreetMap lookup failed');
 const result=await response.json() as OsmResponse;
 const unique=new Map<string,Place>();
 for(const element of result.elements??[]){
  const tags=element.tags;
  if(!tags?.name)continue;
  const {category,typeLabel}=osmTypeLabel(tags);
  const address=osmAddress(tags,city,element);
  const url=`https://www.openstreetmap.org/${element.type}/${element.id}`;
  unique.set(`${element.type}/${element.id}`,{id:`${element.type}/${element.id}`,name:tags.name,address,url,category,typeLabel});
 }
 return [...unique.values()].sort((a,b)=>Number(a.address.includes('Sokak adresi kaydedilmemiş'))-Number(b.address.includes('Sokak adresi kaydedilmemiş'))||a.name.localeCompare(b.name,'tr')).slice(0,24);
}

export async function GET(_request:Request,{params}:{params:Promise<{slug:string}>}){
 const {slug}=await params;
 const city=getCityGuide(slug);
 if(!city)return NextResponse.json({status:'not-found',places:[]},{status:404,headers:{'Cache-Control':'no-store'}});
 const apiKey=process.env.GOOGLE_PLACES_API_KEY;
 if(apiKey){
  try{
   const [restaurants,shopping]=await Promise.all([searchGooglePlaces(apiKey,`restaurants and cafes in ${city.name}, Turkey`,'Restoran'),searchGooglePlaces(apiKey,`shopping malls and local shops in ${city.name}, Turkey`,'Alışveriş')]);
   const unique=new Map<string,Place>();
   for(const place of [...restaurants,...shopping])unique.set(place.id,place);
   const places=[...unique.values()].sort((a,b)=>(b.rating??0)-(a.rating??0)||(b.reviewCount??0)-(a.reviewCount??0)).slice(0,12);
   if(places.length)return NextResponse.json({status:'ok',city:city.name,places,source:'google'},{headers:{'Cache-Control':'no-store'}});
  }catch{
   // Google is optional. OpenStreetMap supplies a free, clearly attributed fallback.
  }
 }
 try{
  const places=await searchOpenStreetMap(city.name);
  return NextResponse.json({status:'ok',city:city.name,places,source:'openstreetmap'},{headers:openMapHeaders});
 }catch{
  return NextResponse.json({status:'unavailable',places:[],message:'Mekân kayıtlarına şu anda ulaşılamadı.'},{status:502,headers:{'Cache-Control':'no-store'}});
 }
}
