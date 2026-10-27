import {categories,type Category} from './categories';
export const focusSlugs:readonly Category[]=['elektronik','beyaz-esya'];
export const focusCategories=categories.filter(c=>focusSlugs.includes(c.slug));
export const inLaunchScope=(category:Category)=>focusSlugs.includes(category);
