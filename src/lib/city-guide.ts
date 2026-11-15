import {turkiyeCities} from './turkiye-cities';

const replacements:Record<string,string>={'ı':'i','ğ':'g','ü':'u','ş':'s','ö':'o','ç':'c'};
export function citySlug(city:string){return city.toLocaleLowerCase('tr').replace(/[ığüşöç]/g,char=>replacements[char]??char).normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');}
export const cityGuides=turkiyeCities.map(name=>({name,slug:citySlug(name)}));
export function getCityGuide(slug:string){return cityGuides.find(city=>city.slug===slug);}
export function cultureSearchUrl(city:string,term:string){return `https://www.kulturportali.gov.tr/portal/arama/${encodeURIComponent(`${city} ${term}`).replaceAll('%20','+')}`;}
