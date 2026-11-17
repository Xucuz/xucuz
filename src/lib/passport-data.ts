export type Destination={id:string;country:string;city:string;flag:string;lat:number;lon:number};

export const destinations:Destination[]=[
 {id:'tr-istanbul',country:'tr',city:'istanbul',flag:'🇹🇷',lat:41.0082,lon:28.9784},
 {id:'tr-cappadocia',country:'tr',city:'cappadocia',flag:'🇹🇷',lat:38.6431,lon:34.8289},
 {id:'tr-antalya',country:'tr',city:'antalya',flag:'🇹🇷',lat:36.8969,lon:30.7133},
 {id:'jp-tokyo',country:'jp',city:'tokyo',flag:'🇯🇵',lat:35.6762,lon:139.6503},
 {id:'jp-kyoto',country:'jp',city:'kyoto',flag:'🇯🇵',lat:35.0116,lon:135.7681},
 {id:'it-rome',country:'it',city:'rome',flag:'🇮🇹',lat:41.9028,lon:12.4964},
 {id:'it-venice',country:'it',city:'venice',flag:'🇮🇹',lat:45.4408,lon:12.3155},
 {id:'gb-london',country:'gb',city:'london',flag:'🇬🇧',lat:51.5072,lon:-0.1276},
 {id:'gb-edinburgh',country:'gb',city:'edinburgh',flag:'🇬🇧',lat:55.9533,lon:-3.1883},
 {id:'fr-paris',country:'fr',city:'paris',flag:'🇫🇷',lat:48.8566,lon:2.3522},
 {id:'de-berlin',country:'de',city:'berlin',flag:'🇩🇪',lat:52.52,lon:13.405},
 {id:'de-munich',country:'de',city:'munich',flag:'🇩🇪',lat:48.1351,lon:11.582},
 {id:'ae-dubai',country:'ae',city:'dubai',flag:'🇦🇪',lat:25.2048,lon:55.2708},
 {id:'ae-abu-dhabi',country:'ae',city:'abuDhabi',flag:'🇦🇪',lat:24.4539,lon:54.3773},
 {id:'us-new-york',country:'us',city:'newYork',flag:'🇺🇸',lat:40.7128,lon:-74.006},
 {id:'us-san-francisco',country:'us',city:'sanFrancisco',flag:'🇺🇸',lat:37.7749,lon:-122.4194},
 {id:'ru-moscow',country:'ruCountry',city:'moscow',flag:'🇷🇺',lat:55.7558,lon:37.6173},
 {id:'ru-saint-petersburg',country:'ruCountry',city:'stPetersburg',flag:'🇷🇺',lat:59.9311,lon:30.3609}
];

export const passportStorageKey='xucuz-world-passport-v1';
const validIds=new Set(destinations.map(destination=>destination.id));
export function sanitizePassportStamps(value:unknown):string[]{
 if(!Array.isArray(value))return [];
 return [...new Set(value.filter((item):item is string=>typeof item==='string'&&validIds.has(item)))];
}
export function exploredCountryCount(stamps:string[]){return new Set(destinations.filter(destination=>stamps.includes(destination.id)).map(destination=>destination.country)).size;}
