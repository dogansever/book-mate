# Book Mate 📚

Kitap tutkunları için tasarlanmış sosyal platform. Kişisel kütüphanenizi oluşturun, kitap arkadaşları bulun ve okuma deneyiminizi paylaşın.

## ✨ Özellikler

### 📚 Kütüphane Görüntüleme (My Library)
- **Görsel Kitap Rafı**: Kullanıcının sahip olduğu veya okuduğu kitapların listesi, profil sayfasında görsel "kitap rafı" olarak gösterilir
- **İki Görüntüleme Modu**: 
  - **Raf Görünümü**: Gerçek bir kitaplık rafına benzer görsel tasarım
  - **Izgara Görünümü**: Kitap kapaklarının daha detaylı gösterildiği kart görünümü
- **Filtreleme**: Okuduklarım, Okuyorum, Okuyacağım kategorilerine göre filtreleme
- **Kitap Durumu**: Görsel işaretlerle kitap okuma durumunu takip etme
- **Puanlama Sistemi**: Okunan kitaplar için 5 yıldızlı puanlama sistemi
- **Detay Modal**: Kitaplara tıklayarak detaylı bilgi görüntüleme

### 👤 Profil ve Kimlik Doğrulama
- Kullanıcı kaydı ve giriş sistemi
- Sosyal medya entegrasyonu (Google, Instagram)
- Kişisel profil bilgileri yönetimi
- Favori türler ve yazarlar

### 🔍 Kitap Keşfi
- Google Books API entegrasyonu
- Kitap arama ve filtreleme
- Kişisel kütüphaneye kitap ekleme
- Kitap detayları ve açıklamaları

### 👥 Sosyal Özellikler
- Takip sistemi
- Kitapsever ağı oluşturma
- Benzer zevklere sahip kullanıcıları bulma

## 🚀 Kurulum

### Gereksinimler

- Node.js (versiyon 18 veya üzeri)
- npm veya yarn

### Kurulum Adımları

1. Projeyi klonlayın:
```bash
git clone [repository-url]
cd book-mate
```

2. Bağımlılıkları yükleyin:
```bash
npm install
```

3. Geliştirme sunucusunu başlatın:
```bash
npm run dev
```

4. Tarayıcınızda `http://localhost:5173` adresine gidin

## 📜 Mevcut Komutlar

- `npm run dev` - Geliştirme sunucusunu başlat
- `npm run build` - Üretim için derleme
- `npm run lint` - ESLint kontrolü
- `npm run preview` - Üretim derlemesini önizle

## 📁 Proje Yapısı

```
src/
  ├── components/        # React bileşenleri
  │   ├── BookShelf.tsx     # Görsel kitap rafı bileşeni
  │   ├── BookLibrary.tsx   # Kitap kütüphanesi bileşeni
  │   ├── Dashboard.tsx     # Ana kontrol paneli
  │   ├── AddBook.tsx       # Kitap ekleme bileşeni
  │   ├── Login.tsx         # Giriş bileşeni
  │   ├── Register.tsx      # Kayıt bileşeni
  │   └── ...               # Diğer bileşenler
  ├── hooks/             # Custom React hooks
  │   ├── useAuth.ts        # Kimlik doğrulama hook'u
  │   ├── useUserBooks.ts   # Kullanıcı kitapları hook'u
  │   └── useFollow.ts      # Takip sistemi hook'u
  ├── contexts/          # React Context'leri
  │   └── AuthContext.tsx   # Kimlik doğrulama context'i
  ├── services/          # API servisleri
  │   └── googleBooksService.ts # Google Books API servisi
  ├── types/             # TypeScript tür tanımları
  │   ├── book.ts           # Kitap tür tanımları
  │   └── user.ts           # Kullanıcı tür tanımları
  ├── utils/             # Yardımcı fonksiyonlar
  │   └── culturalMatching.ts # Kültürel eşleştirme
  ├── assets/            # Statik dosyalar
  ├── App.tsx           # Ana uygulama bileşeni
  ├── App.css           # Ana uygulama stilleri
  ├── index.css         # Global stiller
  └── main.tsx          # Uygulama giriş noktası
```

## 🎨 Görsel Kitap Rafı Özellikleri

### BookShelf Bileşeni
- **Görsel Tasarım**: Ahşap kitaplık rafı görünümü
- **Animasyonlu Kitaplar**: Kitapların rafta belirmesi için slide-in animasyonları
- **İnteraktif Kitap Sırtları**: Kitap sırtlarında başlık, yazar ve puan gösterimi
- **Hover Efektleri**: Kitapların üzerine gelindiğinde kalkma efekti
- **Duruma Göre Renklendirme**: 
  - 🟢 Yeşil: Okundu (read)
  - 🟠 Turuncu: Okunuyor (currently-reading)  
  - 🔵 Mavi: Okunacak (want-to-read)

### Responsive Tasarım
- Mobil cihazlar için optimize edilmiş
- Tablet ve desktop görünümleri
- Esnek grid sistemi

## 🛠️ Kullanılan Teknolojiler

- **Frontend Framework**: React 18
- **Tip Güvenliği**: TypeScript
- **Build Tool**: Vite
- **Styling**: CSS3 (Custom CSS, Flexbox, Grid)
- **API**: Google Books API
- **Code Quality**: ESLint
- **State Management**: React Context + Custom Hooks
- **Authentication**: Custom authentication system

## 🔧 Geliştirme

Bu proje Vite ile oluşturulmuş ve hızlı geliştirme için hot module replacement içermektedir.

Projeyi ihtiyaçlarınıza göre özelleştirmek için `src` dizinindeki bileşenleri düzenlemeye başlayın.

### Yeni Özellik Eklemek

1. İlgili tip tanımlarını `types/` dizinine ekleyin
2. Gerekli servis fonksiyonlarını `services/` dizinine ekleyin  
3. Custom hook'ları `hooks/` dizinine ekleyin
4. Bileşeni `components/` dizinine ekleyin
5. Stilleri ilgili CSS dosyasına ekleyin

## 📱 Kullanım Kılavuzu

### Kitap Rafı Kullanımı

1. **Ana Sayfa**: Dashboard'da mini kitap rafı önizlemesi
2. **Kütüphanem**: Tam kitap rafı görünümü
3. **Filtreleme**: Duruma göre kitapları filtreleme
4. **Kitap Detayları**: Kitaba tıklayarak detay modal'ı açma
5. **Durum Değişikliği**: Modal üzerinden kitap durumu güncelleme
6. **Puanlama**: Okunan kitaplar için yıldız puanlama

## 🤝 Katkıda Bulunma

1. Fork'layın
2. Feature branch oluşturun (`git checkout -b feature/AmazingFeature`)
3. Commit'leyin (`git commit -m 'Add some AmazingFeature'`)
4. Branch'i push'layın (`git push origin feature/AmazingFeature`)
5. Pull Request açın

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.
