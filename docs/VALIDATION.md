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
