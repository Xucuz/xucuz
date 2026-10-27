# API'siz fiyat toplama ve saatlik güncelleme

## Uygulanan kapsam

İlk aktif kaynaklar İncehesap ve Taze Çiçek'in seçili herkese açık ürün sayfalarıdır. API anahtarı, gizli JSON endpoint'i, hesap, cookie veya CAPTCHA aşma kullanılmaz. Bu kapsam elektronik ve çiçekte az sayıda üründür; tüm kategori ve tüm satıcılar taranmış değildir. Kaynak isimleri ticari ortaklık veya resmî entegrasyon iddiası değildir.

Uçuş, otobüs ve otelde tarih/yolcu/oda koşullarıyla eşleşen kesin fiyat veren erişim henüz doğrulanmadı. Obilet robots kuralları /seferler ve /ucuslar gibi sonuç yollarını engelliyor; ETS tarihli arama/otel fiyat yollarını engelliyor. Sahibinden erişim kontrolünde HTTP 429 döndü; koruma aşılmadı. Market/otomobil/beyaz eşya toplayıcıları henüz etkin değil. Bu kategorilerde fiyat uydurulmaz. Yeni kategori ancak olağan HTML yanıtından doğru kapsam ve fiyat okunabildiğinde eklenir.

## Çalışma

- `src/lib/public-prices/catalog.ts`: incelenmiş, sabit kaynak URL'leri. Kullanıcı girdisinden hedef URL alınmaz.
- `crawl.ts`: her kaynakta robots.txt okur, ilgili bot kurallarını uygular. Kaynak başına düşük hız, timeout, içerik boyutu sınırı; 401/403/429/koruma ekranında durur. Otomatik yönlendirme takip etmez. Hiçbir tarayıcı veya kullanıcı taklidi yapılmaz.
- `parse.ts`: aynı ürün adı, tekil Offer veya kaynağa özgü ürün microdata'sı, para birimi, stok ve görünür fiyat eşleşmesi gerekir. AggregateOffer/başlayan fiyat kullanılamaz. Belirsiz veya değişmiş sayfa reddedilir.
- `npm run prices:collect`: sıradan HTML sayfalarından gözlem yapar; data/public-offers.json ve gerçek gözlem geçmişini yazar. Fiyat kodda sabitlenmez. Proxy gerektiren Node 24 ortamlarında standart `NODE_USE_ENV_PROXY=1` kullanılabilir; TLS doğrulaması kapatılmaz.
- Uygulama `price-data` dalındaki halka açık JSON snapshot'ını okur. Bu bizim veri dosyamızdır; sağlayıcı API'si değildir. Snapshot alınamazsa yalnızca hâlâ taze olan depoya alınmış gözlemler gösterilebilir. Eski veya demo kayıtlar asla güncel teklif yerine kullanılmaz.
- Ayrıntı ve sağlayıcıya yönlendirme aynı onaylı kaynak ve ürün URL'sini tekrar doğrular.

Kargo/teslimat ve zorunlu ücretler doğrulanmadıysa null saklanır, sıfır kabul edilmez. Adres seçilmemiş genel sayfa fiyatı belirli şehir/ilçe müsaitliği gibi sunulmaz. Farklı buket/paketler aynı varyant sayılmaz. Şimdiki ilk örnek kapsam, aynı ürünün birden çok satıcı teklifini henüz içermeyebilir; kıyaslama sayfasında bağımsız ürünler yan yana görülebilir.

## Saatlik iş

`.github/workflows/prices-hourly.yml`, UTC saat başında (`0 * * * *`) ve elle çalıştırılabilir. GitHub cron gecikebilir; tam dakika garantisi yoktur. Her koşuda robots ve gerçek sayfa yeniden kontrol edilir; snapshot/rapor/gerçek fiyat gözlemleri price-data dalına yayımlanır. Başarısız ürünlerin eski fiyatları yeni zaman damgasıyla yeniden kaydedilmez. Kaynak hataları snapshot'ta görünür.

GitHub zamanlanmış işlerin çalışması için workflow dosyası varsayılan dalda olmalıdır. Uygulama kaynak dalı feat/xucuz-platform olarak açıkça seçilir; uygulamanın inceleme PR'ı ayrıca açık kalır. Yalnızca veri dalı yenilenir, saatlik uygulama build'i yapılmaz. Veri dalı vercel.json içinde build'i atlama kuralı taşır. Public repo standart GitHub Actions çalıştırıcısı kullanılır; ücretli servis satın alınmaz.

Yayın tazeliği elektronik/çiçek için en fazla 1 saat; daha eski kayıt gizlenir. Uçuş/otobüs 5 dakika, otel 15 dakika politikasını korur: saatlik gözlemler bu kategoriler için güncel kesin fiyatı tek başına sağlamaz. Fiyat gözlem zamanı her kartta yer alır. Veri kaynakları ve sonuç durumu /veri-kaynaklari sayfasındadır.

GitHub, public repo etkinliği uzun süre olmadığında schedule'ı durdurabilir; Actions durumunu takip edin. Kaynakların robots/koşulları değişirse ilgili kaynak kapatılmalı veya izinli feed'e geçilmelidir.

## Son gerçek çalışma sonucu

GitHub otomatik sunucusu ilk kaynaklarda ve yeni Çiçek Market denemesinde erişim reddi aldı; engel aşılmadı. İncehesap ve Taze Çiçek devre dışı bırakıldı. Çiçek Market normal erişimde Windows-1254 kodlamasıyla iki ürün için görünür/yapılandırılmış fiyat eşleşmesi verdi; 27 Ekim 2026 17:12 UTC gözlemleri özgün zamanlarıyla yayımlandı. Bu kayıtlar tek satıcının iki farklı buketidir; aynı ürünün çok satıcılı fiyat karşılaştırması değildir. Saatlik workflow kurulmuş olsa da otomatik fiyat akışı başarılı değildir; başarısızlık gizlenmez. Kaynak tazeliği bir saat dolunca fiyatlar gizlenir.

## Satıcı girdisine bağımlı olmayan kaynak keşfi

Satıcıların dosya göndermesi veya fiyat girmesi ön koşul değildir. Public source discovery işi, sekiz kategoride 18 yeni site adayında robots ve sıradan HTML erişimini düşük hızda denetler; sonuçları price-data/source-probes.json içine yazar. Sadece kök sayfanın açılması fiyat entegrasyonu değildir. 301 yönlendirmeler engel aşma yoluyla takip edilmez; canonical adres ayrıca incelenir. Erişim reddi, ağ hatası ve belirsiz kapsam ayrı raporlanır. Bu keşif işi mevcut fiyatları değiştirmez ve hiçbir fiyat üretmez. Son rapor /veri-kaynaklari ekranında aday olarak gösterilir. Ürün kimliği, varyant ve geçerli fiyat koşulları doğrulanmadan adaylar aktif kaynak olmaz.
