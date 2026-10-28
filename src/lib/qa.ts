import {findGuides,guides} from './guides';
import {normalize} from './categories';
import {buildProductGuide} from './products/guide';
import {products,searchProducts} from './products';

export type QaReply={text:string;href?:string;label?:string};

const stopWords=new Set(['bir','ve','ile','icin','için','nasil','nasıl','ne','nedir','mi','mu','da','de','bu','ben','bana','the','veya','alirken','alırken','yarin','hava','olacak','secerken','seçerken','nelere','bakmaliyim','bakmalıyım','neye']);

function terms(value:string){return normalize(value).split(' ').filter(word=>word.length>2&&!stopWords.has(word));}

export function answerQuestion(question:string):QaReply{
 const q=normalize(question.slice(0,300));
 if(!q)return {text:'Bir soru yazarsan yardımcı olayım. Örneğin: “Birim fiyatı nasıl karşılaştırırım?”'};
 if(/insan|temsilci|canli gorus|canli destek/.test(q))return {text:'Bu pencere otomatik rehber yanıtları verir; şu anda insan temsilciye bağlı değil. Bize yazmak için İletişim sayfasını kullanabilirsin.',href:'/iletisim',label:'İletişim sayfası'};
 if(/fiyat|teklif|en ucuz|kampanya|indirim kodu|kupon/.test(q)){
  if(/birim fiyat|kg fiyat|litre fiyat|gramaj|kilo fiyat/.test(q))return {text:'Birim fiyat için ürünün fiyatını net miktarına böl: örneğin 500 g ürünün fiyatını 0,5 kg’a bölerek TL/kg değerini bul. Aynı ürün türü ve aynı ölçü birimini karşılaştır; üyelik, çoklu alım ve teslimat koşullarını ayrıca kontrol et.',href:'/birim-fiyat',label:'Birim fiyat aracını aç'};
  if(/indirim|kampanya|kupon|promosyon/.test(q))return {text:'Doğrulanmamış indirim kodu veya mağaza kampanyası paylaşmıyorum. Kampanyada hangi ürüne indirim uygulandığını, adet sınırını, üyelik şartını ve sepet sonundaki zorunlu ücretleri kontrol et. Yüzdenin gerçek etkisini örneklerle inceleyebilirsin.',href:'/rehberler/kampanyanin-gercek-indirimini-hesapla',label:'İndirim rehberini aç'};
  return {text:'Bu sohbet güncel fiyat kaynağı değildir; canlı fiyat uydurmaz. Bir teklif gösteriliyorsa kaynağını, güncellenme zamanını, para birimini ve bilinen ek ücretleri teklif kartında kontrol et. Kaynağı olmayan ya da eski görünen fiyatı güncel kabul etme.',href:'/veri-kaynaklari',label:'Veri kaynaklarını gör'};
 }
 if(/toplam maliyet|gercek maliyet|gerçek maliyet|kargo|teslimat|zorunlu ucret|zorunlu ücret/.test(q))return {text:'Gerçek maliyet için ürün bedeline bilinen kargo, teslimat ve zorunlu ücretleri ekle. Bir ücret bilinmiyorsa sıfır sayma; toplamın eksik olabileceğini not et. Üyelik, çoklu alım ve taksit koşullarını da ayrı değerlendir.',href:'/birim-fiyat',label:'Maliyet araçlarını gör'};

 const words=terms(question);
 const ranked=guides.map(guide=>{
  const haystack=new Set(normalize([guide.title,guide.summary,guide.category,...guide.tags,...guide.sections.flatMap(section=>[section.title,section.text,...section.points])].join(' ')).split(' '));
  const score=words.reduce((sum,word)=>sum+(haystack.has(word)?1:0),0);
  return {guide,score};
 }).sort((a,b)=>b.score-a.score);
 const best=ranked[0];
 if(best&&best.score>0){
  const guide=findGuides(best.guide.title)[0]??best.guide;
  return {text:`${guide.summary} ${guide.sections[0]?.points[0]??''}`.trim(),href:`/rehberler/${guide.slug}`,label:'İlgili alışveriş rehberini aç'};
 }
 const productTokens=new Set(words);
 const directProduct=products.filter(product=>normalize(product.name).split(' ').some(word=>productTokens.has(word))).sort((a,b)=>{
  const aExact=q.includes(normalize(a.name))?1:0,bExact=q.includes(normalize(b.name))?1:0;
  const aKind=a.kind==='type'?0:1,bKind=b.kind==='type'?0:1;
  return bExact-aExact||aKind-bKind||normalize(b.name).length-normalize(a.name).length;
 })[0];
 const aliasProduct=directProduct?undefined:words.map(word=>searchProducts(word,8).find(product=>product.kind==='type')).find(Boolean);
 const product=directProduct??aliasProduct;
 if(product){
  const guide=buildProductGuide(product);
  return {text:`${product.name} için başlangıç noktası: ${guide.usage} Kontrol etmen gerekenler: ${guide.criteria.join('; ')}. Ek maliyetlerde ${guide.costs.slice(0,2).join(' ve ').toLocaleLowerCase('tr-TR')} kalemlerini de hesaba kat. Bu rehber belirli bir marka/model için satın alma tavsiyesi veya fiyat teklifi değildir.`,href:`/urunler/${product.id}`,label:`${product.name} rehberini aç`};
 }
 if(/otel|hotel|ucak|uçak|otobus|otobüs|araba|otomobil|elektronik|market|cicek|çiçek/.test(q))return {text:'Kategoriye göre arama yapabilirsin. Gösterilen tekliflerde fiyatın yanında sağlayıcıyı, güncellenme zamanını ve koşulları kontrol et; bu pencerede canlı fiyat sorgusu yapılmıyor.',href:'/',label:'Kategorileri gör'};
 return {text:'Bu soruya şu an güvenilir bir yanıtım yok. Ürün seçimi, birim fiyat, kampanya hesabı ve toplam maliyet konularında yardımcı olabilirim. Sorunu bu başlıklardan biriyle daraltabilir ya da bize yazabilirsin.',href:'/iletisim',label:'İletişim sayfası'};
}
