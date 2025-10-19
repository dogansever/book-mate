import React, { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import ProfileSetup from "./ProfileSetup";
import "./Dashboard.css";

const Dashboard: React.FC = () => {
  const { state, logout } = useAuth();
  const [showProfileSetup, setShowProfileSetup] = useState(false);

  if (!state.user) {
    return null;
  }

  // Profil kurulumu gerekiyor mu kontrol et
  const needsProfileSetup =
    !state.user.profile?.isProfileComplete || showProfileSetup;

  if (needsProfileSetup) {
    return (
      <ProfileSetup
        onComplete={() => setShowProfileSetup(false)}
        onSkip={() => setShowProfileSetup(false)}
      />
    );
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <div className="brand-info">
            <h1>📚 Book Mate</h1>
            <span className="brand-tagline">
              Kitap Severler İçin Sosyal Platform
            </span>
          </div>
          <div className="user-info">
            <div className="user-avatar">
              {state.user.avatar ? (
                <img src={state.user.avatar} alt={state.user.displayName} />
              ) : (
                <div className="avatar-placeholder">
                  {state.user.displayName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="user-details">
              <span className="user-name">{state.user.displayName}</span>
              <span className="user-email">{state.user.email}</span>
            </div>
            <div className="header-actions">
              <button
                onClick={() => setShowProfileSetup(true)}
                className="profile-edit-button"
              >
                Profili Düzenle
              </button>
              <button onClick={logout} className="logout-button">
                Çıkış Yap
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="welcome-section">
          <div className="welcome-header">
            <h2>Hoş geldin, {state.user.displayName}! 📚</h2>
            <div className="app-description">
              <h3>Book Mate Nedir?</h3>
              <p>
                Book Mate, kitap tutkunları için tasarlanmış sosyal bir
                platformdur. Burada kitap arkadaşlarınla bağlantı kurabilir,
                okuduğun kitapları paylaşabilir, yeni keşifler yapabilir ve
                okuma deneyimlerini zenginleştirebilirsin.
              </p>
            </div>
          </div>

          {/* Kullanıcı Profil Bilgileri */}
          {state.user.profile && (
            <div className="user-profile-info">
              <div className="profile-section">
                <h4>👤 Profil Bilgileri</h4>
                <div className="profile-details">
                  {state.user.profile.city && (
                    <span className="profile-item">
                      📍 {state.user.profile.city}
                    </span>
                  )}
                  {state.user.profile.ageRange && (
                    <span className="profile-item">
                      🎂 {state.user.profile.ageRange} yaş
                    </span>
                  )}
                </div>
              </div>

              {state.user.profile.favoriteGenres.length > 0 && (
                <div className="profile-section">
                  <h4>📚 Favori Türler</h4>
                  <div className="profile-tags">
                    {state.user.profile.favoriteGenres
                      .slice(0, 5)
                      .map((genre) => (
                        <span key={genre} className="profile-tag">
                          {genre}
                        </span>
                      ))}
                    {state.user.profile.favoriteGenres.length > 5 && (
                      <span className="profile-tag more">
                        +{state.user.profile.favoriteGenres.length - 5} daha
                      </span>
                    )}
                  </div>
                </div>
              )}

              {state.user.profile.favoriteAuthors.length > 0 && (
                <div className="profile-section">
                  <h4>✍️ Favori Yazarlar</h4>
                  <div className="profile-authors">
                    {state.user.profile.favoriteAuthors
                      .slice(0, 3)
                      .map((author) => (
                        <span key={author} className="author-name">
                          {author}
                        </span>
                      ))}
                    {state.user.profile.favoriteAuthors.length > 3 && (
                      <span className="author-name more">
                        ve {state.user.profile.favoriteAuthors.length - 3} yazar
                        daha
                      </span>
                    )}
                  </div>
                </div>
              )}

              {state.user.profile.intellectualBio && (
                <div className="profile-section">
                  <h4>💭 Entelektüel Biyografi</h4>
                  <p className="bio-text">
                    {state.user.profile.intellectualBio}
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="quick-stats">
            <div className="stat-card">
              <div className="stat-icon">📖</div>
              <div className="stat-info">
                <span className="stat-number">0</span>
                <span className="stat-label">Okunan Kitap</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">👥</div>
              <div className="stat-info">
                <span className="stat-number">0</span>
                <span className="stat-label">Kitap Arkadaşı</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">⭐</div>
              <div className="stat-info">
                <span className="stat-number">0</span>
                <span className="stat-label">Değerlendirme</span>
              </div>
            </div>
          </div>

          <div className="provider-info">
            <span className="provider-badge">
              {state.user.provider === "email" && "✉️ E-posta"}
              {state.user.provider === "google" && "🔗 Google"}
              {state.user.provider === "instagram" && "📷 Instagram"}
            </span>
            ile giriş yapıldı
          </div>
        </div>

        <div className="features-preview">
          <h3>📱 Platform Özellikleri</h3>
          <div className="feature-grid">
            <div className="feature-card">
              <div className="feature-icon">�</div>
              <h4>Kitap Keşfi</h4>
              <p>
                Yeni kitaplar keşfet, incelemeler oku ve kişisel kütüphaneni
                oluştur
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">�👥</div>
              <h4>Sosyal Bağlantılar</h4>
              <p>
                Benzer zevklere sahip okuyucularla tanış ve kitap deneyimlerini
                paylaş
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🎯</div>
              <h4>Akıllı Öneriler</h4>
              <p>
                Okuma geçmişin ve tercihlerine göre kişiselleştirilmiş kitap
                önerileri
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h4>Okuma İstatistikleri</h4>
              <p>
                Okuma hedeflerin, ilerleme durumun ve detaylı istatistiklerin
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">💬</div>
              <h4>Kitap Klubü</h4>
              <p>
                Kitap gruplarına katıl, tartışmalara başla ve fikir alışverişi
                yap
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🌟</div>
              <h4>Değerlendirme & İnceleme</h4>
              <p>
                Kitapları değerlendir, detaylı incelemeler yaz ve başkalarından
                ilham al
              </p>
            </div>
          </div>

          <div className="cta-section">
            <h4>🚀 Hemen Başla!</h4>
            <p>
              Kitap yolculuğuna şimdi başla ve Book Mate topluluğunun bir
              parçası ol.
            </p>
            <div className="cta-buttons">
              <button className="cta-button primary">İlk Kitabını Ekle</button>
              <button className="cta-button secondary">Arkadaş Bul</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
