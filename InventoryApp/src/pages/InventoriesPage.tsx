import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import { inventoriesApi } from "../api/inventories.api";
import type { InventoryListItemDto, InventoryDto, PagedResult } from "../types";
import InventoryTable from "../components/inventory/InventoryTable";
import Pagination from "../components/common/Pagination";
import ErrorAlert from "../components/common/ErrorAlert";
import EmptyState from "../components/common/EmptyState";
import ConfirmModal from "../components/common/ConfirmModal";
import InventoryFormModal from "../components/inventory/InventoryForModal";

const PAGE_SIZE = 10;

const InventoriesPage: React.FC = () => {
  const { t } = useTranslation();
  const { isAuthenticated, user, isAdmin } = useAuth();

  const [data, setData] = useState<PagedResult<InventoryListItemDto> | null>(
    null,
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedInventory, setSelectedInventory] =
    useState<InventoryDto | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchInventories = async (page: number) => {
    try {
      setLoading(true);
      const res = await inventoriesApi.getInventories(page, PAGE_SIZE);
      setData(res);
      setCurrentPage(page);
      setError(null);
    } catch (err: any) {
      setError(err.message || t("errors.network"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventories(currentPage);
  }, [currentPage]);

  const handleEdit = async (id: number) => {
    try {
      const fullDto = await inventoriesApi.getInventoryById(id);
      setSelectedInventory(fullDto);
      setIsFormOpen(true);
    } catch (err: any) {
      setError(err.message || t("errors.general"));
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    setActionLoading(true);
    try {
      await inventoriesApi.deleteInventory(deleteId);
      setIsConfirmOpen(false);
      setDeleteId(null);
      fetchInventories(currentPage);
    } catch (err: any) {
      setError(err.message || t("errors.general"));
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="container-fluid max-w-1200 px-4">
      <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom-custom animate-fade-up">
        <div className="d-flex align-items-center gap-3">
          <h1 className="m-0 fw-bold">
            {t("inventories.title", "Inventories")}
          </h1>
          {data && (
            <span className="badge-count">
              {data.totalCount} {t("home.columns.itemCount", "Items")}
            </span>
          )}
        </div>

        {isAuthenticated && (
          <button
            className="btn-primary-custom d-flex align-items-center gap-2"
            onClick={() => {
              setSelectedInventory(null);
              setIsFormOpen(true);
            }}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            <span className="d-none d-sm-inline">
              {t("inventories.createBtn", "New Inventory")}
            </span>
          </button>
        )}
      </div>

      {error && <ErrorAlert message={error} onDismiss={() => setError(null)} />}

      {loading && !data ? (
        <div className="skeleton-table animate-fade-up mt-3">
          {[...Array(PAGE_SIZE)].map((_, i) => (
            <div key={i} className="skeleton-row shimmer-bg"></div>
          ))}
        </div>
      ) : data?.items.length === 0 ? (
        <EmptyState
          title={t("inventories.empty", "No inventories yet")}
          message="Create your first inventory to get started."
        />
      ) : (
        <div className="animate-fade-up" style={{ animationDelay: "0.1s" }}>
          <InventoryTable
            inventories={data?.items || []}
            currentUserId={user?.id}
            isAdmin={isAdmin}
            onEdit={handleEdit}
            onDelete={(id) => {
              setDeleteId(id);
              setIsConfirmOpen(true);
            }}
          />
          {data && data.totalPages > 1 && (
            <Pagination
              page={data.page}
              totalPages={data.totalPages}
              onPageChange={fetchInventories}
            />
          )}
        </div>
      )}

      {/* Modals */}
      <InventoryFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSuccess={() => fetchInventories(currentPage)}
        editInventory={selectedInventory}
      />

      <ConfirmModal
        isOpen={isConfirmOpen}
        title={t("common.confirm", "Are you sure?")}
        message={t(
          "inventories.deleteConfirm",
          "Are you sure you want to delete this inventory?",
        )}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setIsConfirmOpen(false)}
        isProcessing={actionLoading}
      />

      <style>{`
        .max-w-1200 { max-width: 1200px; margin: 0 auto; }
        .border-bottom-custom { border-bottom: 1px solid var(--border); }
        .badge-count { background: var(--bg-secondary); color: var(--text-secondary); padding: 4px 10px; border-radius: 20px; font-size: 0.875rem; font-weight: 600; border: 1px solid var(--border); }
        .btn-primary-custom { background: var(--accent); color: white; padding: 8px 16px; border-radius: var(--radius-sm); font-weight: 600; transition: var(--transition); border: none; cursor: pointer; }
        .btn-primary-custom:hover { background: var(--accent-hover); transform: translateY(-1px); box-shadow: var(--shadow-sm); }
        
        .skeleton-table { background: var(--bg-card); border-radius: var(--radius-md); overflow: hidden; border: 1px solid var(--border); }
        .skeleton-row { height: 52px; border-bottom: 1px solid var(--border); }
        .skeleton-row:last-child { border-bottom: none; }
      `}</style>
    </div>
  );
};

export default InventoriesPage;
