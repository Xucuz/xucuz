# Gıda alışveriş rehberleri

Her biri 25 yeni tür içeren dört grup:

- Şarküteri: peynir çeşitleri, tereyağı, kaymak, kefir/ayran, işlenmiş et ürünleri ve zeytin çeşitleri.
- Manav: sebze ve meyveler; domates, salatalık, patates, elma, muz ve diğer temel türler.
- Gıda ve kahvaltılık: ekmek, salça, reçel, tahin, maya, nişasta ve baharatlar.
- Bakliyat ve tahıl: nohut, mercimek, fasulye, pirinç ve bulgur çeşitleri, kinoa ve benzeri türler.

100 yeni ürün türüyle toplam 625 tür + 5 kaynaklı model = 630 kayıt olur. Bunlar marka/SKU, fiyat veya stok kaydı değildir. Aynı isimli farklı gramaj, çeşit ve içerik eşdeğer varsayılmaz. Mevcut market grubundaki 18 gıda türüne de gıda kontrol listesi uygulanır; deterjan gibi ev ürünleri bu kapsamda sınıflandırılmaz.

Her üründe üç hazırlanmış seçim ölçütü, kategori maliyetleri ve altı maddelik kontrol listesi vardır. Kg/litre/adet birim fiyat aracı kullanıcının kendi tutarlarıyla çalışır. Net miktar, varsa süzme ağırlık, paket adedi ve satış birimi ayrılır. Tarih ve saklama bilgisi ürün etiketinden kontrol edilir; sabit raf ömrü/sıcaklık veya sağlık iddiası üretilmez. Görünüm güvenlik onayı sayılmaz. Rehber metni gıdada model/kurulum yerine çeşit, içerik, miktar ve etiket koşullarını kullanır.

Şarküteri/manav/gıda/bakliyat sözcükleriyle kategori araması desteklenir. Gıda araması dört yeni grubun yanı sıra mevcut gıda türlerini de kapsar. Tam ürün adı araması doğrudan rehberi açar. Katalog dışı adlarda genel rehber davranışı korunur.

Katalog: src/lib/products/catalog.json. Ölçütler: guide-features.json. Gıda türü tespiti ve maliyet aracı seçimi: index.ts. İçerik çerçevesi: guide.ts. Hiçbir market için canlı fiyat, indirim veya doğrulanmış satıcı iddiası eklenmemiştir.
