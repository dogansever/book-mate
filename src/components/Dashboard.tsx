import React, { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useFollow } from "../hooks/useFollow";
import { useUserBooks } from "../contexts/UserBooksContext";
import ProfileSetup from "./ProfileSetup";
import FollowSystem from "./FollowSystem";
import AddBook from "./AddBook";
import BookShelf from "./BookShelf";
import SwapManager from "./SwapManager";
import BookDiscovery from "./BookDiscovery";
import PostFeed from "./PostFeed";
import { PostProvider } from "../contexts/PostContext";
import { MeetupProvider } from "../contexts/MeetupContext";
import MeetupManager from "./MeetupManager";
import MeetupPreview from "./MeetupPreview";
import InvitationsList from "./InvitationsList";
import "./Dashboard.css";

const Dashboard: React.FC = () => {
  const { state, logout } = useAuth();
  const { followersCount, followingCount } = useFollow(state.user?.id);
  const { getReadingStats } = useUserBooks();
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const [activeView, setActiveView] = useState<"dashboard" | "follow" | "add-book" | "library" | "swaps" | "discovery" | "posts" | "meetups" | "invitations">(
    "dashboard"
  );
  const [showMobileMenu, setShowMobileMenu] = useState(false);

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
              {/* Hamburger Menu Button */}
              <button
                className="hamburger-button"
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                aria-label="Menü"
              >
                <div className={`hamburger-icon ${showMobileMenu ? 'open' : ''}`}>
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </button>

              {/* Desktop Navigation - Always visible on desktop */}
              <div className="desktop-nav">
                <button
                  onClick={() => setActiveView("dashboard")}
                  className={`nav-button ${activeView === "dashboard" ? "active" : ""}`}
                  title="Ana Sayfa"
                >
                  <span className="nav-icon">🏠</span>
                  <span className="nav-text">Ana Sayfa</span>
                </button>
                <button
                  onClick={() => setActiveView("library")}
                  className={`nav-button ${activeView === "library" ? "active" : ""}`}
                  title="Kütüphanem"
                >
                  <span className="nav-icon">📚</span>
                  <span className="nav-text">Kütüphane</span>
                </button>
                <button
                  onClick={() => setActiveView("add-book")}
                  className={`nav-button ${activeView === "add-book" ? "active" : ""}`}
                  title="Kitap Ekle"
                >
                  <span className="nav-icon">➕</span>
                  <span className="nav-text">Ekle</span>
                </button>
                <button
                  onClick={() => setActiveView("follow")}
                  className={`nav-button ${activeView === "follow" ? "active" : ""}`}
                  title="Kitapsever Ağı"
                >
                  <span className="nav-icon">👥</span>
                  <span className="nav-text">Ağ</span>
                </button>
                <button
                  onClick={() => setActiveView("swaps")}
                  className={`nav-button ${activeView === "swaps" ? "active" : ""}`}
                  title="Kitap Takası"
                >
                  <span className="nav-icon">🔄</span>
                  <span className="nav-text">Takas</span>
                </button>
                <button
                  onClick={() => setActiveView("discovery")}
                  className={`nav-button ${activeView === "discovery" ? "active" : ""}`}
                  title="Kitap Keşfi"
                >
                  <span className="nav-icon">🌍</span>
                  <span className="nav-text">Keşif</span>
                </button>
                <button
                  onClick={() => setActiveView("posts")}
                  className={`nav-button ${activeView === "posts" ? "active" : ""}`}
                  title="Paylaşımlar"
                >
                  <span className="nav-icon">💭</span>
                  <span className="nav-text">Paylaşım</span>
                </button>
                <button
                  onClick={() => setActiveView("meetups")}
                  className={`nav-button ${activeView === "meetups" ? "active" : ""}`}
                  title="Buluşma Grupları"
                >
                  <span className="nav-icon">🤝</span>
                  <span className="nav-text">Buluşma</span>
                </button>
                <button
                  onClick={() => setActiveView("invitations")}
                  className={`nav-button ${activeView === "invitations" ? "active" : ""}`}
                  title="Grup Davetleri"
                >
                  <span className="nav-icon">📩</span>
                  <span className="nav-text">Davetler</span>
                </button>
              </div>
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

      {/* Mobile Navigation Menu */}
      <div className={`mobile-nav-overlay ${showMobileMenu ? 'active' : ''}`} onClick={() => setShowMobileMenu(false)}>
        <nav className={`mobile-nav ${showMobileMenu ? 'active' : ''}`} onClick={(e) => e.stopPropagation()}>
          <div className="mobile-nav-header">
            <h3>📚 Book Mate</h3>
            <button 
              className="mobile-nav-close" 
              onClick={() => setShowMobileMenu(false)}
              aria-label="Menüyü kapat"
            >
              ✕
            </button>
          </div>
          <div className="mobile-nav-content">
            <button
              onClick={() => {
                setActiveView("dashboard");
                setShowMobileMenu(false);
              }}
              className={`mobile-nav-item ${activeView === "dashboard" ? "active" : ""}`}
            >
              <span className="mobile-nav-icon">🏠</span>
              <span className="mobile-nav-text">Ana Sayfa</span>
            </button>
            <button
              onClick={() => {
                setActiveView("library");
                setShowMobileMenu(false);
              }}
              className={`mobile-nav-item ${activeView === "library" ? "active" : ""}`}
            >
              <span className="mobile-nav-icon">📚</span>
              <span className="mobile-nav-text">Kütüphanem</span>
            </button>
            <button
              onClick={() => {
                setActiveView("add-book");
                setShowMobileMenu(false);
              }}
              className={`mobile-nav-item ${activeView === "add-book" ? "active" : ""}`}
            >
              <span className="mobile-nav-icon">➕</span>
              <span className="mobile-nav-text">Kitap Ekle</span>
            </button>
            <button
              onClick={() => {
                setActiveView("follow");
                setShowMobileMenu(false);
              }}
              className={`mobile-nav-item ${activeView === "follow" ? "active" : ""}`}
            >
              <span className="mobile-nav-icon">👥</span>
              <span className="mobile-nav-text">Kitapsever Ağı</span>
            </button>
            <button
              onClick={() => {
                setActiveView("swaps");
                setShowMobileMenu(false);
              }}
              className={`mobile-nav-item ${activeView === "swaps" ? "active" : ""}`}
            >
              <span className="mobile-nav-icon">🔄</span>
              <span className="mobile-nav-text">Kitap Takası</span>
            </button>
            <button
              onClick={() => {
                setActiveView("discovery");
                setShowMobileMenu(false);
              }}
              className={`mobile-nav-item ${activeView === "discovery" ? "active" : ""}`}
            >
              <span className="mobile-nav-icon">🌍</span>
              <span className="mobile-nav-text">Kitap Keşfi</span>
            </button>
            <button
              onClick={() => {
                setActiveView("posts");
                setShowMobileMenu(false);
              }}
              className={`mobile-nav-item ${activeView === "posts" ? "active" : ""}`}
            >
              <span className="mobile-nav-icon">💭</span>
              <span className="mobile-nav-text">Paylaşımlar</span>
            </button>
            <button
              onClick={() => {
                setActiveView("meetups");
                setShowMobileMenu(false);
              }}
              className={`mobile-nav-item ${activeView === "meetups" ? "active" : ""}`}
            >
              <span className="mobile-nav-icon">🤝</span>
              <span className="mobile-nav-text">Buluşma Grupları</span>
            </button>
            <button
              onClick={() => {
                setActiveView("invitations");
                setShowMobileMenu(false);
              }}
              className={`mobile-nav-item ${activeView === "invitations" ? "active" : ""}`}
            >
              <span className="mobile-nav-icon">📩</span>
              <span className="mobile-nav-text">Grup Davetleri</span>
            </button>
            <div className="mobile-nav-divider"></div>
            <button
              onClick={() => {
                setShowProfileSetup(true);
                setShowMobileMenu(false);
              }}
              className="mobile-nav-item"
            >
              <span className="mobile-nav-icon">⚙️</span>
              <span className="mobile-nav-text">Profili Düzenle</span>
            </button>
            <button
              onClick={() => {
                logout();
                setShowMobileMenu(false);
              }}
              className="mobile-nav-item logout"
            >
              <span className="mobile-nav-icon">🚪</span>
              <span className="mobile-nav-text">Çıkış Yap</span>
            </button>
          </div>
        </nav>
      </div>

      {activeView === "dashboard" ? (
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
                          ve {state.user.profile.favoriteAuthors.length - 3}{" "}
                          yazar daha
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
              <div className="stat-card" onClick={() => setActiveView("library")}>
                <div className="stat-icon">📖</div>
                <div className="stat-info">
                  <span className="stat-number">{getReadingStats().readBooks}</span>
                  <span className="stat-label">Okunan Kitap</span>
                </div>
              </div>
              <div className="stat-card" onClick={() => setActiveView("library")}>
                <div className="stat-icon">📚</div>
                <div className="stat-info">
                  <span className="stat-number">{getReadingStats().totalBooks}</span>
                  <span className="stat-label">Toplam Kitap</span>
                </div>
              </div>
              <div
                className="stat-card"
                onClick={() => setActiveView("follow")}
              >
                <div className="stat-icon">👥</div>
                <div className="stat-info">
                  <span className="stat-number">
                    {followersCount + followingCount}
                  </span>
                  <span className="stat-label">Bağlantı</span>
                </div>
              </div>
              <div className="stat-card" onClick={() => setActiveView("library")}>
                <div className="stat-icon">⭐</div>
                <div className="stat-info">
                  <span className="stat-number">{getReadingStats().averageRating.toFixed(1)}</span>
                  <span className="stat-label">Ort. Puan</span>
                </div>
              </div>
            </div>

            {/* Mini Bookshelf Preview */}
            {getReadingStats().totalBooks > 0 && (
              <div className="mini-bookshelf-preview">
                <h4>📚 Kitap Rafım (Önizleme)</h4>
                <BookShelf displayMode="grid" maxBooksPerShelf={4} />
                <button 
                  className="view-full-library"
                  onClick={() => setActiveView("library")}
                >
                  Tüm Kütüphaneyi Gör →
                </button>
              </div>
            )}

            {/* Mini Posts Preview */}
            <div className="mini-posts-preview">
              <h4>💭 Son Paylaşımlar</h4>
              <PostProvider initialFilters={{}} limit={3}>
                <PostFeed showCreatePost={false} limit={3} />
              </PostProvider>
              <button 
                className="view-all-posts"
                onClick={() => setActiveView("posts")}
              >
                Tüm Paylaşımları Gör →
              </button>
            </div>

            {/* Mini Meetups Preview */}
            <div className="mini-meetups-preview">
              <h4>🤝 Aktif Buluşma Grupları</h4>
              <div className="meetup-preview-cards">
                <MeetupProvider>
                  <MeetupPreview userId={state.user.id} />
                </MeetupProvider>
              </div>
              <button 
                className="view-all-meetups"
                onClick={() => setActiveView("meetups")}
              >
                Tüm Grupları Gör →
              </button>
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
                  Benzer zevklere sahip okuyucularla tanış ve kitap
                  deneyimlerini paylaş
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
                  Kitapları değerlendir, detaylı incelemeler yaz ve
                  başkalarından ilham al
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
                <button 
                  className="cta-button primary"
                  onClick={() => setActiveView("add-book")}
                >
                  İlk Kitabını Ekle
                </button>
                <button
                  onClick={() => setActiveView("follow")}
                  className="cta-button secondary"
                >
                  Kitapsever Bul
                </button>
              </div>
            </div>
          </div>
        </main>
      ) : activeView === "follow" ? (
        <main className="dashboard-main">
          <FollowSystem view="discover" />
        </main>
      ) : activeView === "add-book" ? (
        <main className="dashboard-main">
          <AddBook onBookAdded={() => setActiveView("library")} />
        </main>
      ) : activeView === "library" ? (
        <main className="dashboard-main">
          <BookShelf />
        </main>
      ) : activeView === "swaps" ? (
        <main className="dashboard-main">
          <SwapManager />
        </main>
      ) : activeView === "discovery" ? (
        <main className="dashboard-main">
          <BookDiscovery />
        </main>
      ) : activeView === "posts" ? (
        <main className="dashboard-main">
          <PostProvider>
            <PostFeed />
          </PostProvider>
        </main>
      ) : activeView === "meetups" ? (
        <main className="dashboard-main">
          <MeetupProvider>
            <MeetupManager />
          </MeetupProvider>
        </main>
      ) : activeView === "invitations" ? (
        <main className="dashboard-main">
          <MeetupProvider>
            <InvitationsList />
          </MeetupProvider>
        </main>
      ) : null}
    </div>
  );
};

export default Dashboard;
