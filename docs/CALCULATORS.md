# Alışveriş maliyeti araçları

Ana slogan: Almadan önce gerçek maliyeti öğren. Logo tamamlayıcısı: Etikete değil, gerçek maliyete bak.

## Hesaplar

- Birim maliyet = toplam paket fiyatı / (paket başına miktar × paket sayısı × temel birim dönüşümü). Gram ve ml için dönüşüm 0,001; temel birimler kg, litre, adet. Farklı boyutlar karşılaştırılmaz. Kazanan yuvarlama öncesi değerle belirlenir; yüzde fark yüksek birim fiyata göredir.
- N al M öde = tek tam grup için birim normal fiyat × M. İndirim oranı, N ürünün normal toplamına göredir. Farklı fiyatlı ürünler veya eksik gruplar modellenmez.
- İkinci ürün indirimi = aynı fiyatlı iki ürünün birincisi tam fiyat + ikincisi indirimli fiyat. İkinci ürüne %50, toplamda %25 indirimdir.
- Yüzde + kupon = normal birim fiyat × adet × (1 − yüzde/100), kuruşa yuvarlama, ardından bir defalık sepet kuponu. Kupon sepeti aşarsa reddedilir. Kampanya birlikte kullanım/üyelik/alt limit koşulları satıcıda doğrulanmalıdır.
- Taksit toplamı = aylık taksit × tam sayı taksit sayısı + toplam ek ücret. Fark, bu toplamdan peşin fiyat çıkarılarak bulunur. Ek ücret boşsa sıfır sayılmaz. Nominal karşılaştırmadır; finansal tavsiye, faiz oranı, enflasyon veya yatırım getirisi hesabı değildir.

## Girdi ve gizlilik

TL tutarları tam sayı kuruşa çevrilir. Virgüllü/noktalı ondalık, açık Türkçe binlikli `1.234,56` kabul edilir; fiyat en fazla iki ondalık olmalıdır. Negatif ve belirsiz sayılar, sıfır fiyat/miktar reddedilir. Ücretsiz ürünlerde normal fiyat pozitif, kampanyalı toplam sıfır olabilir. Taksit 1–120 arasıdır.

Hesaplar tarayıcıda yapılır; veri tabanına fiyat gözlemi kaydedilmez. Geçerli sonuçta URL güncellenir; yeniden açılış aynı sonucu hesaplar. URL tutarları içerir ve açıldığında sunucu/hosting kayıtlarına girebilir. Paylaş düğmesi Clipboard başarısızlığında başarı uydurmaz. Temizle formu ve URL parametrelerini kaldırır, geçmişte paylaşılmış bağlantıları silmez. Parametreli sayfalar noindex, canonical parametresizdir; robots filtre URL'lerini engeller.

## Yayın

Üç araç tek Next.js uygulamasındadır. Veritabanı, API, üyelik veya ödeme servisi gerekmez. Yerel eski demo testleri korunur; canlı ana sayfa satıcı teklifi göstermez.
