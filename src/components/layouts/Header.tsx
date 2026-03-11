import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { searchApi } from "../../api/search.api";
import type { SearchResultDto } from "../../types";
import "../../styles/Header.css";

const Header: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResultDto | null>(
    null,
  );
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchDropdownRef = useRef<HTMLDivElement>(null);

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    localStorage.setItem("language", lng);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Search functions
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setShowSearchDropdown(true);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (value.length >= 2) {
      searchTimeoutRef.current = setTimeout(async () => {
        try {
          setSearchLoading(true);
          const results = await searchApi.search(value);
          setSearchResults(results);
        } catch (err) {
          console.error("Search error:", err);
          setSearchResults(null);
        } finally {
          setSearchLoading(false);
        }
      }, 300);
    } else {
      setSearchResults(null);
      setSearchLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setShowSearchDropdown(false);
      setSearchQuery("");
    }
  };

  const handleSearchResultClick = (path: string) => {
    navigate(path);
    setShowSearchDropdown(false);
    setSearchQuery("");
  };

  // Effects
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
      if (
        searchDropdownRef.current &&
        !searchDropdownRef.current.contains(event.target as Node) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target as Node)
      ) {
        setShowSearchDropdown(false);
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
        <div
          className="d-none d-md-block search-container"
          style={{ position: "relative" }}
        >
          <form onSubmit={handleSearchSubmit}>
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
              ref={searchInputRef}
              type="text"
              className="search-input"
              placeholder={t("common.search", "Search inventories...")}
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              onFocus={() => setShowSearchDropdown(true)}
            />
          </form>

          {showSearchDropdown && (searchResults || searchLoading) && (
            <div
              ref={searchDropdownRef}
              className="search-dropdown"
              style={{
                position: "absolute",
                top: "calc(100% + 8px)",
                left: 0,
                right: 0,
                background: "var(--bg-card)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-md)",
                boxShadow: "var(--shadow-md)",
                zIndex: 1000,
                maxHeight: "400px",
                overflowY: "auto",
              }}
            >
              {searchLoading ? (
                <div
                  style={{
                    padding: "1rem",
                    textAlign: "center",
                    color: "var(--text-muted)",
                  }}
                >
                  {t("search.searching", "Searching...")}
                </div>
              ) : searchResults ? (
                <>
                  {searchResults.inventories.length > 0 && (
                    <div>
                      <div
                        style={{
                          padding: "0.5rem 1rem",
                          fontWeight: "500",
                          color: "var(--text-secondary)",
                          borderBottom: "1px solid var(--border)",
                        }}
                      >
                        {t("search.inventories", "Inventories")}
                      </div>
                      {searchResults.inventories
                        .slice(0, 3)
                        .map((inventory) => (
                          <div
                            key={inventory.id}
                            onClick={() =>
                              handleSearchResultClick(
                                `/inventories/${inventory.id}`,
                              )
                            }
                            style={{
                              padding: "0.75rem 1rem",
                              cursor: "pointer",
                              borderBottom: "1px solid var(--border)",
                              display: "flex",
                              alignItems: "center",
                              gap: "0.75rem",
                            }}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.background =
                                "var(--bg-secondary)")
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.background = "transparent")
                            }
                          >
                            <div style={{ fontSize: "1.25rem" }}>📦</div>
                            <div>
                              <div style={{ fontWeight: "500" }}>
                                {inventory.title}
                              </div>
                              <div
                                style={{
                                  fontSize: "0.875rem",
                                  color: "var(--text-muted)",
                                }}
                              >
                                {inventory.ownerName} ·{" "}
                                {inventory.itemCount || 0}{" "}
                                {t("search.items", "items")}
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}

                  {searchResults.items.length > 0 && (
                    <div>
                      <div
                        style={{
                          padding: "0.5rem 1rem",
                          fontWeight: "500",
                          color: "var(--text-secondary)",
                          borderBottom: "1px solid var(--border)",
                        }}
                      >
                        {t("search.items", "Items")}
                      </div>
                      {searchResults.items.slice(0, 3).map((item) => (
                        <div
                          key={`${item.inventoryId}-${item.itemId}`}
                          onClick={() =>
                            handleSearchResultClick(
                              `/inventories/${item.inventoryId}?tab=items`,
                            )
                          }
                          style={{
                            padding: "0.75rem 1rem",
                            cursor: "pointer",
                            borderBottom: "1px solid var(--border)",
                            display: "flex",
                            alignItems: "center",
                            gap: "0.75rem",
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.background =
                              "var(--bg-secondary)")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.background = "transparent")
                          }
                        >
                          <div style={{ fontSize: "1.25rem" }}>📄</div>
                          <div>
                            <div style={{ fontWeight: "500" }}>
                              {item.customId}
                            </div>
                            <div
                              style={{
                                fontSize: "0.875rem",
                                color: "var(--text-muted)",
                              }}
                            >
                              {item.inventoryTitle}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {(searchResults.inventories.length > 0 ||
                    searchResults.items.length > 0) && (
                    <div
                      onClick={handleSearchSubmit}
                      style={{
                        padding: "0.75rem 1rem",
                        cursor: "pointer",
                        color: "var(--accent)",
                        fontWeight: "500",
                        textAlign: "center",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background =
                          "var(--bg-secondary)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "transparent")
                      }
                    >
                      🔍{" "}
                      {t("search.seeAll", 'See all results for "{{query}}"', {
                        query: searchQuery,
                      })}
                    </div>
                  )}
                </>
              ) : null}
            </div>
          )}
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
                    to="/me"
                    className="dropdown-item"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    My Page
                  </Link>
                  {isAdmin && (
                    <Link
                      to="/admin"
                      className="dropdown-item"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      Admin Panel
                    </Link>
                  )}
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
    </header>
  );
};

export default Header;
