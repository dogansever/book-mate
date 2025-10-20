import { SearchCriteria, SearchFilters, SearchResultItem, BookSearchResponse } from '../types/book';
import { UserBook } from '../types/book';
import { User } from '../types/user';

export class BookSearchService {
  /**
   * Ana kitap arama fonksiyonu
   */
  static searchBooks(
    allUserBooks: UserBook[],
    allUsers: User[],
    criteria: SearchCriteria,
    filters: SearchFilters,
    currentUserId: string,
    currentUserCoordinates?: { latitude: number; longitude: number }
  ): BookSearchResponse {
    // 1. Temel filtreleme
    const filteredBooks = this.filterBooks(allUserBooks, criteria, currentUserId);
    
    // 2. Kullanıcı bilgileri ile birleştir
    const resultsWithUsers = this.attachUserInfo(filteredBooks, allUsers);
    
    // 3. Mesafe hesaplama (eğer konum bilgisi varsa)
    const resultsWithDistance = currentUserCoordinates 
      ? this.calculateDistances(resultsWithUsers, currentUserCoordinates)
      : resultsWithUsers;
    
    // 4. Ek filtreler uygula
    const finalResults = this.applyAdditionalFilters(resultsWithDistance, filters, criteria);
    
    // 5. Sıralama
    const sortedResults = this.sortResults(finalResults, filters);
    
    // 6. Yakındaki öneriler
    const nearbyResults = this.getNearbyRecommendations(
      sortedResults, 
      criteria.maxDistance || 50
    );
    
    return {
      results: sortedResults,
      totalResults: sortedResults.length,
      appliedFilters: { ...criteria, ...filters },
      nearbyResults: nearbyResults.slice(0, 5) // İlk 5 yakın öneri
    };
  }

  /**
   * Temel kitap filtreleme
   */
  private static filterBooks(
    allUserBooks: UserBook[],
    criteria: SearchCriteria,
    currentUserId: string
  ): UserBook[] {
    return allUserBooks.filter(book => {
      // Kendi kitaplarını hariç tut
      if (book.userId === currentUserId) return false;

      // Genel arama terimi
      if (criteria.query) {
        const query = criteria.query.toLowerCase();
        const titleMatch = book.title.toLowerCase().includes(query);
        const authorMatch = book.authors.some(author => 
          author.toLowerCase().includes(query)
        );
        if (!titleMatch && !authorMatch) return false;
      }

      // Yazar filtresi
      if (criteria.author) {
        const authorQuery = criteria.author.toLowerCase();
        const hasAuthor = book.authors.some(author =>
          author.toLowerCase().includes(authorQuery)
        );
        if (!hasAuthor) return false;
      }

      // Başlık filtresi
      if (criteria.title) {
        const titleQuery = criteria.title.toLowerCase();
        if (!book.title.toLowerCase().includes(titleQuery)) return false;
      }

      // Minimum puan filtresi
      if (criteria.minRating && book.rating) {
        if (book.rating < criteria.minRating) return false;
      }

      return true;
    });
  }

  /**
   * Kullanıcı bilgilerini kitaplara ekle
   */
  private static attachUserInfo(
    books: UserBook[],
    users: User[]
  ): SearchResultItem[] {
    return books.map(book => {
      const owner = users.find(user => user.id === book.userId);
      
      return {
        userBook: book,
        owner: {
          id: owner?.id || book.userId,
          displayName: owner?.displayName || 'Bilinmeyen Kullanıcı',
          city: owner?.profile?.city,
          avatar: owner?.avatar
        },
        matchScore: 1.0 // Varsayılan skor
      };
    });
  }

  /**
   * Mesafe hesaplama
   */
  private static calculateDistances(
    results: SearchResultItem[],
    currentCoordinates: { latitude: number; longitude: number }
  ): SearchResultItem[] {
    return results.map(result => {
      // Mock koordinatlar - gerçek uygulamada kullanıcıların gerçek koordinatları kullanılır
      const ownerCoordinates = this.getMockCoordinatesForCity(
        result.owner.city || 'İstanbul'
      );
      
      const distance = this.calculateHaversineDistance(
        currentCoordinates,
        ownerCoordinates
      );
      
      return {
        ...result,
        distance
      };
    });
  }

  /**
   * Ek filtreler (mesafe, durum, vb.)
   */
  private static applyAdditionalFilters(
    results: SearchResultItem[],
    filters: SearchFilters,
    criteria: SearchCriteria
  ): SearchResultItem[] {
    let filtered = results;

    // Mesafe filtresi
    if (criteria.maxDistance && filtered.some(r => r.distance !== undefined)) {
      filtered = filtered.filter(result => 
        !result.distance || result.distance <= (criteria.maxDistance || 50)
      );
    }

    // Sadece uygun kitaplar (takas edilebilir durumda)
    if (filters.includeAvailableOnly) {
      filtered = filtered.filter(result => 
        result.userBook.status === 'read' || result.userBook.status === 'want-to-read'
      );
    }

    // Şehir filtresi
    if (criteria.city) {
      filtered = filtered.filter(result =>
        result.owner.city === criteria.city
      );
    }

    // Kullanıcı adı filtresi
    if (criteria.owner) {
      const ownerQuery = criteria.owner.toLowerCase();
      filtered = filtered.filter(result =>
        result.owner.displayName.toLowerCase().includes(ownerQuery)
      );
    }

    return filtered;
  }

  /**
   * Sonuçları sırala
   */
  private static sortResults(
    results: SearchResultItem[],
    filters: SearchFilters
  ): SearchResultItem[] {
    const sortBy = filters.sortBy || 'title';
    const sortOrder = filters.sortOrder || 'asc';
    
    return results.sort((a, b) => {
      let comparison;
      
      switch (sortBy) {
        case 'title': {
          comparison = a.userBook.title.localeCompare(b.userBook.title, 'tr');
          break;
        }
        case 'author': {
          const authorA = a.userBook.authors[0] || '';
          const authorB = b.userBook.authors[0] || '';
          comparison = authorA.localeCompare(authorB, 'tr');
          break;
        }
        case 'rating': {
          const ratingA = a.userBook.rating || 0;
          const ratingB = b.userBook.rating || 0;
          comparison = ratingA - ratingB;
          break;
        }
        case 'dateAdded': {
          comparison = a.userBook.dateAdded.getTime() - b.userBook.dateAdded.getTime();
          break;
        }
        case 'distance': {
          const distA = a.distance || Infinity;
          const distB = b.distance || Infinity;
          comparison = distA - distB;
          break;
        }
        default: {
          comparison = 0;
        }
      }
      
      return sortOrder === 'desc' ? -comparison : comparison;
    });
  }

  /**
   * Yakındaki önerileri getir
   */
  private static getNearbyRecommendations(
    results: SearchResultItem[],
    maxDistance: number
  ): SearchResultItem[] {
    return results
      .filter(result => result.distance && result.distance <= maxDistance)
      .sort((a, b) => (a.distance || 0) - (b.distance || 0));
  }

  /**
   * Haversine formülü ile mesafe hesaplama
   */
  private static calculateHaversineDistance(
    coords1: { latitude: number; longitude: number },
    coords2: { latitude: number; longitude: number }
  ): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(coords2.latitude - coords1.latitude);
    const dLon = this.toRadians(coords2.longitude - coords1.longitude);
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(coords1.latitude)) * 
      Math.cos(this.toRadians(coords2.latitude)) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    
    return Math.round(R * c);
  }

  private static toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Şehir için mock koordinatlar - demo amaçlı
   */
  private static getMockCoordinatesForCity(city: string): { latitude: number; longitude: number } {
    const ISTANBUL = 'İstanbul';
    const ANKARA = 'Ankara';
    const IZMIR = 'İzmir';
    const BURSA = 'Bursa';
    const ANTALYA = 'Antalya';
    const ADANA = 'Adana';
    const KONYA = 'Konya';
    const GAZIANTEP = 'Gaziantep';
    const MERSIN = 'Mersin';
    const KAYSERI = 'Kayseri';
    
    const cityCoordinates: { [key: string]: { latitude: number; longitude: number } } = {
      [ISTANBUL]: { latitude: 41.0082, longitude: 28.9784 },
      [ANKARA]: { latitude: 39.9334, longitude: 32.8597 },
      [IZMIR]: { latitude: 38.4237, longitude: 27.1428 },
      [BURSA]: { latitude: 40.1826, longitude: 29.0665 },
      [ANTALYA]: { latitude: 36.8969, longitude: 30.7133 },
      [ADANA]: { latitude: 37.0000, longitude: 35.3213 },
      [KONYA]: { latitude: 37.8713, longitude: 32.4846 },
      [GAZIANTEP]: { latitude: 37.0662, longitude: 37.3833 },
      [MERSIN]: { latitude: 36.8121, longitude: 34.6415 },
      [KAYSERI]: { latitude: 38.7312, longitude: 35.4787 }
    };
    
    return cityCoordinates[city] || cityCoordinates[ISTANBUL];
  }

  /**
   * Fuzzy search için benzerlik skoru hesapla
   */
  static calculateSimilarityScore(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const distance = this.levenshteinDistance(longer.toLowerCase(), shorter.toLowerCase());
    return (longer.length - distance) / longer.length;
  }

  /**
   * Levenshtein distance algoritması
   */
  private static levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
    
    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
    
    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1, // insertion
          matrix[j - 1][i] + 1, // deletion
          matrix[j - 1][i - 1] + indicator // substitution
        );
      }
    }
    
    return matrix[str2.length][str1.length];
  }
}

export default BookSearchService;