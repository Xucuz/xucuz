# Her ürün aramasında rehber

Ana sayfadaki Rehber bul formu /rehberler?q=... adresine gider. Sunucu:

1. Tam ürün/alias eşleşmesini kendi /urunler/[id] rehberine yönlendirir.
2. Tek katalog eşleşmesi olan model kodu veya ürün aramasını da doğrudan ilgili rehbere yönlendirir.
3. Birden çok eşleşmede en fazla 12 rehber kartı ve tüm sonuçlara bağlantı gösterir.
4. İlgili uzun editoryal rehberler varsa onları listeler.
5. Hiç eşleşme yoksa genel alışveriş rehberi, maliyet araçları ve altı maddelik işaretlenebilir kontrol listesi sunar.

Konu filtresi açıkken ürün bağlamı ve ilgili rehberler filtreli sonuçta görünür; tam ürün için rehber bağlantısı korunur. Sorgu URL'de kalır; yönlendirmeler ürünün paylaşılabilir adresine gider.

Genel içerik sorguya özel teknik özellik, ürünün varlığı, fiyat, stok veya test sonucu üretmez. Özel doğrulanmış rehber olmadığı açıkça belirtilir. Sorgu en fazla 120 karakterdir ve React tarafından kaçışlanır; harici adrese yönlendirilmez. Arama parametreli sayfalar noindex kullanır. Boş sorguda normal rehber dizini açılır; bilinmeyen makale adresi yine bulunamadı sayfasıdır.
