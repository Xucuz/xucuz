# Topluluk destekli fiyat platformu — ilk aşama

## Depo incelemesi

Depo; Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4, PostgreSQL 17, Drizzle ORM ve Zod kullanıyor. `src/lib/providers/engine.ts` sağlayıcı adaptörleri, zaman aşımı/önbellek/hata izolasyonu ve canlı/demo modunu yönetiyor. `src/lib/products/` ürün rehberleri ile 630 tür/model kaydı içeriyor. Ürün, varyant, teklif, fiyat gözlemi ve yönetici içe aktarma tabloları mevcut. Yönetim oturumu imzalı ve HttpOnly. Vitest, Playwright ve PostgreSQL kullanan GitHub Actions doğrulama iş akışı var.

Eksikler: topluluk fiyat gönderimi ve kanıt dosyalarının güvenli saklanması yok; moderasyon kuyruğu yok; dil seçici yok; PWA manifest/service worker yok; mevcut rehber sohbeti metin tabanlı ve insan desteğine bağlı değil. Doğrulanmış aktif satıcı entegrasyonu yok; canlı modda fiyat göstermemek mevcut ve korunması gereken davranış.

## İlk aşama kararı

1. Ana sayfayı sade arama odaklı bir düzene ve lacivert, beyaz, yeşil palete al.
2. `/fiyatlar` ve `/fiyat-ekle` ile ürün/bölge araması ve topluluk gönderisi akışını kur. İlk veri alanı market fiyat gözlemleridir; veri kaynağı, şehir, mağaza, paket ölçüsü, kampanya şartı ve gözlem zamanı kayıtla birlikte tutulur.
3. Fiş, raf etiketi ve ürün görseli yüklemelerini ayrı özel kanıt kayıtları olarak PostgreSQL'de sakla. Tarayıcı fotoğrafları yeniden boyutlandırıp metadata içermeyen WebP'ye dönüştürür. SVG ve bilinmeyen dosya türlerini kabul etme; boyut/adet sınırı koy. Kanıtları herkese açma ve yönetici incelemesi tamamlanınca sil.
4. Gönderileri `pending` başlat. Yalnızca giriş yapmış yönetici kanıtı inceledikten sonra onaylayabilir/reddedebilir. Kamuya yalnızca onaylı, süresi geçmemiş kayıtları ver; bunları “topluluk gözlemi” olarak göster, satıcıya git bağlantısı veya canlı satıcı fiyatı gibi sunma.
5. Türkçe/İngilizce/Rusça ilk aşama ana akışını (arama, gönderi, sonuç ve Xucina yardım paneli) yerelleştir.
6. Xucina için ürün rehberlerine dayalı, fiyat uydurmayan yazılı asistanı koru ve tarayıcının Web Speech API'lerini isteğe bağlı kullan. Ses izni yoksa metin akışı çalışmaya devam etsin.
7. PWA manifest, kurulum bilgisi ve çevrimdışı statik yardım sayfası ekle. Çevrimdışıyken fiyatları güncelmiş gibi sunma.
8. Şema, moderasyon yetkisi, gizli kanıtlar, onay sonrası görünürlük, dil seçimi ve fiyat tazeliği için test ekle.

## Sınırlar ve sonraki aşama

İlk sürüm anonim, hesap gerektirmeyen gönderi kabul eder; kullanıcı IP'si ve kimliği uygulama veritabanına yazılmaz. Uygunluk ve spam sınırları sunucu tarafında uygulanır. Moderatör hesabı varsayılan üretilmez. Market fiyatları dışında kategoriye özgü gönderiler, kullanıcı hesabı/itibar sistemi, topluluk oylaması, otomatik OCR, ölçekli görsel nesne deposu, harici kimlik doğrulama ve sesli yanıt üretimi sonraki aşamalardır. Üretim ortamında kullanıcı yüklemeleri için PostgreSQL saklama maliyeti ve yedekleme kapasitesi takip edilmeli; içerik saklama/silme politikası işletme bilgileriyle yayından önce netleştirilmelidir.

## Doğrulama

`npm run lint`, `npm run typecheck`, `npm test`, PostgreSQL migration ve `npm run build`; ayrıca Playwright ana sayfa, dil seçimi, yükleme doğrulaması, moderasyon erişimi ve mobil görünümü doğrular. Production dağıtım bu çalışmanın kapsamı dışındadır.
