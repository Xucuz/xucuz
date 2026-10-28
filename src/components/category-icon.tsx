import {Hotel,Plane,Bus,ShoppingBasket,Car,Smartphone,Refrigerator,Flower2} from 'lucide-react';
import type {Category} from '@/lib/categories';
const icons={otel:Hotel,ucak:Plane,otobus:Bus,market:ShoppingBasket,otomobil:Car,elektronik:Smartphone,'beyaz-esya':Refrigerator,cicek:Flower2};
export function CategoryIcon({category,size=24}:{category:Category;size?:number}){const Icon=icons[category];return <Icon size={size} strokeWidth={1.65} aria-hidden="true"/>;}
