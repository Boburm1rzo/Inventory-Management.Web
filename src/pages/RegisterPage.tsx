import React, { useState, useEffect } from "react";
import { Link, useNavigate, Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { authApi } from "../api/auth.api";
import { useAuth } from "../context/AuthContext";
import ErrorAlert from "../components/common/ErrorAlert";
import "../styles/RegisterPage.css";

const RegisterPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Password Strength Logic
  const [strength, setStrength] = useState(0);

  useEffect(() => {
    let score = 0;
    if (password.length > 5) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    setStrength(score);
  }, [password]);

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await authApi.register({ displayName, email, password });
      await login(res.token);
      navigate("/");
    } catch (err: any) {
      setError(err.message || t("errors.general"));
    } finally {
      setLoading(false);
    }
  };

  const getStrengthColor = () => {
    if (strength === 0) return "var(--border)";
    if (strength === 1) return "var(--danger)";
    if (strength === 2) return "var(--warning)";
    if (strength === 3) return "#84cc16"; // yellow-green
    return "var(--success)";
  };

  return (
    <div className="auth-container">
      <div className="auth-card animate-fade-up">
        <div className="text-center mb-4">
          <h1 className="auth-title">
            {t("auth.registerTitle", "Create account")}
          </h1>
          <p className="auth-subtitle text-secondary">
            Join InventoryApp today
          </p>
        </div>

        {error && (
          <ErrorAlert message={error} onDismiss={() => setError(null)} />
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-floating-custom mb-3">
            <input
              type="text"
              id="displayName"
              required
              placeholder=" "
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
            <label htmlFor="displayName">
              {t("auth.displayName", "Display Name")}
            </label>
          </div>

          <div className="form-floating-custom mb-3">
            <input
              type="email"
              id="email"
              required
              placeholder=" "
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <label htmlFor="email">{t("auth.email", "Email")}</label>
          </div>

          <div className="form-floating-custom mb-1 position-relative">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              required
              placeholder=" "
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <label htmlFor="password">{t("auth.password", "Password")}</label>
            <button
              type="button"
              className="btn-toggle-pwd"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          {/* Password Strength Indicator */}
          <div className="password-strength mb-4">
            <div className="strength-bars">
              {[1, 2, 3, 4].map((level) => (
                <div
                  key={level}
                  className="strength-bar"
                  style={
                    {
                      "--bar-color":
                        strength >= level
                          ? getStrengthColor()
                          : "var(--border)",
                    } as React.CSSProperties
                  }
                />
              ))}
            </div>
          </div>

          <button type="submit" className="btn-submit w-100" disabled={loading}>
            {loading ? (
              <span className="spinner-border spinner-border-sm"></span>
            ) : (
              t("auth.registerBtn", "Create account")
            )}
          </button>
        </form>

        <div className="text-center mt-4">
          <span className="text-muted text-sm">
            {t("auth.hasAccount", "Already have an account?")}{" "}
          </span>
          <Link to="/login" className="auth-link">
            {t("auth.loginBtn", "Sign in")}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
