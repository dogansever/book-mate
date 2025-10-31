import React, { useState, useEffect } from "react";
import { UserProfile, SocialConnection } from "../types/user";
import { useAuth } from "../hooks/useAuth";
import SocialConnections from "./SocialConnections";
import "./ProfileSetup.css";

interface ProfileSetupProps {
  onComplete: () => void;
  onSkip?: () => void;
}

const ProfileSetup: React.FC<ProfileSetupProps> = ({ onComplete, onSkip }) => {
  const { state, updateProfile } = useAuth();
  const [formData, setFormData] = useState<UserProfile>({
    city: "",
    age: undefined,
    gender: undefined,
    ageRange: "",
    favoriteGenres: [],
    favoriteAuthors: [],
    interests: [],
    intellectualBio: "",
    culturalProfile: {
      readingMotivation: [],
      favoriteThemes: [],
      readingFrequency: undefined,
      preferredReadingTime: undefined,
      readingEnvironment: undefined,
      isVisible: true
    },
    worldview: {
      cosmology: undefined,
      cosmologyDetails: "",
      philosophical: [],
      philosophicalDetails: "",
      isVisible: false
    },
    valuesAndPhilosophy: {
      coreValues: [],
      lifePhilosophy: "",
      moralFramework: undefined,
      politicalLean: undefined,
      isVisible: false
    },
    academicInfo: {
      university: "",
      department: "",
      graduationYear: undefined,
      degree: undefined,
      isVisible: true
    },
    professionalInfo: {
      company: "",
      position: "",
      salaryRange: undefined,
      workExperience: undefined,
      industry: "",
      isVisible: false
    },
    socialConnections: [],
    isProfileComplete: false,
  });

  const [currentAuthor, setCurrentAuthor] = useState("");
  const [currentInterest, setCurrentInterest] = useState("");

  // Önceden tanımlanmış seçenekler
  const ageRanges = ["18-24", "25-34", "35-44", "45-54", "55-64", "65+"];
  
  const genderOptions = [
    { value: "male", label: "Erkek" },
    { value: "female", label: "Kadın" },
    { value: "other", label: "Diğer" },
    { value: "prefer-not-to-say", label: "Belirtmek istemiyorum" }
  ];
  
  const degreeOptions = [
    { value: "bachelor", label: "Lisans" },
    { value: "master", label: "Yüksek Lisans" },
    { value: "phd", label: "Doktora" },
    { value: "other", label: "Diğer" }
  ];
  
  const salaryRanges = [
    { value: "0-30k", label: "0-30.000 ₺" },
    { value: "30k-60k", label: "30.000-60.000 ₺" },
    { value: "60k-100k", label: "60.000-100.000 ₺" },
    { value: "100k-150k", label: "100.000-150.000 ₺" },
    { value: "150k+", label: "150.000+ ₺" }
  ];
  
  const industries = [
    "Teknoloji", "Finans", "Eğitim", "Sağlık", "Mühendislik", 
    "Pazarlama", "İnsan Kaynakları", "Satış", "Hukuk", "Medya", 
    "Sanat", "Kamu", "Turizm", "İnşaat", "Diğer"
  ];

  const readingMotivations = [
    { value: "knowledge", label: "Bilgi Edinmek", icon: "🧠" },
    { value: "thinking", label: "Düşünmek", icon: "💭" },
    { value: "entertainment", label: "Eğlenmek", icon: "🎭" },
    { value: "escape", label: "Kaçmak", icon: "🌙" },
    { value: "emotional-growth", label: "Duygusal Gelişim", icon: "💖" },
    { value: "social-connection", label: "Sosyal Bağ", icon: "🤝" }
  ];

  const readingFrequencies = [
    { value: "daily", label: "Günlük" },
    { value: "weekly", label: "Haftalık" },
    { value: "monthly", label: "Aylık" },
    { value: "occasionally", label: "Ara sıra" }
  ];

  const readingTimes = [
    { value: "morning", label: "Sabah" },
    { value: "afternoon", label: "Öğleden sonra" },
    { value: "evening", label: "Akşam" },
    { value: "night", label: "Gece" },
    { value: "anytime", label: "Her zaman" }
  ];

  const readingEnvironments = [
    { value: "quiet", label: "Sessiz ortam" },
    { value: "music", label: "Müzik eşliğinde" },
    { value: "cafe", label: "Kafe/Restoran" },
    { value: "nature", label: "Doğada" },
    { value: "anywhere", label: "Her yerde" }
  ];

  const cosmologyOptions = [
    { value: "big-bang", label: "Bilimsel Model (Big Bang)" },
    { value: "creation", label: "Yaratılış" },
    { value: "agnostic", label: "Bilinmez (Agnostik)" },
    { value: "other", label: "Diğer" },
    { value: "prefer-not-to-say", label: "Belirtmek istemiyorum" }
  ];

  const philosophicalViews = [
    { value: "scientific-naturalist", label: "Bilimsel Natüralist", icon: "🔬" },
    { value: "humanist", label: "Hümanist", icon: "🌟" },
    { value: "spiritual", label: "Spiritüel", icon: "🙏" },
    { value: "religious", label: "Dindar", icon: "⛪" },
    { value: "existentialist", label: "Varoluşçu", icon: "🤔" },
    { value: "pragmatist", label: "Pragmatist", icon: "⚖️" },
    { value: "other", label: "Diğer", icon: "💫" }
  ];

  const coreValues = [
    { value: "freedom", label: "Özgürlük", icon: "🕊️" },
    { value: "progress", label: "İlerleme", icon: "📈" },
    { value: "balance", label: "Denge", icon: "⚖️" },
    { value: "simplicity", label: "Sadelik", icon: "🎋" },
    { value: "knowledge", label: "Bilgi", icon: "📚" },
    { value: "peace", label: "Huzur", icon: "☮️" },
    { value: "justice", label: "Adalet", icon: "⚡" },
    { value: "creativity", label: "Yaratıcılık", icon: "🎨" },
    { value: "family", label: "Aile", icon: "👨‍👩‍👧‍👦" },
    { value: "success", label: "Başarı", icon: "🏆" },
    { value: "tradition", label: "Gelenek", icon: "🏛️" },
    { value: "innovation", label: "Yenilik", icon: "💡" },
    { value: "community", label: "Toplum", icon: "🌍" },
    { value: "independence", label: "Bağımsızlık", icon: "🦅" },
    { value: "compassion", label: "Merhamet", icon: "❤️" }
  ];

  const moralFrameworks = [
    { value: "utilitarian", label: "Faydacı" },
    { value: "deontological", label: "Görev Etiği" },
    { value: "virtue-ethics", label: "Erdem Etiği" },
    { value: "relativist", label: "Göreceli" },
    { value: "religious", label: "Dini Temelli" },
    { value: "personal", label: "Kişisel İlkeler" },
    { value: "other", label: "Diğer" }
  ];

  const politicalLeanings = [
    { value: "progressive", label: "İlerici" },
    { value: "conservative", label: "Muhafazakar" },
    { value: "libertarian", label: "Libertaryen" },
    { value: "socialist", label: "Sosyalist" },
    { value: "centrist", label: "Merkezci" },
    { value: "apolitical", label: "Apolitik" },
    { value: "prefer-not-to-say", label: "Belirtmek istemiyorum" }
  ];

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
    
    // Nested object handling
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof UserProfile] as any),
          [child]: value === '' ? undefined : (child === 'graduationYear' || child === 'age' || child === 'workExperience') ? Number(value) : value
        }
      }));
    } else {
      setFormData((prev) => ({ 
        ...prev, 
        [name]: value === '' ? undefined : (name === 'age') ? Number(value) : value 
      }));
    }
  };
  
  const handleAcademicVisibilityChange = (isVisible: boolean) => {
    setFormData((prev) => ({
      ...prev,
      academicInfo: {
        ...prev.academicInfo!,
        isVisible
      }
    }));
  };
  
  const handleProfessionalVisibilityChange = (isVisible: boolean) => {
    setFormData((prev) => ({
      ...prev,
      professionalInfo: {
        ...prev.professionalInfo!,
        isVisible
      }
    }));
  };

  const handleCulturalVisibilityChange = (isVisible: boolean) => {
    setFormData((prev) => ({
      ...prev,
      culturalProfile: {
        ...prev.culturalProfile!,
        isVisible
      }
    }));
  };

  const handleWorldviewVisibilityChange = (isVisible: boolean) => {
    setFormData((prev) => ({
      ...prev,
      worldview: {
        ...prev.worldview!,
        isVisible
      }
    }));
  };

  const handleValuesVisibilityChange = (isVisible: boolean) => {
    setFormData((prev) => ({
      ...prev,
      valuesAndPhilosophy: {
        ...prev.valuesAndPhilosophy!,
        isVisible
      }
    }));
  };

  const handleArrayToggle = (category: string, subCategory: string, value: any) => {
    setFormData((prev) => {
      const currentArray = (prev[category as keyof UserProfile] as any)?.[subCategory] || [];
      const newArray = currentArray.includes(value) 
        ? currentArray.filter((item: any) => item !== value)
        : [...currentArray, value];
      
      return {
        ...prev,
        [category]: {
          ...(prev[category as keyof UserProfile] as any),
          [subCategory]: newArray
        }
      };
    });
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

  const handleSocialConnectionsUpdate = (connections: SocialConnection[]) => {
    setFormData((prev) => ({
      ...prev,
      socialConnections: connections,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const completeProfile = {
      ...formData,
      isProfileComplete: true,
    };

    console.log('🔄 Profil kaydediliyor:', completeProfile);
    console.log('🔍 Akademik Info:', completeProfile.academicInfo);
    console.log('🔍 Profesyonel Info:', completeProfile.professionalInfo);
    await updateProfile(completeProfile);
    console.log('✅ Profil başarıyla kaydedildi');
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
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="age">Yaş (Opsiyonel)</label>
                <input
                  type="number"
                  id="age"
                  name="age"
                  value={formData.age || ''}
                  onChange={handleInputChange}
                  placeholder="25"
                  min="13"
                  max="100"
                />
              </div>
              <div className="form-group">
                <label htmlFor="gender">Cinsiyet (Opsiyonel)</label>
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender || ''}
                  onChange={handleInputChange}
                >
                  <option value="">Belirtmek istemiyorum</option>
                  {genderOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
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

          {/* Kültürel Profil */}
          <div className="form-section">
            <h3>📖 Okuma Kültürü ve Motivasyon</h3>
            <div className="visibility-toggle">
              <label>
                <input
                  type="checkbox"
                  checked={formData.culturalProfile?.isVisible || false}
                  onChange={(e) => handleCulturalVisibilityChange(e.target.checked)}
                />
                Bu bilgileri profilimde göster
              </label>
            </div>

            <div className="form-group">
              <label>Okuma Motivasyonun (Çoklu seçim)</label>
              <div className="tags-container">
                {readingMotivations.map((motivation) => (
                  <button
                    key={motivation.value}
                    type="button"
                    className={`tag icon-tag ${
                      formData.culturalProfile?.readingMotivation?.includes(motivation.value as any) ? "selected" : ""
                    }`}
                    onClick={() => handleArrayToggle('culturalProfile', 'readingMotivation', motivation.value)}
                  >
                    {motivation.icon} {motivation.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="culturalProfile.readingFrequency">Okuma Sıklığı</label>
                <select
                  id="culturalProfile.readingFrequency"
                  name="culturalProfile.readingFrequency"
                  value={formData.culturalProfile?.readingFrequency || ''}
                  onChange={handleInputChange}
                >
                  <option value="">Seçiniz...</option>
                  {readingFrequencies.map((freq) => (
                    <option key={freq.value} value={freq.value}>
                      {freq.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="culturalProfile.preferredReadingTime">Tercih Ettiğin Okuma Zamanı</label>
                <select
                  id="culturalProfile.preferredReadingTime"
                  name="culturalProfile.preferredReadingTime"
                  value={formData.culturalProfile?.preferredReadingTime || ''}
                  onChange={handleInputChange}
                >
                  <option value="">Seçiniz...</option>
                  {readingTimes.map((time) => (
                    <option key={time.value} value={time.value}>
                      {time.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="culturalProfile.readingEnvironment">Tercih Ettiğin Okuma Ortamı</label>
              <select
                id="culturalProfile.readingEnvironment"
                name="culturalProfile.readingEnvironment"
                value={formData.culturalProfile?.readingEnvironment || ''}
                onChange={handleInputChange}
              >
                <option value="">Seçiniz...</option>
                {readingEnvironments.map((env) => (
                  <option key={env.value} value={env.value}>
                    {env.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Dünya Görüşü */}
          <div className="form-section">
            <h3>🌌 Dünya Görüşü ve Kozmoloji</h3>
            <div className="visibility-toggle">
              <label>
                <input
                  type="checkbox"
                  checked={formData.worldview?.isVisible || false}
                  onChange={(e) => handleWorldviewVisibilityChange(e.target.checked)}
                />
                Bu bilgileri profilimde göster
              </label>
            </div>

            <div className="form-group">
              <label htmlFor="worldview.cosmology">Evreni Nasıl Anlamlandırıyorsun?</label>
              <select
                id="worldview.cosmology"
                name="worldview.cosmology"
                value={formData.worldview?.cosmology || ''}
                onChange={handleInputChange}
              >
                <option value="">Seçiniz...</option>
                {cosmologyOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {formData.worldview?.cosmology === 'other' && (
              <div className="form-group">
                <label htmlFor="worldview.cosmologyDetails">Açıklama</label>
                <textarea
                  id="worldview.cosmologyDetails"
                  name="worldview.cosmologyDetails"
                  value={formData.worldview?.cosmologyDetails || ''}
                  onChange={handleInputChange}
                  placeholder="Dünya görüşünü kısaca açıkla..."
                  rows={3}
                />
              </div>
            )}

            <div className="form-group">
              <label>Felsefi Yaklaşımın (Çoklu seçim)</label>
              <div className="tags-container">
                {philosophicalViews.map((view) => (
                  <button
                    key={view.value}
                    type="button"
                    className={`tag icon-tag ${
                      formData.worldview?.philosophical?.includes(view.value as any) ? "selected" : ""
                    }`}
                    onClick={() => handleArrayToggle('worldview', 'philosophical', view.value)}
                  >
                    {view.icon} {view.label}
                  </button>
                ))}
              </div>
            </div>

            {formData.worldview?.philosophical?.includes('other') && (
              <div className="form-group">
                <label htmlFor="worldview.philosophicalDetails">Felsefi Yaklaşım Açıklaması</label>
                <textarea
                  id="worldview.philosophicalDetails"
                  name="worldview.philosophicalDetails"
                  value={formData.worldview?.philosophicalDetails || ''}
                  onChange={handleInputChange}
                  placeholder="Felsefi yaklaşımını açıkla..."
                  rows={3}
                />
              </div>
            )}
          </div>

          {/* Değer ve Hayat Görüşü */}
          <div className="form-section">
            <h3>💎 Değerler ve Hayat Felsefesi</h3>
            <div className="visibility-toggle">
              <label>
                <input
                  type="checkbox"
                  checked={formData.valuesAndPhilosophy?.isVisible || false}
                  onChange={(e) => handleValuesVisibilityChange(e.target.checked)}
                />
                Bu bilgileri profilimde göster
              </label>
            </div>

            <div className="form-group">
              <label>Temel Değerlerin (En fazla 5 seçin)</label>
              <div className="tags-container">
                {coreValues.map((value) => (
                  <button
                    key={value.value}
                    type="button"
                    className={`tag icon-tag ${
                      formData.valuesAndPhilosophy?.coreValues?.includes(value.value as any) ? "selected" : ""
                    }`}
                    onClick={() => handleArrayToggle('valuesAndPhilosophy', 'coreValues', value.value)}
                    disabled={
                      !formData.valuesAndPhilosophy?.coreValues?.includes(value.value as any) && 
                      (formData.valuesAndPhilosophy?.coreValues?.length || 0) >= 5
                    }
                  >
                    {value.icon} {value.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="valuesAndPhilosophy.lifePhilosophy">Hayat Felsefesi</label>
              <textarea
                id="valuesAndPhilosophy.lifePhilosophy"
                name="valuesAndPhilosophy.lifePhilosophy"
                value={formData.valuesAndPhilosophy?.lifePhilosophy || ''}
                onChange={handleInputChange}
                placeholder="Yaşam ilkelerini ve hayat görüşünü kısaca anlat..."
                rows={4}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="valuesAndPhilosophy.moralFramework">Ahlaki Çerçeve</label>
                <select
                  id="valuesAndPhilosophy.moralFramework"
                  name="valuesAndPhilosophy.moralFramework"
                  value={formData.valuesAndPhilosophy?.moralFramework || ''}
                  onChange={handleInputChange}
                >
                  <option value="">Seçiniz...</option>
                  {moralFrameworks.map((framework) => (
                    <option key={framework.value} value={framework.value}>
                      {framework.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="valuesAndPhilosophy.politicalLean">Politik Eğilim (Opsiyonel)</label>
                <select
                  id="valuesAndPhilosophy.politicalLean"
                  name="valuesAndPhilosophy.politicalLean"
                  value={formData.valuesAndPhilosophy?.politicalLean || ''}
                  onChange={handleInputChange}
                >
                  <option value="">Seçiniz...</option>
                  {politicalLeanings.map((lean) => (
                    <option key={lean.value} value={lean.value}>
                      {lean.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Akademik Bilgiler */}
          <div className="form-section">
            <h3>🎓 Akademik Bilgiler (Opsiyonel)</h3>
            <div className="visibility-toggle">
              <label>
                <input
                  type="checkbox"
                  checked={formData.academicInfo?.isVisible || false}
                  onChange={(e) => handleAcademicVisibilityChange(e.target.checked)}
                />
                Bu bilgileri profilimde göster
              </label>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="academicInfo.university">Üniversite</label>
                <input
                  type="text"
                  id="academicInfo.university"
                  name="academicInfo.university"
                  value={formData.academicInfo?.university || ''}
                  onChange={handleInputChange}
                  placeholder="İstanbul Üniversitesi"
                />
              </div>
              <div className="form-group">
                <label htmlFor="academicInfo.department">Bölüm</label>
                <input
                  type="text"
                  id="academicInfo.department"
                  name="academicInfo.department"
                  value={formData.academicInfo?.department || ''}
                  onChange={handleInputChange}
                  placeholder="Bilgisayar Mühendisliği"
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="academicInfo.graduationYear">Mezuniyet Yılı</label>
                <input
                  type="number"
                  id="academicInfo.graduationYear"
                  name="academicInfo.graduationYear"
                  value={formData.academicInfo?.graduationYear || ''}
                  onChange={handleInputChange}
                  placeholder="2020"
                  min="1950"
                  max="2030"
                />
              </div>
              <div className="form-group">
                <label htmlFor="academicInfo.degree">Derece</label>
                <select
                  id="academicInfo.degree"
                  name="academicInfo.degree"
                  value={formData.academicInfo?.degree || ''}
                  onChange={handleInputChange}
                >
                  <option value="">Seçiniz...</option>
                  {degreeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Profesyonel Bilgiler */}
          <div className="form-section">
            <h3>💼 Profesyonel Bilgiler (Opsiyonel)</h3>
            <div className="visibility-toggle">
              <label>
                <input
                  type="checkbox"
                  checked={formData.professionalInfo?.isVisible || false}
                  onChange={(e) => handleProfessionalVisibilityChange(e.target.checked)}
                />
                Bu bilgileri profilimde göster
              </label>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="professionalInfo.company">Şirket</label>
                <input
                  type="text"
                  id="professionalInfo.company"
                  name="professionalInfo.company"
                  value={formData.professionalInfo?.company || ''}
                  onChange={handleInputChange}
                  placeholder="ABC Teknoloji"
                />
              </div>
              <div className="form-group">
                <label htmlFor="professionalInfo.position">Pozisyon</label>
                <input
                  type="text"
                  id="professionalInfo.position"
                  name="professionalInfo.position"
                  value={formData.professionalInfo?.position || ''}
                  onChange={handleInputChange}
                  placeholder="Yazılım Geliştirici"
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="professionalInfo.industry">Sektör</label>
                <select
                  id="professionalInfo.industry"
                  name="professionalInfo.industry"
                  value={formData.professionalInfo?.industry || ''}
                  onChange={handleInputChange}
                >
                  <option value="">Seçiniz...</option>
                  {industries.map((industry) => (
                    <option key={industry} value={industry}>
                      {industry}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="professionalInfo.workExperience">Deneyim (Yıl)</label>
                <input
                  type="number"
                  id="professionalInfo.workExperience"
                  name="professionalInfo.workExperience"
                  value={formData.professionalInfo?.workExperience || ''}
                  onChange={handleInputChange}
                  placeholder="5"
                  min="0"
                  max="50"
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="professionalInfo.salaryRange">Maaş Aralığı (Opsiyonel)</label>
                <select
                  id="professionalInfo.salaryRange"
                  name="professionalInfo.salaryRange"
                  value={formData.professionalInfo?.salaryRange || ''}
                  onChange={handleInputChange}
                >
                  <option value="">Belirtmek istemiyorum</option>
                  {salaryRanges.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Sosyal Medya Bağlantıları */}
          <div className="form-section">
            <h3>🔗 Sosyal Hesap Doğrulama</h3>
            <p className="section-desc">
              Güvenilirliğini artırmak için sosyal hesaplarını bağlayabilirsin.
            </p>
            <SocialConnections
              connections={formData.socialConnections || []}
              onUpdate={handleSocialConnectionsUpdate}
            />
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
