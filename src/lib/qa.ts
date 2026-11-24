import {findGuides,guides} from './guides';
import {normalize} from './categories';
import {buildProductGuide} from './products/guide';
import {products,searchProducts} from './products';

export type QaReply={text:string;href?:string;label?:string};

const stopWords=new Set(['bir','ve','ile','icin','için','nasil','nasıl','ne','nedir','mi','mu','da','de','bu','ben','bana','the','veya','alirken','alırken','yarin','hava','olacak','secerken','seçerken','nelere','bakmaliyim','bakmalıyım','neye']);

function terms(value:string){return normalize(value).split(' ').filter(word=>word.length>2&&!stopWords.has(word));}

export function answerQuestion(question:string,language:'tr'|'en'|'de'|'es'|'ru'|'fr'|'ar'|'zh'='tr'):QaReply{
 if(language==='en'){
  const q=question.toLocaleLowerCase('en-US');
  if(/unit price|per kg|per litre|per liter|gram|quantity/.test(q))return {text:'Divide the total pack price by its net quantity, then convert grams or millilitres to kilograms or litres. Compare like-for-like products and check multipack terms separately. I do not fetch live store prices.',href:'/birim-fiyat',label:'Open unit price calculator'};
  if(/price|cheapest|offer|deal|store|observation/.test(q))return {text:'Xucuz shows only recent community price observations with evidence that have been reviewed by a moderator. They are not live store offers; check the store, location and observed date. If no result appears, there is no current approved observation. I never invent a price.',href:'/fiyatlar',label:'Search price observations'};
  return {text:'I can help with unit price, total cost and product-selection guides. The detailed shopping guides are currently in Turkish. I do not provide live prices or human support.',href:'/rehberler',label:'Browse shopping guides'};
 }
 if(language==='ru'){
  const q=question.toLocaleLowerCase('ru-RU');
  if(/цена за|кг|литр|грамм|количеств/.test(q))return {text:'Разделите цену всей упаковки на её массу или объём. Переведите граммы в килограммы, а миллилитры в литры; условия нескольких упаковок учитывайте отдельно. Актуальные цены магазинов я не получаю.',href:'/birim-fiyat',label:'Открыть расчёт цены за единицу'};
  if(/цен|дешев|предложен|магазин|наблюден/.test(q))return {text:'Xucuz показывает только свежие наблюдения сообщества с фото, проверенные модератором. Это не актуальное предложение магазина: проверьте магазин, регион и дату наблюдения. Если результата нет, одобренного наблюдения сейчас нет. Я не придумываю цены.',href:'/fiyatlar',label:'Искать наблюдения цен'};
  return {text:'Я могу помочь с ценой за единицу, полной стоимостью и руководствами по выбору товара. Подробные руководства пока доступны на турецком. Актуальные цены и человеческая поддержка здесь недоступны.',href:'/rehberler',label:'Открыть руководства'};
 }
 if(language==='de'||language==='es'||language==='fr'||language==='ar'||language==='zh'){
  const q=question.toLocaleLowerCase(language==='ar'?'ar':language==='zh'?'zh-CN':language);
  const unitIntent=/unit price|per kg|per litre|per liter|gram|quantity|einheitspreis|kilopreis|precio por unidad|precio por kilo|prix au kilo|prix unitaire|سعر الوحدة|سعر الكيلو|单位价格|每公斤|每升/i.test(q);
  const priceIntent=/price|preis|precio|prix|سعر|价格|cheapest|günstig|barato|moins cher|أرخص|便宜|fiyat|цен/i.test(q);
  const replies={
   de:{unit:'Teilen Sie den Packungspreis durch die Nettomenge und vergleichen Sie dieselbe Einheit. Ich rufe keine Live-Preise von Geschäften ab.',price:'Xucuz zeigt nur aktuelle, von Moderatoren geprüfte Preisbeobachtungen mit Belegfoto. Das sind keine Live-Angebote. Ohne bestätigten Datenbankeintrag nenne ich keinen Preis.',other:'Ich kann bei Preisbeobachtungen, Stückpreisen und Einkaufsratgebern helfen. Preise werden nicht erfunden.'},
   es:{unit:'Divide el precio del paquete por su cantidad neta y compara la misma unidad. No consulto precios de tiendas en tiempo real.',price:'Xucuz muestra únicamente observaciones de precios actuales con foto y aprobación de moderación. No son ofertas en tiempo real. Sin un registro verificado no doy un precio.',other:'Puedo ayudar con observaciones de precios, precios por unidad y guías de compra. No invento precios.'},
   fr:{unit:'Divisez le prix du paquet par sa quantité nette et comparez la même unité. Je ne consulte pas les prix des magasins en direct.',price:'Xucuz affiche uniquement des observations de prix récentes, accompagnées d’une photo et validées par un modérateur. Sans donnée vérifiée, je ne donne pas de prix.',other:'Je peux aider avec les observations de prix, le prix unitaire et les guides d’achat. Je n’invente pas de prix.'},
   ar:{unit:'اقسم سعر العبوة على الكمية الصافية وقارن الوحدة نفسها. لا أسترجع أسعار المتاجر مباشرة.',price:'تعرض Xucuz ملاحظات الأسعار الحديثة التي تتضمن صورة وتمت مراجعتها من المشرفين فقط. من دون سجل موثّق لن أذكر سعرًا.',other:'يمكنني المساعدة في ملاحظات الأسعار وسعر الوحدة وأدلة التسوق. لا أخمّن الأسعار.'},
   zh:{unit:'用包装总价除以净含量，并按相同计量单位比较。我不会查询商家的实时价格。',price:'Xucuz 只展示近期、有照片且经管理员审核的价格记录。没有已验证的数据库记录时，我不会提供价格。',other:'我可以帮助查看价格记录、单位价格和购物指南，不会编造价格。'},
  };
  const copy=replies[language];
  return {text:unitIntent?copy.unit:priceIntent?copy.price:copy.other,href:unitIntent?'/birim-fiyat':'/fiyatlar',label:unitIntent?'Open calculator':'View price observations'};
 }
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
