# Aylık ziyaretçi sayacı

Üst şerit siyah/beyaz mekanik sayaç şablonudur. Kendisi trafik toplamaz; rastgele, örnek veya localStorage sayacı yoktur. Ölçüm bağlanmadığında çizgiler ve ölçümün etkin olmadığı açıklaması gösterilir.

VISITOR_STATS_SNAPSHOT sunucu ortam değişkeni, doğrulanmış analitik kaynağından alınan JSON toplu kaydını kabul eder. Alanlar: month (Europe/Istanbul takvim ayı YYYY-MM), visitors (0..999999999 tam sayı aylık ziyaretçi, sayfa görüntüleme değil), measuredAt (gerçek ISO UTC ölçüm zamanı), source (iç denetim kaynak tanımı). Varsayılan örnek sayı sağlanmaz. Farklı ay, gelecekteki zaman, 48 saatten eski veya hatalı kayıt gösterilmez. Kaynak adı kullanıcıya aktarılmaz.

Bu bir otomatik analitik entegrasyonu değildir. Gerçek ölçüm kaynağı ve izinleri olmadan ziyaretçi sayısı etkinleşmez. Aylık sayı ziyaretçinin sıra numarası değildir; aynı kişinin farklı tarayıcı/cihaz kullanımı ölçüm kaynağının yöntemine bağlıdır. Harici analitik bağlanırsa gizlilik açıklaması ve veri kapsamı bu yönteme göre güncellenmelidir. Ortam değişkeni güncellemesinin Vercel dağıtımına uygulanması gerekir.
