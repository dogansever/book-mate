import React, { useState } from "react";
import { useAuth } from "../hooks/useAuth";
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
    await socialLogin({ provider });
  };

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
            onClick={() => handleSocialLogin("google")}
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
