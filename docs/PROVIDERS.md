# Veri kaynağı rehberi

## Durum

Her kategoride demo normalizasyonu vardır. Üçüncü taraf canlı API entegrasyonu yoktur. API adresleri veya yanıt şemaları tahmin edilmemiştir. `authorized-feed` adaptörü, yönetici tarafından kullanım izni doğrulanmış dosyaları PostgreSQL üzerinden okur; harici API bağlantısı değildir.

## Ortak sözleşme

`src/lib/types.ts`: ProviderAdapter, `{category,search,page,signal}` alır, `{offers,nextPage?}` döndürür. API adaptörü AbortSignal'ı fetch'e iletmelidir. Motor 4 saniye timeout, 2 deneme, 10 sayfa sınırı, normalizasyon, tazelik, cache ve kısmi hata yönetimi uygular. Anahtarlar yalnızca sunucuda tutulur. Resmî doküman ve yetki olmadan adaptör eklemeyin; CAPTCHA veya erişim engeli aşılmaz.

## İzinli JSON / CSV

/admin üzerinde kaynağı, resmî dokümantasyon URL'sini, kullanım izin referansını ve tam HTTPS yönlendirme alan adlarını kaydedin. `authorized-feed` kaynağını etkinleştirin. Dosya: en fazla 1000 satır / 2 MB. JSON dizi veya başlıklı CSV desteklenir. Hatalı dosyada hiçbir teklif yazılmaz; hata raporu ve eşleştirme inceleme kayıtları tutulur.

Zorunlu alanlar: `id,category,entityId,variantKey,title,providerId,provider,description,price,shipping,mandatoryFees,currency,available,url,source,updatedAt,demo,sponsored,affiliate,attributes`. İsteğe bağlı: `quantity`.

- providerId bu adaptörde `authorized-feed` olmalı.
- price, shipping, mandatoryFees kuruş/cents cinsinden tamsayı. Bilinmeyen shipping/mandatoryFees `null`; sıfır değildir.
- currency TRY/EUR/USD. Farklı para birimleri kur bilgisi olmadan birlikte sıralanmaz.
- updatedAt gerçek kaynak gözlem zamanı, ISO UTC. Gelecek zaman ve eski teklifler gösterilmez. Yükleme zamanı fiyat gözlem zamanı yerine uydurulmaz.
- demo canlı dosyada false; sponsored ve affiliate gerçek ticari durumu belirtir.
- url panelde onaylı tam alan adına sahip HTTPS URL. IP, localhost, kullanıcı bilgisi ve özel port yasak. Yönlendirmede yeniden doğrulanır.
- attributes string/number/boolean değerlerden oluşur.
- quantity örneği: `{ "value":500,"unit":"ml","packs":1 }`; birimler g/kg/ml/l/adet. Birim fiyat hesapları paket sayısını içerir.
- CSV boolean değerleri true/false; bilinmeyen ücret hücreleri boş. attributes ve quantity hücreleri CSV kurallarına uygun kaçırılmış JSON.

## Eşleştirme

entityId kaynaktan doğrulanmış tesis/uçuş/sefer/ürün veya bağımsız araç kimliğidir. Başlık benzerliği kanıt değildir. variantKey ve ayrıca attribute/miktar parmak izi farklı koşulları ayrı tutar.

- Otel: tesis + oda tipi + yemek + iptal + tarih + oda/yetişkin/çocuk ve yaşları. Canlı fiyat seçili konaklamanın toplamıdır, gecelik fiyat ayrı verilir.
- Uçuş: sefer dizisi + havalimanı + tarih + kabin + bagaj/değişiklik + yolcu sayısı + tek yön/gidiş-dönüş.
- Otobüs: sefer + terminal + tarih/saat + yolcu sayısı; mevcutsa koltuk.
- Market: barkod + gramaj/paket + mağaza/bölge + üyelik/çoklu alım koşulu.
- Otomobil: ilan kimliği; farklı araçlar satıcı teklifleri gibi gruplanmaz. Donanım ve kondisyon ayrı kalır.
- Elektronik/beyaz eşya: GTIN veya üretici model kodu + kapasite/depolama/renk/garanti/durum.

Tazelik: otel 15 dk, uçak/otobüs 5 dk, market 6 saat, otomobil/elektronik/beyaz eşya 1 saat. Cache gözlem süresini uzatmaz. Seed gerçek fiyat geçmişi üretmez; gözlemler yalnızca başarılı canlı aktarımdan kaydedilir.

## Resmî teknik belgeler

Kurulum sırasında kontrol edildi:
- https://nextjs.org/docs/app/getting-started/installation
- https://tailwindcss.com/docs/installation/framework-guides/nextjs
- https://orm.drizzle.team/docs/get-started/postgresql-new

Tam sürümler package-lock.json dosyasındadır. Yeni API adaptörünün resmî dokümantasyonunu ve doğrulanan örnek yanıtlarını ayrıca belgeleyin.

## Çiçek

Kategori `cicek`, tazelik 30 dakika. Çiçek türü, adet, renk, buket içeriği, vazo/sunum, teslimat bölgesi ve zamanı `attributes` içinde açık tutulur. Arama filtreleri: flowerType, flowerCount, delivery, city, district. Teslimat ücreti shipping alanında; bilinmiyorsa null. Farklı boy, adet, içerik ve teslimat koşulları ayrı varyantlardır. Gerçek çiçekçi API/feed bağlantısı kurulmamıştır. “En ucuz” yalnızca aynı kapsamda güncel, doğrulanmış ve toplam ücreti bilinen karşılaştırılmış teklifler için kullanılabilir.
