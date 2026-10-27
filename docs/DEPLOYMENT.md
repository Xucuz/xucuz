# Yayına hazırlık

1. Node.js 24 destekli Vercel projesi veya Docker hosting seçin. Bu çalışma ücretli hizmet satın almaz.
2. GitHub kaynağı Xucuz/xucuz, inceleme dalı feat/xucuz-platform. Main dalında başlangıç README kalır; PR birleştirilmeden main tabanlı production yeni kodu görmez. Preview dalı seçilebilir.
3. Demo önizleme için DATA_MODE=demo; NEXT_PUBLIC_SITE_URL gerçek preview URL'si. Demo robots ve tüm sayfalarda noindex uygular.
4. PostgreSQL 17 hazırlayın, TLS bağlantılı DATABASE_URL secret ekleyin. Migration güvenli ortamda `npm run db:migrate` ile çalıştırılır. Demo seed canlı için gerekli değildir.
5. Yönetim için ADMIN_PASSWORD_HASH ve en az 32 karakter SESSION_SECRET. Production HTTPS zorunludur. Güçlü benzersiz parola kullanın. Anahtar rotasyonu tüm oturumları iptal eder.
6. Yetkili sağlayıcı sözleşmeleri, resmî API/feed dokümantasyonu, test/production erişimleri ve izinli yönlendirme alan adları gereklidir. Bunlar olmadan canlı fiyat sunulmaz.
7. CONTACT_EMAIL, BUSINESS_NAME, BUSINESS_ADDRESS ve veri sorumlusu/saklama politikası sağlanmalı; hukuki metinler işletmeye göre incelenmelidir. Mevcut metinler hukuki uygunluk iddiası değildir.
8. Hosting hedefini alan adına bağlayın. xucuz.com ve www için hostingin verdiği DNS kayıtlarını kullanın; hedef IP veya CNAME tahmin etmeyin. HTTPS sertifikasını ve canonical adresini doğrulayın.
9. Günlük veritabanı yedeği ve geri yükleme denemesi, saklama politikası, gizli bilgi içermeyen hata izleme kurun. Varsayılan analitik/reklam takibi yoktur.
10. Tek süreç dışına ölçeklenirse paylaşımlı istek limiti/cache veya edge ters proxy limiti ekleyin. Mevcut limitler süreç içidir. HTTP request boyutu ters proxyde de sınırlandırılmalıdır.
11. Lint, tip, test, build ve mobil E2E kontrolleri geçtikten sonra canlı geçiş yapın. Geri dönüş: önceki imaj/deployment, gerekirse sağlayıcıyı kapatma. Migration geri alma veri kaybı açısından ayrıca değerlendirilir.

## Dağıtım yetkileri

GitHub push yetkisi doğrulandı. Bu oturumda Vercel hesabı/projesi veya DNS yetkisi bulunmadı. GitHub commit'i hosting dağıtımının tamamlandığı anlamına gelmez. Vercel projesi adresi ve repo bağlantısı/verilen dalın preview yetkisi gerekir. Tokenları sohbete veya Git'e yazmayın; servis bağlantısı/secret store kullanın.

## Vercel 404 düzeltmesi

İlk boş depodan alınan framework/çıktı ayarlarını aşmak için `vercel.json` dosyası `framework: nextjs`, `buildCommand: npm run build`, `outputDirectory: .next` tanımlar. Proje Root Directory depo kökü olmalıdır. Başarılı yeni deployment sonrası Visit bağlantısını açın; eski deployment URL'si eski çıktıyı göstermeye devam eder. Preview Vercel Authentication ile korunuyorsa erişim sahibi Vercel hesabıyla giriş gerekir. Site sayfasının yanıtını bu koruma olmadan bağımsız doğrulamak mümkün değildir.
