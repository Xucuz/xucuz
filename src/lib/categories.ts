export const categories = [
  {slug:'otel',name:'Otel',icon:'⌂',description:'Bir sonraki güzel anın için',aliases:['hotel','hotels','konaklama','tatil'],kind:'stay'},
  {slug:'ucak',name:'Uçak bileti',icon:'✈',description:'Yeni rotalar, iyi fiyatlar',aliases:['uçak','ucak bileti','uçuş','flight','flights'],kind:'flight'},
  {slug:'otobus',name:'Otobüs bileti',icon:'▣',description:'Yolculuğun burada başlasın',aliases:['otobüs','otobus bileti','bus'],kind:'bus'},
  {slug:'market',name:'Market',icon:'◈',description:'Sepetini akıllıca doldur',aliases:['gida','gıda','supermarket','market ürünleri'],kind:'product'},
  {slug:'otomobil',name:'Otomobil',icon:'▰',description:'Sana uygun aracı bul',aliases:['araba','oto','car','araç'],kind:'vehicle'},
  {slug:'elektronik',name:'Elektronik',icon:'▱',description:'Teknolojiyi karşılaştır',aliases:['telefon','bilgisayar','electronics'],kind:'product'},
  {slug:'beyaz-esya',name:'Beyaz eşya',icon:'▥',description:'Evin için doğru seçim',aliases:['beyaz eşya','buzdolabi','buzdolabı','appliances'],kind:'product'},
] as const;
export type Category = typeof categories[number]['slug'];
export function normalize(value:string) { return value.toLocaleLowerCase('tr-TR').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/ı/g,'i').replace(/[^a-z0-9]+/g,' ').trim(); }
export function categoryFor(value:string) { const q=normalize(value); return categories.find(c=>[c.slug,c.name,...c.aliases].some(a=>normalize(a)===q)); }
export const isProduct=(c:Category)=>['market','elektronik','beyaz-esya'].includes(c);
export const freshness:Record<Category,number>={otel:900,ucak:300,otobus:300,market:21600,otomobil:3600,elektronik:3600,'beyaz-esya':3600};
