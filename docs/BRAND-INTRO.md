# Marka açılışı

Kullanıcının onayladığı ürün simgeli X görseli public/brand-intro.webp içinde 137.698 bayt WebP olarak saklanır. Kaynak PNG korunmuştur; biçim dönüşümü dışında görsel değiştirilmemiştir. Üst menünün mevcut logosu korunur.

- İlk sekme ziyaretinde tam ekran gösterilir; site arkada normal yüklenir. Üç saniye sonra kapanır.
- Görsel object-fit:contain ile kırpılmadan gösterilir; telefon, tablet ve masaüstü boyutlarına uyar.
- Siteye geç ve Escape erken kapatır. Ekran açıkken odak tek geçiş düğmesindedir; kapanınca içerik odağı ve kaydırma geri gelir.
- Tamamlanma/atlama işareti sessionStorage içinde xucuz-brand-intro-v1 anahtarıyla saklanır. Sayfa geçişinde veya aynı sekmede yenilemede yeniden bekletmez. Depolama engelliyse kapanma yine çalışır, sonraki tam yüklemede tekrar gösterilebilir.
- JavaScript yüklenmese bile CSS üç saniye sonra katmanı görünmez ve etkileşimsiz yapar. Geç yüklenen JavaScript CSS ile kapanmış ekranı yeniden açmaz.
- Sürekli hareket veya yanıp sönme içermez. Gizlilik açıklamasında işlevsel oturum işareti belirtilmiştir; ziyaretçi ölçümüyle ilişkili değildir.

Playwright splash.spec.ts gerçek açılışı temiz depolama ile test eder: görüntünün yüklenmesi, 2.999/3.000 ms sınırı, inert/odak davranışı, yenilemede atlama, Escape/düğme ve JavaScript kapalıyken açılabilme. Diğer tarayıcı testleri fixtures.ts ile önceden görülmüş oturumu kullanır; böylece her bağımsız testte tekrar üç saniye beklenmez.
