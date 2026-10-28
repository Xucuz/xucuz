# Geçmiş fiyat kapsamı

/gecmis-fiyat yalnızca doğrulanmış model ve varyanta ait gözlenmiş ürün tekliflerini gösterir. Tamamlanmış satış fiyatı değildir. Kaynak adları sonuçta gösterilmez; kaynak URL, kimlik ve zaman damgası denetim kaydında korunur. Depo herkese açık olduğundan bu kayıtlar gizli sayılmaz.

500 ürün genel ürün türleridir. İlk model Kingston SNV3S/1000G, NV3 1 TB, sıfır ve 5 yıl sınırlı üretici garantisi koşuludur. Üretici belgesi model kimliğini doğrular, satıcı fiyatını doğrulamaz. Şu an yayına uygun etkin fiyat kaynağı ve bu modele ait geçmiş fiyat kaydı yoktur. Kayıt hattının hazırlanması veri toplamaya başlandığı anlamına gelmez.

Bir ay önceki gün takvim ayına göre hesaplanır; ay sonu gerektiğinde önceki ayın son gününe çekilir. Son 30 gün referans günü dahil 30 takvim günüdür. Günler Europe/Istanbul saat dilimindedir. Para birimleri ayrı tutulur. Gösterilen minimum ürün etiket fiyatıdır; kargo ve zorunlu ücretlerin bilinmediği belirtilir, teslim toplamı iddiası yapılmaz.

## Kayıt hattı

Saatlik prices-hourly iş akışı mevcut price-data/model-history arşivini geri yükler. Yalnızca yayın değerlendirmesi onaylı kaynaklardan gelen taze, stokta ve modelin tüm zorunlu özellikleriyle eşleşen teklifler kaydedilir. Gün, model/varyant, kaynak ve para birimi başına minimum saklanır; eski kaydın zamanı yeniymiş gibi değiştirilmez. Kayıtlar 400 gün ve model başına 5000 satır ile sınırlıdır. Aynı gün içindeki tüm fiyat değişimleri bu arşivde tutulmaz.

src/lib/price-history/models.ts yeni model kayıt noktasıdır. Model kodu, kapasite, durum ve garanti gibi özellikler açık olmalıdır. Varyant değişince yeni model kimliği oluşturun. Kaynak onayı geri çekilirse okuma sırasında kayıt yayımlanmaz. MODEL_HISTORY_ENABLED=0 okuma için kapatma anahtarıdır. Dosya erişim hatası ile kayıt yokluğu arayüzde ayrılır.

Eski price-history.json kayıtları model/varyant ve kaynak doğrulaması eksik olduğundan yeni arşive taşınmaz. Geçmişe tarih verilerek kayıt üretilmez. Geçerli tarihsel veri sağlanmadan bir ay önceki tutar gösterilemez. Fiyat geçmişi sayfası indekslenmez.
