import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { itemsApi } from "../api/items.api";
import type { Item, CreateItemDto } from "../types";
import ItemForm from "../components/item/ItemForm";
import ConfirmModal from "../components/common/ConfirmModal";
import LoadingSpinner from "../components/common/LoadingSpinner";
import ErrorAlert from "../components/common/ErrorAlert";
import LikeButton from "../components/common/LikeButton";

type TabKey = "details" | "edit";

const ItemPage: React.FC = () => {
  const { t } = useTranslation();
  const { inventoryId, itemId } = useParams<{
    inventoryId: string;
    itemId: string;
  }>();
  const navigate = useNavigate();

  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(itemId !== "new");
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>(
    itemId === "new" ? "edit" : "details",
  );
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const isCreate = itemId === "new";

  useEffect(() => {
    if (inventoryId && itemId && itemId !== "new") {
      fetchItem(parseInt(inventoryId), parseInt(itemId));
    }
  }, [inventoryId, itemId]);

  const fetchItem = async (invId: number, itId: number) => {
    try {
      setLoading(true);
      const data = await itemsApi.getItemById(invId, itId);
      setItem(data);
    } catch (err: any) {
      setError(err.message || "Network error");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubmit = async (data: CreateItemDto) => {
    if (!inventoryId) return;
    try {
      const created = await itemsApi.createItem(parseInt(inventoryId), data);
      navigate(`/inventories/${inventoryId}/items/${created.id}`);
    } catch (err: any) {
      setError(err.message || "Create failed");
    }
  };

  const handleEditSubmit = async (data: any) => {
    if (!item || !inventoryId) return;
    try {
      const updated = await itemsApi.updateItem(
        parseInt(inventoryId),
        item.id,
        data,
      );
      setItem(updated);
      setActiveTab("details");
    } catch (err: any) {
      setError(err.message || "Update failed");
    }
  };

  const handleDelete = async () => {
    if (!item || !inventoryId) return;
    try {
      await itemsApi.deleteItem(parseInt(inventoryId), item.id);
      navigate(`/inventories/${inventoryId}`);
    } catch (err: any) {
      setError(err.message || "Delete failed");
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorAlert message={error} />;
  if (!isCreate && !item)
    return <ErrorAlert message={t("items.notFound", "Item not found")} />;

  return (
    <div className="item-page">
      <div className="d-flex align-items-center justify-content-between mb-4">
        <h1 className="m-0">
          {isCreate
            ? t("items.createTitle", "Create New Item")
            : t("items.pageTitle", "Item: {{customId}}", {
                customId: item?.customId,
              })}
        </h1>
        {!isCreate && item && (
          <LikeButton itemId={item.id} />
        )}
      </div>

      {!isCreate && (
        <div className="tabs">
          <button
            className={activeTab === "details" ? "active" : ""}
            onClick={() => setActiveTab("details")}
          >
            {t("items.tabs.details", "Details")}
          </button>
          <button
            className={activeTab === "edit" ? "active" : ""}
            onClick={() => setActiveTab("edit")}
          >
            {t("items.tabs.edit", "Edit")}
          </button>
        </div>
      )}

      {!isCreate && activeTab === "details" && item && (
        <div className="item-details">
          <p>
            <strong>{t("items.customId", "Custom ID")}:</strong> {item.customId}
          </p>
          <p>
            <strong>{t("items.tags", "Tags")}:</strong> {item.tags.join(", ")}
          </p>
          <p>
            <strong>{t("items.createdAt", "Created")}:</strong>{" "}
            {new Date(item.createdAt).toLocaleString()}
          </p>
          <p>
            <strong>{t("items.updatedAt", "Updated")}:</strong>{" "}
            {new Date(item.updatedAt).toLocaleString()}
          </p>

          <h3>{t("items.customFields", "Custom Fields")}</h3>
          <div>
            {item.customFields.strings.map(
              (str, i) =>
                str && (
                  <p key={i}>
                    String {i + 1}: {str}
                  </p>
                ),
            )}
            {item.customFields.texts.map(
              (txt, i) =>
                txt && (
                  <p key={i}>
                    Text {i + 1}: {txt}
                  </p>
                ),
            )}
            {item.customFields.numbers.map(
              (num, i) =>
                num !== 0 && (
                  <p key={i}>
                    Number {i + 1}: {num}
                  </p>
                ),
            )}
            {item.customFields.links.map(
              (link, i) =>
                link && (
                  <p key={i}>
                    Link {i + 1}:{" "}
                    <a href={link} target="_blank" rel="noopener noreferrer">
                      {link}
                    </a>
                  </p>
                ),
            )}
            {item.customFields.booleans.map((bool, i) => (
              <p key={i}>
                Boolean {i + 1}: {bool ? "Yes" : "No"}
              </p>
            ))}
          </div>

          <div className="actions">
            <button onClick={() => setActiveTab("edit")}>
              {t("common.edit", "Edit")}
            </button>
            <button onClick={() => setShowDeleteModal(true)} className="danger">
              {t("common.delete", "Delete")}
            </button>
          </div>
        </div>
      )}

      {(isCreate || activeTab === "edit") && (
        <ItemForm
          isEdit={!isCreate}
          initialData={item || undefined}
          onSubmit={isCreate ? handleCreateSubmit : handleEditSubmit}
          onCancel={
            isCreate
              ? () => navigate(`/inventories/${inventoryId}`)
              : () => setActiveTab("details")
          }
        />
      )}

      {!isCreate && (
        <ConfirmModal
          isOpen={showDeleteModal}
          title={t("items.confirmDeleteTitle", "Delete Item")}
          message={t(
            "items.confirmDeleteMessage",
            "Are you sure you want to delete this item?",
          )}
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteModal(false)}
        />
      )}
    </div>
  );
};

export default ItemPage;
