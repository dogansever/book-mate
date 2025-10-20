import { User } from '../types/user';
import { UserBook } from '../types/book';

// Genişletilmiş test kullanıcıları
export const MOCK_USERS: User[] = [
  {
    id: 'user-2',
    email: 'ali.kaya@example.com',
    displayName: 'Ali Kaya',
    avatar: '👨‍💼',
    provider: 'email',
    profile: {
      city: 'İstanbul',
      coordinates: { latitude: 41.0082, longitude: 28.9784 },
      favoriteGenres: ['Klasik Edebiyat', 'Felsefe', 'Tarih'],
      favoriteAuthors: ['Dostoyevski', 'Orhan Pamuk', 'Sabahattin Ali'],
      interests: ['Okuma', 'Seyahat', 'Müzik'],
      bio: 'Edebiyat ve felsefe meraklısı. Kitap takas etmeyi seviyorum.',
      readingGoal: 50,
      isProfileComplete: true
    },
    createdAt: new Date('2024-01-15'),
    lastLoginAt: new Date()
  },
  {
    id: 'user-3',
    email: 'zehra.demir@example.com',
    displayName: 'Zehra Demir',
    avatar: '👩‍🎓',
    provider: 'email',
    profile: {
      city: 'Ankara',
      coordinates: { latitude: 39.9334, longitude: 32.8597 },
      favoriteGenres: ['Roman', 'Biyografi', 'Psikoloji'],
      favoriteAuthors: ['Virginia Woolf', 'Elif Şafak', 'Milan Kundera'],
      interests: ['Yazma', 'Resim', 'Yoga'],
      bio: 'Psikoloji öğrencisi ve kitap kurdu.',
      readingGoal: 36,
      isProfileComplete: true
    },
    createdAt: new Date('2024-02-01'),
    lastLoginAt: new Date()
  },
  {
    id: 'user-4',
    email: 'mehmet.ozkan@example.com',
    displayName: 'Mehmet Özkan',
    avatar: '👨‍🔬',
    provider: 'email',
    profile: {
      city: 'İzmir',
      coordinates: { latitude: 38.4237, longitude: 27.1428 },
      favoriteGenres: ['Bilim Kurgu', 'Fantastik', 'Teknoloji'],
      favoriteAuthors: ['Isaac Asimov', 'Philip K. Dick', 'Liu Cixin'],
      interests: ['Teknoloji', 'Oyun', 'Bilim'],
      bio: 'Yazılım geliştirici ve bilim kurgu tutkunu.',
      readingGoal: 30,
      isProfileComplete: true
    },
    createdAt: new Date('2024-01-20'),
    lastLoginAt: new Date()
  },
  {
    id: 'user-5',
    email: 'ayse.yilmaz@example.com',
    displayName: 'Ayşe Yılmaz',
    avatar: '👩‍⚕️',
    provider: 'email',
    profile: {
      city: 'Bursa',
      coordinates: { latitude: 40.1826, longitude: 29.0665 },
      favoriteGenres: ['Kişisel Gelişim', 'Sağlık', 'Edebiyat'],
      favoriteAuthors: ['Malcolm Gladwell', 'Brené Brown', 'Nazim Hikmet'],
      interests: ['Spor', 'Meditasyon', 'Doğa'],
      bio: 'Doktor ve yaşam koçu. Kitapların hayatımızı değiştirdiğine inanıyorum.',
      readingGoal: 40,
      isProfileComplete: true
    },
    createdAt: new Date('2024-02-05'),
    lastLoginAt: new Date()
  },
  {
    id: 'user-6',
    email: 'can.bulut@example.com',
    displayName: 'Can Bulut',
    avatar: '🎨',
    provider: 'email',
    profile: {
      city: 'Antalya',
      coordinates: { latitude: 36.8969, longitude: 30.7133 },
      favoriteGenres: ['Sanat', 'Tarih', 'Fotoğrafçılık'],
      favoriteAuthors: ['John Berger', 'Susan Sontag', 'İlber Ortaylı'],
      interests: ['Fotoğraf', 'Seyahat', 'Sanat'],
      bio: 'Fotoğrafçı ve sanat tarihi meraklısı.',
      readingGoal: 25,
      isProfileComplete: true
    },
    createdAt: new Date('2024-01-25'),
    lastLoginAt: new Date()
  }
];

// Her kullanıcı için genişletilmiş kitap koleksiyonları
export const MOCK_USER_BOOKS: { [userId: string]: UserBook[] } = {
  'user-2': [
    {
      id: 'ub-ali-1',
      userId: 'user-2',
      bookId: 'book-ali-1',
      title: 'Suç ve Ceza',
      authors: ['Fyodor Dostoyevski'],
      imageUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300',
      status: 'read',
      rating: 5,
      review: 'Muhteşem bir psikolojik roman',
      dateAdded: new Date('2024-01-20'),
      dateStarted: new Date('2024-01-25'),
      dateFinished: new Date('2024-02-15'),
      pages: 624
    },
    {
      id: 'ub-ali-2',
      userId: 'user-2',
      bookId: 'book-ali-2',
      title: 'Beyaz Diş',
      authors: ['Jack London'],
      imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300',
      status: 'currently-reading',
      dateAdded: new Date('2024-02-20'),
      dateStarted: new Date('2024-02-22'),
      pages: 298,
      readingProgress: 65
    },
    {
      id: 'ub-ali-3',
      userId: 'user-2',
      bookId: 'book-ali-3',
      title: 'Benim Adım Kırmızı',
      authors: ['Orhan Pamuk'],
      imageUrl: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300',
      status: 'want-to-read',
      dateAdded: new Date('2024-03-01'),
      pages: 475
    }
  ],
  'user-3': [
    {
      id: 'ub-zehra-1',
      userId: 'user-3',
      bookId: 'book-zehra-1',
      title: 'Madame Bovary',
      authors: ['Gustave Flaubert'],
      imageUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=300',
      status: 'read',
      rating: 4,
      review: 'Gerçekçi edebiyatın başyapıtı',
      dateAdded: new Date('2024-01-10'),
      dateStarted: new Date('2024-01-15'),
      dateFinished: new Date('2024-02-10'),
      pages: 416
    },
    {
      id: 'ub-zehra-2',
      userId: 'user-3',
      bookId: 'book-zehra-2',
      title: 'Aşk',
      authors: ['Elif Şafak'],
      imageUrl: 'https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=300',
      status: 'read',
      rating: 5,
      dateAdded: new Date('2024-02-05'),
      dateStarted: new Date('2024-02-10'),
      dateFinished: new Date('2024-02-25'),
      pages: 368
    },
    {
      id: 'ub-zehra-3',
      userId: 'user-3',
      bookId: 'book-zehra-3',
      title: 'Varolmanın Dayanılmaz Hafifliği',
      authors: ['Milan Kundera'],
      imageUrl: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=300',
      status: 'currently-reading',
      dateAdded: new Date('2024-02-20'),
      dateStarted: new Date('2024-03-01'),
      pages: 314,
      readingProgress: 40
    }
  ],
  'user-4': [
    {
      id: 'ub-mehmet-1',
      userId: 'user-4',
      bookId: 'book-mehmet-1',
      title: 'Dune',
      authors: ['Frank Herbert'],
      imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=300',
      status: 'read',
      rating: 5,
      review: 'Bilim kurgunun zirvesi',
      dateAdded: new Date('2024-01-05'),
      dateStarted: new Date('2024-01-10'),
      dateFinished: new Date('2024-02-01'),
      pages: 896
    },
    {
      id: 'ub-mehmet-2',
      userId: 'user-4',
      bookId: 'book-mehmet-2',
      title: 'Foundation',
      authors: ['Isaac Asimov'],
      imageUrl: 'https://images.unsplash.com/photo-1592496431122-2349e0fbc666?w=300',
      status: 'want-to-read',
      dateAdded: new Date('2024-02-15'),
      pages: 244
    },
    {
      id: 'ub-mehmet-3',
      userId: 'user-4',
      bookId: 'book-mehmet-3',
      title: 'Neuromancer',
      authors: ['William Gibson'],
      imageUrl: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=300',
      status: 'currently-reading',
      dateAdded: new Date('2024-02-28'),
      dateStarted: new Date('2024-03-05'),
      pages: 271,
      readingProgress: 25
    }
  ],
  'user-5': [
    {
      id: 'ub-ayse-1',
      userId: 'user-5',
      bookId: 'book-ayse-1',
      title: 'Atomik Alışkanlıklar',
      authors: ['James Clear'],
      imageUrl: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=300',
      status: 'read',
      rating: 5,
      review: 'Hayat değiştiren kitap',
      dateAdded: new Date('2024-01-08'),
      dateStarted: new Date('2024-01-12'),
      dateFinished: new Date('2024-01-28'),
      pages: 320
    },
    {
      id: 'ub-ayse-2',
      userId: 'user-5',
      bookId: 'book-ayse-2',
      title: 'Sapiens',
      authors: ['Yuval Noah Harari'],
      imageUrl: 'https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=300',
      status: 'read',
      rating: 4,
      dateAdded: new Date('2024-01-20'),
      dateStarted: new Date('2024-02-01'),
      dateFinished: new Date('2024-02-20'),
      pages: 512
    },
    {
      id: 'ub-ayse-3',
      userId: 'user-5',
      bookId: 'book-ayse-3',
      title: 'Cesaret Etmek',
      authors: ['Brené Brown'],
      imageUrl: 'https://images.unsplash.com/photo-1505664194779-8beaceb93744?w=300',
      status: 'want-to-read',
      dateAdded: new Date('2024-02-25'),
      pages: 287
    }
  ],
  'user-6': [
    {
      id: 'ub-can-1',
      userId: 'user-6',
      bookId: 'book-can-1',
      title: 'Görme Biçimleri',
      authors: ['John Berger'],
      imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300',
      status: 'read',
      rating: 5,
      review: 'Sanat hakkında düşündürücü',
      dateAdded: new Date('2024-01-12'),
      dateStarted: new Date('2024-01-15'),
      dateFinished: new Date('2024-01-25'),
      pages: 176
    },
    {
      id: 'ub-can-2',
      userId: 'user-6',
      bookId: 'book-can-2',
      title: 'İstanbul: Hatıralar ve Şehir',
      authors: ['Orhan Pamuk'],
      imageUrl: 'https://images.unsplash.com/photo-1520637836862-4d197d17c50a?w=300',
      status: 'currently-reading',
      dateAdded: new Date('2024-02-10'),
      dateStarted: new Date('2024-02-15'),
      pages: 384,
      readingProgress: 55
    },
    {
      id: 'ub-can-3',
      userId: 'user-6',
      bookId: 'book-can-3',
      title: 'Fotoğraf Üzerine',
      authors: ['Susan Sontag'],
      imageUrl: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=300',
      status: 'want-to-read',
      dateAdded: new Date('2024-02-28'),
      pages: 207
    }
  ]
};

// Kullanıcı kitaplarını getiren fonksiyon
export const getUserBooksById = (userId: string): UserBook[] => {
  return MOCK_USER_BOOKS[userId] || [];
};

// Tüm kullanıcıları getiren fonksiyon
export const getAllMockUsers = (): User[] => {
  return MOCK_USERS;
};

// Tüm kitapları getiren fonksiyon (arama için)
export const getAllMockUserBooks = (): UserBook[] => {
  return Object.values(MOCK_USER_BOOKS).flat();
};

// Şehre göre kullanıcıları getiren fonksiyon
export const getUsersByCity = (city: string): User[] => {
  return MOCK_USERS.filter(user => user.profile?.city === city);
};

// Türe göre kitapları getiren fonksiyon
export const getBooksByGenre = (genre: string): UserBook[] => {
  return getAllMockUserBooks().filter(book => {
    // Mock implementation - gerçekte kitap türleri categorize edilmiş olur
    const genreKeywords: { [key: string]: string[] } = {
      'Roman': ['Madame Bovary', 'Aşk', 'Varolmanın Dayanılmaz Hafifliği', 'Benim Adım Kırmızı'],
      'Bilim Kurgu': ['Dune', 'Foundation', 'Neuromancer'],
      'Kişisel Gelişim': ['Atomik Alışkanlıklar', 'Cesaret Etmek', 'Sapiens'],
      'Sanat': ['Görme Biçimleri', 'Fotoğraf Üzerine'],
      'Klasik': ['Suç ve Ceza', 'Madame Bovary', 'Beyaz Diş'],
      'Tarih': ['İstanbul: Hatıralar ve Şehir', 'Sapiens']
    };
    
    const keywords = genreKeywords[genre] || [];
    return keywords.some(keyword => book.title.includes(keyword));
  });
};