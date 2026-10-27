# 500 ürünün tamamında alışveriş rehberi

Her katalog ürünü `/urunler/[id]` adresinde bir seçim rehberine sahiptir. Bu kapsam 500 ayrı model testi veya 500 bağımsız araştırma makalesi değildir: ürüne özel üç karşılaştırma ölçütü, kategorinin kullanım/maliyet çerçevesi ve satın alma kontrol listesi bir araya getirilir. Gerçek fiyat, stok ve en iyi ürün iddiası oluşturulmaz.

## Veri ve ekran

- `src/lib/products/guide-features.json`: katalogdaki 500 ada karşılık üçer ölçüt; toplam 1500 ölçüt kaydı. Örneğin SSD'de arayüz/boyut/uyumluluk; çadırda kapasite/mevsim/kurulum; kahvede miktar/demleme/saklama başlıkları.
- `src/lib/products/guide.ts`: kullanım soruları, kategoriye ait olası giderler, altı maddelik liste ve uygun hesaplama aracı. Eksik ürün ölçütü sessizce genel metne dönmez, hata verir.
- Ana aramadaki öneri seçimi ve ürün listesi doğrudan rehbere gider. Serbest rehber aramasında çözümlenen üründen de rehbere bağlantı verilir. “Ayrıntılı rehber henüz yok” boş durumu katalog ürünleri için kaldırılır; katalog dışı serbest aramalar sonuçsuz kalabilir.
- Altı önceki uzun editoryal rehber ek okuma olarak korunur; ilgisiz aksesuarlar telefon/bilgisayar rehberine zorla eşleştirilmez.
- Sarf malzemeleri için birim fiyat, dayanıklı ürünlerde ödeme hesabı öne çıkar. Tüm giderler kullanıcı/satıcı tarafından doğrulanmalıdır.

## İçerik sınırları

Ölçütler bir modelin bu özelliklere sahip olduğu anlamına gelmez; hangi bilgilerin kontrol edileceğini söyler. Modelin üretici kılavuzu, teknik belgesi ve satıcının yazılı koşulu esas alınır. Sağlık, çocuk güvenliği, araç uyumu ve elektrikli ürünlerde genel rehber uygunluk onayı yerine kullanılmaz. Bilinmeyen ücretler sıfır varsayılmaz.

Sayfalar noindex ve canonical içerir. Kapsamı ve içerik niteliği insan tarafından geliştirilmeden toplu SEO içeriği olarak indekslenmez. Ürün kataloğu Google arama sıralaması değildir.

## Genişletme ve kontrol

Yeni katalog adı için özellik dosyasına üç ilgili ölçüt ekleyin; kategori çerçevesini ve araç bağlantısını gözden geçirin. Ürün adı değişirse eşleşen anahtarı da değiştirin. Birim testleri bütün katalogda ölçüt, maliyet ve kontrol listesi kapsamını doğrular. Tek bir canlı-mode tarayıcı test projesi ayrıca tüm 500 adresi uygulamadan gerçekten isteyerek içeriklerini denetler; bu kapsam testi istemci ve ekran boyutundan bağımsız olduğu için bir kez çalışır.
