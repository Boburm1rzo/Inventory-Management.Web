import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
  Plus,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { itemsApi } from "../../../api/items.api";
import type {
  ItemListItemDto,
  ItemDto,
  InventoryFieldDto,
  PagedResult,
  ItemFieldValueDto,
} from "../../../types";
import LoadingSpinner from "../../common/LoadingSpinner";
import ErrorAlert from "../../common/ErrorAlert";
import ConfirmModal from "../../common/ConfirmModal";
import EmptyState from "../../common/EmptyState";
import LikeButton from "../../common/LikeButton";
import { timeAgo } from "../../../utils/time";

import ItemForm from "../../item/ItemForm";

interface ItemsTabProps {
  inventoryId: number;
  fields: InventoryFieldDto[];
  canEdit: boolean;
}

const ItemsTab: React.FC<ItemsTabProps> = ({
  inventoryId,
  fields,
  canEdit,
}) => {
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
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load items");
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
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to delete item");
    }
  };

  const openEditModal = async (itemId: number) => {
    try {
      const item = await itemsApi.getItem(inventoryId, itemId);
      setEditingItem(item);
      setIsModalOpen(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to fetch item details");
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
          padding: 14px 16px;
          text-align: left;
          border-bottom: 1px solid var(--border);
        }
        .items-table th {
          background: var(--bg-secondary);
          color: var(--text-secondary);
          font-weight: 700;
          text-transform: uppercase;
          font-size: 11px;
          letter-spacing: 0.05em;
        }
        .items-table tr {
          transition: background 0.2s;
        }
        .items-table tr:last-child td { border-bottom: none; }
        .items-table tr:hover { background: var(--bg-secondary); }
        
        .fw-medium { font-weight: 600; color: var(--text-primary); }
        .text-muted { color: var(--text-muted); font-size: 0.85rem; }

        .actions-cell {
          display: flex;
          align-items: center;
          gap: 8px;
          opacity: 0.8;
          transition: opacity 0.2s;
        }
        .items-table tr:hover .actions-cell { opacity: 1; }
        
        .action-btn {
          background: none;
          border: none;
          padding: 6px;
          cursor: pointer;
          color: var(--text-secondary);
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }
        .action-btn:hover { 
          background: var(--bg-primary); 
          color: var(--accent);
          transform: translateY(-1px);
        }
        .action-btn.delete:hover { 
          color: var(--danger); 
          background: rgba(239, 68, 68, 0.1); 
        }
        
        /* Ensure LikeButton also follows the muted-to-visible pattern if it has a class */
        .actions-cell .like-btn {
          opacity: 0.6;
          transition: opacity 0.2s;
        }
        .actions-cell .like-btn:hover {
          opacity: 1;
        }
        
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
                        (fv) => fv.fieldId === f.id,
                      );
                      return <td key={f.id}>{val ? renderValue(val) : "—"}</td>;
                    })}
                    <td className="text-muted">{timeAgo(item.createdAt)}</td>
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
        <div className="custom-modal-backdrop">
          <div className="custom-modal-content p-4" style={{ maxWidth: "500px" }}>
            <ItemForm
              inventoryId={inventoryId}
              fields={fields}
              item={editingItem}
              onCancel={() => setIsModalOpen(false)}
              onSuccess={() => {
                setIsModalOpen(false);
                fetchItems();
              }}
            />
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={itemToDelete !== null}
        title="Delete Item"
        message="Are you sure you want to delete this item? This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setItemToDelete(null)}
      />
    </div>
  );
};

export default ItemsTab;
