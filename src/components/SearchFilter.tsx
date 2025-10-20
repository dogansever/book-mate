import React, { useState } from 'react';
import { SearchCriteria, SearchFilters } from '../types/book';
import './SearchFilter.css';

interface SearchFilterProps {
  onSearch: (criteria: SearchCriteria, filters: SearchFilters) => void;
  isSearching?: boolean;
  initialCriteria?: Partial<SearchCriteria>;
  initialFilters?: Partial<SearchFilters>;
}

const GENRES = [
  'Roman', 'Bilim Kurgu', 'Fantastik', 'Gerilim', 'Polisiye', 'Tarih',
  'Biyografi', 'Felsefe', 'Psikoloji', 'Edebiyat', 'Şiir', 'Deneme',
  'Araştırma', 'Bilim', 'Sanat', 'Kişisel Gelişim', 'İşadamı',
  'Çocuk', 'Gençlik', 'Eğitim', 'Sağlık', 'Spor'
];

const TURKISH_CITIES = [
  'İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya', 'Adana', 'Konya',
  'Gaziantep', 'Mersin', 'Diyarbakır', 'Kayseri', 'Eskişehir', 'Urfa',
  'Malatya', 'Erzurum', 'Van', 'Batman', 'Elazığ', 'İzmit', 'Sivas',
  'Gebze', 'Balıkesir', 'Tarsus', 'Kütahya', 'Trabzon', 'Çorum', 'Çorlu'
];

const SORT_OPTIONS = [
  { value: 'title', label: 'Kitap Adı' },
  { value: 'author', label: 'Yazar' },
  { value: 'rating', label: 'Puan' },
  { value: 'dateAdded', label: 'Eklenme Tarihi' },
  { value: 'distance', label: 'Mesafe' }
] as const;

export const SearchFilter: React.FC<SearchFilterProps> = ({
  onSearch,
  isSearching = false,
  initialCriteria = {},
  initialFilters = {}
}) => {
  const [criteria, setCriteria] = useState<SearchCriteria>({
    query: '',
    author: '',
    genre: '',
    city: '',
    owner: '',
    minRating: undefined,
    maxDistance: 50,
    ...initialCriteria
  });

  const [filters, setFilters] = useState<SearchFilters>({
    sortBy: 'title',
    sortOrder: 'asc',
    includeAvailableOnly: false,
    includeNearbyOnly: false,
    ...initialFilters
  });

  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  const handleCriteriaChange = (key: keyof SearchCriteria, value: string | number | undefined) => {
    setCriteria(prev => ({ ...prev, [key]: value }));
  };

  const handleFiltersChange = (key: keyof SearchFilters, value: string | boolean | undefined) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(criteria, filters);
  };

  const handleClear = () => {
    setCriteria({
      query: '',
      author: '',
      genre: '',
      city: '',
      owner: '',
      minRating: undefined,
      maxDistance: 50
    });
    setFilters({
      sortBy: 'title',
      sortOrder: 'asc',
      includeAvailableOnly: false,
      includeNearbyOnly: false
    });
  };

  return (
    <div className="search-filter">
      <form onSubmit={handleSubmit} className="search-form">
        {/* Ana Arama */}
        <div className="search-main">
          <div className="search-input-group">
            <input
              type="text"
              placeholder="Kitap adı, yazar, konu ara..."
              value={criteria.query || ''}
              onChange={(e) => handleCriteriaChange('query', e.target.value)}
              className="search-input main-search"
            />
            <button 
              type="submit" 
              disabled={isSearching}
              className="search-button"
            >
              {isSearching ? (
                <span className="loading-spinner">🔍</span>
              ) : (
                '🔍'
              )}
            </button>
          </div>
        </div>

        {/* Hızlı Filtreler */}
        <div className="quick-filters">
          <label className="filter-checkbox">
            <input
              type="checkbox"
              checked={filters.includeAvailableOnly || false}
              onChange={(e) => handleFiltersChange('includeAvailableOnly', e.target.checked)}
            />
            <span>Sadece Uygun Kitaplar</span>
          </label>
          
          <label className="filter-checkbox">
            <input
              type="checkbox"
              checked={filters.includeNearbyOnly || false}
              onChange={(e) => handleFiltersChange('includeNearbyOnly', e.target.checked)}
            />
            <span>Yakınımdakiler</span>
          </label>

          <button 
            type="button" 
            className="advanced-toggle"
            onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
          >
            Gelişmiş Filtreler {isAdvancedOpen ? '▲' : '▼'}
          </button>
        </div>

        {/* Gelişmiş Filtreler */}
        {isAdvancedOpen && (
          <div className="advanced-filters">
            <div className="filter-row">
              <div className="filter-group">
                <label>Yazar</label>
                <input
                  type="text"
                  placeholder="Yazar adı..."
                  value={criteria.author || ''}
                  onChange={(e) => handleCriteriaChange('author', e.target.value)}
                />
              </div>

              <div className="filter-group">
                <label>Tür</label>
                <select
                  value={criteria.genre || ''}
                  onChange={(e) => handleCriteriaChange('genre', e.target.value)}
                >
                  <option value="">Tüm Türler</option>
                  {GENRES.map(genre => (
                    <option key={genre} value={genre}>{genre}</option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <label>Şehir</label>
                <select
                  value={criteria.city || ''}
                  onChange={(e) => handleCriteriaChange('city', e.target.value)}
                >
                  <option value="">Tüm Şehirler</option>
                  {TURKISH_CITIES.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="filter-row">
              <div className="filter-group">
                <label>Kitap Sahibi</label>
                <input
                  type="text"
                  placeholder="Kullanıcı adı..."
                  value={criteria.owner || ''}
                  onChange={(e) => handleCriteriaChange('owner', e.target.value)}
                />
              </div>

              <div className="filter-group">
                <label>Minimum Puan</label>
                <select
                  value={criteria.minRating || ''}
                  onChange={(e) => handleCriteriaChange('minRating', e.target.value ? Number(e.target.value) : undefined)}
                >
                  <option value="">Farketmez</option>
                  <option value="1">1+ Yıldız</option>
                  <option value="2">2+ Yıldız</option>
                  <option value="3">3+ Yıldız</option>
                  <option value="4">4+ Yıldız</option>
                  <option value="5">5 Yıldız</option>
                </select>
              </div>

              <div className="filter-group">
                <label>Maksimum Mesafe: {criteria.maxDistance} km</label>
                <input
                  type="range"
                  min="1"
                  max="500"
                  value={criteria.maxDistance || 50}
                  onChange={(e) => handleCriteriaChange('maxDistance', Number(e.target.value))}
                  className="distance-slider"
                />
              </div>
            </div>

            <div className="filter-row">
              <div className="filter-group">
                <label>Sıralama</label>
                <select
                  value={filters.sortBy || 'title'}
                  onChange={(e) => handleFiltersChange('sortBy', e.target.value)}
                >
                  {SORT_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <label>Sıra</label>
                <select
                  value={filters.sortOrder || 'asc'}
                  onChange={(e) => handleFiltersChange('sortOrder', e.target.value as 'asc' | 'desc')}
                >
                  <option value="asc">Artan</option>
                  <option value="desc">Azalan</option>
                </select>
              </div>

              <div className="filter-actions">
                <button type="button" onClick={handleClear} className="clear-button">
                  Temizle
                </button>
                <button type="submit" disabled={isSearching} className="apply-button">
                  {isSearching ? 'Aranıyor...' : 'Uygula'}
                </button>
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default SearchFilter;