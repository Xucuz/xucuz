# İlk yayın: elektronik ve beyaz eşya

İlk yayında kullanıcıya sunulan iki kategori elektronik ve beyaz eşyadır. Diğer kategori veri modelleri korunur; canlı modda eski kategori adresleri açıklama gösterir, arama API'si fiyat getirmez, sitemap ve kategori otomatik tamamlaması bunları içermez. Yerel demo testleri eski adaptör sözleşmelerini doğrulamaya devam eder.

## Mevcut durum

Arayüz ve ürün araması hazırdır. Onaylı, düzenli çalışan gerçek fiyat kaynağı henüz yoktur. Ana sayfa, üst bildirim ve sonuç ekranları bu hazırlık durumunu belirtir. İlk katalog için 20–50 ürün bir hedef olup sitede varmış gibi gösterilmez. İki kaynak veya ürün hedefi tamamlanmış değildir.

## Fiyatlı yayına geçiş için somut kabul ölçütleri

- En az iki kaynağın yeniden kullanım dayanağı, koşul bağlantısı ve inceleme tarihi kaydedilir; robots ve normal sunucu erişimi doğrulanır. Satıcı dosyası veya API kullanımı ön koşul değildir.
- Öncelikle standart GTIN/üretici model kodu bulunan 20–50 ürün seçilir. Aynı modelin depolama, renk, kapasite, garanti, yeni/ikinci el ve paket farkları ayrı varyant olarak kalır.
- En az bir aynı varyantta iki farklı satıcının doğrulanmış fiyatı uçtan uca görülmeden çok satıcılı karşılaştırmanın çalıştığı söylenmez. Tek satıcı kaydı karşılaştırma kanıtı değildir.
- Bilinen kargo ve zorunlu ücretler toplama katılır; bilinmeyen ücretler açıkça belirtilir. TRY dışında dönüşüm kaynağı olmadan para birimleri sıralamada birleştirilmez.
- Saatlik işin başarılı gerçek gözlemi ve uygulamada yayımlanan snapshot birlikte kontrol edilir. Bir saati geçen teklifler gizlenir. Fiyat geçmişi yalnızca gerçek kayıtlardan oluşur.
- Kaynak hazır olduğunda ana sayfa ve üst bildirimdeki hazırlık metni gerçek kapsamla güncellenir. Yeni kategori, ancak bu doğrulamalardan sonra `site-scope.ts` kapsamına eklenir.

Kaynak kabul ve durdurma kuralları: [PUBLIC-PRICES.md](PUBLIC-PRICES.md). Hiçbir kaynak için erişim açıklığı, hukuki yeniden kullanım izni olarak otomatik kabul edilmez.
