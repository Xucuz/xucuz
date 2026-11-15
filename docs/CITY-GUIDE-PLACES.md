# 81 İl Rehberi: Google Places kurulumu

İl sayfalarındaki mekân adı, adresi, puanı ve Google yorum sayısı Google Places API (New) üzerinden sunucu tarafında alınır. Uygulama API anahtarı yokken gerçek mekân veya puan üretmez.

## Gerekli yapılandırma

1. Google Cloud Console'da bir proje seçin ve Places API (New) hizmetini etkinleştirin.
2. Google Maps Platform faturalandırmasını ve istek kotasını yapılandırın. Places API ücretlidir; iki Text Search isteği, her il sayfası görüntülemesinde gönderilir.
3. Sunucu için bir API anahtarı oluşturun ve anahtarı yalnızca Places API ile sınırlandırın. Web sayfası/referrer kısıtı sunucu isteklerine uygun değildir.
4. Anahtarı Vercel'de `GOOGLE_PLACES_API_KEY` adıyla önce Preview ortamına ekleyin. Değeri `NEXT_PUBLIC_` değişkeni olarak tanımlamayın ve kaynak koda koymayın.
5. Google Cloud'da günlük ve dakikalık kotalar ile bütçe uyarıları belirleyin; API tüketimini izleyin.

API yanıtları veritabanına yazılmaz ve önbelleğe alınmaz. Sonuçlar puana, eşitlikte Google yorum sayısına göre sıralanır ve Google Maps bağlantısıyla birlikte gösterilir. Gerçek kullanım ve maliyet, Google Cloud projesinin kota ve fiyatlandırmasına bağlıdır.
