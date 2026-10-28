# Gerçek fiyatlara geçiş — 27 Ekim 2026

## Şu an doğrulanan durum

Çalışma ortamında sağlayıcı API kimliği, feed izni veya affiliate anlaşması bulunmuyor; proje sahibi da mevcut anlaşması olmadığını belirtti. Bu nedenle hiçbir kategori için canlı üçüncü taraf fiyatı doğrulanmış değildir. Kamuya açık Vercel dağıtımı demo fiyat göstermez. Kaynak yoksa açıklayıcı boş durum vardır.

## Resmî kaynak araştırması

| Kaynak | Doğrulanan kapsam | xucuz için eksik olan |
| --- | --- | --- |
| ÇiçekSepeti Akademi / API belgeleri | Satıcının ürün ve sipariş entegrasyonu; API anahtarıyla satıcı sistemi bağlantısı | Fiyat karşılaştırma/yayınlama için katalog/feed erişim izni ve kapsamı; satıcı API'si tüm mağazaların herkese açık fiyat kataloğu olarak kabul edilmedi |
| Trendyol Product V2 | Belirli satıcının mağaza ürününün durumunu listeleme | Platform genelinde fiyat karşılaştırması için yetkili veri erişimi; satıcı anahtarı bu izni kendiliğinden sağlamaz |
| Booking.com Demand API | Managed Affiliate Partner sözleşmesi, Partner Centre, API token + X-Affiliate-Id | Başvuru/sözleşme, production erişimi ve yönlendirmeli arama kapsamı |

Resmî belgeler:
- https://akademi.ciceksepeti.com/sikca-sorulan-sorular/
- https://ciceksepeti.dev/
- https://developers.trendyol.com/docs/%C3%BCr%C3%BCn-filtreleme-temel-bilgiler-v2
- https://developers.booking.com/demand/docs/getting-started/prerequisites

Bu inceleme anonim, sınırsız ve karşılaştırmada kullanım izni doğrulanmış bir çiçek fiyat kataloğu sağlamadı. Arama motoru snippet'leri, elle yazılmış fiyatlar veya satıcıya ait olmayan API anahtarları canlı kaynak yerine kullanılmaz. Kamuya açık görünen bir endpoint'in yeniden yayın izni olduğu varsayılmaz. CAPTCHA/oturum engeli aşılmaz.

## Çiçek için ilk gerçek karşılaştırma

En az iki çiçekçi veya birden fazla satıcı içeren yetkili veri sağlayıcısı ile aşağıdaki kapsam netleştirilmelidir:

1. xucuz.com üzerinde ürün, fiyat ve stok bilgisini yayınlama ve satıcıya yönlendirme izni.
2. Resmî API dokümantasyonu veya izinli XML/JSON/CSV ürün feed'i ve örnek yanıt.
3. Ürün kimliği, buket içeriği, dal/adet, boy, vazo/sunum, renk ve ikame çiçek koşulları.
4. Şehir/ilçe kapsamı, teslimat günü/saat dilimi, teslimat ve zorunlu ücretler.
5. Fiyatın para birimi, KDV kapsamı, güncelleme zamanı, kullanım limiti ve tazelik politikası.
6. Satıcı ürün URL'si ve izinli yönlendirme alan adları; varsa affiliate/sponsorlu koşulları.

Anahtarlar sohbete/Git'e yazılmaz; hosting secret store üzerinden sunucuya eklenir. PostgreSQL DATABASE_URL ayrıca gerekir. Bu erişimler olmadan adaptörün production doğrulaması yapılamaz. Mevcut /admin izinli JSON/CSV yükleme yolu kullanılabilir; her satıcının güvenilir kaynak kimliği korunmalıdır. Bir toplu feed'de farklı satıcıları tek sağlayıcı kimliğine indirgemeden önce adaptör genişletilmelidir.

## Gönderime hazır veri erişimi talep metni

Aşağıdaki metin kullanıcı tarafından tedarikçiye gönderilebilir; bu çalışma kimseye mesaj göndermedi:

> xucuz.com için fiyat karşılaştırma ve sitenize yönlendirme entegrasyonu geliştiriyoruz. Ürün kataloğu, güncel fiyat/stok, buket içeriği/adedi, teslimat bölgeleri/ücretleri ve güncelleme zamanını içeren resmî API veya izinli ürün feed'i sağlıyor musunuz? Bu verilerin xucuz.com üzerinde karşılaştırmalı gösterimi için gerekli sözleşme/izin, teknik dokümantasyon, kullanım limitleri ve affiliate koşullarını paylaşabilir misiniz? xucuz ödeme veya sipariş almayacak; işlemler sağlayıcının sitesinde tamamlanacaktır.
