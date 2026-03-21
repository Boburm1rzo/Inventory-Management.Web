import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { itemsApi } from "../api/items.api";
import { getFields } from "../api/fields.api";
import type { ItemDto, InventoryFieldDto } from "../types";
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
  const [item, setItem] = useState<ItemDto | null>(null);
  const [fields, setFields] = useState<InventoryFieldDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>(
    itemId === "new" ? "edit" : "details",
  );
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const isCreate = itemId === "new";

  useEffect(() => {
    if (inventoryId) {
      fetchData(parseInt(inventoryId), itemId);
    }
  }, [inventoryId, itemId]);

  const fetchData = async (invId: number, itId: string | undefined) => {
    try {
      setLoading(true);
      const [fieldsData, itemData] = await Promise.all([
        getFields(invId),
        itId && itId !== "new"
          ? itemsApi.getItem(invId, parseInt(itId))
          : Promise.resolve(null),
      ]);
      setFields(fieldsData);
      setItem(itemData);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Network error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!item || !inventoryId) return;
    try {
      await itemsApi.deleteItem(parseInt(inventoryId), item.id);
      navigate(`/inventories/${inventoryId}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Delete failed");
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorAlert message={error} />;
  if (!isCreate && !item)
    return <ErrorAlert message={t("items.notFound", "Item not found")} />;

  return (
    <div className="item-page container py-4">
      <div className="d-flex align-items-center justify-content-between mb-4">
        <h1 className="m-0 h2">
          {isCreate
            ? t("items.createTitle", "Create New Item")
            : t("items.pageTitle", "Item: {{customId}}", {
                customId: item?.customId,
              })}
        </h1>
        {!isCreate && item && <LikeButton itemId={item.id} />}
      </div>

      {!isCreate && (
        <div className="nav nav-tabs mb-4">
          <button
            className={`nav-link ${activeTab === "details" ? "active" : ""}`}
            onClick={() => setActiveTab("details")}
          >
            {t("items.tabs.details", "Details")}
          </button>
          <button
            className={`nav-link ${activeTab === "edit" ? "active" : ""}`}
            onClick={() => setActiveTab("edit")}
          >
            {t("items.tabs.edit", "Edit")}
          </button>
        </div>
      )}

      {!isCreate && activeTab === "details" && item && (
        <div className="card shadow-sm">
          <div className="card-body">
            <div className="row mb-4">
              <div className="col-md-6">
                <p className="mb-1 text-muted small">
                  {t("items.customId", "Custom ID")}
                </p>
                <p className="fw-bold">{item.customId}</p>
              </div>
              <div className="col-md-6">
                <p className="mb-1 text-muted small">
                  {t("items.createdBy", "Created By")}
                </p>
                <p className="fw-bold">{item.createdByName}</p>
              </div>
              <div className="col-md-6">
                <p className="mb-1 text-muted small">
                  {t("items.createdAt", "Created At")}
                </p>
                <p className="fw-bold">
                  {new Date(item.createdAt).toLocaleString()}
                </p>
              </div>
              <div className="col-md-6">
                <p className="mb-1 text-muted small">
                  {t("items.updatedAt", "Updated At")}
                </p>
                <p className="fw-bold">
                  {new Date(item.updatedAt).toLocaleString()}
                </p>
              </div>
            </div>

            <h3 className="h5 border-bottom pb-2 mb-3">
              {t("items.customFields", "Custom Fields")}
            </h3>
            <div className="row">
              {item.fieldValues.map((fv) => (
                <div key={fv.fieldId} className="col-md-6 mb-3">
                  <p className="mb-1 text-muted small">{fv.fieldTitle}</p>
                  <p className="fw-medium">
                    {fv.fieldType === "Boolean" ? (
                      fv.booleanValue ? (
                        "Yes"
                      ) : (
                        "No"
                      )
                    ) : fv.fieldType === "Numeric" ? (
                      fv.numericValue
                    ) : fv.fieldType === "Link" ? (
                      <a
                        href={fv.textValue}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {fv.textValue}
                      </a>
                    ) : (
                      fv.textValue || "—"
                    )}
                  </p>
                </div>
              ))}
            </div>

            <div className="d-flex gap-2 mt-4 pt-3 border-top">
              <button
                className="btn btn-primary"
                onClick={() => setActiveTab("edit")}
              >
                {t("common.edit", "Edit")}
              </button>
              <button
                className="btn btn-outline-danger"
                onClick={() => setShowDeleteModal(true)}
              >
                {t("common.delete", "Delete")}
              </button>
            </div>
          </div>
        </div>
      )}

      {(isCreate || activeTab === "edit") && inventoryId && (
        <div className="card shadow-sm">
          <div className="card-body">
            <ItemForm
              inventoryId={parseInt(inventoryId)}
              fields={fields}
              item={item}
              onSuccess={() => {
                if (isCreate) {
                  navigate(`/inventories/${inventoryId}`);
                } else {
                  fetchData(parseInt(inventoryId), itemId);
                  setActiveTab("details");
                }
              }}
              onCancel={
                isCreate
                  ? () => navigate(`/inventories/${inventoryId}`)
                  : () => setActiveTab("details")
              }
            />
          </div>
        </div>
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
