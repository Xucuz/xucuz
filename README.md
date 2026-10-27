# Xucuz.com — Almadan önce gerçek maliyeti öğren

Logo tamamlayıcısı: **Etikete değil, gerçek maliyete bak.**

Güncel ana sayfa üç ücretsiz ve üyelik gerektirmeyen hesaplama aracı sunar:

- `/birim-fiyat`: paket toplamı, gram/kg, ml/litre ve adet üzerinden birim maliyet karşılaştırması.
- `/indirim-hesapla`: N al M öde, ikinci ürüne indirim, yüzde indirimi ardından kupon.
- `/taksit-mi-pesin-mi`: peşin fiyat ve taksit toplamı; ek ücret açıkça girilir.

Araçlar mağazalardan fiyat çekmez; kullanıcının kendi girdileriyle tarayıcıda hesaplar. Fiyatlar boş başlar. Doğrulama ve hesaplar `src/lib/calculators/index.ts` içindedir. Paylaşılabilir URL'ler tutarları içerir, indekslenmez ve bağlantı açıldığında teknik sunucu kayıtlarına girebilir. Gizli bilgi girilmemelidir. Kurulum için Node 24, `npm ci`, `npm run dev`; araçlar veritabanı veya satıcı servisi gerektirmez.

## Önceki fiyat karşılaştırma altyapısı

Aşağıdaki kurulum ve adaptör belgeleri geçmiş kapsam içindir. Gerçek fiyat karşılaştırmasının tamamlandığı iddia edilmez; ana hizmet artık hesaplama araçlarıdır.

> **İlk yayın kapsamı:** Elektronik ve beyaz eşya. Gerçek fiyat kaynakları henüz hazır değil; site hazırlık durumunu açıkça gösterir. Diğer kategoriler canlı aramaya kapalıdır. Yerel demo ve eski kategori sözleşmeleri geliştirme/test için korunur. [Yayın kapsamı ve kabul ölçütleri](docs/LAUNCH-SCOPE.md).

# xucuz

Türkçe, mobil öncelikli fiyat karşılaştırma sitesi. Next.js 16, React 19, TypeScript, Tailwind 4, PostgreSQL 17, Drizzle, Zod, Vitest, Playwright.

## Yerel başlangıç

```bash
npm ci
cp .env.example .env.local
docker compose up -d db
DATABASE_URL=postgres://xucuz:local-development-only@localhost:5432/xucuz npm run db:migrate
DATABASE_URL=postgres://xucuz:local-development-only@localhost:5432/xucuz npm run db:seed
npm run dev
```

Node.js 24 kullanın. Veri kaynağı olmayan canlı arayüz veritabanı olmadan da açılır; teklif göstermez. Yerel demo için ayrıca DATA_MODE=demo seçilmelidir. Migration/seed komutlarına DATABASE_URL ayrıca verilir; Next.js .env.local dosyasını okur.

## Test

```bash
npm run lint
npm run typecheck
npm test
npm run build
npx playwright install --with-deps chromium
npm run test:e2e
```

## Yönetim

Varsayılan hesap yoktur. `npm run admin:hash -- 'en-az-14-karakter-parola'` ile özet oluşturun, ADMIN_PASSWORD_HASH olarak saklayın. SESSION_SECRET için `openssl rand -hex 32` kullanın. Değerleri Git'e eklemeyin. /admin paneli izinli CSV/JSON aktarımı, sağlayıcı etkinleştirme ve doğrulama raporlarını içerir. Production yönetici çerezi HTTPS gerektirir.

## Veri modu

Yalnızca yerel geliştirmede DATA_MODE=demo: tüm fiyatlar ve sağlayıcılar kurgusal, her sayfada bildirim var; arama motorlarına kapalı; gerçek satıcıya yönlendirme yok.

DATA_MODE=live: yalnızca doğrulanmış, etkin ve güncel izinli feed kayıtları. Canlı üçüncü taraf API entegrasyonu henüz yoktur. Veri yoksa demo veriye dönülmez.

## Dağıtım

Vercel: Next.js framework seçin, Node 24, build `npm run build`, bağlı dal `feat/xucuz-platform`. Vercel her zaman canlı mod kullanır; NEXT_PUBLIC_SITE_URL değerini ayarlayın. Veri kaynağı yoksa boş durum gösterilir. Canlı ve yönetim için PostgreSQL DATABASE_URL, ADMIN_PASSWORD_HASH, SESSION_SECRET gereklidir. Migration deploy öncesi güvenli ortamda çalıştırılır. Runtime modu sunucuda okunur.

Docker: `docker compose --profile app up -d --build`. Compose .env okur; .env.local dosyasını otomatik okumaz. Production veritabanı parolasını değiştirin. HTTPS ters proxy ve yedekleme sağlayın. Ücretli hizmet otomatik açılmaz.

Henüz hosting/DNS dağıtımı yapılmadı. İşletme unvanı, adresi, iletişim e-postası ve veri sorumlusu bilgileri yayından önce sağlanmalıdır. CONTACT_EMAIL, BUSINESS_NAME ve BUSINESS_ADDRESS sunucuda yapılandırılabilir. Gönderim servisi yokken iletişim formu başarı mesajı üretmez.

Doğrulama: lint, tip kontrolü, 21 birim/PostgreSQL testi, 14 masaüstü/mobil Playwright testi ve production build geçti. GitHub Actions aynı kontrolleri çalıştırır. Vercel önizlemesi oturum korumalıdır; detaylı sonuçlar docs/VALIDATION.md dosyasında.

Veri kaynağı sözleşmesi: [docs/PROVIDERS.md](docs/PROVIDERS.md). Yayına hazırlık ve Vercel 404 ayarları: [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md). Doğrulama sonuçları: [docs/VALIDATION.md](docs/VALIDATION.md).

PostgreSQL entegrasyon testi için `DATABASE_URL=... npm test`. URL yoksa veritabanı testi açıkça atlanır. Fiyat geçmişi yalnızca kaydedilmiş gözlemlerden oluşur; demo seed geçmiş üretmez. Cache ve istek limiti tek süreçte çalışır; çoklu replica için paylaşımlı limit/cache veya edge limiti gerekir.

Yerel demo kapsamındaki çiçek kategorisi: `/cicek` (canlı ilk yayında sunulmaz). Tür, adet, teslimat şehri/ilçesi ve zamanı filtreleri, teslimat dahil fiyat sıralaması ve yan yana buket karşılaştırması. Farklı adet/içerik/vazo koşulları ayrı kalır. Demo fiyatlar gerçek çiçekçi teklifi değildir.

## Güncel yayın politikası: yalnızca gerçek fiyat

Varsayılan DATA_MODE=live. Vercel üzerinde eski DATA_MODE=demo ayarı bulunsa bile yalnızca canlı mod çalışır. Doğrulanmış kaynak bağlı değilse teklif yoktur; örnek fiyat üretilmez. Eski demo favorileri ve karşılaştırma kayıtları canlı modda gösterilmez. Demo yalnızca yerel geliştirme/test için açıkça DATA_MODE=demo seçilerek kullanılabilir. Playwright iki ayrı sunucuda yerel demo ve Vercel canlı davranışını test eder. Kaynak araştırması ve gerekli erişimler: [docs/LIVE-SOURCES.md](docs/LIVE-SOURCES.md).

## API kullanmadan fiyat okuma

Seçili sıradan HTML ürün sayfaları için robots kurallarını izleyen toplayıcı eklendi. Geçmişte Çiçek Market’ten iki farklı buketin özgün gözlemleri yayımlandı; bu kayıtlar güncel fiyat değildir. Yeniden yayın incelemesi tamamlanmış aktif kaynak bulunmadığından gerçek fiyatlar şu anda yayımlanmıyor; çok satıcılı karşılaştırma henüz tamamlanmadı. GitHub saatlik işi mevcut, ancak kaynaklar otomatik sunucudan erişimi reddettiği için düzenli otomatik yenileme çalışıyor sayılmaz. Taze olmayan fiyatlar gizlenir. [Kapsam ve sonuçlar](docs/PUBLIC-PRICES.md).

## Satıcıdan veri beklemeyen çalışma modeli

Satıcıların fiyat göndermesi veya panel kullanması işletim ön koşulu değildir. İncelenen herkese açık sayfalar birinci veri kaynağıdır. `npm run sources:probe` yeni kaynak adaylarının robots ve normal HTML erişimini düşük hızda denetler; aday bulmak çalışan entegrasyon sayılmaz ve probe hiçbir fiyat yayımlamaz. GitHub Public source discovery işi aynı denetimi üretimde kullanılan otomatik sunucu üzerinden yapar. Rapor price-data dalında source-probes.json dosyasına yazılır. Mevcut fiyat snapshot’ı bu iş tarafından değiştirilmez. Ürün kimliği/koşullar/varyant/fiyat doğrulaması tamamlanmadan aday site aktif kataloğa alınmaz.
