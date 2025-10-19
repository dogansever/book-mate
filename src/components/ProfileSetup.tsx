import React, { useState, useEffect } from "react";
import { UserProfile } from "../types/user";
import { useAuth } from "../hooks/useAuth";
import "./ProfileSetup.css";

interface ProfileSetupProps {
  onComplete: () => void;
  onSkip?: () => void;
}

const ProfileSetup: React.FC<ProfileSetupProps> = ({ onComplete, onSkip }) => {
  const { state, updateProfile } = useAuth();
  const [formData, setFormData] = useState<UserProfile>({
    city: "",
    ageRange: "",
    favoriteGenres: [],
    favoriteAuthors: [],
    interests: [],
    intellectualBio: "",
    isProfileComplete: false,
  });

  const [currentAuthor, setCurrentAuthor] = useState("");
  const [currentInterest, setCurrentInterest] = useState("");

  // Önceden tanımlanmış seçenekler
  const ageRanges = ["18-24", "25-34", "35-44", "45-54", "55-64", "65+"];

  const bookGenres = [
    "Roman",
    "Bilim Kurgu",
    "Fantastik",
    "Polisiye",
    "Tarih",
    "Biyografi",
    "Felsefi",
    "Psikoloji",
    "Sosyoloji",
    "Sanat",
    "Şiir",
    "Deneme",
    "Çizgi Roman",
    "Gençlik",
    "Çocuk",
    "Kişisel Gelişim",
    "Sağlık",
    "Teknoloji",
    "İş ve Ekonomi",
    "Seyahat",
    "Yemek",
    "Spor",
  ];

  const commonInterests = [
    "Yazma",
    "Müzik",
    "Sinema",
    "Tiyatro",
    "Resim",
    "Fotoğraf",
    "Seyahat",
    "Yemek",
    "Spor",
    "Doğa",
    "Teknoloji",
    "Oyun",
    "Dans",
    "Yoga",
    "Meditasyon",
    "Bahçıvanlık",
    "El Sanatları",
    "Koleksiyonculuk",
    "Gönüllülük",
    "Dil Öğrenme",
  ];

  useEffect(() => {
    if (state.user?.profile) {
      setFormData(state.user.profile);
    }
  }, [state.user]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleGenreToggle = (genre: string) => {
    setFormData((prev) => ({
      ...prev,
      favoriteGenres: prev.favoriteGenres.includes(genre)
        ? prev.favoriteGenres.filter((g) => g !== genre)
        : [...prev.favoriteGenres, genre],
    }));
  };

  const handleInterestToggle = (interest: string) => {
    setFormData((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest],
    }));
  };

  const addAuthor = () => {
    if (
      currentAuthor.trim() &&
      !formData.favoriteAuthors.includes(currentAuthor.trim())
    ) {
      setFormData((prev) => ({
        ...prev,
        favoriteAuthors: [...prev.favoriteAuthors, currentAuthor.trim()],
      }));
      setCurrentAuthor("");
    }
  };

  const removeAuthor = (author: string) => {
    setFormData((prev) => ({
      ...prev,
      favoriteAuthors: prev.favoriteAuthors.filter((a) => a !== author),
    }));
  };

  const addCustomInterest = () => {
    if (
      currentInterest.trim() &&
      !formData.interests.includes(currentInterest.trim())
    ) {
      setFormData((prev) => ({
        ...prev,
        interests: [...prev.interests, currentInterest.trim()],
      }));
      setCurrentInterest("");
    }
  };

  const removeInterest = (interest: string) => {
    setFormData((prev) => ({
      ...prev,
      interests: prev.interests.filter((i) => i !== interest),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const completeProfile = {
      ...formData,
      isProfileComplete: true,
    };

    await updateProfile(completeProfile);
    onComplete();
  };

  const handleSkip = () => {
    if (onSkip) {
      onSkip();
    }
  };

  return (
    <div className="profile-setup-container">
      <div className="profile-setup-card">
        <div className="profile-header">
          <h1>📚 Profilini Oluştur</h1>
          <p>Book Mate deneyimini kişiselleştirmek için kendini tanıt!</p>
        </div>

        <form onSubmit={handleSubmit} className="profile-form">
          {/* Lokasyon ve Yaş */}
          <div className="form-section">
            <h3>📍 Kişisel Bilgiler</h3>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="city">Şehir</label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  placeholder="İstanbul, Ankara, İzmir..."
                />
              </div>
              <div className="form-group">
                <label htmlFor="ageRange">Yaş Aralığı</label>
                <select
                  id="ageRange"
                  name="ageRange"
                  value={formData.ageRange}
                  onChange={handleInputChange}
                >
                  <option value="">Seçiniz...</option>
                  {ageRanges.map((range) => (
                    <option key={range} value={range}>
                      {range}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Kitap Türleri */}
          <div className="form-section">
            <h3>📖 Favori Kitap Türleri</h3>
            <p className="section-desc">
              Sevdiğin kitap türlerini seç (birden fazla seçebilirsin)
            </p>
            <div className="tags-container">
              {bookGenres.map((genre) => (
                <button
                  key={genre}
                  type="button"
                  className={`tag ${
                    formData.favoriteGenres.includes(genre) ? "selected" : ""
                  }`}
                  onClick={() => handleGenreToggle(genre)}
                >
                  {genre}
                </button>
              ))}
            </div>
          </div>

          {/* Favori Yazarlar */}
          <div className="form-section">
            <h3>✍️ Favori Yazarlar</h3>
            <div className="author-input-container">
              <input
                type="text"
                value={currentAuthor}
                onChange={(e) => setCurrentAuthor(e.target.value)}
                placeholder="Yazar adı girin..."
                onKeyPress={(e) =>
                  e.key === "Enter" && (e.preventDefault(), addAuthor())
                }
              />
              <button type="button" onClick={addAuthor} className="add-button">
                Ekle
              </button>
            </div>
            <div className="selected-items">
              {formData.favoriteAuthors.map((author) => (
                <div key={author} className="selected-item">
                  <span>{author}</span>
                  <button
                    type="button"
                    onClick={() => removeAuthor(author)}
                    className="remove-button"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* İlgi Alanları */}
          <div className="form-section">
            <h3>🎯 İlgi Alanları</h3>
            <p className="section-desc">
              Kitap dışındaki hobiler ve ilgi alanların
            </p>
            <div className="tags-container">
              {commonInterests.map((interest) => (
                <button
                  key={interest}
                  type="button"
                  className={`tag ${
                    formData.interests.includes(interest) ? "selected" : ""
                  }`}
                  onClick={() => handleInterestToggle(interest)}
                >
                  {interest}
                </button>
              ))}
            </div>
            <div className="custom-interest-input">
              <input
                type="text"
                value={currentInterest}
                onChange={(e) => setCurrentInterest(e.target.value)}
                placeholder="Özel ilgi alanı ekle..."
                onKeyPress={(e) =>
                  e.key === "Enter" && (e.preventDefault(), addCustomInterest())
                }
              />
              <button
                type="button"
                onClick={addCustomInterest}
                className="add-button"
              >
                Ekle
              </button>
            </div>
            <div className="selected-items">
              {formData.interests
                .filter((interest) => !commonInterests.includes(interest))
                .map((interest) => (
                  <div key={interest} className="selected-item custom">
                    <span>{interest}</span>
                    <button
                      type="button"
                      onClick={() => removeInterest(interest)}
                      className="remove-button"
                    >
                      ×
                    </button>
                  </div>
                ))}
            </div>
          </div>

          {/* Entelektüel Biyografi */}
          <div className="form-section">
            <h3>💭 Entelektüel Biyografi</h3>
            <p className="section-desc">
              Kendinle ilgili kısa bir tanıtım yaz. Okuma alışkanlıkların,
              düşünce tarzın...
            </p>
            <textarea
              name="intellectualBio"
              value={formData.intellectualBio}
              onChange={handleInputChange}
              placeholder="Örnek: Felsefi romanları seven, hayata eleştirel yaklaşan bir okuyucuyum. Özellikle postmodern edebiyat ve psikoloji kitaplarına ilgi duyuyorum..."
              rows={4}
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="submit-button">
              Profili Tamamla
            </button>
            {onSkip && (
              <button
                type="button"
                onClick={handleSkip}
                className="skip-button"
              >
                Şimdilik Atla
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileSetup;
