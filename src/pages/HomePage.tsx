import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../hooks/useAuth";
import { inventoriesApi } from "../api/inventories.api";
import type { InventoryListItemDto } from "../types";
import InventoryTable from "../components/inventory/InventoryTable";
import ErrorAlert from "../components/common/ErrorAlert";
import "../styles/HomePage.css";

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
        setLatest(latestData || []);
        setTop(topData || []);
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
          {t("home.hero.title", "Manage everything, effortlessly.")}
        </h1>
        <p className="hero-subtitle mb-4">
          {t("home.hero.subtitle", "A modern, lightning-fast platform to track your assets, collaborate with your team, and stay organized.")}
        </p>
        <div className="d-flex justify-content-center gap-3">
          <Link to="/inventories" className="btn-primary-custom">
            {t("home.hero.browseBtn", "Browse Inventories")}
          </Link>
        </div>
      </section>

      {error && <ErrorAlert message={error} onDismiss={() => setError(null)} />}

      {/* Latest Inventories */}
      <section className="mt-5 animate-fade-up delay-1">
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
      <section className="mt-5 mb-5 animate-fade-up delay-2">
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
    </div>
  );
};

export default HomePage;
