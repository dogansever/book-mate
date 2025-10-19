import React, { useState } from "react";
import { SocialConnection } from "../types/user";
import "./SocialConnections.css";

interface SocialConnectionsProps {
  connections: SocialConnection[];
  onUpdate: (connections: SocialConnection[]) => void;
}

const SocialConnections: React.FC<SocialConnectionsProps> = ({
  connections,
  onUpdate,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<
    "instagram" | "linkedin"
  >("instagram");
  const [username, setUsername] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  const platforms = [
    {
      id: "instagram" as const,
      name: "Instagram",
      icon: "📷",
      placeholder: "kullanici_adi",
      color: "#E4405F",
      description:
        "Instagram profilinizi bağlayarak kitap paylaşımlarınızı ve görsel içeriklerinizi sergileyebilirsiniz.",
    },
    {
      id: "linkedin" as const,
      name: "LinkedIn",
      icon: "💼",
      placeholder: "ad-soyad",
      color: "#0077B5",
      description:
        "LinkedIn profilinizi bağlayarak profesyonel kimliğinizi doğrulayabilir ve güvenilirliğinizi artırabilirsiniz.",
    },
  ];

  const isConnected = (platform: "instagram" | "linkedin") => {
    return connections.some((conn) => conn.platform === platform);
  };

  const getConnection = (platform: "instagram" | "linkedin") => {
    return connections.find((conn) => conn.platform === platform);
  };

  const handleAddConnection = async () => {
    if (!username.trim()) return;

    setIsVerifying(true);

    try {
      // Simulated verification process
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const newConnection: SocialConnection = {
        platform: selectedPlatform,
        username: username.trim(),
        profileUrl:
          selectedPlatform === "instagram"
            ? `https://instagram.com/${username.trim()}`
            : `https://linkedin.com/in/${username.trim()}`,
        isVerified: true, // In real app, this would be based on actual verification
        connectedAt: new Date(),
      };

      const updatedConnections = [...connections, newConnection];
      onUpdate(updatedConnections);

      // Reset form
      setUsername("");
      setShowAddForm(false);
    } catch (error) {
      console.error("Verification failed:", error);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleRemoveConnection = (platform: "instagram" | "linkedin") => {
    const updatedConnections = connections.filter(
      (conn) => conn.platform !== platform
    );
    onUpdate(updatedConnections);
  };

  return (
    <div className="social-connections">
      <div className="connections-header">
        <h3>🔗 Sosyal Hesap Bağlantıları</h3>
        <p className="connections-description">
          Sosyal hesaplarınızı bağlayarak kimliğinizi doğrulayın ve
          güvenilirliğinizi artırın. Bu, diğer kullanıcıların sizinle güvenle
          bağlantı kurmasına yardımcı olur.
        </p>
      </div>

      <div className="platforms-grid">
        {platforms.map((platform) => {
          const connection = getConnection(platform.id);
          const connected = isConnected(platform.id);

          return (
            <div
              key={platform.id}
              className={`platform-card ${connected ? "connected" : ""}`}
            >
              <div className="platform-header">
                <div className="platform-info">
                  <span className="platform-icon">{platform.icon}</span>
                  <div>
                    <h4>{platform.name}</h4>
                    {connected && connection && (
                      <div className="connection-status">
                        <span className="verified-badge">✅ Doğrulandı</span>
                        <span className="username">@{connection.username}</span>
                      </div>
                    )}
                  </div>
                </div>
                {connected ? (
                  <div className="connection-actions">
                    <a
                      href={connection?.profileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="view-profile-btn"
                    >
                      Profili Gör
                    </a>
                    <button
                      onClick={() => handleRemoveConnection(platform.id)}
                      className="remove-btn"
                    >
                      Kaldır
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setSelectedPlatform(platform.id);
                      setShowAddForm(true);
                    }}
                    className="connect-btn"
                    style={{ backgroundColor: platform.color }}
                  >
                    Bağla
                  </button>
                )}
              </div>

              <p className="platform-description">{platform.description}</p>
            </div>
          );
        })}
      </div>

      {showAddForm && (
        <div className="add-connection-modal">
          <div
            className="modal-overlay"
            onClick={() => setShowAddForm(false)}
          />
          <div className="modal-content">
            <div className="modal-header">
              <h3>
                {platforms.find((p) => p.id === selectedPlatform)?.icon}
                {platforms.find((p) => p.id === selectedPlatform)?.name} Hesabı
                Bağla
              </h3>
              <button
                onClick={() => setShowAddForm(false)}
                className="close-btn"
              >
                ×
              </button>
            </div>

            <div className="modal-body">
              <div className="verification-info">
                <h4>🔐 Doğrulama Süreci</h4>
                <p>
                  {selectedPlatform === "instagram"
                    ? "Instagram kullanıcı adınızı girin. Hesabınızın erişilebilir olduğunu doğrulayacağız."
                    : "LinkedIn profil URL'inizdeki kullanıcı adınızı girin. Hesabınızın geçerliliğini doğrulayacağız."}
                </p>
              </div>

              <div className="username-input-group">
                <label>
                  {selectedPlatform === "instagram" ? "Instagram" : "LinkedIn"}{" "}
                  Kullanıcı Adı
                </label>
                <div className="input-with-prefix">
                  <span className="url-prefix">
                    {selectedPlatform === "instagram"
                      ? "@"
                      : "linkedin.com/in/"}
                  </span>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder={
                      platforms.find((p) => p.id === selectedPlatform)
                        ?.placeholder
                    }
                    disabled={isVerifying}
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button
                  onClick={() => setShowAddForm(false)}
                  className="cancel-btn"
                  disabled={isVerifying}
                >
                  İptal
                </button>
                <button
                  onClick={handleAddConnection}
                  className="verify-btn"
                  disabled={!username.trim() || isVerifying}
                >
                  {isVerifying ? (
                    <>
                      <span className="loading-spinner"></span>
                      Doğrulanıyor...
                    </>
                  ) : (
                    "Doğrula ve Bağla"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {connections.length > 0 && (
        <div className="trust-indicator">
          <div className="trust-badge">
            <span className="trust-icon">🛡️</span>
            <div className="trust-info">
              <h4>Güven Puanı: Yüksek</h4>
              <p>
                {connections.length} sosyal hesap bağlantısı ile kimliğiniz
                doğrulandı. Bu, diğer kullanıcıların sizinle güvenle etkileşim
                kurmasını sağlar.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SocialConnections;
