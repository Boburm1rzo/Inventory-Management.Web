import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";

const Header: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    localStorage.setItem("language", lng);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const currentLang = i18n.language || "en";

  return (
    <header className="app-header sticky-top">
      <div className="container-fluid max-w-1200 d-flex justify-content-between align-items-center h-100 px-4">
        {/* Left: Logo */}
        <Link
          to="/"
          className="d-flex align-items-center gap-2 text-decoration-none logo-link"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--accent)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
            <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
            <line x1="12" y1="22.08" x2="12" y2="12"></line>
          </svg>
          <span className="logo-text">InventoryApp</span>
        </Link>

        {/* Center: Search (Hidden on Mobile) */}
        <div className="d-none d-md-block search-container">
          <svg
            className="search-icon"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            type="text"
            className="search-input"
            placeholder={t("common.search", "Search inventories...")}
          />
        </div>

        {/* Right: Actions */}
        <div className="d-flex align-items-center gap-3">
          {/* Language Switcher */}
          <div className="lang-switcher d-flex rounded-pill p-1">
            <button
              className={`lang-btn ${currentLang === "en" ? "active" : ""}`}
              onClick={() => changeLanguage("en")}
            >
              EN
            </button>
            <button
              className={`lang-btn ${currentLang === "uz" ? "active" : ""}`}
              onClick={() => changeLanguage("uz")}
            >
              UZ
            </button>
          </div>

          {/* Theme Toggle */}
          <button
            className="theme-toggle-btn"
            onClick={toggleTheme}
            aria-label={t("theme.toggle", "Toggle theme")}
          >
            {theme === "light" ? (
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            ) : (
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </button>

          {/* Auth Area */}
          {!isAuthenticated ? (
            <div className="d-flex gap-2">
              <Link to="/login" className="btn-auth btn-login">
                {t("nav.login")}
              </Link>
              <Link to="/register" className="btn-auth btn-register">
                {t("nav.register")}
              </Link>
            </div>
          ) : (
            <div className="position-relative" ref={dropdownRef}>
              <button
                className="user-menu-btn d-flex align-items-center gap-2"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <div className="avatar">
                  {user?.displayName.charAt(0).toUpperCase()}
                </div>
                <span className="d-none d-sm-block fw-medium text-sm">
                  {user?.displayName}
                </span>
              </button>

              {isDropdownOpen && (
                <div className="user-dropdown slideInTop">
                  <Link
                    to="/profile"
                    className="dropdown-item"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    {t("nav.profile")}
                  </Link>
                  <hr className="dropdown-divider" />
                  <button
                    className="dropdown-item text-danger"
                    onClick={handleLogout}
                  >
                    {t("nav.logout")}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <style>{`
        .app-header {
          height: 64px;
          background: var(--bg-header);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-bottom: 1px solid var(--border);
          box-shadow: var(--shadow-sm);
          z-index: 1000;
        }
        .max-w-1200 { max-width: 1200px; margin: 0 auto; }
        .logo-text { font-family: 'Plus Jakarta Sans', sans-serif; font-weight: 800; font-size: 1.25rem; color: var(--text-primary); }
        
        .search-container { position: relative; width: 300px; }
        .search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--text-muted); }
        .search-input {
          width: 100%; padding: 8px 16px 8px 36px;
          border-radius: 50rem; border: 1px solid var(--border);
          background: var(--bg-secondary); color: var(--text-primary);
          transition: var(--transition); font-size: 0.875rem;
        }
        .search-input:focus { outline: none; border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-subtle); }
        
        .lang-switcher { background: var(--bg-secondary); border: 1px solid var(--border); }
        .lang-btn {
          border: none; background: transparent; color: var(--text-secondary);
          font-size: 0.75rem; font-weight: 600; padding: 4px 10px; border-radius: 6px;
          transition: var(--transition); cursor: pointer;
        }
        .lang-btn.active { background: var(--accent); color: white; }
        
        .theme-toggle-btn {
          width: 36px; height: 36px; border-radius: 50%; border: none;
          background: var(--bg-secondary); color: var(--text-primary);
          display: flex; align-items: center; justify-content: center;
          transition: var(--transition); cursor: pointer;
        }
        .theme-toggle-btn:hover { background: var(--accent-subtle); color: var(--accent); }
        .theme-toggle-btn svg { transition: transform 0.3s ease; }
        .theme-toggle-btn:active svg { transform: rotate(360deg); }

        .btn-auth { font-size: 0.875rem; font-weight: 600; padding: 6px 16px; border-radius: 8px; transition: var(--transition); text-decoration: none; }
        .btn-login { color: var(--accent); border: 1px solid var(--accent); background: transparent; }
        .btn-login:hover { background: var(--accent-subtle); }
        .btn-register { background: var(--accent); color: white; border: 1px solid var(--accent); }
        .btn-register:hover { background: var(--accent-hover); border-color: var(--accent-hover); color: white; transform: translateY(-1px); }

        .user-menu-btn { background: transparent; border: none; padding: 0; color: var(--text-primary); cursor: pointer; }
        .avatar {
          width: 36px; height: 36px; border-radius: 50%; background: linear-gradient(135deg, var(--accent), var(--success));
          color: white; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 1rem;
        }
        
        .user-dropdown {
          position: absolute; right: 0; top: calc(100% + 12px); min-width: 160px;
          background: var(--bg-card); border: 1px solid var(--border);
          border-radius: var(--radius-md); box-shadow: var(--shadow-md);
          padding: 8px 0; z-index: 1050;
        }
        .user-dropdown .dropdown-item {
          padding: 8px 16px; font-size: 0.875rem; color: var(--text-primary);
          background: transparent; border: none; width: 100%; text-align: left; cursor: pointer;
        }
        .user-dropdown .dropdown-item:hover { background: var(--bg-secondary); }
        .dropdown-divider { margin: 4px 0; border-color: var(--border); }
        .slideInTop { animation: slideInTop 0.2s ease-out forwards; }
      `}</style>
    </header>
  );
};

export default Header;
