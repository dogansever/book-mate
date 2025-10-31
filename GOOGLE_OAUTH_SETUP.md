# Google OAuth Setup Instructions

## Google Cloud Console Setup

1. **Google Cloud Console'a git**: https://console.cloud.google.com/
2. **Yeni proje oluştur** veya mevcut projeyi seç
3. **APIs & Services > Credentials** bölümüne git
4. **+ CREATE CREDENTIALS > OAuth 2.0 Client IDs** seç
5. **Application Type**: Web application
6. **Name**: Book Mate Web App (veya istediğin isim)

## Authorized JavaScript Origins
```
http://localhost:5173
http://localhost:5174
http://127.0.0.1:5173
http://127.0.0.1:5174
```

## Authorized Redirect URIs  
```
http://localhost:5173
http://localhost:5174
```

## Environment Setup
1. Client ID'yi kopyala
2. `.env` dosyasında `VITE_GOOGLE_CLIENT_ID` değerini güncelle:
```bash
VITE_GOOGLE_CLIENT_ID=your_actual_google_client_id_here
```

## Test Etme
1. `npm run dev` ile development server'ı başlat
2. Login/Register sayfasında "Google ile Giriş Yap" butonuna tıkla
3. Google OAuth popup'ı açılacak
4. Google hesabınla giriş yap
5. Uygulama otomatik olarak dashboard'a yönlendirecek

## Production Deploy
- Production domain'ini de Authorized Origins'e ekle
- Environment variables'ı production ortamında ayarla
- HTTPS kullanmayı unutma

## Troubleshooting
- **Popup blocked**: Browser popup ayarlarını kontrol et
- **Origin not allowed**: Authorized Origins'i kontrol et  
- **Client ID error**: .env dosyasını ve server restart'ını kontrol et