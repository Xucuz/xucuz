# Xucuz global trend keşfi ve SEO

## İncelenen başlangıç yapısı

- Next.js App Router, TypeScript, React 19 ve npm (`package-lock.json`).
- PostgreSQL ve Drizzle ORM. Mevcut migration zinciri `0000`–`0006`; son tablolar fiyat gözlemleri, ziyaretçi sayımı ve canlı sohbet içindir.
- `src/lib/google-trends.ts` Google Trends RSS akışlarını 16 ülke/bölgeden sunucu tarafında toplar; `/api/trends` ve `/api/trends/info` bu akışı kullanır.
- Kök uygulama düzeni `src/app/layout.tsx`; mevcut sitemap ve robots App Router metadata route'larıdır.
- Vercel bağlantısı için yerel proje ayarı/kimlik bilgileri ve Preview'a özel DB ayrımı bu çalışma alanından doğrulanamadı. Environment değerleri okunmadı veya rapora yazılmadı.

## Uygulama

- `/tr`, `/en`, `/de`, `/es` trend keşif sayfaları ve her dilde `/trends/[slug]` detay rotaları eklendi.
- Ülke, kaynak dili, yaklaşık konu grubu ve kaynak tarihine göre sunucu tarafı filtreler var. Konu grubu başlıktan türetilen yaklaşık sınıflandırmadır; kaynakta kategori yoktur.
- Google Trends ve Google News RSS verisi sunucuda alınır. Google Trends birleşik cevabı beş dakika önbelleğe alınır; bölgesel son başarılı veriler sıcak instance içinde korunur ve Next Data Cache hata anında son başarılı yanıtı sunabilir. Haber bağlantıları yalnızca HTTPS `news.google.com` adresleridir. Kaynak görseli veya haber özeti yeni sayfalara kopyalanmaz.
- Detay sayfası canlı trendi kaynağı, kaynak zamanı, yaklaşık arama ilgisi, Google News başlıkları ve aynı bölgeden ilişkili aramalarla sunar. Fiyat, olay nedeni veya AI tarafından doğrulanmamış bağlam uydurmaz.
- Trend rotaları SSR'dır. Dört dil için canonical/hreflang/x-default, Open Graph, Article JSON-LD, sitemap girdileri ve filtreli URL'ler için noindex/canonical eklendi. Robots artık filtreli URL'leri taramadan engellemiyor; bot noindex etiketini okuyabilir. `/trends` eski yolu `/tr`'ye kalıcı yönlendirilir.
- Tüm Vercel Preview dağıtımları `noindex` ve `robots.txt` `Disallow: /` ile korunur; Preview sitemap boş döner. Production indeksleme kuralları bundan etkilenmez.
- GA4 kodu yalnızca `NEXT_PUBLIC_GA_MEASUREMENT_ID` geçerli olduğunda ve CMP `xucuz_analytics=granted` çerezini yazdığında yüklenir. İzin bileşeni `xucuz:analytics-consent` olayıyla ölçümü başlatabilir. Search Console sahiplik meta etiketi `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` ile açılır.

## Veri kalıcılığı ve veritabanı güvenliği

Mevcut şemada trend arşivi yok. Preview environment listesi bu dal için DB bağlantısını doğrulamadı; Neon erişimiyle de Preview dalı/Production dalı ayrımı teyit edilemedi. Bu nedenle hiçbir bağlantı denenmedi ve hiçbir migration çalıştırılmadı. Canlı veritabanına dokunulmadı.

Mevcut trend ayrıntı URL'si terim + ülke kodundan deterministik üretildiğinden aynı terim sonraki akışlarda görünürse URL değişmez. Ancak Google Trends kaynak akışı tarihsel arşiv sağlamadığından, trend listeden düştüğünde eski detay URL'si kalıcı arşiv garantisi vermez. Kalıcı tarihçe için daha sonra şu güvenli plan izlenmelidir:

1. Neon'da Preview ve Production branch kimliklerini sağlayıcı panelinden doğrulayın; Vercel Preview `DATABASE_URL` değerinin Preview branch endpoint'ine, Production değerinin ayrı Production endpoint'ine işaret ettiğini değerleri ifşa etmeden doğrulayın.
2. Hukuk/lisans incelemesinden sonra yalnızca arama terimi, ülke, dil, kaynak URL'si ve ilk/son görülme zamanını tutan ayrı `trend_snapshots` tablosu için geriye uyumlu migration tasarlayın. Haber metni/görseli veya gereksiz kişisel veri saklamayın.
3. Önce yedek/branch restore planı hazırlayın; migration'ı yalnızca doğrulanmış Preview branch'e uygulayıp geri alma yolunu test edin. Production için ayrı onay ve ayrı değişiklik gerekir.

Bu aşamada DB migration dosyası oluşturulmamış; bu bilinçli olarak veritabanı değiştirmeme kuralını korur.

## Environment değişkenleri

- Mevcut: `NEXT_PUBLIC_SITE_URL` (canonical host; prod URL'den farklı Preview için ayarlanabilir).
- İsteğe bağlı ölçüm: `NEXT_PUBLIC_GA_MEASUREMENT_ID` (GA4 `G-...`; değer verilmediyse ölçüm yoktur).
- İsteğe bağlı doğrulama: `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` (Search Console doğrulama token'ı).
- Trend sayfası için API anahtarı veya yeni veritabanı değişkeni gerekmez.

Google Trends/News RSS erişimi kaynak sağlayıcı koşullarına ve erişilebilirliğine bağlıdır. Bu akış arşiv, kapsamlı haber lisansı veya ticari trend API'si garantisi değildir. Kurumsal/tarihsel kullanım için Google'ın güncel kullanım koşulları ve gerekiyorsa yetkili bir veri sağlayıcısı ayrıca incelenmelidir.
