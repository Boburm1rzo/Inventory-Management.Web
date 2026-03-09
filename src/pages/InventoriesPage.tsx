import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import { inventoriesApi } from "../api/inventories.api";
import type { InventoryListItemDto, InventoryDto, PagedResult } from "../types";
import InventoryTable from "../components/inventory/InventoryTable";
import Pagination from "../components/common/Pagination";
import ErrorAlert from "../components/common/ErrorAlert";
import ConfirmModal from "../components/common/ConfirmModal";
import InventoryFormModal from "../components/inventory/InventoryForModal";
import "../styles/InventoriesPage.css";

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

  // Modal holatlari (State)
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedInventory, setSelectedInventory] =
    useState<InventoryDto | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // READ: Ma'lumotlarni yuklash
  const fetchInventories = async (page: number) => {
    try {
      setLoading(true);
      const res = await inventoriesApi.getInventories(page, PAGE_SIZE);
      setData(res);
      setCurrentPage(page);
    } catch (err: any) {
      setError(err.message || "Tarmoq xatosi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventories(currentPage);
  }, [currentPage]);

  // UPDATE action: Tahrirlash tugmasi bosilganda
  const handleEditClick = async (id: number) => {
    try {
      // To'liq ma'lumotni backenddan yuklab olamiz
      const fullDto = await inventoriesApi.getInventoryById(id);
      setSelectedInventory(fullDto);
      setIsFormOpen(true);
    } catch (err: any) {
      setError(err.message || "Xatolik yuz berdi");
    }
  };

  // DELETE action: O'chirishni tasdiqlanganda
  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    setActionLoading(true);
    try {
      await inventoriesApi.deleteInventory(deleteId);
      setIsConfirmOpen(false);
      setDeleteId(null);
      // O'chirilgandan so'ng jadvalni yangilaymiz
      fetchInventories(currentPage);
    } catch (err: any) {
      setError(err.message || "Xatolik yuz berdi");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>{t("inventories.title", "Inventories")}</h2>

        {/* CREATE: Yangi yaratish tugmasi */}
        {isAuthenticated && (
          <button
            className="btn btn-primary btn-accent"
            onClick={() => {
              setSelectedInventory(null);
              setIsFormOpen(true);
            }}
          >
            + {t("inventories.createBtn", "Yangi yaratish")}
          </button>
        )}
      </div>

      {error && <ErrorAlert message={error} onDismiss={() => setError(null)} />}

      {loading && !data ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" />
        </div>
      ) : (
        <>
          <InventoryTable
            inventories={data?.items || []}
            currentUserId={user?.id}
            isAdmin={isAdmin}
            onEdit={handleEditClick} // Jadvaldagi qalamcha (edit) bosilganda
            onDelete={(id) => {
              setDeleteId(id);
              setIsConfirmOpen(true);
            }} // Jadvaldagi musor (delete) bosilganda
          />

          {data && data.totalPages > 1 && (
            <Pagination
              page={data.page}
              totalPages={data.totalPages}
              onPageChange={fetchInventories}
            />
          )}
        </>
      )}

      {/* CREATE & UPDATE uchun Form Modal */}
      <InventoryFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSuccess={() => fetchInventories(currentPage)} // Saqlangach jadvalni yangilash
        editInventory={selectedInventory}
      />

      {/* DELETE uchun Confirm Modal */}
      <ConfirmModal
        isOpen={isConfirmOpen}
        title="Tasdiqlash"
        message="Haqiqatan ham bu inventarni o'chirmoqchimisiz?"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setIsConfirmOpen(false)}
        isProcessing={actionLoading}
      />
    </div>
  );
};

export default InventoriesPage;
