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

Node.js 24 kullanın. Demo arayüzü veritabanı olmadan da çalışır. Migration/seed komutlarına DATABASE_URL ayrıca verilir; Next.js .env.local dosyasını okur.

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

DATA_MODE=demo: tüm fiyatlar ve sağlayıcılar kurgusal, her sayfada bildirim var; arama motorlarına kapalı; gerçek satıcıya yönlendirme yok.

DATA_MODE=live: yalnızca doğrulanmış, etkin ve güncel izinli feed kayıtları. Canlı üçüncü taraf API entegrasyonu henüz yoktur. Veri yoksa demo veriye dönülmez.

## Dağıtım

Vercel: Next.js framework seçin, Node 24, build `npm run build`, bağlı dal `feat/xucuz-platform`. Demo için ek servis gerekmez; DATA_MODE=demo ve NEXT_PUBLIC_SITE_URL değerini ayarlayın. Canlı ve yönetim için PostgreSQL DATABASE_URL, ADMIN_PASSWORD_HASH, SESSION_SECRET gereklidir. Migration deploy öncesi güvenli ortamda çalıştırılır. Runtime modu sunucuda okunur.

Docker: `docker compose --profile app up -d --build`. Compose .env okur; .env.local dosyasını otomatik okumaz. Production veritabanı parolasını değiştirin. HTTPS ters proxy ve yedekleme sağlayın. Ücretli hizmet otomatik açılmaz.

Henüz hosting/DNS dağıtımı yapılmadı. İşletme unvanı, adresi, iletişim e-postası ve veri sorumlusu bilgileri yayından önce sağlanmalıdır. CONTACT_EMAIL, BUSINESS_NAME ve BUSINESS_ADDRESS sunucuda yapılandırılabilir. Gönderim servisi yokken iletişim formu başarı mesajı üretmez.

Geliştirme devam ediyor; tam kabul testlerinin nihai durumu teslim raporunda belirtilecektir.
