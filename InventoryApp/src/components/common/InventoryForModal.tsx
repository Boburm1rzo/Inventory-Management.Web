import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import type { InventoryDto, CreateInventoryDto } from "../../types";
import { inventoriesApi } from "../../api/inventories.api";
import ErrorAlert from "../common/ErrorAlert";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editInventory?: InventoryDto | null;
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

  useEffect(() => {
    if (editInventory) {
      setFormData({
        title: editInventory.title,
        description: editInventory.description || "",
        isPublic: editInventory.isPublic,
        tags: editInventory.tags || [],
      });
      setTagsInput(editInventory.tags?.join(", ") || "");
    } else {
      setFormData({ title: "", description: "", isPublic: false, tags: [] });
      setTagsInput("");
    }
    setError(null);
  }, [editInventory, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const tags = tagsInput
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean);
      const payload = { ...formData, tags };

      if (editInventory) {
        await inventoriesApi.updateInventory(editInventory.id, {
          ...payload,
          rowVersion: editInventory.rowVersion,
        });
      } else {
        await inventoriesApi.createInventory(payload);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      if (err.message.includes("409")) setError(t("errors.conflict"));
      else setError(err.message || t("errors.general"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="custom-modal-backdrop animate-fade-in">
      <div className="custom-modal-content p-4 form-modal animate-slide-up">
        <h3 className="h4 fw-bold mb-4">
          {editInventory
            ? t("form.edit", "Edit Inventory")
            : t("inventories.createBtn", "New Inventory")}
        </h3>

        {error && (
          <ErrorAlert message={error} onDismiss={() => setError(null)} />
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-floating-custom mb-3">
            <input
              type="text"
              id="title"
              required
              placeholder=" "
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
            />
            <label htmlFor="title">{t("form.inventoryTitle", "Title")}</label>
          </div>

          <div className="form-floating-custom mb-3">
            <textarea
              id="description"
              placeholder=" "
              rows={3}
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
            <label htmlFor="description">
              {t("form.description", "Description")}
            </label>
          </div>

          <div className="form-floating-custom mb-3">
            <input
              type="text"
              id="tags"
              placeholder=" "
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
            />
            <label htmlFor="tags">Tags (comma separated)</label>
          </div>

          <div className="d-flex align-items-center justify-content-between mb-4 mt-2 p-3 rounded custom-switch-wrapper">
            <span className="fw-medium text-secondary">
              {t("form.isPublic", "Public inventory")}
            </span>
            <label className="custom-switch">
              <input
                type="checkbox"
                checked={formData.isPublic}
                onChange={(e) =>
                  setFormData({ ...formData, isPublic: e.target.checked })
                }
              />
              <span className="slider"></span>
            </label>
          </div>

          <div className="d-flex justify-content-end gap-2">
            <button
              type="button"
              className="btn-modal-cancel"
              onClick={onClose}
              disabled={loading}
            >
              {t("form.cancel", "Cancel")}
            </button>
            <button type="submit" className="btn-modal-save" disabled={loading}>
              {loading
                ? "..."
                : editInventory
                  ? t("form.save", "Save")
                  : t("form.create", "Create")}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        .form-modal { max-width: 500px; width: 100%; border: 1px solid var(--border); }
        .form-floating-custom textarea {
          width: 100%; padding: 12px 16px; font-size: 1rem; color: var(--text-primary);
          background: var(--bg-primary); border: 1px solid var(--border); border-radius: var(--radius-sm);
          resize: none; font-family: inherit; transition: all 0.2s ease;
        }
        .form-floating-custom textarea:focus { outline: none; border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-subtle); }
        
        .custom-switch-wrapper { background: var(--bg-secondary); border: 1px solid var(--border); }
        .custom-switch { position: relative; display: inline-block; width: 44px; height: 24px; }
        .custom-switch input { opacity: 0; width: 0; height: 0; }
        .custom-switch .slider {
          position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0;
          background-color: var(--border); transition: 0.2s; border-radius: 24px;
        }
        .custom-switch .slider:before {
          position: absolute; content: ""; height: 18px; width: 18px; left: 3px; bottom: 3px;
          background-color: white; transition: 0.2s; border-radius: 50%; box-shadow: var(--shadow-sm);
        }
        .custom-switch input:checked + .slider { background-color: var(--accent); }
        .custom-switch input:checked + .slider:before { transform: translateX(20px); }

        .btn-modal-save { background: var(--accent); border: none; padding: 10px 20px; border-radius: var(--radius-sm); font-weight: 600; color: white; cursor: pointer; transition: var(--transition); }
        .btn-modal-save:hover:not(:disabled) { background: var(--accent-hover); }
        .animate-slide-up { animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
};

export default InventoryFormModal;
