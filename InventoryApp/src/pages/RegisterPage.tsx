import React, { useState, useEffect } from "react";
import { Link, useNavigate, Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { authApi } from "../api/auth.api";
import { useAuth } from "../context/AuthContext";
import ErrorAlert from "../components/common/ErrorAlert";

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
                  style={{
                    backgroundColor:
                      strength >= level ? getStrengthColor() : "var(--border)",
                  }}
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

      <style>{`
        /* Inherits auth-container, auth-card, form-floating-custom, btn-submit from LoginPage via global CSS or shared classes if extracted. */
        /* For this file, I'll provide the specific additions. */
        
        .auth-container {
          min-height: calc(100vh - 64px); display: flex; align-items: center; justify-content: center;
          background: linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-primary) 100%);
          background-size: 200% 200%; animation: logInGradient 15s ease infinite; padding: 2rem 1rem;
        }
        .auth-card {
          width: 100%; max-width: 420px; background: var(--bg-card); padding: 40px;
          border-radius: var(--radius-lg); box-shadow: var(--shadow-lg); border: 1px solid var(--border);
        }
        .auth-title { font-size: 1.75rem; font-weight: 800; color: var(--text-primary); margin-bottom: 0.25rem; }
        .auth-subtitle { font-size: 0.875rem; color: var(--text-secondary); }
        
        .form-floating-custom { position: relative; }
        .form-floating-custom input {
          width: 100%; padding: 12px 16px; font-size: 1rem; color: var(--text-primary);
          background: var(--bg-primary); border: 1px solid var(--border); border-radius: var(--radius-sm);
          transition: all 0.2s ease;
        }
        .form-floating-custom input:focus { outline: none; border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-subtle); }
        .form-floating-custom label {
          position: absolute; left: 16px; top: 50%; transform: translateY(-50%); color: var(--text-muted);
          transition: all 0.2s ease; pointer-events: none; font-size: 1rem; background: var(--bg-primary); padding: 0 4px;
        }
        .form-floating-custom input:focus ~ label, .form-floating-custom input:not(:placeholder-shown) ~ label {
          top: 0; font-size: 0.75rem; color: var(--accent);
        }
        
        .btn-toggle-pwd { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); background: none; border: none; color: var(--text-secondary); font-size: 0.75rem; font-weight: 600; cursor: pointer; }
        
        .strength-bars { display: flex; gap: 4px; margin-top: 8px; }
        .strength-bar { height: 4px; flex: 1; border-radius: 2px; transition: background-color 0.3s ease; }
        
        .btn-submit { background: var(--accent); color: white; border: none; padding: 12px; border-radius: var(--radius-sm); font-weight: 600; font-size: 1rem; transition: var(--transition); }
        .btn-submit:hover:not(:disabled) { background: var(--accent-hover); transform: translateY(-1px); box-shadow: var(--shadow-sm); }
        .btn-submit:disabled { opacity: 0.7; cursor: not-allowed; }
        
        .auth-link { color: var(--accent); font-weight: 600; text-decoration: none; }
        .auth-link:hover { text-decoration: underline; }
      `}</style>
    </div>
  );
};

export default RegisterPage;
