'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Search, ArrowUpRight } from 'lucide-react';
import type { Category } from '@/lib/categories';
import { useLanguage, type Language } from './language-provider';

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

function CategoryTiles({ items, language }: { items: Category[]; language: Language }) {
  const t = labels[language];
  return <div className="home-category-grid">
    {items.map((slug) => {
      const cover = covers[slug];
      return <Link className="home-category-tile" href={`/${slug}`} key={slug}>
        <Image src={`/category-tiles/${cover.image}`} alt={cover.alt} fill sizes="(max-width: 600px) 45vw, (max-width: 1100px) 43vw, 20vw" />
        <span className="home-category-shade" />
        <span className="home-category-copy"><strong>{t.names[slug]}</strong><small>{t.compare}<ArrowUpRight size={13} aria-hidden="true" /></small></span>
      </Link>;
    })}
  </div>;
}

export function XucuzWorldHome() {
  const { language } = useLanguage();
  const t = labels[language];

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
      <CategoryTiles items={leftCategories} language={language} />
      <div className="trends-home-art home-genie-art">
        <Image className="trends-home-mascot" src="/xucuz-genie-globe.webp" alt="Dönen dünyayı parmağında çeviren Xucuz mavi cin maskotu" width={745} height={1089} priority sizes="(max-width: 760px) 68vw, 32vw" />
        <div className="trends-home-globe" aria-hidden="true" />
      </div>
      <CategoryTiles items={rightCategories} language={language} />
    </div>
  </div>;
}
