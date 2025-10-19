import React, { useState } from "react";
import { UserConnectionInfo } from "../types/user";
import { useFollow } from "../hooks/useFollow";
import { useAuth } from "../hooks/useAuth";
import "./FollowSystem.css";

interface FollowSystemProps {
  view?: "followers" | "following" | "discover" | "stats";
}

const FollowSystem: React.FC<FollowSystemProps> = ({ view = "stats" }) => {
  const { state } = useAuth();
  const {
    followersCount,
    followingCount,
    mutualFollowsCount,
    followers,
    following,
    suggestedUsers,
    isFollowing,
    followUser,
    unfollowUser,
    isFollowLoading,
    searchUsers,
  } = useFollow(state.user?.id);

  const [activeTab, setActiveTab] = useState<
    "followers" | "following" | "discover"
  >("discover");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<UserConnectionInfo[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      setIsSearching(true);
      try {
        const results = await searchUsers(query);
        setSearchResults(results);
      } catch (error) {
        console.error("Arama hatası:", error);
      } finally {
        setIsSearching(false);
      }
    } else {
      setSearchResults([]);
    }
  };

  const handleFollowAction = async (userId: string) => {
    if (isFollowing(userId)) {
      await unfollowUser(userId);
    } else {
      await followUser(userId);
    }
  };

  const getCompatibilityColor = (score: number) => {
    if (score >= 80) return "#22c55e";
    if (score >= 60) return "#f59e0b";
    return "#64748b";
  };

  const UserCard: React.FC<{
    userInfo: UserConnectionInfo;
    showFollowButton?: boolean;
    compact?: boolean;
  }> = ({ userInfo, showFollowButton = true, compact = false }) => {
    const {
      user,
      relationshipType,
      commonInterests,
      commonGenres,
      compatibilityScore,
    } = userInfo;

    return (
      <div className={`user-card ${compact ? "compact" : ""}`}>
        <div className="user-info">
          <div className="user-avatar">
            {user.avatar ? (
              <img src={user.avatar} alt={user.displayName} />
            ) : (
              <div className="avatar-placeholder">
                {user.displayName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="user-details">
            <h4>{user.displayName}</h4>
            <p className="user-location">{user.profile?.city}</p>
            {!compact && (
              <>
                <p className="user-bio">{user.profile?.intellectualBio}</p>
                <div className="compatibility-score">
                  <span
                    className="score-badge"
                    style={{
                      backgroundColor:
                        getCompatibilityColor(compatibilityScore),
                    }}
                  >
                    %{compatibilityScore} uyumlu
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        {!compact &&
          (commonInterests.length > 0 || commonGenres.length > 0) && (
            <div className="common-interests">
              {commonInterests.length > 0 && (
                <div className="interest-group">
                  <span className="group-label">📚 Ortak İlgiler:</span>
                  <div className="tags">
                    {commonInterests.slice(0, 3).map((interest) => (
                      <span key={interest} className="tag">
                        {interest}
                      </span>
                    ))}
                    {commonInterests.length > 3 && (
                      <span className="tag more">
                        +{commonInterests.length - 3}
                      </span>
                    )}
                  </div>
                </div>
              )}
              {commonGenres.length > 0 && (
                <div className="interest-group">
                  <span className="group-label">🎭 Ortak Türler:</span>
                  <div className="tags">
                    {commonGenres.slice(0, 3).map((genre) => (
                      <span key={genre} className="tag">
                        {genre}
                      </span>
                    ))}
                    {commonGenres.length > 3 && (
                      <span className="tag more">
                        +{commonGenres.length - 3}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

        {showFollowButton && relationshipType !== "following" && (
          <div className="user-actions">
            <button
              onClick={() => handleFollowAction(user.id)}
              disabled={isFollowLoading}
              className={`follow-button ${
                relationshipType === "follower" ? "mutual" : ""
              }`}
            >
              {isFollowLoading ? (
                <span className="loading">⏳</span>
              ) : relationshipType === "follower" ? (
                "🤝 Karşılıklı Takip Et"
              ) : (
                "➕ Takip Et"
              )}
            </button>
          </div>
        )}

        {relationshipType === "following" && (
          <div className="user-actions">
            <button
              onClick={() => handleFollowAction(user.id)}
              disabled={isFollowLoading}
              className="unfollow-button"
            >
              {isFollowLoading ? "⏳" : "➖ Takip Bırak"}
            </button>
          </div>
        )}
      </div>
    );
  };

  const StatsView = () => (
    <div className="stats-view">
      <div className="stats-grid">
        <div className="stat-card" onClick={() => setActiveTab("followers")}>
          <div className="stat-number">{followersCount}</div>
          <div className="stat-label">Takipçi</div>
        </div>
        <div className="stat-card" onClick={() => setActiveTab("following")}>
          <div className="stat-number">{followingCount}</div>
          <div className="stat-label">Takip Edilen</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{mutualFollowsCount}</div>
          <div className="stat-label">Karşılıklı</div>
        </div>
      </div>
    </div>
  );

  const DiscoverView = () => (
    <div className="discover-view">
      <div className="search-section">
        <input
          type="text"
          placeholder="Kitapsever bul... (isim, ilgi alanı)"
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          className="search-input"
        />
        {isSearching && <div className="search-loading">🔍 Aranıyor...</div>}
      </div>

      {searchResults.length > 0 ? (
        <div className="users-list">
          <h3>🔍 Arama Sonuçları</h3>
          {searchResults.map((userInfo) => (
            <UserCard
              key={userInfo.user.id}
              userInfo={userInfo}
              showFollowButton={userInfo.user.id !== state.user?.id}
            />
          ))}
        </div>
      ) : (
        <div className="users-list">
          <h3>💡 Önerilen Kitapseverler</h3>
          <p className="section-desc">
            İlgi alanlarınıza ve okuma zevkinize göre sizin için seçtiklerimiz:
          </p>
          {suggestedUsers.map((userInfo) => (
            <UserCard
              key={userInfo.user.id}
              userInfo={userInfo}
              showFollowButton={userInfo.user.id !== state.user?.id}
            />
          ))}
        </div>
      )}
    </div>
  );

  const FollowersView = () => (
    <div className="followers-view">
      <h3>👥 Takipçiler ({followersCount})</h3>
      <div className="users-list">
        {followers.map((userInfo) => (
          <UserCard
            key={userInfo.user.id}
            userInfo={userInfo}
            showFollowButton={userInfo.relationshipType !== "mutual"}
            compact
          />
        ))}
      </div>
    </div>
  );

  const FollowingView = () => (
    <div className="following-view">
      <h3>🔗 Takip Edilenler ({followingCount})</h3>
      <div className="users-list">
        {following.map((userInfo) => (
          <UserCard
            key={userInfo.user.id}
            userInfo={userInfo}
            showFollowButton={false}
            compact
          />
        ))}
      </div>
    </div>
  );

  if (view === "stats") {
    return (
      <div className="follow-system">
        <StatsView />
        <div className="quick-actions">
          <button
            onClick={() => setActiveTab("discover")}
            className="action-button primary"
          >
            🔍 Kitapsever Keşfet
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="follow-system">
      <div className="follow-header">
        <h2>📚 Kitapsever Ağı</h2>
        <p>Benzer zevklere sahip okuyucularla bağlantı kurun</p>
      </div>

      <div className="follow-tabs">
        <button
          className={`tab ${activeTab === "discover" ? "active" : ""}`}
          onClick={() => setActiveTab("discover")}
        >
          🔍 Keşfet
        </button>
        <button
          className={`tab ${activeTab === "followers" ? "active" : ""}`}
          onClick={() => setActiveTab("followers")}
        >
          👥 Takipçiler ({followersCount})
        </button>
        <button
          className={`tab ${activeTab === "following" ? "active" : ""}`}
          onClick={() => setActiveTab("following")}
        >
          🔗 Takip Edilenler ({followingCount})
        </button>
      </div>

      <div className="follow-content">
        {activeTab === "discover" && <DiscoverView />}
        {activeTab === "followers" && <FollowersView />}
        {activeTab === "following" && <FollowingView />}
      </div>
    </div>
  );
};

export default FollowSystem;
