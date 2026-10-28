export type PriceModel={id:string;productId:string;brand:string;model:string;variant:string;features:Record<string,string>;requiredAttributes:Record<string,string>;identitySource:string;verifiedOn:string};
// Exact model identity is separate from a generic product type. No price is seeded.
export const priceModels:PriceModel[]=[{
 id:'kingston-nv3-1tb-new-manufacturer-warranty',productId:'ssd',brand:'Kingston',model:'SNV3S/1000G',variant:'NV3 · 1 TB · Sıfır · 5 yıl sınırlı üretici garantisi',
 features:{'Kapasite':'1 TB','Bağlantı':'M.2 2280 PCIe 4.0 NVMe','Ürün durumu':'Sıfır','Garanti koşulu':'5 yıl sınırlı üretici garantisi'},
 requiredAttributes:{'Marka':'Kingston','Model kodu':'SNV3S/1000G','Kapasite':'1 TB','Durum':'Sıfır','Garanti':'5 yıl sınırlı üretici garantisi'},
 identitySource:'https://www.kingston.com/tr/memory/search?partid=SNV3S%2F1000G',verifiedOn:'2026-10-27'
}];
export const priceModelById=(id:string)=>priceModels.find(m=>m.id===id);

export const modelSignature=(m:PriceModel)=>JSON.stringify(Object.entries(m.requiredAttributes).sort(([a],[b])=>a.localeCompare(b)));
