# Ürün türleri, gerçek modeller ve 50.000 kayıt kapasitesi

Mevcut içerik: **525 genel ürün türü + 5 kaynaklı gerçek model = 530 kayıt**. Henüz 50.000 gerçek ürün/model yüklenmedi. Google sıralaması, satıcı stok listesi veya fiyat verisi iddiası yoktur. 25 müzik aleti türü, saz/bağlama eş anlamlıları ve özgün seçim ölçütleri eklendi.

Gerçek modeller: Kingston SNV3S/1000G ve Yamaha C70, C40II, C40MII, CX40. Kaynak bağlantıları ve kontrol tarihleri models.json içindedir ve model sayfasında gösterilir. Yamaha'nın bölgesel üretici dokümanı model kimliğini doğrular; Türkiye'de satış, renk, satıcı paketi veya garanti koşulu doğrulaması değildir. Model tanımı, canlı teklif entegrasyonu veya fiyat geçmişi anlamına gelmez.

## Model ekleme

- Şema: src/lib/products/model-schema.ts. Gerçek marka, üretici model kodu, varyant kapsamı, mevcut ürün türüne referans, HTTPS belge kaynağı, gerçek doğrulama tarihi ve kaynaklı teknik alanlar gereklidir.
- src/lib/products/models.json dosyası çalışır veri sözleşmesidir. Yeni kayıtlar JSON dizisi olarak verilir; fiyat veya stok alanları kabul edilmez.
- `npm run catalog:import -- /path/models.json` yalnızca doğrular ve raporlar.
- `npm run catalog:import -- /path/models.json --write` mevcut kayıtlarla birleştirir, tümünü doğrular, atomik yazar. Aynı kimlik farklı model/varyanta tahsis edilemez. Kaynakları operatör doğrulamalıdır; URL bulunması otomatik doğrulama veya yayın izni kanıtı değildir.
- Toplam ürün türü + model sayısı en fazla 50.000 olabilir. Bu sınır bir içerik sayısı beyanı değildir. Yinelenen kimlik, marka/model/varyant ve bilinmeyen tür reddedilir.
- Gerçek kaydı olmayan modeller üretilmez. Kategorilerin rastgele marka/kapasite/renkle çarpılmasıyla liste doldurulmaz. Yeni türün üç özgün rehber ölçütü ile kullanım/maliyet çerçevesi eklenmelidir.

## Arama ve arayüz

Ana sayfa önerisi ve ürün seçimi /api/products üzerinden sınırlı sonuç alır; tüm model dosyası istemci paketine eklenmez. Büyük katalogda seçim 50'lik sayfalara bölünür; mevcut küçük katalog başlangıçta tamamını gösterir. Sonuç arama ve URL seçim durumu korunur. Sunucu, normalize edilmiş arama anahtarlarını ve Türkçe sıralamayı bir kez hazırlar. Dizin 30 kayıt/sayfa ile en az 1.667 sayfaya erişebilir.

## Doğrulama sınırı

50.000 toplam kayıt kapasitesi, yalnızca test belleğinde oluşturulan ve yayımlanmayan sentetik kayıtlarla şema düzeyinde denenir. Bu, 50.000 gerçek kayıt toplandığı veya o boyutta üretim yük testi yapıldığı anlamına gelmez. Mevcut tüm rehberler tarayıcı/HTTP kapsam testinden geçer. Gerçek veri artışında kaynak inceleme ve operasyonel performans ölçümü sürdürülmelidir.
