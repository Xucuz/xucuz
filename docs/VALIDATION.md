# Doğrulama raporu

2026-10-27, Node 24.19.0, Next 16.4.3, PostgreSQL 17 Docker.

- `npm run lint`: geçti.
- `npm run typecheck`: geçti.
- `DATABASE_URL=... npm test`: 21 test geçti; PostgreSQL transaction, kaynak etkinleştirme ve gerçek gözlem kaydı dahil.
- `npm run build`: production build geçti.
- `npm run db:migrate`, `npm run db:seed`: gerçek PostgreSQL konteynerinde geçti.
- Playwright Chromium: masaüstü ve 390 px mobilde 14/14 kabul testi geçti. Ana sayfa/yedi kategori, yatay taşma, hotel alias, URL durumu, elektronik arama, favori kalıcılığı, karşılaştırma, mobil filtre, sonuçsuz durum, yetkisiz yönetim API'leri, demo yönlendirme yasağı, fiyat toplamı, robots/noindex ve iletişim durumu doğrulandı.
- Canlı mod ayrı production HTTP sunucusunda yedi kategoriyle kontrol edildi: sıfır teklif, açıklayıcı boş durum, demo veriye dönüş yok.
- Masaüstü ana sayfa ve mobil sonuç sayfası ekran görüntüleri görsel olarak incelendi.
- Vercel ilk deploy Ready olsa da kullanıcı 404 bildirdi. `vercel.json` ile Next.js framework ve .next çıktı ayarı açıkça tanımlandı. `fc9ed05` commit'i Vercel status kontrolünde success oldu. Preview Vercel Authentication koruması nedeniyle dışarıdan sayfa HTML'ine erişim giriş ekranına yönleniyor; uzak arayüzün açıldığı bağımsız doğrulanmadı.

Canlı üçüncü taraf API'leri, gerçek ticari teklifler, satın alma/rezervasyon akışı, gerçek DNS/HTTPS alan adı ve işletmeye özgü hukuki bilgiler test edilmiş / teslim edilmiş değildir. Bunlar yapılandırılmış erişimler gerektirir. Demo gerçek fiyat değildir.

Başlangıç Turbopack build'i sandbox port bağlama kısıtı nedeniyle durdu; izinli ağ yürütmesinde başarılı build alındı. Başlangıçta yakalanan oturum imza biçimi ve boş maksimum fiyat filtresi hataları düzeltildi; testleri eklendi. Başarısız ilk denemeler nihai başarılı test sonucu yerine kullanılmadı.

## Çiçek kategorisi güncellemesi

Sekizinci kategori eklendi. Lint, tip kontrolü, production build ve çiçek kategorisi migration'ı geçti. 24 birim/PostgreSQL testi ve 16 masaüstü/mobil Playwright testi geçti. Çiçek türü/adedi, teslimat bölgesi/zamanı, teslimat dahil fiyat, farklı buket varyantlarının ayrımı ve yan yana karşılaştırma doğrulandı. Gerçek çiçekçi entegrasyonu yok; fiyatlar demodur.

## Yayında demo fiyatların kaldırılması

Kullanıcı gerçek fiyat istediği ve henüz sağlayıcı anlaşması olmadığı için yayın varsayılanı canlı yapıldı. Vercel eski DATA_MODE=demo ayarıyla dahi canlı mod kullanır. Eski demo favori ve karşılaştırma kayıtları canlı listelerden gizlenir. Doğrulanmış kaynak gelmeden fiyat gösterilmez. Gerçek bir entegrasyonun tamamlandığı iddia edilmez.

Lint, tip kontrolü ve production build geçti; 25 birim/PostgreSQL testi ve iki modda 20 masaüstü/mobil tarayıcı testi geçti. Canlı testler sekiz kategori, demo detay erişimi ve eski demo yerel kayıtlarının gizlenmesini kontrol eder. Sağlayıcı araştırması ve erişim gereksinimleri LIVE-SOURCES.md içinde.

## API’siz toplayıcı

robots kuralları, görünür fiyat eşleşmesi, stok, ürün kimliği, belirsiz fiyat reddi ve tazelik için 8 ek birim testi geçti. GitHub CI 3761d3d için lint, tip, 33 birim/PostgreSQL testi, build ve 20 tarayıcı testi başarılı tamamlandı. Yerelde ağ izinli olmayan denemede veritabanı testi EPERM ile başarısız oldu; izinsiz build de başarısız oldu. Bu başarısız denemeler geçti diye raporlanmadı; başarılı CI kanıtı Actions run 40545042756 içindedir.

İlk saatlik yayın adımı git orphan sonrası gereksiz git rm nedeniyle başarısızdı; düzeltildi. Sonraki iş snapshot dosyasını yayımladı fakat kaynaklara erişim reddi nedeniyle sıfır fiyat üretti ve başarısız sonuçlandı. Saatlik otomatik fiyat yenilemesi çalışır olarak doğrulanmadı. Normal erişimde iki gerçek Çiçek Market fiyatı okunup özgün gözlem zamanıyla price-data dalına yayımlandı; canlı /api/search?category=cicek yanıtında iki kayıt ve demo:false doğrulandı.

## 27 Ekim 2026 — iki kategorili ilk yayın kapsamı

- Lint ve TypeScript: geçti.
- Vitest: 34 geçti, DATABASE_URL sağlanmadığı için 1 PostgreSQL entegrasyon testi atlandı.
- Production `next build`: geçti.
- Playwright: 22 geçti; masaüstü/mobil demo ve canlı mod. Canlı testlerde `PUBLIC_PRICES_ENABLED=0` ile kaynak bulunmayan durum deterministik doğrulandı; bu testler çalışan gerçek sağlayıcı entegrasyonu kanıtı değildir.
- Yeni kontroller: canlı ana sayfada iki kategori, hazırlık bildirimi, kapsam dışı adreslerde açıklama, kategori kelimesiyle kapsam dışına çıkmama, sitemap kapsamı ve mobil yatay taşma.
- Gerçek fiyat kaynakları, iki satıcılı eş ürün karşılaştırması ve 20–50 ürün kataloğu tamamlanmadı.

## 27 Ekim 2026 — alışveriş maliyeti araçları ve logo tamamlayıcısı

- Ana slogan: Almadan önce gerçek maliyeti öğren.
- Logo devamı: — Etikete değil, gerçek maliyete bak.
- TypeScript, lint ve production Next.js build geçti.
- Vitest: 55 geçti; yerel DATABASE_URL sağlanmadığı için 1 PostgreSQL testi atlandı.
- Playwright son koşu: 42 geçti (masaüstü/mobil, demo/canlı). Birim hesap, kampanya toplamı, taksit, URL üzerinden tekrar hesaplama, geçersiz ölçü hatası, sıfırlama, üç aracın erişimi ve eski altyapı regresyonları doğrulandı.
- İlk tarayıcı koşusunda hata testi Next.js route-announcer öğesini de seçtiği için 4 proje başarısızdı. Seçici hesaplama formundaki hata mesajıyla sınırlandı; son tam koşuda 42/42 geçti.
- 390px ana sayfa ve 320px birim fiyat sayfası ek tarayıcı kontrolünde taşma yapmadı; mobil ekran görüntüsü incelendi.
- Hesaplama araçları satıcı fiyatı veya gerçekleşmiş fiyat gözlemi üretmez; kullanıcı girdileriyle yerel hesap yapar. Veritabanı/haricî servis gerektirmez.

## 27 Ekim 2026 — ihtiyaç odaklı rehber tasarımı

- Yeni ana sayfa: büyük rehber araması, ürün seç/maliyet hesabı/rehber girişleri, ihtiyaç senaryoları ve altı özgün rehber. Mevcut hesaplama araçları ve marka sloganları korundu.
- Rehberlerde Türkçe arama, URL konu filtresi, ürün türü/öncelik formu, ilgili rehber ve hesaplama bağlantıları, işaretlenebilir kontrol listeleri doğrulandı.
- Lint ve TypeScript geçti; production Next.js build geçti.
- Vitest: 58 geçti; yerel DATABASE_URL sağlanmadığı için 1 veritabanı testi atlandı.
- Son tam Playwright koşusu: 58 geçti, masaüstü/mobil ve demo/canlı mod. İlk koşudaki bilinmeyen rehber testi HTTP 404 bekliyordu; Next.js streaming yanıtı 200 taşıyabildiğinden kullanıcıya görünen not-found ve noindex davranışı doğrulanacak şekilde düzeltildi. Son koşuda başarısız test yok.
- Ek tarayıcı kontrolü: 320px ana sayfa, rehber listesi ve ürün seçim sonucu taşma yapmadı. 390px ana sayfanın tam ekran görüntüsü incelendi.
- İçerikler ürün testi veya model sıralaması değildir. Kaynaklar Microsoft, Apple ve Ticaret Bakanlığı'nın belirtilen konularına bağlantı verir; laboratuvar ölçümü, güncel satıcı fiyatı ve en ucuz iddiası üretilmez.

## 27 Ekim 2026 — 500 editoryal ürün adı

- 20 kategoride 500 ad; normalizasyon sonrası isim ve kimlik benzersizliği doğrulandı.
- Google'ın Türkiye ilk 500 ürün sıralaması veya arama hacmi raporu elde edilmedi. Liste editoryal olarak etiketlendi; fiyat, hacim ve sıralama uydurulmadı. Kaynak/sınır: docs/PRODUCT-SUGGESTIONS.md.
- Lint, TypeScript ve production build geçti. Vitest: 63 geçti, DATABASE_URL sağlanmadığı için 1 PostgreSQL testi atlandı.
- Tam Playwright koşusu: 74 geçti. Türkçe/büyük harf/eş anlamlı arama, klavye ve tıklamayla öneri seçimi, Escape, serbest arama, rehbersiz üründe genel notlar, kategori ve sayfalama, eski rehber/hesaplayıcı regresyonları masaüstü/mobil ve demo/canlı doğrulandı.
- Ek ekran görüntüsü denemesi test sunucuları kapandıktan sonra bağlantı reddi aldı; ürün öneri ekranının ayrıca görsel incelemesi yapılmış sayılmaz. Mobil tarayıcı testleri geçti.

## 27 Ekim 2026 — tüm 500 ürüne alışveriş rehberi

- Katalogdaki her ürün için `/urunler/[id]` sayfası: üç ürün türüne özel ölçüt, kullanım soruları, kategoriye ait üç olası gider, altı maddelik kontrol listesi ve maliyet aracı bağlantısı.
- Özellik verisi: 500 üründe toplam 1500 ölçüt kaydı. Model testi, fiyat veya bağımsız araştırma iddiası yok; içerik modeli docs/PRODUCT-GUIDES.md içinde.
- Ana öneriler ve ürün listesi doğrudan rehbere gider. Serbest arama çözümlenen üründen rehbere bağlantı verir; katalog ürünleri için rehber yok boş durumu kaldırıldı.
- Lint, TypeScript ve production build geçti.
- Vitest: 67 geçti; DATABASE_URL sağlanmadığı için 1 PostgreSQL testi atlandı.
- Tam Playwright: 75 geçti. Bu sayıya, canlı moddaki uygulamadan 500 rehber adresini 10'arlı gruplarla gerçekten isteyen kapsam testi dahil; tüm yanıtlar 200 ve ürüne ait başlık/ölçüt/kontrol listesi içerdi. Sunucu kapsamı testi 3,6 saniyede tamamlandı.
- Masaüstü/mobil öneri seçimi, altı maddelik kontrol listesi, maliyet bağlantısı, kategori/sayfalama ve önceki hesaplayıcı/rehber akışları geçti. Kamp çadırı rehberi mobilde taşma yapmadı.

## 2026-10-28 — Model history

77 unit tests passed; 1 PostgreSQL integration test skipped (no database). ESLint passed. Local production build was blocked by runtime port restrictions (Turbopack); webpack fallback could not parse TypeScript showConfig in this runtime. Production build and browser verification require CI/deployment confirmation. No verified historical price observations exist; this change does not backfill prices.
