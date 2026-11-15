import {NextResponse} from 'next/server';
import {getCityGuide} from '@/lib/city-guide';

export const dynamic='force-dynamic';
type Place={id?:string;displayName?:{text?:string};formattedAddress?:string;rating?:number;userRatingCount?:number;googleMapsUri?:string;primaryTypeDisplayName?:{text?:string}};
type PlacesResponse={places?:Place[]};

async function searchPlaces(apiKey:string,textQuery:string,category:'Restoran'|'Alışveriş'){
 const response=await fetch('https://places.googleapis.com/v1/places:searchText',{method:'POST',cache:'no-store',headers:{'Content-Type':'application/json','X-Goog-Api-Key':apiKey,'X-Goog-FieldMask':'places.id,places.displayName,places.formattedAddress,places.rating,places.userRatingCount,places.googleMapsUri,places.primaryTypeDisplayName'},body:JSON.stringify({textQuery,languageCode:'tr',regionCode:'TR',pageSize:8,minRating:4})});
 if(!response.ok)throw new Error('Places request failed');
 const result=await response.json() as PlacesResponse;
 return (result.places??[]).map(place=>({...place,category}));
}

export async function GET(_request:Request,{params}:{params:Promise<{slug:string}>}){
 const {slug}=await params;const city=getCityGuide(slug);if(!city)return NextResponse.json({status:'not-found',places:[]},{status:404,headers:{'Cache-Control':'no-store'}});
 const apiKey=process.env.GOOGLE_PLACES_API_KEY;
 if(!apiKey)return NextResponse.json({status:'unconfigured',places:[],message:'Google Places API anahtarı yapılandırılmamış.'},{status:503,headers:{'Cache-Control':'no-store'}});
 try{
  const [restaurants,shopping]=await Promise.all([searchPlaces(apiKey,`restaurants and cafes in ${city.name}, Turkey`,'Restoran'),searchPlaces(apiKey,`shopping malls and local shops in ${city.name}, Turkey`,'Alışveriş')]);
  const unique=new Map<string,Place&{category:'Restoran'|'Alışveriş'}>();
  for(const place of [...restaurants,...shopping])if(place.id&&place.displayName?.text&&place.formattedAddress&&place.rating!==undefined&&place.userRatingCount!==undefined&&place.googleMapsUri)unique.set(place.id,place);
  const places=[...unique.values()].sort((a,b)=>(b.rating??0)-(a.rating??0)||(b.userRatingCount??0)-(a.userRatingCount??0)).slice(0,12);
  return NextResponse.json({status:'ok',city:city.name,places,source:'Google Places API'},{headers:{'Cache-Control':'no-store'}});
 }catch{return NextResponse.json({status:'unavailable',places:[],message:'Google Places verisi şu anda alınamadı.'},{status:502,headers:{'Cache-Control':'no-store'}});}
}
