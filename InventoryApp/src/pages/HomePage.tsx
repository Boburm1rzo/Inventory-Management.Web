import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import { inventoriesApi } from "../api/inventories.api";
import type { InventoryListItemDto } from "../types";
import InventoryTable from "../components/inventory/InventoryTable";
import ErrorAlert from "../components/common/ErrorAlert";

const HomePage: React.FC = () => {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();

  const [latest, setLatest] = useState<InventoryListItemDto[]>([]);
  const [top, setTop] = useState<InventoryListItemDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [latestData, topData] = await Promise.all([
          inventoriesApi.getLatestInventories(),
          inventoriesApi.getTopInventories(),
        ]);
        setLatest(latestData);
        setTop(topData);
      } catch (err: any) {
        setError(err.message || t("errors.general"));
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [t]);

  return (
    <div className="container-fluid max-w-1200 px-4">
      {/* Hero Section */}
      <section className="hero-section text-center animate-fade-up">
        <span className="hero-badge">
          {t("nav.inventories", "Inventory Management")}
        </span>
        <h1 className="hero-title mt-3 mb-3">
          Manage everything, effortlessly.
        </h1>
        <p className="hero-subtitle mb-4">
          A modern, lightning-fast platform to track your assets, collaborate
          with your team, and stay organized.
        </p>
        <div className="d-flex justify-content-center gap-3">
          <Link to="/inventories" className="btn-primary-custom">
            Browse Inventories
          </Link>
          {isAuthenticated && (
            <Link
              to="/inventories?create=true"
              className="btn-secondary-custom"
            >
              {t("inventories.createBtn", "New Inventory")}
            </Link>
          )}
        </div>
      </section>

      {error && <ErrorAlert message={error} onDismiss={() => setError(null)} />}

      {/* Latest Inventories */}
      <section
        className="mt-5 animate-fade-up"
        style={{ animationDelay: "0.1s" }}
      >
        <div className="d-flex justify-content-between align-items-end mb-3">
          <h2 className="section-title m-0">
            {t("home.latestTitle", "Latest Inventories")}
          </h2>
          <Link
            to="/inventories"
            className="text-decoration-none fw-medium view-all"
          >
            View all &rarr;
          </Link>
        </div>

        {loading ? (
          <div className="skeleton-table">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="skeleton-row shimmer-bg"></div>
            ))}
          </div>
        ) : (
          <InventoryTable inventories={latest} showActions={false} />
        )}
      </section>

      {/* Top Inventories */}
      <section
        className="mt-5 mb-5 animate-fade-up"
        style={{ animationDelay: "0.2s" }}
      >
        <h2 className="section-title mb-3">
          {t("home.topTitle", "Most Popular")}
        </h2>
        {loading ? (
          <div className="skeleton-table">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="skeleton-row shimmer-bg"></div>
            ))}
          </div>
        ) : (
          <InventoryTable inventories={top} showActions={false} />
        )}
      </section>

      <style>{`
        .max-w-1200 { max-width: 1200px; margin: 0 auto; }
        .hero-section { padding: 4rem 0 3rem; }
        .hero-badge {
          background: var(--accent-subtle); color: var(--accent);
          padding: 6px 14px; border-radius: 50rem; font-size: 0.875rem; font-weight: 600;
        }
        .hero-title { font-size: 2.75rem; font-weight: 800; letter-spacing: -0.03em; color: var(--text-primary); }
        .hero-subtitle { font-size: 1.125rem; color: var(--text-secondary); max-width: 600px; margin: 0 auto; }
        
        .btn-primary-custom {
          background: var(--accent); color: white; padding: 10px 24px; border-radius: var(--radius-sm);
          font-weight: 600; transition: var(--transition); border: 1px solid var(--accent);
        }
        .btn-primary-custom:hover { background: var(--accent-hover); color: white; transform: translateY(-1px); box-shadow: var(--shadow-sm); }
        
        .btn-secondary-custom {
          background: var(--bg-card); color: var(--text-primary); padding: 10px 24px; border-radius: var(--radius-sm);
          font-weight: 600; transition: var(--transition); border: 1px solid var(--border);
        }
        .btn-secondary-custom:hover { background: var(--bg-secondary); }

        .section-title { font-size: 1.5rem; font-weight: 700; color: var(--text-primary); }
        .view-all { color: var(--accent); transition: var(--transition); font-size: 0.875rem; }
        .view-all:hover { color: var(--accent-hover); }

        .skeleton-table { background: var(--bg-card); border-radius: var(--radius-md); overflow: hidden; border: 1px solid var(--border); }
        .skeleton-row { height: 50px; border-bottom: 1px solid var(--border); }
        .skeleton-row:last-child { border-bottom: none; }
      `}</style>
    </div>
  );
};

export default HomePage;
