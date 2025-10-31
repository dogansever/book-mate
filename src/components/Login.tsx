import React, { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useGoogleLogin } from '@react-oauth/google';
import { instagramOAuthService } from '../services/instagramOAuthService';
import "./Login.css";

interface LoginProps {
  onSwitchToRegister: () => void;
}

const Login: React.FC<LoginProps> = ({ onSwitchToRegister }) => {
  const { state, login, socialLogin } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.email && formData.password) {
      await login(formData);
    }
  };

  const handleSocialLogin = async (provider: "google" | "instagram") => {
    if (provider === "google") {
      // Google OAuth will be handled by googleLogin hook
      return;
    }
    
    if (provider === "instagram") {
      await handleInstagramLogin();
      return;
    }
    
    await socialLogin({ provider });
  };

  const handleInstagramLogin = async () => {
    try {
      console.log('🔄 Instagram OAuth başlatılıyor...');
      
      const { user } = await instagramOAuthService.authenticateWithPopup();
      
      console.log('✅ Instagram OAuth başarılı:', user);
      
      // AuthContext'e Instagram user bilgilerini gönder
      await socialLogin({ 
        provider: 'instagram',
        userData: {
          id: user.id,
          email: `${user.username}@instagram.com`, // Instagram email vermiyor, username kullan
          name: user.username,
          picture: undefined // Instagram Basic Display API'da profile picture yok
        }
      });
      
    } catch (error) {
      console.error('❌ Instagram login error:', error);
      // Kullanıcıya hata göster
      alert(error instanceof Error ? error.message : 'Instagram ile giriş yapılırken hata oluştu');
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      console.log('Google OAuth Success:', tokenResponse);
      
      try {
        // Access token ile user info al
        const userInfoResponse = await fetch(
          `https://www.googleapis.com/oauth2/v2/userinfo?access_token=${tokenResponse.access_token}`
        );
        const userInfo = await userInfoResponse.json();
        
        console.log('Google User Info:', userInfo);
        
        // AuthContext'e Google user bilgilerini gönder
        await socialLogin({ 
          provider: 'google',
          userData: {
            id: userInfo.id,
            email: userInfo.email,
            name: userInfo.name,
            picture: userInfo.picture
          }
        });
        
      } catch (error) {
        console.error('Google login error:', error);
      }
    },
    onError: (error) => {
      console.error('Google OAuth Error:', error);
    },
  });

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="brand-header">
          <h1>📚 Book Mate</h1>
          <p className="brand-subtitle">Kitap Severler İçin Sosyal Platform</p>
          <div className="app-intro">
            <p>
              Kitap tutkunu arkadaşlarla tanış, okuma deneyimlerini paylaş ve
              kişiselleştirilmiş kitap önerileri keşfet.
            </p>
          </div>
        </div>

        <h2>Hesabına Giriş Yap</h2>

        {state.error && <div className="error-message">{state.error}</div>}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">E-posta</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              placeholder="E-posta adresinizi girin"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Şifre</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              placeholder="Şifrenizi girin"
            />
          </div>

          <button
            type="submit"
            className="login-button"
            disabled={state.isLoading}
          >
            {state.isLoading ? "Giriş yapılıyor..." : "Giriş Yap"}
          </button>
        </form>

        <div className="divider">
          <span>veya</span>
        </div>

        <div className="social-login">
          <button
            onClick={() => googleLogin()}
            className="social-button google"
            disabled={state.isLoading}
          >
            <span className="social-icon">🔗</span>
            Google ile Giriş Yap
          </button>

          <button
            onClick={() => handleSocialLogin("instagram")}
            className="social-button instagram"
            disabled={state.isLoading}
          >
            <span className="social-icon">📷</span>
            Instagram ile Giriş Yap
          </button>
        </div>

        <div className="switch-auth">
          <p>
            Hesabınız yok mu?
            <button onClick={onSwitchToRegister} className="link-button">
              Kayıt Ol
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
