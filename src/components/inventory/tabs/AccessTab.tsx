import React, { useState, useEffect, useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import { accessApi } from "../../../api/access.api";
import type { InventoryAccessDto, UserSearchDto } from "../../../types";
import ConfirmModal from "../../common/ConfirmModal";
import ErrorAlert from "../../common/ErrorAlert";
import LoadingSpinner from "../../common/LoadingSpinner";
import { timeAgo } from "../../../utils/time";

interface AccessTabProps {
  inventoryId: number;
  canManage: boolean;
}

interface UserOptionProps {
  user: UserSearchDto;
  onSelect: (user: UserSearchDto) => void;
  disabled: boolean;
}

const UserOption: React.FC<UserOptionProps> = ({
  user,
  onSelect,
  disabled,
}) => {
  const handleClick = () => {
    if (!disabled) onSelect(user);
  };

  return (
    <div
      className={`user-option ${disabled ? "disabled" : ""}`}
      onClick={handleClick}
      style={{
        padding: "0.5rem",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
      }}
    >
      {user.avatarUrl ? (
        <img
          src={user.avatarUrl}
          alt={user.displayName}
          style={{
            width: "32px",
            height: "32px",
            borderRadius: "50%",
            objectFit: "cover",
          }}
        />
      ) : (
        <div
          className="avatar-initials"
          style={{
            width: "32px",
            height: "32px",
            borderRadius: "50%",
            background: "var(--accent)",
            color: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "0.75rem",
            fontWeight: "700",
          }}
        >
          {(user.displayName || "?")
            .split(" ")
            .map((n) => n?.[0] || "")
            .join("")
            .toUpperCase()
            .slice(0, 2)}
        </div>
      )}
      <div>
        <div style={{ fontWeight: "500" }}>{user.displayName}</div>
        <div style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>
          {user.email}
        </div>
      </div>
    </div>
  );
};

const AccessTab: React.FC<AccessTabProps> = ({ inventoryId, canManage }) => {
  const { t } = useTranslation();
  const [accessList, setAccessList] = useState<InventoryAccessDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<UserSearchDto[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState<{
    userId: string;
    displayName: string;
  } | null>(null);

  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchAccessList = useCallback(async () => {
    try {
      setLoading(true);
      const data = await accessApi.getAccessList(inventoryId);
      setAccessList(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [inventoryId]);

  useEffect(() => {
    fetchAccessList();
  }, [fetchAccessList]);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setShowDropdown(true);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (value.length >= 2) {
      searchTimeoutRef.current = setTimeout(async () => {
        try {
          setSearchLoading(true);
          const results = await accessApi.searchUsers(value);
          setSearchResults(results);
        } catch (err: unknown) {
          console.error("Search error:", err);
          setSearchResults([]);
        } finally {
          setSearchLoading(false);
        }
      }, 300);
    } else {
      setSearchResults([]);
      setSearchLoading(false);
    }
  };

  const handleUserSelect = async (user: UserSearchDto) => {
    try {
      await accessApi.addAccess(inventoryId, { userId: user.id });
      setSearchQuery("");
      setShowDropdown(false);
      setSearchResults([]);
      await fetchAccessList();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  };

  const handleRemoveAccess = async (userId: string) => {
    try {
      await accessApi.removeAccess(inventoryId, userId);
      await fetchAccessList();
      setConfirmRemove(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  };

  const isUserAlreadyHasAccess = (userId: string) => {
    return accessList.some((access) => access.userId === userId);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div style={{ padding: "1rem" }}>
      <h3>{t("inventory.access.title", "Who has access")}</h3>

      {canManage && (
        <div style={{ marginBottom: "1rem", position: "relative" }}>
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <div style={{ flex: 1, position: "relative" }}>
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder={t(
                  "inventory.access.searchUsers",
                  "Search users...",
                )}
                style={{
                  width: "100%",
                  padding: "0.5rem",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-sm)",
                  background: "var(--bg-primary)",
                  color: "var(--text-primary)",
                }}
              />
              {searchLoading && (
                <div
                  style={{
                    position: "absolute",
                    right: "0.5rem",
                    top: "50%",
                    transform: "translateY(-50%)",
                  }}
                >
                  <LoadingSpinner />
                </div>
              )}
            </div>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              style={{
                padding: "0.5rem 1rem",
                background: "var(--accent)",
                color: "white",
                border: "none",
                borderRadius: "var(--radius-sm)",
                cursor: "pointer",
              }}
            >
              {t("inventory.access.add", "+ Add")}
            </button>
          </div>

          {showDropdown && (searchResults.length > 0 || searchLoading) && (
            <div
              ref={dropdownRef}
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
                maxHeight: "200px",
                overflowY: "auto",
              }}
            >
              {searchLoading ? (
                <div style={{ padding: "1rem", textAlign: "center" }}>
                  <LoadingSpinner />
                </div>
              ) : (
                searchResults
                  .slice(0, 5)
                  .map((user) => (
                    <UserOption
                      key={user.id}
                      user={user}
                      onSelect={handleUserSelect}
                      disabled={isUserAlreadyHasAccess(user.id)}
                    />
                  ))
              )}
            </div>
          )}
        </div>
      )}

      <div>
        <h4>{t("inventory.access.currentAccess", "Current access")}</h4>
        {accessList.length === 0 ? (
          <p style={{ color: "var(--text-muted)" }}>
            {t("inventory.access.noAccess", "No users have access yet")}
          </p>
        ) : (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
          >
            {accessList.map((access) => (
              <div
                key={access.userId}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  padding: "0.75rem",
                  background: "var(--bg-card)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-md)",
                  position: "relative",
                }}
              >
                {access.avatarUrl ? (
                  <img
                    src={access.avatarUrl}
                    alt={access.displayName}
                    className="avatar"
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "50%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <div
                    className="avatar-initials"
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "50%",
                      background: "var(--accent)",
                      color: "white",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "0.75rem",
                      fontWeight: "700",
                    }}
                  >
                    {(access.displayName || "?")
                      .split(" ")
                      .map((n) => n?.[0] || "")
                      .join("")
                      .toUpperCase()
                      .slice(0, 2)}
                  </div>
                )}
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: "500" }}>{access.displayName}</div>
                  <div
                    style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}
                  >
                    {t("inventory.access.addedAt", "Added: {{time}}", {
                      time: timeAgo(access.grantedAt),
                    })}
                  </div>
                </div>
                {canManage && (
                  <button
                    onClick={() =>
                      setConfirmRemove({
                        userId: access.userId,
                        displayName: access.displayName,
                      })
                    }
                    style={{
                      background: "none",
                      border: "none",
                      color: "var(--danger)",
                      cursor: "pointer",
                      padding: "0.25rem",
                      borderRadius: "var(--radius-sm)",
                      opacity: 0,
                      transition: "opacity 0.2s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
                    onMouseLeave={(e) => (e.currentTarget.style.opacity = "0")}
                    title={t("inventory.access.remove", "Remove access")}
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {error && <ErrorAlert message={error} onDismiss={() => setError(null)} />}

      {confirmRemove && (
        <ConfirmModal
          isOpen={true}
          title={t("inventory.access.confirmRemoveTitle", "Remove access")}
          message={t(
            "inventory.access.confirmRemoveMessage",
            "Are you sure you want to remove access for {{name}}?",
            { name: confirmRemove.displayName },
          )}
          onConfirm={() => handleRemoveAccess(confirmRemove.userId)}
          onCancel={() => setConfirmRemove(null)}
        />
      )}


      <style>{`
        .user-option:hover:not(.disabled) {
          background: var(--bg-secondary);
        }
        .user-option.disabled {
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
};

export default AccessTab;
