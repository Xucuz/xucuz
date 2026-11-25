'use client';

import Image from 'next/image';
import { Search, ArrowUpRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { Category } from '@/lib/categories';
import { useLanguage, type Language } from './language-provider';

type Deal = { id:string; title:string; category:Category; source:string; item_price:number; shipping_cost:number|null; total_price:number; discount_percent:number|null; url:string; updated_at:string; currency:'TRY'|'EUR'|'USD' };
type DealsResponse = { items:Deal[]; total_count:number };

const covers: Record<Category, { image: string; alt: string }> = {
  otel: { image: 'hotel.webp', alt: 'Havuzlu otel ve tatil konaklaması' },
  ucak: { image: 'flight.webp', alt: 'Bulutların üzerinde uçak kanadı' },
  otobus: { image: 'bus.webp', alt: 'Şehirler arası yolcu otobüsü' },
  market: { image: 'market.webp', alt: 'Taze meyve ve sebzeler' },
  otomobil: { image: 'car.webp', alt: 'Otomobil' },
  elektronik: { image: 'electronics.webp', alt: 'Elektronik devre kartı' },
  'beyaz-esya': { image: 'appliances.webp', alt: 'Ev tipi beyaz eşyalar' },
  cicek: { image: 'flowers.webp', alt: 'Renkli çiçekler' },
};

const labels: Record<Language, { placeholder: string; search: string; section: string; note: string; compare: string; names: Record<Category, string> }> = {
  tr: { placeholder: 'En ucuz ne arıyorsun?', search: 'Ara', section: 'Günün en ucuz ürünleri', note: 'Kategori seçip ara; doğrulanmış fiyat yoksa sonuç uydurulmaz.', compare: 'Fiyatları karşılaştır', names: { otel: 'Otel & konaklama', ucak: 'Uçak bileti', otobus: 'Otobüs bileti', market: 'Market', otomobil: 'Otomobil', elektronik: 'Elektronik', 'beyaz-esya': 'Beyaz eşya', cicek: 'Çiçek' } },
  en: { placeholder: 'What are you looking for?', search: 'Search', section: "Today's lowest prices", note: 'Choose a category to explore current, source-verified results.', compare: 'Compare prices', names: { otel: 'Hotels', ucak: 'Flights', otobus: 'Bus tickets', market: 'Groceries', otomobil: 'Cars', elektronik: 'Electronics', 'beyaz-esya': 'Home appliances', cicek: 'Flowers' } },
  de: { placeholder: 'Wonach suchst du zum besten Preis?', search: 'Suchen', section: 'Die besten Preise des Tages', note: 'Wähle eine Kategorie und entdecke aktuelle, geprüfte Quellen.', compare: 'Preise vergleichen', names: { otel: 'Hotels', ucak: 'Flüge', otobus: 'Bustickets', market: 'Lebensmittel', otomobil: 'Autos', elektronik: 'Elektronik', 'beyaz-esya': 'Haushaltsgeräte', cicek: 'Blumen' } },
  es: { placeholder: '¿Qué buscas al mejor precio?', search: 'Buscar', section: 'Los mejores precios de hoy', note: 'Elige una categoría para ver resultados actuales con fuentes verificadas.', compare: 'Comparar precios', names: { otel: 'Hoteles', ucak: 'Vuelos', otobus: 'Billetes de autobús', market: 'Supermercado', otomobil: 'Automóviles', elektronik: 'Electrónica', 'beyaz-esya': 'Electrodomésticos', cicek: 'Flores' } },
  ru: { placeholder: 'Что вы ищете по лучшей цене?', search: 'Найти', section: 'Лучшие цены сегодня', note: 'Выберите категорию, чтобы посмотреть актуальные предложения из проверенных источников.', compare: 'Сравнить цены', names: { otel: 'Отели', ucak: 'Авиабилеты', otobus: 'Автобусные билеты', market: 'Продукты', otomobil: 'Автомобили', elektronik: 'Электроника', 'beyaz-esya': 'Бытовая техника', cicek: 'Цветы' } },
  fr: { placeholder: 'Que cherchez-vous au meilleur prix ?', search: 'Rechercher', section: 'Les meilleurs prix du jour', note: 'Choisissez une catégorie pour consulter les résultats vérifiés et à jour.', compare: 'Comparer les prix', names: { otel: 'Hôtels', ucak: 'Vols', otobus: 'Billets de bus', market: 'Épicerie', otomobil: 'Automobile', elektronik: 'Électronique', 'beyaz-esya': 'Électroménager', cicek: 'Fleurs' } },
  ar: { placeholder: 'ما الذي تبحث عنه بأفضل سعر؟', search: 'ابحث', section: 'أفضل أسعار اليوم', note: 'اختر فئة للاطلاع على نتائج حديثة من مصادر موثوقة.', compare: 'قارن الأسعار', names: { otel: 'الفنادق', ucak: 'تذاكر الطيران', otobus: 'تذاكر الحافلات', market: 'البقالة', otomobil: 'السيارات', elektronik: 'الإلكترونيات', 'beyaz-esya': 'الأجهزة المنزلية', cicek: 'الزهور' } },
  zh: { placeholder: '你想找什么优惠商品？', search: '搜索', section: '今日精选价格', note: '选择一个类别，查看来自已验证来源的最新结果。', compare: '比较价格', names: { otel: '酒店住宿', ucak: '机票', otobus: '汽车票', market: '超市', otomobil: '汽车', elektronik: '电子产品', 'beyaz-esya': '家用电器', cicek: '鲜花' } },
};

const leftCategories: Category[] = ['elektronik', 'beyaz-esya', 'market', 'cicek'];
const rightCategories: Category[] = ['otel', 'ucak', 'otobus', 'otomobil'];
const dealMessages:Record<Language,{loading:string;emptyAll:string;emptyCategory:string;unavailable:string;all:string;verified:string}>={
 tr:{loading:'Doğrulanmış fiyatlar getiriliyor...',emptyAll:'Şu an doğrulanmış güncel fiyat bulunmuyor.',emptyCategory:'Bu kategori için şu an doğrulanmış güncel fiyat bulunmuyor.',unavailable:'Fiyat servisine şu an ulaşılamıyor.',all:'Tüm kategoriler',verified:'Yalnızca doğrulanmış kayıtlar'},
 en:{loading:'Loading verified prices...',emptyAll:'No current verified prices are available right now.',emptyCategory:'No current verified prices are available for this category.',unavailable:'The price service is temporarily unavailable.',all:'All categories',verified:'Verified records only'},
 de:{loading:'Geprüfte Preise werden geladen...',emptyAll:'Derzeit sind keine aktuellen geprüften Preise verfügbar.',emptyCategory:'Für diese Kategorie sind derzeit keine aktuellen geprüften Preise verfügbar.',unavailable:'Der Preisservice ist momentan nicht erreichbar.',all:'Alle Kategorien',verified:'Nur geprüfte Einträge'},
 es:{loading:'Cargando precios verificados...',emptyAll:'Ahora no hay precios verificados y actuales.',emptyCategory:'No hay precios verificados actuales para esta categoría.',unavailable:'El servicio de precios no está disponible temporalmente.',all:'Todas las categorías',verified:'Solo registros verificados'},
 ru:{loading:'Загружаем проверенные цены...',emptyAll:'Сейчас нет актуальных проверенных цен.',emptyCategory:'Для этой категории сейчас нет актуальных проверенных цен.',unavailable:'Сервис цен временно недоступен.',all:'Все категории',verified:'Только проверенные записи'},
 fr:{loading:'Chargement des prix vérifiés...',emptyAll:'Aucun prix vérifié et récent n’est disponible pour le moment.',emptyCategory:'Aucun prix vérifié récent pour cette catégorie.',unavailable:'Le service de prix est temporairement indisponible.',all:'Toutes les catégories',verified:'Entrées vérifiées uniquement'},
 ar:{loading:'جارٍ تحميل الأسعار الموثقة...',emptyAll:'لا توجد أسعار حديثة موثقة حاليًا.',emptyCategory:'لا توجد أسعار حديثة موثقة لهذه الفئة حاليًا.',unavailable:'خدمة الأسعار غير متاحة مؤقتًا.',all:'كل الفئات',verified:'السجلات الموثقة فقط'},
 zh:{loading:'正在加载已验证价格…',emptyAll:'目前没有可用的最新验证价格。',emptyCategory:'此类别目前没有可用的最新验证价格。',unavailable:'价格服务暂时不可用。',all:'所有类别',verified:'仅显示已验证记录'},
};

function CategoryTiles({ items, language, selected, onSelect }: { items: Category[]; language: Language; selected:Category|null; onSelect:(category:Category)=>void }) {
  const t = labels[language];
  return <div className="home-category-grid">
    {items.map((slug) => {
      const cover = covers[slug];
      return <button className="home-category-tile" type="button" data-category={slug} aria-pressed={selected===slug} key={slug} onClick={()=>onSelect(slug)}>
        <Image src={`/category-tiles/${cover.image}`} alt={cover.alt} fill sizes="(max-width: 600px) 45vw, (max-width: 1100px) 43vw, 20vw" />
        <span className="home-category-shade" />
        <span className="home-category-copy"><strong>{t.names[slug]}</strong><small>{t.compare}<ArrowUpRight size={13} aria-hidden="true" /></small></span>
      </button>;
    })}
  </div>;
}

export function XucuzWorldHome() {
  const { language } = useLanguage();
  const t = labels[language];
  const [selectedCategory,setSelectedCategory]=useState<Category|null>(null);
  const [deals,setDeals]=useState<Deal[]>([]);
  const [dealStatus,setDealStatus]=useState(dealMessages[language].loading);
  const [dealsLoading,setDealsLoading]=useState(true);
  const messages=dealMessages[language];

  useEffect(()=>{
    const controller=new AbortController();
    const params=new URLSearchParams({limit:'8',include_shipping:'true'});
    if(selectedCategory)params.set('category',selectedCategory);
    fetch(`/api/v1/deals/today?${params.toString()}`,{signal:controller.signal})
      .then(async response=>{
        if(!response.ok)throw new Error('deals unavailable');
        return await response.json() as DealsResponse;
      })
      .then(data=>{
        const safeItems=(Array.isArray(data.items)?data.items:[]).filter(item=>{try{return typeof item.url==='string'&&new URL(item.url).protocol==='https:';}catch{return false;}});
        setDeals(safeItems);
        setDealStatus(safeItems.length?'':selectedCategory?messages.emptyCategory:messages.emptyAll);
        setDealsLoading(false);
      })
      .catch(error=>{if(error instanceof Error&&error.name==='AbortError')return;setDealStatus(messages.unavailable);setDealsLoading(false);});
    return ()=>controller.abort();
  },[selectedCategory,messages]);

  function selectCategory(category:Category){setDealsLoading(true);setDealStatus(messages.loading);setDeals([]);setSelectedCategory(category);}
  function formatPrice(value:number,currency:Deal['currency']){return new Intl.NumberFormat(language==='tr'?'tr-TR':language,{style:'currency',currency,maximumFractionDigits:2}).format(value);}

  return <div className="trends-home home-market-home">
    <h1 className="trends-home-sr-only">{t.section} · Xucuz</h1>
    <form className="home-product-search" action="/ara" method="get" role="search">
      <Search size={23} aria-hidden="true" />
      <input aria-label={t.placeholder} name="q" type="search" maxLength={120} placeholder={t.placeholder} autoComplete="off" required />
      <button type="submit">{t.search}<Search size={17} aria-hidden="true" /></button>
    </form>

    <header className="home-market-heading">
      <h2>{t.section}</h2>
      <p>{t.note}</p>
    </header>

    <div className="home-market-stage">
      <CategoryTiles items={leftCategories} language={language} selected={selectedCategory} onSelect={selectCategory} />
      <div className="trends-home-art home-genie-art">
        <Image className="trends-home-mascot" src="/xucuz-genie-globe.webp" alt="Dönen dünyayı parmağında çeviren Xucuz mavi cin maskotu" width={745} height={1089} priority sizes="(max-width: 760px) 68vw, 32vw" />
        <div className="trends-home-globe" aria-hidden="true" />
      </div>
      <CategoryTiles items={rightCategories} language={language} selected={selectedCategory} onSelect={selectCategory} />
    </div>

    <section className="home-deals" aria-live="polite" aria-busy={dealsLoading}>
      <div className="home-deals-heading"><h2>{t.section}</h2><p>{selectedCategory?t.names[selectedCategory]:messages.all} · {messages.verified}</p></div>
      {dealStatus&&<p className="home-deals-status" role="status">{dealStatus}</p>}
      {deals.length>0&&<div className="home-deals-grid">{deals.map(item=><article className="home-deal-card" key={item.id}>
        <span>{t.names[item.category]}</span><h3>{item.title}</h3><p>Kaynak: {item.source}</p>
        <strong>{formatPrice(item.total_price,item.currency)}</strong>
        {item.discount_percent!==null&&item.discount_percent>0&&<small>%{item.discount_percent} indirim</small>}
        <a href={item.url} target="_blank" rel="noopener noreferrer">İncele <ArrowUpRight size={14} aria-hidden="true"/></a>
      </article>)}</div>}
    </section>
  </div>;
}
