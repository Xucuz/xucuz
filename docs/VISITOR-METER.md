# Gerçek yıllık ziyaretçi sayacı

Siyah/beyaz sayaç /api/visitors üzerinden PostgreSQL toplu sayısını okur. Sayı tahmini veya örnek veri yoktur; bağlantı yoksa yalnızca açıkça etiketlenmiş 1.453 başlangıç değeri gösterilir. Yıllık sayı, yalnızca sayıma açıkça katılan tarayıcıları ifade eder; kesin kişi sayısı değildir. Üçüncü taraf analitik eklenmez.

## Canlı kurulum

1. Vercel projesine PostgreSQL DATABASE_URL bağlantısını sunucu değişkeni olarak bağlayın. Bu repoya veya mesaja gizli bağlantı yazmayın. Ücretli servis otomatik başlatılmaz.
2. Veritabanında npm run db:migrate çalıştırın (0003 yearly visitors tablolarını oluşturur).
3. Sunucuya VISITOR_METRICS_SECRET olarak kriptografik rastgele en az 32 karakterli ayrı gizli anahtar ekleyin; NEXT_PUBLIC ön eki kullanmayın.
4. VISITOR_METRICS_ENABLED=1 ile production yeniden dağıtın. GET /api/visitors ready ve gerçek başlangıç sayısını döndürmelidir. 503, etkin sayım anlamına gelmez.
5. Sayaçtaki Sayıma katıl düğmesiyle aynı tarayıcıdan tekrar gezinme/toplamın artmaması ve farklı tarayıcıdan açık katılımın artması kontrol edilmelidir.

Şu an çalışma ortamında DATABASE_URL yoktur ve bağlı Vercel yönetim aracı/kimliği yoktur. Production değişkenlerinin eklendiği veya canlı sayımın etkin olduğu iddia edilmez.

## Yöntem

Katılımdan önce ziyaretçi kimliği oluşturulmaz. Tercih localStorage içinde kalır. Katılımdan sonra rastgele UUID, Türkiye takvim yılı ile tarayıcıda tutulur. Veritabanında yalnızca yıl bazlı HMAC özeti ve yıllık toplam bulunur. Yıl+özet birleşik birincil anahtarı, aynı kimliğin eşzamanlı isteklerde bile bir kez sayılmasını sağlar; toplu artış aynı transaction içindedir. Yenileme veya yeni sunucu örneği sayıyı sıfırlamaz. Önceki yıl kimlikleri yeni yılın ilk yazımında temizlenir, toplu yıllık toplamlar korunur.

Sayaç IP, isim, sayfa geçmişi tutmaz; barındırma teknik kayıtları ayrıdır. Sayımı kapat kimliği tarayıcıdan kaldırır ve gelecekteki katılımı durdurur; geçmiş anonim toplamı düşürmez. Kimliğini temizleyen veya birden fazla tarayıcı kullanan kişi tekrar sayılabilir. Kimlik üreten botları kesin ayırma garantisi yoktur; bu insan nüfusu sayımı veya gerçek zamanlı aktif kişi sayısı değildir.

POST aynı origin, küçük doğrulanmış gövde, consent=true ve UUID gerektirir. İstek sınırlaması sunucu örneği bazında koruma sağlar; küresel bot savunması değildir. SQL hata ayrıntıları istemciye verilmez. VISITOR_METRICS_ENABLED=0 kapatma anahtarıdır. Harici snapshot veya uydurma ziyaretçi kaydı kullanılmaz.

## 1.453 başlangıç değeri

Görsel gösterge 1.453 + gerçek yıllık kayıt sayısıdır; başlık Xucuz sayacıdır ve başlangıç değeri açıkça belirtilir. 1.453 gerçek ziyaretçi sayısı olarak kaydedilmez veya raporlanmaz. /api/visitors count alanı yalnızca gerçek katılımları içerir. Ölçüm bağlı değilken gösterge 1.453 başlangıç değerinde kalır ve bu durum yazılır. Hedef ifadesi yoktur.

Türkiye takvim yılı esas alınır: 1 Ocakta yeni yıllık sayım başlar, görsel başlangıç yine 1.453 olur. Aynı tarayıcı o yıl bir kez sayılır. Yeni yearly tabloları eski monthly kayıtlarından doldurulmaz. Sayım, canlı bağlantı etkinleştirildikten sonra ilk gerçek katılımla başlar; bugünden veri toplandığı ileri sürülmez. started_at ilk gerçek kaydın zamanıdır.
