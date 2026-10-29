# Xucuz Preview — Google ve Facebook ile giriş kurulumu

Bu belge yalnızca `feat/community-price-platform` geliştirme dalı ve Vercel **Preview** ortamı içindir. Production ayarlarını değiştirmeyin.

## Durum

Henüz sosyal oturum açma altyapısı kurulmuş değildir. /sohbet sayfası mesajlaşmayı kapalı tutar. OAuth uygulama kimlikleri oluşturulmadan giriş düğmelerini etkinleştirmeyin.

## Google

1. https://console.cloud.google.com/ adresinde ayrı bir **test** projesi oluşturun.
2. OAuth consent screen ve **Web application** OAuth istemcisi oluşturun.
3. Yetkili yönlendirme URI'si: `https://xucuz-git-feat-community-price-platform-yahya-763e.vercel.app/api/auth/callback/google`.
4. Test kullanıcılarını ekleyin ve uygulama erişimini gerektiği şekilde sınırlandırın.

## Facebook

1. https://developers.facebook.com/apps/ adresinde ayrı bir geliştirme uygulaması oluşturun.
2. Facebook Login ürünü / kullanım senaryosunu etkinleştirin.
3. Valid OAuth Redirect URIs: `https://xucuz-git-feat-community-price-platform-yahya-763e.vercel.app/api/auth/callback/facebook`.
4. Geliştirme modunda yalnızca uygulama rolleri/test kullanıcıları giriş yapabilir; genel kullanıma açmak için Meta gereksinimleri ayrıca karşılanmalıdır.

## Vercel Preview sırları

Sadece **Preview** kapsamına, seçilecek Auth.js sürümüne uygun biçimde şunları ekleyin:

- `AUTH_GOOGLE_ID`
- `AUTH_GOOGLE_SECRET`
- `AUTH_FACEBOOK_ID`
- `AUTH_FACEBOOK_SECRET`
- `AUTH_SECRET` (güçlü rastgele anahtar)

Bu değerleri GitHub'a, sohbet mesajlarına veya istemci koduna koymayın. Auth.js için `AUTH_SECRET` gereklidir.

## Uygulama öncesi kontrol

- Google/Facebook OAuth akışı, state/CSRF ve güvenli oturum çerezleri
- Giriş yapmamış kullanıcı için sohbet mesaj API'sinde sunucu tarafında 401
- Giriş yapmış kullanıcıda yalnızca sağlayıcının değişmez kullanıcı kimliğiyle yetkilendirme
- Facebook bazı hesaplar için e-posta sağlamaz: e-postaya göre kullanıcı eşleştirmesi yapmayın
- Gizli alanların istemciye ve günlük kayıtlarına sızmaması
- Mesaj hız sınırı, moderasyon, şikâyet ve yönetici engellemesi
- Preview veritabanının Production'dan ayrı olduğunun doğrulanması
- Herhangi bir migration işleminden **önce kullanıcı onayı**

Gerçek OAuth kodu ve doğrulama testleri tamamlanmadan sohbeti açmayın.
