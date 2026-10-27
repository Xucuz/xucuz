# 500 ürün önerisi

`src/lib/products/catalog.json` 20 grupta 500 benzersiz ürün türü adı içerir. Liste editoryaldir; Google Türkiye'nin en çok aranan 500 ürün sıralaması, satış hacmi, güncel fiyat veya stok verisi değildir. Belirli marka modellerinin veya arama hacminin doğrulandığı iddia edilmez.

Google'ın kendi Trends açıklaması örneklenmiş ve 0–100 ölçeğinde normalize edilmiş göreli ilgiyi açıklar. Kesin toplam arama hacmi veya Türkiye için bu projenin kullanabileceği doğrulanmış ilk 500 ürün listesi bu çalışmada elde edilmedi: https://support.google.com/trends/answer/4365533?hl=en . Google sıralamasına geçmek için kaynak, ülke, dönem, ürün/anahtar kelime tanımı ve ölçüm yöntemiyle birlikte doğrulanmış veri gerekir; sıralama veya hacim uydurulmaz.

## Kullanım

- Ana sayfa önerileri tarayıcıda çalışır; Google'a veya harici otomatik tamamlama servisine sorgu göndermez.
- Türkçe normalizasyon, eş anlamlılar, tam eşleşme önceliği ve ardından alfabetik sıra kullanılır. En fazla 8 öneri gösterilir. Bu sıra popülerlik sırası değildir.
- ArrowUp/ArrowDown, Enter ve Escape desteklenir. Serbest metinle mevcut rehber araması korunur.
- `/urunler` tüm listeyi kategori/arama/sayfalama ile açar; sayfada 30 kayıt gösterilir ve filtreler URL'de tutulur.
- Öneri seçimi artık doğrudan `/urunler/[id]` alışveriş rehberine gider. Serbest arama `/rehberler?q=...` yolunu korur; çözümlenen üründen tam rehbere bağlantı bulunur. Katalogdaki her ürün üç özel karşılaştırma ölçütü ve kategoriye ait maliyet çerçevesiyle desteklenir. Altı önceki uzun editoryal rehber ek okuma olarak ayrıca korunur.
- Ürün listesi noindex'tir. 500 rehber URL’si ürün türüne özel ölçütler ve ortak kategori çerçevesini birleştirir; bağımsız model testi veya 500 özgün uzun makale gibi sunulmaz, toplu SEO makalesi olarak indekslenmez. Rehber kaynakları ve fiyat gözlemleriyle karıştırılmaz.

## Genişletme

JSON listesindeki isimler `normalize` sonrasında benzersiz olmalıdır. Yeni gruplarda `productChecks` ve uygun rehber/araç eşleştirmeleri gözden geçirilmelidir. Fiyat, googleRank veya searchVolume alanları doğrulanmış veri olmadan eklenmez.
