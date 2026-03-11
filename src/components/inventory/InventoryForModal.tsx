import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import type { InventoryDto, CreateInventoryDto } from "../../types";
import { inventoriesApi } from "../../api/inventories.api";
import ErrorAlert from "../common/ErrorAlert";
import "../../styles/InventoryForModal.css";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void; // Saqlangandan keyin jadvalni yangilash uchun
  editInventory?: InventoryDto | null; // Agar bu bo'lsa -> Edit mode
}

const InventoryFormModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSuccess,
  editInventory,
}) => {
  const { t } = useTranslation();

  const [formData, setFormData] = useState<CreateInventoryDto>({
    title: "",
    description: "",
    isPublic: false,
    tags: [],
  });
  const [tagsInput, setTagsInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modal ochilganda ma'lumotlarni to'ldirish yoki tozalash
  useEffect(() => {
    if (isOpen) {
      if (editInventory) {
        setFormData({
          title: editInventory.title,
          description: editInventory.description || "",
          isPublic: editInventory.isPublic,
          tags: editInventory.tags || [],
        });
        setTagsInput(editInventory.tags ? editInventory.tags.join(", ") : "");
      } else {
        setFormData({ title: "", description: "", isPublic: false, tags: [] });
        setTagsInput("");
      }
      setError(null);
    }
  }, [editInventory, isOpen]);

  if (!isOpen) return null;

  // Formani saqlash (Create yoki Update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const tags = tagsInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      const payload: CreateInventoryDto = { ...formData, tags };

      if (editInventory) {
        // UPDATE: Tahrirlash
        await inventoriesApi.updateInventory(editInventory.id, {
          ...payload,
          rowVersion: editInventory.rowVersion, // Backend conflict (409) ni tekshirishi uchun
        });
      } else {
        // CREATE: Yangi yaratish
        await inventoriesApi.createInventory(payload);
      }

      onSuccess(); // Jadvalni yangilash
      onClose(); // Modalni yopish
    } catch (err: any) {
      if (err.message?.includes("409")) {
        setError(
          t(
            "errors.conflict",
            "Kimdir bu ma'lumotni o'zgartirdi. Sahifani yangilang.",
          ),
        );
      } else {
        setError(err.message || t("errors.general", "Xatolik yuz berdi"));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="custom-modal-backdrop">
      <div className="custom-modal-content p-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h3 className="m-0 h4 fw-bold">
            {editInventory
              ? t("common.edit", "Tahrirlash")
              : t("form.create", "Yaratish")}
          </h3>
          <button className="btn-close" onClick={onClose}></button>
        </div>

        {error && (
          <ErrorAlert message={error} onDismiss={() => setError(null)} />
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">
              {t("form.inventoryTitle", "Nomi")}
            </label>
            <input
              type="text"
              className="form-control"
              required
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              disabled={loading}
            />
          </div>

          <div className="mb-3">
            <label className="form-label">
              {t("form.description", "Tavsif")}
            </label>
            <textarea
              className="form-control"
              rows={3}
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              disabled={loading}
            />
          </div>

          <div className="mb-4">
            <label className="form-label">Tags (vergul bilan ajrating)</label>
            <input
              type="text"
              className="form-control"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="d-flex justify-content-end gap-2 mt-4">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              {t("form.cancel", "Bekor qilish")}
            </button>
            <button
              type="submit"
              className="btn btn-primary btn-save"
              disabled={loading}
            >
              {loading ? "Saqlanmoqda..." : t("form.save", "Saqlash")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InventoryFormModal;
