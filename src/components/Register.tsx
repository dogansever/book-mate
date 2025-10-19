import React, { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import "./Register.css";

interface RegisterProps {
  onSwitchToLogin: () => void;
}

const Register: React.FC<RegisterProps> = ({ onSwitchToLogin }) => {
  const { state, register, socialLogin } = useAuth();
  const [formData, setFormData] = useState({
    displayName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [validationError, setValidationError] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setValidationError("");
  };

  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) {
      setValidationError("Şifreler eşleşmiyor");
      return false;
    }
    if (formData.password.length < 6) {
      setValidationError("Şifre en az 6 karakter olmalıdır");
      return false;
    }
    if (!formData.displayName.trim()) {
      setValidationError("İsim alanı zorunludur");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      await register({
        email: formData.email,
        password: formData.password,
        displayName: formData.displayName,
      });
    }
  };

  const handleSocialLogin = async (provider: "google" | "instagram") => {
    await socialLogin({ provider });
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <div className="brand-header">
          <h1>📚 Book Mate</h1>
          <p className="brand-subtitle">Kitap Severler İçin Sosyal Platform</p>
          <div className="app-intro">
            <p>
              Binlerce kitap severle tanış, okuma hedeflerini takip et ve
              büyüleyici kitap dünyasının bir parçası ol.
            </p>
          </div>
        </div>

        <h2>Yeni Hesap Oluştur</h2>

        {(state.error || validationError) && (
          <div className="error-message">{validationError || state.error}</div>
        )}

        <form onSubmit={handleSubmit} className="register-form">
          <div className="form-group">
            <label htmlFor="displayName">İsim</label>
            <input
              type="text"
              id="displayName"
              name="displayName"
              value={formData.displayName}
              onChange={handleInputChange}
              required
              placeholder="Adınızı girin"
            />
          </div>

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
              placeholder="Şifre oluşturun (en az 6 karakter)"
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Şifre Tekrar</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              required
              placeholder="Şifrenizi tekrar girin"
            />
          </div>

          <button
            type="submit"
            className="register-button"
            disabled={state.isLoading}
          >
            {state.isLoading ? "Kayıt oluşturuluyor..." : "Kayıt Ol"}
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
            Google ile Kayıt Ol
          </button>

          <button
            onClick={() => handleSocialLogin("instagram")}
            className="social-button instagram"
            disabled={state.isLoading}
          >
            <span className="social-icon">📷</span>
            Instagram ile Kayıt Ol
          </button>
        </div>

        <div className="switch-auth">
          <p>
            Zaten hesabınız var mı?
            <button onClick={onSwitchToLogin} className="link-button">
              Giriş Yap
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
