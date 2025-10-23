import React, { useState, useRef } from 'react';
import { CreatePostData, POST_CATEGORIES, POST_VISIBILITY_OPTIONS, PostCategory } from '../types/post';
import './CreatePost.css';

interface CreatePostProps {
  onSubmit: (data: CreatePostData) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const CreatePost: React.FC<CreatePostProps> = ({ onSubmit, onCancel, isSubmitting = false }) => {
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<PostCategory>('general');
  const [visibility, setVisibility] = useState<'public' | 'followers' | 'private'>('public');
  const [images, setImages] = useState<File[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const maxFiles = 4;
    
    if (images.length + files.length > maxFiles) {
      alert(`En fazla ${maxFiles} görsel yükleyebilirsiniz`);
      return;
    }

    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) {
        alert('Sadece görsel dosyalar yükleyebilirsiniz');
        return false;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert('Görsel boyutu 5MB\'den küçük olmalıdır');
        return false;
      }
      return true;
    });

    if (validFiles.length > 0) {
      const newImages = [...images, ...validFiles];
      const newPreviews = [...previewImages];
      
      validFiles.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          newPreviews.push(e.target?.result as string);
          setPreviewImages([...newPreviews]);
        };
        reader.readAsDataURL(file);
      });

      setImages(newImages);
    }
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    const newPreviews = previewImages.filter((_, i) => i !== index);
    setImages(newImages);
    setPreviewImages(newPreviews);
  };

  const handleTagAdd = () => {
    const trimmedTag = tagInput.trim().toLowerCase();
    if (trimmedTag && !tags.includes(trimmedTag) && tags.length < 10) {
      setTags([...tags, trimmedTag]);
      setTagInput('');
    }
  };

  const handleTagKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleTagAdd();
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      alert('Lütfen bir içerik yazın');
      return;
    }

    if (content.length > 2000) {
      alert('İçerik 2000 karakterden fazla olamaz');
      return;
    }

    const postData: CreatePostData = {
      type: images.length > 0 ? (content.trim() ? 'text-image' : 'image') : 'text',
      category,
      content: content.trim(),
      images: images.length > 0 ? images : undefined,
      tags: tags.length > 0 ? tags : undefined,
      visibility
    };

    try {
      await onSubmit(postData);
      // Form'u temizle
      setContent('');
      setCategory('general');
      setVisibility('public');
      setImages([]);
      setTags([]);
      setTagInput('');
      setPreviewImages([]);
      setShowAdvanced(false);
    } catch (error) {
      console.error('Post oluşturulurken hata:', error);
      alert('Post oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.');
    }
  };

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  };

  React.useEffect(() => {
    adjustTextareaHeight();
  }, [content]);

  return (
    <div className="create-post">
      <div className="create-post-header">
        <h2>Yeni Gönderi</h2>
        <button 
          type="button" 
          className="close-btn"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          ✕
        </button>
      </div>

      <form onSubmit={handleSubmit} className="create-post-form">
        {/* Kategori Seçimi */}
        <div className="form-group category-selection">
          <label>Kategori</label>
          <div className="category-buttons">
            {POST_CATEGORIES.map(cat => (
              <button
                key={cat.value}
                type="button"
                className={`category-btn ${category === cat.value ? 'active' : ''}`}
                onClick={() => setCategory(cat.value)}
                disabled={isSubmitting}
              >
                <span className="category-icon">{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* İçerik Yazma Alanı */}
        <div className="form-group content-group">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Düşüncelerinizi paylaşın..."
            className="content-textarea"
            maxLength={2000}
            disabled={isSubmitting}
            rows={3}
          />
          <div className="content-info">
            <span className="char-count">{content.length}/2000</span>
          </div>
        </div>

        {/* Görsel Önizlemeleri */}
        {previewImages.length > 0 && (
          <div className="image-previews">
            {previewImages.map((preview, index) => (
              <div key={index} className="image-preview">
                <img src={preview} alt={`Preview ${index + 1}`} />
                <button
                  type="button"
                  className="remove-image-btn"
                  onClick={() => removeImage(index)}
                  disabled={isSubmitting}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Etiketler */}
        {tags.length > 0 && (
          <div className="tags-display">
            {tags.map(tag => (
              <span key={tag} className="tag">
                #{tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  disabled={isSubmitting}
                >
                  ✕
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Gelişmiş Seçenekler */}
        {showAdvanced && (
          <div className="advanced-options">
            {/* Etiket Ekleme */}
            <div className="form-group">
              <label>Etiketler</label>
              <div className="tag-input-container">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagKeyPress}
                  placeholder="Etiket ekleyin..."
                  maxLength={20}
                  disabled={isSubmitting || tags.length >= 10}
                />
                <button
                  type="button"
                  onClick={handleTagAdd}
                  disabled={!tagInput.trim() || tags.length >= 10 || isSubmitting}
                  className="add-tag-btn"
                >
                  Ekle
                </button>
              </div>
              <small>En fazla 10 etiket ekleyebilirsiniz</small>
            </div>

            {/* Görünürlük Ayarı */}
            <div className="form-group">
              <label>Görünürlük</label>
              <select
                value={visibility}
                onChange={(e) => setVisibility(e.target.value as 'public' | 'followers' | 'private')}
                disabled={isSubmitting}
              >
                {POST_VISIBILITY_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.icon} {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Alt Araç Çubuğu */}
        <div className="post-toolbar">
          <div className="toolbar-left">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              multiple
              style={{ display: 'none' }}
              disabled={isSubmitting || images.length >= 4}
            />
            
            <button
              type="button"
              className="toolbar-btn"
              onClick={() => fileInputRef.current?.click()}
              disabled={isSubmitting || images.length >= 4}
              title="Görsel ekle"
            >
              📷 Görsel
            </button>

            <button
              type="button"
              className="toolbar-btn"
              onClick={() => setShowAdvanced(!showAdvanced)}
              disabled={isSubmitting}
              title="Gelişmiş seçenekler"
            >
              ⚙️ {showAdvanced ? 'Gizle' : 'Seçenekler'}
            </button>
          </div>

          <div className="toolbar-right">
            <button
              type="button"
              className="cancel-btn"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              İptal
            </button>
            
            <button
              type="submit"
              className="submit-btn"
              disabled={!content.trim() || isSubmitting}
            >
              {isSubmitting ? 'Paylaşılıyor...' : 'Paylaş'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreatePost;