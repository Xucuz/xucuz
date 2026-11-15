# 81 İl Rehberi: mekân listeleri

İl sayfalarındaki restoran, kafe, market ve alışveriş işletmeleri ücretsiz OpenStreetMap (OSM) topluluk kayıtlarından gelir. OSM verisi Google yorum puanı sunmaz; arayüz bu puanları uydurmaz ve listeyi “en yüksek puanlı” diye tanıtmaz. Kayıtlar OSM sayfasına bağlanır ve kaynak ODbL atfıyla gösterilir. Adres ayrıntısı kaynakta yoksa sayfa bunu açıkça belirtir.

API yanıtı CDN'de altı saat tutulur; böylece her ziyaret yeni bir Overpass isteği üretmez. Dış kaynak geçici olarak erişilemezse ziyaretçiye OpenStreetMap üzerinde arama bağlantısı gösterilir.

Google Places entegrasyonu isteğe bağlıdır. `GOOGLE_PLACES_API_KEY` yalnızca sunucu ortamında tanımlanırsa puanlı sonuçlar Google Places'tan gelir; bu istekler ücretli olabilir ve Google içerikleri önbelleğe alınmaz. Anahtar yoksa veya Google sonuç döndürmezse ücretsiz OSM listesi kullanılır. Vercel'de anahtar eklemek şart değildir.

OpenStreetMap verisi © OpenStreetMap katkıda bulunanlar tarafından sağlanır ve Open Database License (ODbL) koşullarına tabidir. Harita kayıtları eksik veya güncelliğini yitirmiş olabilir; Xucuz bunları işletme onayı ya da Google puanı olarak sunmaz.
