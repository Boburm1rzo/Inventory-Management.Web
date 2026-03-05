import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
// Using 'type' import to fix the verbatimModuleSyntax error
import type { InventoryDto, CreateInventoryDto } from "../../types";
import { inventoriesApi } from "../../api/inventories.api";
import ErrorAlert from "../common/ErrorAlert";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void; // Fixed: Now matches InventoriesPage (takes no arguments)
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

  // Reset or populate form when modal opens/closes or editInventory changes
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

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Process comma-separated tags into an array
      const tags = tagsInput
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);

      const payload: CreateInventoryDto = { ...formData, tags };

      if (editInventory) {
        // Update existing inventory
        await inventoriesApi.updateInventory(editInventory.id, {
          ...payload,
          rowVersion: editInventory.rowVersion,
        });
      } else {
        // Create new inventory
        await inventoriesApi.createInventory(payload);
      }

      onSuccess(); // Fixed: Calling without arguments
      onClose();
    } catch (err: any) {
      if (err.message.includes("409")) {
        setError(
          t(
            "errors.conflict",
            "Someone else modified this record. Please reload.",
          ),
        );
      } else {
        setError(err.message || t("errors.general", "Something went wrong"));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="custom-modal-backdrop animate-fade-in" onClick={onClose}>
      <div
        className="custom-modal-content animate-slide-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header-custom">
          <h3 className="modal-title">
            {editInventory
              ? t("common.edit", "Edit")
              : t("form.create", "Create")}{" "}
            {t("inventories.title", "Inventory")}
          </h3>
          <button
            type="button"
            className="btn-close-custom"
            onClick={onClose}
            aria-label={t("common.close", "Close")}
          >
            &times;
          </button>
        </div>

        <div className="modal-body-custom">
          {error && (
            <ErrorAlert message={error} onDismiss={() => setError(null)} />
          )}

          <form id="inventory-form" onSubmit={handleSubmit}>
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
                disabled={loading}
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
                disabled={loading}
              />
              <label htmlFor="description">
                {t("form.description", "Description")}
              </label>
            </div>

            <div className="form-floating-custom mb-4">
              <input
                type="text"
                id="tags"
                placeholder=" "
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                disabled={loading}
              />
              <label htmlFor="tags">Tags (comma separated)</label>
            </div>

            <div className="custom-switch-wrapper mb-4">
              <span className="switch-label">
                {t("form.isPublic", "Public inventory")}
              </span>
              <label className="custom-switch">
                <input
                  type="checkbox"
                  checked={formData.isPublic}
                  onChange={(e) =>
                    setFormData({ ...formData, isPublic: e.target.checked })
                  }
                  disabled={loading}
                />
                <span className="slider"></span>
              </label>
            </div>
          </form>
        </div>

        <div className="modal-footer-custom">
          <button
            type="button"
            className="btn-modal-cancel"
            onClick={onClose}
            disabled={loading}
          >
            {t("form.cancel", "Cancel")}
          </button>
          <button
            type="submit"
            form="inventory-form"
            className="btn-modal-submit"
            disabled={loading}
          >
            {loading ? (
              <span className="d-flex align-items-center justify-content-center gap-2">
                <span className="spinner"></span> {t("form.save", "Saving...")}
              </span>
            ) : editInventory ? (
              t("form.save", "Save Changes")
            ) : (
              t("form.create", "Create Inventory")
            )}
          </button>
        </div>
      </div>

      <style>{`
        .custom-modal-backdrop {
          position: fixed; inset: 0;
          background-color: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
          z-index: 1050;
          display: flex; align-items: center; justify-content: center;
          padding: 1rem;
        }

        .custom-modal-content {
          background: var(--bg-card);
          width: 100%; max-width: 500px;
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-lg);
          display: flex; flex-direction: column;
          border: 1px solid var(--border);
          overflow: hidden;
        }

        .modal-header-custom {
          display: flex; align-items: center; justify-content: space-between;
          padding: 1.5rem 1.5rem 1rem;
        }

        .modal-title { margin: 0; font-size: 1.25rem; font-weight: 700; color: var(--text-primary); }

        .btn-close-custom {
          background: transparent; border: none; font-size: 1.5rem; line-height: 1;
          color: var(--text-secondary); cursor: pointer; transition: color 0.2s;
        }
        .btn-close-custom:hover { color: var(--text-primary); }

        .modal-body-custom { padding: 0 1.5rem 1.5rem; }

        .form-floating-custom { position: relative; }
        .form-floating-custom input, .form-floating-custom textarea {
          width: 100%; padding: 14px 16px; font-size: 1rem; color: var(--text-primary);
          background: var(--bg-primary); border: 1px solid var(--border);
          border-radius: var(--radius-md); transition: all 0.2s ease;
        }
        .form-floating-custom textarea { resize: none; font-family: inherit; }
        .form-floating-custom input:focus, .form-floating-custom textarea:focus {
          outline: none; border-color: var(--accent);
          box-shadow: 0 0 0 3px var(--accent-subtle);
        }
        .form-floating-custom label {
          position: absolute; left: 16px; top: 14px;
          color: var(--text-muted); font-size: 1rem;
          transition: all 0.2s ease; pointer-events: none;
          background: var(--bg-primary); padding: 0 4px;
        }
        .form-floating-custom input:focus ~ label, 
        .form-floating-custom input:not(:placeholder-shown) ~ label,
        .form-floating-custom textarea:focus ~ label, 
        .form-floating-custom textarea:not(:placeholder-shown) ~ label {
          top: -10px; font-size: 0.75rem; color: var(--accent); font-weight: 500;
        }

        .custom-switch-wrapper {
          display: flex; align-items: center; justify-content: space-between;
          padding: 12px 16px; background: var(--bg-secondary);
          border-radius: var(--radius-md); border: 1px solid var(--border);
        }
        .switch-label { font-weight: 500; color: var(--text-primary); }
        .custom-switch { position: relative; display: inline-block; width: 44px; height: 24px; margin: 0; }
        .custom-switch input { opacity: 0; width: 0; height: 0; }
        .slider {
          position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0;
          background-color: var(--border); transition: 0.3s; border-radius: 24px;
        }
        .slider:before {
          position: absolute; content: ""; height: 18px; width: 18px; left: 3px; bottom: 3px;
          background-color: white; transition: 0.3s; border-radius: 50%; box-shadow: var(--shadow-sm);
        }
        .custom-switch input:checked + .slider { background-color: var(--accent); }
        .custom-switch input:checked + .slider:before { transform: translateX(20px); }

        .modal-footer-custom {
          display: flex; gap: 12px; padding: 1.5rem;
          background: var(--bg-secondary); border-top: 1px solid var(--border);
        }
        .btn-modal-cancel {
          flex: 1; background: transparent; color: var(--text-primary);
          border: 1px solid var(--border); padding: 12px;
          border-radius: var(--radius-sm); font-weight: 600;
          cursor: pointer; transition: var(--transition);
        }
        .btn-modal-cancel:hover:not(:disabled) { background: var(--border); }
        .btn-modal-submit {
          flex: 2; background: var(--accent); color: white; border: none;
          padding: 12px; border-radius: var(--radius-sm); font-weight: 600;
          cursor: pointer; transition: var(--transition);
        }
        .btn-modal-submit:hover:not(:disabled) {
          background: var(--accent-hover); box-shadow: var(--shadow-md); transform: translateY(-1px);
        }
        .btn-modal-submit:disabled, .btn-modal-cancel:disabled { opacity: 0.7; cursor: not-allowed; }

        .animate-fade-in { animation: fadeIn 0.2s ease-out forwards; }
        .animate-slide-in { animation: slideInUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        
        .spinner {
          display: inline-block; width: 16px; height: 16px;
          border: 2px solid rgba(255,255,255,0.3); border-radius: 50%;
          border-top-color: #fff; animation: spin 0.8s ease-in-out infinite;
        }

        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideInUp {
          from { opacity: 0; transform: translateY(30px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
};

export default InventoryFormModal;
