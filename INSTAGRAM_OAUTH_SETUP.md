# Instagram OAuth Setup Instructions

## Facebook Developers Setup

Instagram Basic Display API, Facebook Developers platformu üzerinden yönetilir.

### 1. Facebook Developer Account
1. **Facebook Developers'a git**: https://developers.facebook.com/
2. **Hesabınızla giriş yapın** (Facebook hesabı gerekli)
3. **Geliştirici hesabı oluşturun** (eğer yoksa)

### 2. Yeni Uygulama Oluşturma
1. **"Uygulamalarım" > "Uygulama Oluştur"** seçin
2. **Uygulama Türü**: "Tüketici" seçin
3. **Uygulama Adı**: "Book Mate" (veya istediğiniz isim)
4. **İletişim E-postası**: Geliştirici e-postanız
5. **Uygulamayı Oluştur**

### 3. Instagram Basic Display API Ekleme
1. Dashboard'da **"+ Ürün Ekle"** butonuna tıklayın
2. **"Instagram Basic Display"** bulun ve **"Kur"** butonuna tıklayın
3. **"Temel Ayarlar"** sekmesine gidin

### 4. OAuth Ayarları
**Valid OAuth Redirect URIs**'ye ekleyin:
```
http://localhost:5173/auth/instagram/callback
http://localhost:5174/auth/instagram/callback
http://127.0.0.1:5173/auth/instagram/callback
http://127.0.0.1:5174/auth/instagram/callback
```

**Deauthorize Callback URL** (isteğe bağlı):
```
http://localhost:5173/auth/instagram/deauth
```

**Data Deletion Request URL** (isteğe bağlı):
```
http://localhost:5173/auth/instagram/delete
```

### 5. Environment Variables
**App Dashboard > Basic Settings** kısmından:

1. **App ID** ve **App Secret**'i kopyalayın
2. `.env` dosyasında güncelleyin:

```bash
# Instagram OAuth Configuration
VITE_INSTAGRAM_CLIENT_ID=your_instagram_app_id_here
VITE_INSTAGRAM_CLIENT_SECRET=your_instagram_app_secret_here
VITE_INSTAGRAM_REDIRECT_URI=http://localhost:5174/auth/instagram/callback
```

### 6. Test Kullanıcıları Ekleme
1. **Instagram Basic Display > Basic Display** sekmesine gidin
2. **"Instagram Testers"** bölümüne gidin  
3. **"Add Instagram Testers"** ile test kullanıcıları ekleyin
4. Test kullanıcıları davetiyeyi kabul etmeli

### 7. Uygulama Modları
- **Development Mode**: Sadece test kullanıcıları giriş yapabilir
- **Live Mode**: Tüm kullanıcılar giriş yapabilir (App Review gerekli)

### 8. Test Etme
1. `npm run dev` ile development server'ı başlatın
2. Login/Register sayfasında "Instagram ile Giriş Yap" butonuna tıklayın
3. Instagram OAuth popup'ı açılacak
4. Test hesabınızla giriş yapın
5. Uygulamaya geri dönülecek

## Production Hazırlık

### App Review Süreci
1. **App Review** kısmından Live Mode için başvuru yapın
2. **instagram_graph_user_profile** permission'ı isteyin
3. Kullanım amaçlarını detaylı açıklayın
4. Screenshot'lar ve video ekleyin

### Production URLs
Production domain'lerinizi **Valid OAuth Redirect URIs**'ye ekleyin:
```
https://yourdomain.com/auth/instagram/callback
```

## Troubleshooting

**Common Issues:**
- **"Redirect URI Mismatch"**: Valid OAuth Redirect URIs'yi kontrol edin
- **"App Not Setup"**: Instagram Basic Display API'nin eklendiğinden emin olun  
- **"User Not Authorized"**: Test kullanıcıları listesini kontrol edin
- **"Permission Denied"**: Development mode'da sadece test kullanıcıları giriş yapabilir

**Debug:**
- Browser developer tools'da Network tab'ını kontrol edin
- Console'da error mesajlarını inceleyin
- Facebook Developers > Tools > Graph API Explorer ile API'yi test edin

## API Limits
- **Basic Display API**: 200 requests/hour per user
- **Rate Limiting**: Instagram'ın rate limit'lerine dikkat edin
- **Data Usage**: Sadece gerekli verileri çekin (profile, media)