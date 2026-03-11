import React, { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { searchApi } from "../api/search.api";
import type {
  SearchResultDto,
  InventoryListItemDto,
  ItemSearchResultDto,
} from "../types";
import ErrorAlert from "../components/common/ErrorAlert";
import LoadingSpinner from "../components/common/LoadingSpinner";
import EmptyState from "../components/common/EmptyState";

const SearchPage: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q") ?? "";

  const [results, setResults] = useState<SearchResultDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (query.length >= 2) {
      performSearch(query);
    } else {
      setResults(null);
    }
  }, [query]);

  const performSearch = async (searchQuery: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await searchApi.search(searchQuery);
      setResults(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setResults(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchParams({ q: value });
  };

  const renderInventoryCard = (inventory: InventoryListItemDto) => (
    <Link
      key={inventory.id}
      to={`/inventories/${inventory.id}`}
      style={{
        display: "block",
        textDecoration: "none",
        color: "inherit",
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-md)",
        padding: "1rem",
        transition: "var(--transition)",
        cursor: "pointer",
      }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.borderColor = "var(--accent-subtle)")
      }
      onMouseLeave={(e) =>
        (e.currentTarget.style.borderColor = "var(--border)")
      }
    >
      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        <div
          style={{
            width: "60px",
            height: "60px",
            background: "var(--bg-secondary)",
            borderRadius: "var(--radius-md)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--text-muted)",
            fontSize: "1.5rem",
          }}
        >
          📦
        </div>
        <div style={{ flex: 1 }}>
          <h4 style={{ margin: "0 0 0.25rem 0", fontSize: "1.125rem" }}>
            {inventory.title}
          </h4>
          <p
            style={{
              margin: "0 0 0.25rem 0",
              color: "var(--text-muted)",
              fontSize: "0.875rem",
            }}
          >
            {t("search.by", "By: {{owner}}", { owner: inventory.ownerName })}
            {inventory.category && ` · ${inventory.category}`}
            {inventory.itemCount !== undefined &&
              ` · ${inventory.itemCount} ${t("search.items", "items")}`}
          </p>
        </div>
      </div>
    </Link>
  );

  const renderItemResult = (item: ItemSearchResultDto) => (
    <div
      key={`${item.inventoryId}-${item.itemId}`}
      style={{
        padding: "0.75rem",
        borderBottom: "1px solid var(--border)",
        cursor: "pointer",
      }}
      onClick={() =>
        (window.location.href = `/inventories/${item.inventoryId}?tab=items`)
      }
    >
      <div style={{ fontWeight: "500", marginBottom: "0.25rem" }}>
        {item.customId}
      </div>
      <div
        style={{
          color: "var(--text-muted)",
          fontSize: "0.875rem",
          marginBottom: "0.25rem",
        }}
      >
        {item.inventoryTitle}
      </div>
      <div style={{ color: "var(--text-secondary)", fontSize: "0.75rem" }}>
        {t("search.foundIn", "Found in: {{fields}}", {
          fields: item.matchedFields.join(", "),
        })}
      </div>
    </div>
  );

  return (
    <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
      <div style={{ marginBottom: "2rem" }}>
        <div style={{ position: "relative", maxWidth: "600px" }}>
          <svg
            style={{
              position: "absolute",
              left: "1rem",
              top: "50%",
              transform: "translateY(-50%)",
              width: "20px",
              height: "20px",
              color: "var(--text-muted)",
            }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder={t(
              "search.placeholder",
              "Search inventories and items...",
            )}
            style={{
              width: "100%",
              padding: "1rem 1rem 1rem 3rem",
              fontSize: "1.125rem",
              border: "2px solid var(--border)",
              borderRadius: "var(--radius-lg)",
              background: "var(--bg-primary)",
              color: "var(--text-primary)",
              outline: "none",
            }}
            autoFocus
          />
        </div>
      </div>

      {query.length === 0 && (
        <EmptyState
          title={t("search.enterQuery", "Enter a search term")}
          message={t(
            "search.enterQueryDesc",
            "Type at least 2 characters to start searching",
          )}
        />
      )}

      {query.length > 0 && query.length < 2 && (
        <EmptyState
          title={t("search.typeMore", "Type at least 2 characters")}
          message={t(
            "search.typeMoreDesc",
            "We need more characters to search effectively",
          )}
        />
      )}

      {loading && <LoadingSpinner />}

      {error && <ErrorAlert message={error} onDismiss={() => setError(null)} />}

      {results && !loading && (
        <div>
          {results.inventories.length > 0 && (
            <div style={{ marginBottom: "2rem" }}>
              <h3 style={{ marginBottom: "1rem" }}>
                {t("search.inventories", "Inventories")} (
                {results.inventories.length})
              </h3>
              <div
                style={{
                  display: "grid",
                  gap: "1rem",
                  gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                }}
              >
                {results.inventories.map(renderInventoryCard)}
              </div>
            </div>
          )}

          {results.items.length > 0 && (
            <div>
              <h3 style={{ marginBottom: "1rem" }}>
                {t("search.items", "Items")} ({results.items.length})
              </h3>
              <div
                style={{
                  background: "var(--bg-card)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-md)",
                }}
              >
                {results.items.map(renderItemResult)}
              </div>
            </div>
          )}

          {results.inventories.length === 0 && results.items.length === 0 && (
            <EmptyState
              title={t("search.noResults", "No results found")}
              message={t(
                "search.noResultsDesc",
                "Try different keywords or check your spelling",
              )}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default SearchPage;
