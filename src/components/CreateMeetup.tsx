import React, { useState, useEffect } from 'react';
import { CreateMeetupData, MEETUP_CATEGORIES, POPULAR_THEMES } from '../types/meetup';
import { Book } from '../types/book';
import { GoogleBooksService } from '../services/googleBooksService';
import './CreateMeetup.css';

interface CreateMeetupProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (meetupData: CreateMeetupData) => Promise<void>;
  isLoading?: boolean;
}

const CreateMeetup: React.FC<CreateMeetupProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  isLoading = false 
}) => {
  const [formData, setFormData] = useState<CreateMeetupData>({
    title: '',
    description: '',
    theme: '',
    maxMembers: 4,
    isPrivate: false,
    tags: [],
    category: 'theme-based',
    initialMessage: ''
  });

  const [bookSearch, setBookSearch] = useState('');
  const [searchResults, setSearchResults] = useState<Book[]>([]);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        title: '',
        description: '',
        theme: '',
        maxMembers: 4,
        isPrivate: false,
        tags: [],
        category: 'theme-based',
        initialMessage: ''
      });
      setSelectedBook(null);
      setBookSearch('');
      setTagInput('');
      setErrors({});
    }
  }, [isOpen]);

  const handleInputChange = (field: keyof CreateMeetupData, value: string | number | boolean | Date | Book | null) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleBookSearch = async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const result = await GoogleBooksService.searchBooks({ query, maxResults: 5 });
      setSearchResults(result.books);
    } catch (error) {
      console.error('Book search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleBookSelect = (book: Book) => {
    setSelectedBook(book);
    setFormData(prev => ({
      ...prev,
      bookId: book.id,
      title: prev.title || `${book.title} Okuma Grubu`,
      theme: prev.theme || book.categories?.[0] || 'Kitap Odaklı',
      coverImage: book.imageLinks?.thumbnail
    }));
    setBookSearch(book.title);
    setSearchResults([]);
  };

  const handleThemeSelect = (theme: string) => {
    setFormData(prev => ({ ...prev, theme }));
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Grup başlığı gerekli';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Grup açıklaması gerekli';
    }

    if (!formData.theme.trim()) {
      newErrors.theme = 'Tema seçimi gerekli';
    }

    if (formData.maxMembers < 2 || formData.maxMembers > 4) {
      newErrors.maxMembers = 'Üye sayısı 2-4 arasında olmalı';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Meetup creation error:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="create-meetup-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Yeni Buluşma Grubu Oluştur</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="create-meetup-form">
          {/* Category Selection */}
          <div className="form-group">
            <label>Grup Kategorisi</label>
            <div className="category-buttons">
              {MEETUP_CATEGORIES.map(category => (
                <button
                  key={category.id}
                  type="button"
                  className={`category-btn ${formData.category === category.id ? 'active' : ''}`}
                  onClick={() => handleInputChange('category', category.id)}
                >
                  <span className="category-label">{category.label}</span>
                  <span className="category-desc">{category.description}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Book Selection (for book-specific category) */}
          {formData.category === 'book-specific' && (
            <div className="form-group">
              <label>Kitap Seçin</label>
              <div className="book-search">
                <input
                  type="text"
                  value={bookSearch}
                  onChange={(e) => {
                    setBookSearch(e.target.value);
                    handleBookSearch(e.target.value);
                  }}
                  placeholder="Kitap adı veya yazar..."
                  className="book-search-input"
                />
                {isSearching && <div className="search-loader">Aranıyor...</div>}
                
                {searchResults.length > 0 && (
                  <div className="search-results">
                    {searchResults.map(book => (
                      <div
                        key={book.id}
                        className="search-result-item"
                        onClick={() => handleBookSelect(book)}
                      >
                        <img
                          src={book.imageLinks?.thumbnail || '/placeholder-book.png'}
                          alt={book.title}
                          className="book-thumbnail"
                        />
                        <div className="book-info">
                          <h4>{book.title}</h4>
                          <p>{book.authors?.join(', ')}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {selectedBook && (
                  <div className="selected-book">
                    <img
                      src={selectedBook.imageLinks?.thumbnail || '/placeholder-book.png'}
                      alt={selectedBook.title}
                    />
                    <div>
                      <h4>{selectedBook.title}</h4>
                      <p>{selectedBook.authors?.join(', ')}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedBook(null);
                        setBookSearch('');
                        setFormData(prev => ({ ...prev, bookId: undefined }));
                      }}
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Theme Selection */}
          <div className="form-group">
            <label>Tema</label>
            <div className="theme-input">
              <input
                type="text"
                value={formData.theme}
                onChange={(e) => handleInputChange('theme', e.target.value)}
                placeholder="Grup temasını yazın..."
                className={errors.theme ? 'error' : ''}
              />
              <div className="popular-themes">
                <p>Popüler temalar:</p>
                <div className="theme-tags">
                  {POPULAR_THEMES.slice(0, 8).map(theme => (
                    <button
                      key={theme}
                      type="button"
                      className="theme-tag"
                      onClick={() => handleThemeSelect(theme)}
                    >
                      {theme}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            {errors.theme && <span className="error-text">{errors.theme}</span>}
          </div>

          {/* Basic Info */}
          <div className="form-row">
            <div className="form-group">
              <label>Grup Başlığı</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Grubunuza çekici bir başlık verin"
                className={errors.title ? 'error' : ''}
              />
              {errors.title && <span className="error-text">{errors.title}</span>}
            </div>
            
            <div className="form-group">
              <label>Maksimum Üye Sayısı</label>
              <select
                value={formData.maxMembers}
                onChange={(e) => handleInputChange('maxMembers', parseInt(e.target.value))}
                className={errors.maxMembers ? 'error' : ''}
              >
                <option value={2}>2 kişi</option>
                <option value={3}>3 kişi</option>
                <option value={4}>4 kişi</option>
              </select>
              {errors.maxMembers && <span className="error-text">{errors.maxMembers}</span>}
            </div>
          </div>

          <div className="form-group">
            <label>Grup Açıklaması</label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Grubunuzun amacını, okuma planınızı ve beklentilerinizi açıklayın..."
              rows={4}
              className={errors.description ? 'error' : ''}
            />
            {errors.description && <span className="error-text">{errors.description}</span>}
          </div>

          {/* Tags */}
          <div className="form-group">
            <label>Etiketler</label>
            <div className="tag-input">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="Etiket ekleyin..."
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
              />
              <button type="button" onClick={handleAddTag}>Ekle</button>
            </div>
            {formData.tags.length > 0 && (
              <div className="selected-tags">
                {formData.tags.map(tag => (
                  <span key={tag} className="tag">
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Privacy Settings */}
          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={formData.isPrivate}
                onChange={(e) => handleInputChange('isPrivate', e.target.checked)}
              />
              <span>Özel grup (davet kodu ile katılım)</span>
            </label>
            {formData.isPrivate && (
              <p className="privacy-info">
                Grubunuz oluşturulduktan sonra davet kodu paylaşabilirsiniz
              </p>
            )}
          </div>

          {/* Initial Message */}
          <div className="form-group">
            <label>İlk Mesaj (Opsiyonel)</label>
            <textarea
              value={formData.initialMessage}
              onChange={(e) => handleInputChange('initialMessage', e.target.value)}
              placeholder="Gruba katılan üyeleri karşılayacak ilk mesajınızı yazın..."
              rows={3}
            />
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose} className="cancel-btn">
              İptal
            </button>
            <button 
              type="submit" 
              disabled={isLoading}
              className="create-btn"
            >
              {isLoading ? 'Oluşturuluyor...' : 'Grubu Oluştur'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateMeetup;