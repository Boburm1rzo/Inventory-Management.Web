import React, { useState, useEffect } from "react";
import { useParams, useSearchParams, Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import { inventoriesApi } from "../api/inventories.api";
import { getFields } from "../api/fields.api";
import type { InventoryDto, InventoryFieldDto } from "../types";
import FieldsTab from "../components/inventory/tabs/FieldsTab";
import CustomIdTab from "../components/inventory/tabs/CustomIdTab";
import ItemsTab from "../components/inventory/tabs/ItemsTab";
import AccessTab from "../components/inventory/tabs/AccessTab";
import DiscussionTab from "../components/inventory/tabs/DiscussionTab";
import SettingsTab from "../components/inventory/tabs/SettingsTab";
import StatisticsTab from "../components/inventory/tabs/StatisticsTab";
import ErrorAlert from "../components/common/ErrorAlert";

type TabKey =
  | "items"
  | "fields"
  | "custom-id"
  | "settings"
  | "discussion"
  | "access"
  | "statistics";

const InventoryPage: React.FC = () => {
  const { t } = useTranslation();
  const { user, isAdmin } = useAuth();
  const { id } = useParams<{ id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [inventory, setInventory] = useState<InventoryDto | null>(null);
  const [fields, setFields] = useState<InventoryFieldDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const activeTab = (searchParams.get("tab") as TabKey) ?? "items";

  useEffect(() => {
    if (id) {
      const inventoryId = parseInt(id);
      fetchData(inventoryId);
    }
  }, [id]);

  const fetchData = async (inventoryId: number) => {
    try {
      setLoading(true);
      const [invData, fieldsData] = await Promise.all([
        inventoriesApi.getInventoryById(inventoryId),
        getFields(inventoryId),
      ]);

      setInventory(invData);
      setFields(fieldsData);
    } catch (err: any) {
      setError(err.message || "Network error");
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab: TabKey) => {
    setSearchParams({ tab });
  };

  const canEdit = isAdmin || user?.id === inventory?.ownerId;

  const renderTabContent = () => {
    if (!inventory || !id) return null;
    const invId = parseInt(id);

    switch (activeTab) {
      case "fields":
        return <FieldsTab inventoryId={invId} canEdit={canEdit} />;
      case "custom-id":
        return <CustomIdTab inventoryId={invId} canEdit={canEdit} />;
      case "items":
        return (
          <ItemsTab
            inventoryId={invId}
            fields={fields}
            canEdit={canEdit}
          />
        );
      case "settings":
        return (
          <SettingsTab
            inventoryId={invId}
            inventory={inventory}
            canEdit={canEdit}
            onUpdated={setInventory}
            onDeleted={() => navigate("/inventories")}
          />
        );
      case "discussion":
        return <DiscussionTab inventoryId={invId} />;
      case "access":
        return <AccessTab inventoryId={invId} canManage={canEdit} />;
      case "statistics":
        return <StatisticsTab inventoryId={invId} />;
      default:
        return null;
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <ErrorAlert message={error} />;
  if (!inventory) return <div>Inventory not found</div>;

  return (
    <div className="inventory-page">
      <div className="page-header">
        <Link to="/inventories" className="back-link">
          ← {t("common.back", "Back")}
        </Link>
        <div className="inventory-info">
          <h1>{inventory.title}</h1>
          <p>
            {t("inventory.by", "By")} {inventory.ownerName}
          </p>
          {inventory.isPublic && (
            <span className="public-badge">
              {t("inventory.public", "Public")}
            </span>
          )}
        </div>
      </div>
      <div className="tabs">
        {(
          [
            "items",
            "fields",
            "custom-id",
            "settings",
            "discussion",
            "access",
            "statistics",
          ] as TabKey[]
        ).map((tab) => (
          <button
            key={tab}
            className={`tab-button ${activeTab === tab ? "active" : ""}`}
            onClick={() => handleTabChange(tab)}
          >
            {t(`inventory.tabs.${tab}`, tab.replace("-", " ").toUpperCase())}
          </button>
        ))}
      </div>
      <div className="tab-content">{renderTabContent()}</div>
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .inventory-page {
          padding: 20px;
        }
        .page-header {
          display: flex;
          align-items: center;
          gap: 20px;
          margin-bottom: 30px;
        }
        .back-link {
          color: var(--accent);
          text-decoration: none;
        }
        .back-link:hover {
          text-decoration: underline;
        }
        .inventory-info h1 {
          margin: 0;
          color: var(--text-primary);
        }
        .inventory-info p {
          margin: 5px 0;
          color: var(--text-secondary);
        }
        .public-badge {
          background: var(--accent);
          color: white;
          padding: 4px 8px;
          border-radius: var(--radius-sm);
          font-size: 0.75rem;
        }
        .tabs {
          display: flex;
          border-bottom: 1px solid var(--border);
          margin-bottom: 20px;
        }
        .tab-button {
          background: none;
          border: none;
          padding: 12px 20px;
          cursor: pointer;
          color: var(--text-secondary);
          border-bottom: 2px solid transparent;
          transition: 0.15s ease;
        }
        .tab-button:hover {
          color: var(--text-primary);
        }
        .tab-button.active {
          color: var(--accent);
          border-bottom-color: var(--accent);
        }
        .tab-content {
          min-height: 400px;
        }
      `,
        }}
      />
    </div>
  );
};

export default InventoryPage;
