# Gerçek aylık ziyaretçi sayacı

Siyah/beyaz sayaç /api/visitors üzerinden PostgreSQL toplu sayısını okur. Sayı tahmini veya örnek veri yoktur; bağlantı yoksa çizgiler gösterilir. Aylık sayı, yalnızca sayıma açıkça katılan tarayıcıları ifade eder; kesin kişi sayısı değildir. Üçüncü taraf analitik eklenmez.

## Canlı kurulum

1. Vercel projesine PostgreSQL DATABASE_URL bağlantısını sunucu değişkeni olarak bağlayın. Bu repoya veya mesaja gizli bağlantı yazmayın. Ücretli servis otomatik başlatılmaz.
2. Veritabanında npm run db:migrate çalıştırın (0002 monthly visitors tablolarını oluşturur).
3. Sunucuya VISITOR_METRICS_SECRET olarak kriptografik rastgele en az 32 karakterli ayrı gizli anahtar ekleyin; NEXT_PUBLIC ön eki kullanmayın.
4. VISITOR_METRICS_ENABLED=1 ile production yeniden dağıtın. GET /api/visitors ready ve gerçek başlangıç sayısını döndürmelidir. 503, etkin sayım anlamına gelmez.
5. Sayaçtaki Sayıma katıl düğmesiyle aynı tarayıcıdan tekrar gezinme/toplamın artmaması ve farklı tarayıcıdan açık katılımın artması kontrol edilmelidir.

Şu an çalışma ortamında DATABASE_URL yoktur ve bağlı Vercel yönetim aracı/kimliği yoktur. Production değişkenlerinin eklendiği veya canlı sayımın etkin olduğu iddia edilmez.

## Yöntem

Katılımdan önce ziyaretçi kimliği oluşturulmaz. Tercih localStorage içinde kalır. Katılımdan sonra rastgele UUID, Türkiye takvim ayı ile tarayıcıda tutulur. Veritabanında yalnızca ay bazlı HMAC özeti ve aylık toplam bulunur. Ay+özet birleşik birincil anahtarı, aynı kimliğin eşzamanlı isteklerde bile bir kez sayılmasını sağlar; toplu artış aynı transaction içindedir. Yenileme veya yeni sunucu örneği sayıyı sıfırlamaz. Önceki ay kimlikleri yeni ayın ilk yazımında temizlenir, toplu aylık toplamlar korunur.

Sayaç IP, isim, sayfa geçmişi tutmaz; barındırma teknik kayıtları ayrıdır. Sayımı kapat kimliği tarayıcıdan kaldırır ve gelecekteki katılımı durdurur; geçmiş anonim toplamı düşürmez. Kimliğini temizleyen veya birden fazla tarayıcı kullanan kişi tekrar sayılabilir. Kimlik üreten botları kesin ayırma garantisi yoktur; bu insan nüfusu sayımı veya gerçek zamanlı aktif kişi sayısı değildir.

POST aynı origin, küçük doğrulanmış gövde, consent=true ve UUID gerektirir. İstek sınırlaması sunucu örneği bazında koruma sağlar; küresel bot savunması değildir. SQL hata ayrıntıları istemciye verilmez. VISITOR_METRICS_ENABLED=0 kapatma anahtarıdır. Harici snapshot veya sahte başlangıç sayısı kullanılmaz.
