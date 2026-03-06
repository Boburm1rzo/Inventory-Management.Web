import React, { useState } from "react";
import { Link, useNavigate, Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { authApi } from "../api/auth.api";
import axiosInstance from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";
import ErrorAlert from "../components/common/ErrorAlert";
import "../styles/LoginPage.css";

const LoginPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await authApi.login({ email, password });
      await login(res.token);
      navigate("/");
    } catch (err: any) {
      setError(err.message || t("errors.general"));
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = (provider: "google" | "facebook") => {
    // build URL using the same base as our axios instance (sans "/api") so
    // we don't hardcode a port.  axiosInstance.baseURL =
    // "https://localhost:7030/api" by default.
    const apiBase = (axiosInstance.defaults.baseURL || "").replace(
      /\/api$/,
      "",
    );
    window.location.href = `${apiBase}/api/auth/login-${provider}`;
  };

  return (
    <div className="auth-container">
      <div className="auth-card animate-fade-up">
        <div className="text-center mb-4">
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--accent)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mb-3"
          >
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
            <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
            <line x1="12" y1="22.08" x2="12" y2="12"></line>
          </svg>
          <h1 className="auth-title">{t("auth.loginTitle", "Welcome back")}</h1>
          <p className="auth-subtitle text-secondary">
            Sign in to your account
          </p>
        </div>

        {error && (
          <ErrorAlert message={error} onDismiss={() => setError(null)} />
        )}

        <form onSubmit={handleSubmit} className="auth-form">
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

          <div className="form-floating-custom mb-4 position-relative">
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

          <button type="submit" className="btn-submit w-100" disabled={loading}>
            {loading ? (
              <span className="spinner-border spinner-border-sm"></span>
            ) : (
              t("auth.loginBtn", "Sign in")
            )}
          </button>
        </form>

        <div className="auth-divider">
          <span>{t("auth.orDivider", "or continue with")}</span>
        </div>

        <div className="d-flex flex-column gap-2">
          <button
            type="button"
            className="btn-oauth btn-google"
            onClick={() => handleOAuth("google")}
          >
            <img
              src="https://www.svgrepo.com/show/475656/google-color.svg"
              alt="Google"
              width="20"
              height="20"
            />
            {t("auth.googleBtn", "Continue with Google")}
          </button>
          <button
            type="button"
            className="btn-oauth btn-facebook"
            onClick={() => handleOAuth("facebook")}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="text-white"
            >
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
            {t("auth.facebookBtn", "Continue with Facebook")}
          </button>
        </div>

        <div className="text-center mt-4">
          <span className="text-muted text-sm">
            {t("auth.noAccount", "Don't have an account?")}{" "}
          </span>
          <Link to="/register" className="auth-link">
            {t("auth.registerBtn", "Register")}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
