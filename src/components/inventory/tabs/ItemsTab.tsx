import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Edit2, Trash2, ChevronLeft, ChevronRight, Heart } from "lucide-react";
import { itemsApi } from "../../../api/items.api";
import { likesApi } from "../../../api/likes.api";
import type {
  ItemListItemDto,
  ItemDto,
  InventoryFieldDto,
  PagedResult,
  ItemFieldValueDto,
  CreateItemDto,
  UpdateItemDto,
  CreateItemFieldValueDto,
} from "../../../types";
import LoadingSpinner from "../../common/LoadingSpinner";
import ErrorAlert from "../../common/ErrorAlert";
import ConfirmModal from "../../common/ConfirmModal";
import EmptyState from "../../common/EmptyState";
import LikeButton from "../../common/LikeButton";
import { timeAgo } from "../../../utils/time";

interface ItemsTabProps {
  inventoryId: number;
  fields: InventoryFieldDto[];
  canEdit: boolean;
}

const ItemsTab: React.FC<ItemsTabProps> = ({ inventoryId, fields, canEdit }) => {
  const { t } = useTranslation();
  const [data, setData] = useState<PagedResult<ItemListItemDto> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ItemDto | null>(null);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const res = await itemsApi.getItems(inventoryId, page, 10);
      setData(res);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to load items");
    } finally {
      setLoading(false);
    }
  }, [inventoryId, page]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleDelete = async () => {
    if (!itemToDelete) return;
    try {
      await itemsApi.deleteItem(inventoryId, itemToDelete);
      fetchItems();
      setItemToDelete(null);
    } catch (err: any) {
      setError(err.message || "Failed to delete item");
    }
  };

  const openEditModal = async (itemId: number) => {
    try {
      const item = await itemsApi.getItem(inventoryId, itemId);
      setEditingItem(item);
      setIsModalOpen(true);
    } catch (err: any) {
      setError(err.message || "Failed to fetch item details");
    }
  };

  const tableFields = fields.filter((f) => f.displayInTable);

  const renderValue = (fv: ItemFieldValueDto) => {
    switch (fv.fieldType) {
      case "Boolean":
        return fv.booleanValue ? (
          <span style={{ color: "#10b981" }}>✓</span>
        ) : (
          <span style={{ color: "var(--text-muted)" }}>✗</span>
        );
      case "Link":
        return (
          <a
            href={fv.textValue}
            target="_blank"
            rel="noreferrer"
            style={{ color: "var(--accent)" }}
            onClick={(e) => e.stopPropagation()}
          >
            {fv.textValue?.replace(/^https?:\/\//, "")}
          </a>
        );
      case "Numeric":
        return fv.numericValue?.toLocaleString();
      default:
        return fv.textValue ?? "—";
    }
  };

  return (
    <div className="items-tab">
      <style>{`
        .items-tab-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }
        .items-table-container {
          background: var(--bg-card);
          border-radius: var(--radius-md);
          border: 1px solid var(--border);
          overflow-x: auto;
        }
        .items-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 14px;
        }
        .items-table th, .items-table td {
          padding: 12px 16px;
          text-align: left;
          border-bottom: 1px solid var(--border);
        }
        .items-table th {
          background: var(--bg-secondary);
          color: var(--text-secondary);
          font-weight: 600;
          text-transform: uppercase;
          font-size: 11px;
          letter-spacing: 0.05em;
        }
        .items-table tr:last-child td { border-bottom: none; }
        .items-table tr:hover { background: var(--bg-secondary); }
        .actions-cell {
          display: flex;
          align-items: center;
          gap: 8px;
          opacity: 0;
          transition: opacity 0.2s;
        }
        .items-table tr:hover .actions-cell { opacity: 1; }
        .action-btn {
          background: none;
          border: none;
          padding: 4px;
          cursor: pointer;
          color: var(--text-muted);
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .action-btn:hover { background: var(--bg-primary); color: var(--text-primary); }
        .action-btn.delete:hover { color: var(--danger); background: #fee2e2; }
        
        .pagination {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          margin-top: 1.5rem;
          color: var(--text-secondary);
          font-size: 14px;
        }
        .page-btn {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          padding: 6px 12px;
          display: flex;
          align-items: center;
          gap: 4px;
          cursor: pointer;
          color: var(--text-primary);
        }
        .page-btn:disabled { opacity: 0.5; cursor: not-allowed; }
      `}</style>

      <div className="items-tab-header">
        <h3 className="m-0 h5 fw-bold">
          {t("items.title", "Items")} ({data?.totalCount || 0})
        </h3>
        {canEdit && (
          <button
            className="btn btn-primary btn-sm d-flex align-items-center gap-1"
            onClick={() => {
              setEditingItem(null);
              setIsModalOpen(true);
            }}
          >
            <Plus size={16} /> {t("items.add", "Add Item")}
          </button>
        )}
      </div>

      {error && <ErrorAlert message={error} onDismiss={() => setError(null)} />}

      {loading ? (
        <LoadingSpinner />
      ) : data?.items.length === 0 ? (
        <EmptyState
          message={t("items.empty", "No items found in this inventory.")}
        />
      ) : (
        <>
          <div className="items-table-container">
            <table className="items-table">
              <thead>
                <tr>
                  <th>Custom ID</th>
                  {tableFields.map((f) => (
                    <th key={f.id}>{f.title}</th>
                  ))}
                  <th>Created</th>
                  <th style={{ width: "120px" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {data?.items.map((item) => (
                  <tr key={item.id}>
                    <td className="fw-medium">{item.customId}</td>
                    {tableFields.map((f) => {
                      const val = item.fieldValues.find(
                        (fv) => fv.fieldId === f.id
                      );
                      return (
                        <td key={f.id}>{val ? renderValue(val) : "—"}</td>
                      );
                    })}
                    <td className="text-muted">
                      {timeAgo(item.createdAt)}
                    </td>
                    <td>
                      <div className="actions-cell">
                        <LikeButton itemId={item.id} />
                        {canEdit && (
                          <>
                            <button
                              className="action-btn"
                              onClick={() => openEditModal(item.id)}
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              className="action-btn delete"
                              onClick={() => setItemToDelete(item.id)}
                            >
                              <Trash2 size={14} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pagination">
            <button
              className="page-btn"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft size={16} /> Previous
            </button>
            <span>
              Page {data?.page} of {data?.totalPages}
            </span>
            <button
              className="page-btn"
              disabled={!data?.hasNextPage}
              onClick={() => setPage((p) => p + 1)}
            >
              Next <ChevronRight size={16} />
            </button>
          </div>
        </>
      )}

      {isModalOpen && (
        <ItemFormModal
          inventoryId={inventoryId}
          fields={fields}
          item={editingItem}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => {
            setIsModalOpen(false);
            fetchItems();
          }}
        />
      )}

      <ConfirmModal
        isOpen={itemToDelete !== null}
        title="Delete Item"
        message="Are you sure you want to delete this item? This action cannot be undone."
        onConfirm={handleDelete}
        onClose={() => setItemToDelete(null)}
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
};

interface ItemFormModalProps {
  inventoryId: number;
  fields: InventoryFieldDto[];
  item: ItemDto | null;
  onClose: () => void;
  onSuccess: () => void;
}

const ItemFormModal: React.FC<ItemFormModalProps> = ({
  inventoryId,
  fields,
  item,
  onClose,
  onSuccess,
}) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<Record<number, any>>({});

  useEffect(() => {
    if (item) {
      const initialValues: Record<number, any> = {};
      item.fieldValues.forEach((fv) => {
        if (fv.fieldType === "Boolean") initialValues[fv.fieldId] = fv.booleanValue;
        else if (fv.fieldType === "Numeric")
          initialValues[fv.fieldId] = fv.numericValue;
        else initialValues[fv.fieldId] = fv.textValue || "";
      });
      setFormValues(initialValues);
    } else {
      const initialValues: Record<number, any> = {};
      fields.forEach((f) => {
        if (f.type === "Boolean") initialValues[f.id] = false;
        else if (f.type === "Numeric") initialValues[f.id] = "";
        else initialValues[f.id] = "";
      });
      setFormValues(initialValues);
    }
  }, [item, fields]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const fieldValues: CreateItemFieldValueDto[] = fields.map((f) => {
      const val = formValues[f.id];
      const dto: CreateItemFieldValueDto = { fieldId: f.id };
      if (f.type === "Boolean") dto.booleanValue = !!val;
      else if (f.type === "Numeric") dto.numericValue = val === "" ? undefined : Number(val);
      else dto.textValue = val || "";
      return dto;
    });

    try {
      if (item) {
        await itemsApi.updateItem(inventoryId, item.id, {
          fieldValues,
          rowVersion: item.rowVersion,
        });
      } else {
        await itemsApi.createItem(inventoryId, { fieldValues });
      }
      onSuccess();
    } catch (err: any) {
      if (err.message?.includes("409")) {
        setError("This item was modified by someone else. Please refresh and try again.");
      } else {
        setError(err.message || "Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  };

  const updateVal = (id: number, val: any) => {
    setFormValues((prev) => ({ ...prev, [id]: val }));
  };

  return (
    <div className="custom-modal-backdrop">
      <div className="custom-modal-content p-4" style={{ maxWidth: "500px" }}>
        <h3 className="m-0 h4 fw-bold mb-4">
          {item ? "Edit Item" : "Add New Item"}
        </h3>

        {error && <ErrorAlert message={error} onDismiss={() => setError(null)} />}

        <form onSubmit={handleSubmit}>
          {fields.map((f) => (
            <div key={f.id} className="mb-3">
              <label className="form-label">{f.title}</label>
              {f.type === "Boolean" ? (
                <div className="form-check form-switch">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    checked={!!formValues[f.id]}
                    onChange={(e) => updateVal(f.id, e.target.checked)}
                    disabled={loading}
                  />
                </div>
              ) : f.type === "MultiLineText" ? (
                <textarea
                  className="form-control"
                  rows={3}
                  value={formValues[f.id] || ""}
                  onChange={(e) => updateVal(f.id, e.target.value)}
                  disabled={loading}
                />
              ) : f.type === "Numeric" ? (
                <input
                  type="number"
                  className="form-control"
                  value={formValues[f.id] ?? ""}
                  onChange={(e) => updateVal(f.id, e.target.value)}
                  disabled={loading}
                />
              ) : (
                <input
                  type={f.type === "Link" ? "url" : "text"}
                  className="form-control"
                  value={formValues[f.id] || ""}
                  onChange={(e) => updateVal(f.id, e.target.value)}
                  disabled={loading}
                />
              )}
              {f.description && (
                <div className="form-text">{f.description}</div>
              )}
              {f.type === "Link" && formValues[f.id] && (
                <div className="mt-1">
                  <a
                    href={formValues[f.id]}
                    target="_blank"
                    rel="noreferrer"
                    className="text-decoration-none small"
                  >
                    Visit link →
                  </a>
                </div>
              )}
            </div>
          ))}

          <div className="d-flex justify-content-end gap-2 mt-4">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "..." : item ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ItemsTab;
