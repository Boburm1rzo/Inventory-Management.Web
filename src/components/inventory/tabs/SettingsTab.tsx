import React, { useState, useEffect } from "react";
import { Save, Trash2, ShieldAlert, Tag, Globe, Layers, Type, FileText, Image as ImageIcon } from "lucide-react";
import CreatableSelect from "react-select/creatable";
import { inventoriesApi } from "../../../api/inventories.api";
import type {
  InventoryDto,
  CategoryDto,
  TagDto,
  CreateInventoryDto,
} from "../../../types";
import ImageUpload from "../../common/ImageUpload";
import ErrorAlert from "../../common/ErrorAlert";
import ConfirmModal from "../../common/ConfirmModal";
import { useTheme } from "../../../hooks/useTheme";

interface SettingsTabProps {
  inventoryId: number;
  inventory: InventoryDto;
  canEdit: boolean;
  onUpdated: (updated: InventoryDto) => void;
  onDeleted: () => void;
}

const SettingsTab: React.FC<SettingsTabProps> = ({
  inventoryId,
  inventory,
  canEdit,
  onUpdated,
  onDeleted,
}) => {
  const { theme } = useTheme();
  const [formData, setFormData] = useState<CreateInventoryDto>({
    title: inventory.title,
    description: inventory.description || "",
    categoryId: inventory.categoryId || 0,
    imageUrl: inventory.imageUrl || "",
    isPublic: inventory.isPublic,
    tags: inventory.tags || [],
  });

  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [availableTags, setAvailableTags] = useState<TagDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, tagRes] = await Promise.all([
          inventoriesApi.getCategories(),
          inventoriesApi.getTags(),
        ]);
        setCategories(catRes);
        setAvailableTags(tagRes);
      } catch (err) {
        console.error("Failed to load settings data", err);
      }
    };
    fetchData();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const updated = await inventoriesApi.updateInventory(inventoryId, {
        ...formData,
        rowVersion: inventory.rowVersion,
      });
      onUpdated(updated);
      // Removed alert per user request
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Failed to update inventory",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      await inventoriesApi.deleteInventory(inventoryId);
      onDeleted();
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Failed to delete inventory",
      );
      setLoading(false);
    }
  };

  const tagOptions = availableTags.map((t) => ({
    value: t.name,
    label: t.name,
  }));
  const selectedTags = formData.tags.map((tag) => ({ value: tag, label: tag }));

  // Custom styles for react-select to support dark theme
  const selectStyles = {
    control: (base: any, state: any) => ({
      ...base,
      backgroundColor: "var(--bg-primary)",
      borderColor: state.isFocused ? "var(--accent)" : "var(--border)",
      boxShadow: state.isFocused ? "0 0 0 2px var(--accent-subtle)" : "none",
      "&:hover": {
        borderColor: "var(--accent)",
      },
      borderRadius: "var(--radius-md)",
      padding: "2px",
    }),
    menu: (base: any) => ({
      ...base,
      backgroundColor: "var(--bg-card)",
      border: "1px solid var(--border)",
      boxShadow: "var(--shadow-lg)",
      borderRadius: "var(--radius-md)",
      zIndex: 100,
    }),
    option: (base: any, state: any) => ({
      ...base,
      backgroundColor: state.isFocused 
        ? "var(--bg-secondary)" 
        : state.isSelected 
          ? "var(--accent)" 
          : "transparent",
      color: state.isSelected ? "white" : "var(--text-primary)",
      "&:active": {
        backgroundColor: "var(--accent)",
      },
    }),
    multiValue: (base: any) => ({
      ...base,
      backgroundColor: "var(--accent-subtle)",
      borderRadius: "var(--radius-sm)",
      border: "1px solid var(--accent-subtle)",
    }),
    multiValueLabel: (base: any) => ({
      ...base,
      color: "var(--accent)",
      fontWeight: "600",
      fontSize: "0.85rem",
      padding: "2px 6px",
    }),
    multiValueRemove: (base: any) => ({
      ...base,
      color: "var(--accent)",
      "&:hover": {
        backgroundColor: "var(--accent)",
        color: "white",
      },
      borderRadius: "0 var(--radius-sm) var(--radius-sm) 0",
    }),
    input: (base: any) => ({
      ...base,
      color: "var(--text-primary)",
    }),
    placeholder: (base: any) => ({
      ...base,
      color: "var(--text-muted)",
    }),
    singleValue: (base: any) => ({
      ...base,
      color: "var(--text-primary)",
    }),
  };

  return (
    <div className="settings-tab">
      <style>{`
        .settings-container {
          display: flex;
          flex-direction: column;
          gap: 2rem;
          padding: 0.5rem;
        }
        
        .settings-section {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          overflow: hidden;
          box-shadow: var(--shadow-sm);
        }
        
        .section-header {
          padding: 1.25rem 1.5rem;
          border-bottom: 1px solid var(--border);
          background: var(--bg-secondary);
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        
        .section-header h3 {
          margin: 0;
          font-size: 1.1rem;
          font-weight: 700;
          color: var(--text-primary);
        }
        
        .section-body {
          padding: 1.5rem;
        }
        
        .form-label-custom {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--text-secondary);
          margin-bottom: 0.625rem;
        }
        
        .input-with-icon {
          position: relative;
        }
        
        .form-control-custom {
          width: 100%;
          padding: 0.75rem 1rem;
          background: var(--bg-primary);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          color: var(--text-primary);
          transition: all 0.2s;
        }
        
        .form-control-custom:focus {
          outline: none;
          border-color: var(--accent);
          box-shadow: 0 0 0 3px var(--accent-subtle);
        }
        
        .form-select-custom {
          width: 100%;
          padding: 0.75rem 1rem;
          background: var(--bg-primary);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          color: var(--text-primary);
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 1rem center;
        }
        
        .visibility-toggle {
          background: var(--bg-primary);
          padding: 1rem;
          border-radius: var(--radius-md);
          border: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        
        .danger-section {
          border: 1px solid var(--danger-subtle, #fee2e2);
          background: var(--danger-bg, #fffcfc);
        }
        
        [data-theme='dark'] .danger-section {
          background: rgba(220, 38, 38, 0.05);
          border-color: rgba(220, 38, 38, 0.2);
        }
        
        .danger-header {
          background: var(--danger-subtle, #fef2f2);
          border-bottom: 1px solid var(--danger-subtle, #fee2e2);
        }
        
        [data-theme='dark'] .danger-header {
          background: rgba(220, 38, 38, 0.1);
          border-bottom-color: rgba(220, 38, 38, 0.2);
        }
        
        .danger-header h3 {
          color: var(--danger);
        }
        
        .danger-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 2rem;
        }
        
        @media (max-width: 768px) {
          .danger-content {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }
        }
        
        .danger-text h4 {
          font-size: 1rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 0.25rem;
        }
        
        .danger-text p {
          font-size: 0.875rem;
          color: var(--text-secondary);
          margin: 0;
        }
        
        .btn-save-custom {
          background: var(--accent);
          color: white;
          border: none;
          padding: 0.875rem 2rem;
          border-radius: var(--radius-md);
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 0.625rem;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          cursor: pointer;
        }
        
        [data-theme='dark'] .btn-save-custom {
          background: var(--primary);
          color: var(--primary-contrast);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        }
        
        .btn-save-custom:hover:not(:disabled) {
          background: var(--accent-hover);
          transform: translateY(-2px) scale(1.02);
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
        }
        
        [data-theme='dark'] .btn-save-custom:hover:not(:disabled) {
          background: var(--primary-hover);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.4);
        }
        
        .btn-save-custom:active:not(:disabled) {
          transform: translateY(0) scale(0.98);
        }
        
        .btn-delete-custom {
          background: transparent;
          color: var(--danger);
          border: 1px solid var(--danger);
          padding: 0.75rem 1.5rem;
          border-radius: var(--radius-md);
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          transition: all 0.2s;
        }
        
        .btn-delete-custom:hover:not(:disabled) {
          background: var(--danger);
          color: white;
          box-shadow: 0 4px 6px -1px rgba(220, 38, 38, 0.2);
        }
      `}</style>

      {error && <ErrorAlert message={error} onDismiss={() => setError(null)} />}

      <div className="settings-container">
        <form onSubmit={handleSave} className="settings-section">
          <div className="section-header">
            <Layers size={20} className="text-accent" />
            <h3>{t("inventory.settings.general", "General Configuration")}</h3>
          </div>
          
          <div className="section-body">
            <div className="row g-4">
              <div className="col-lg-4">
                <label className="form-label-custom">
                  <ImageIcon size={16} /> {t("inventory.settings.cover", "Inventory Cover")}
                </label>
                <div className="p-0">
                  <ImageUpload
                    value={formData.imageUrl}
                    onChange={(url) => setFormData({ ...formData, imageUrl: url })}
                    disabled={!canEdit || loading}
                  />
                </div>
              </div>
              
              <div className="col-lg-8">
                <div className="mb-4">
                  <label className="form-label-custom">
                    <Type size={16} /> {t("inventory.settings.title", "Title")}
                  </label>
                  <input
                    type="text"
                    className="form-control-custom"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    disabled={!canEdit || loading}
                    placeholder={t("form.titlePlaceholder", "Enter title...")}
                    required
                  />
                </div>
                
                <div className="mb-0">
                  <label className="form-label-custom">
                    <FileText size={16} /> {t("inventory.settings.description", "Description")}
                  </label>
                  <textarea
                    className="form-control-custom"
                    rows={4}
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    disabled={!canEdit || loading}
                    placeholder={t("form.descriptionPlaceholder", "Briefly describe...")}
                  />
                </div>
              </div>
              
              <div className="col-md-6">
                <label className="form-label-custom">
                  <Globe size={16} /> {t("inventory.settings.category", "Category")}
                </label>
                <select
                  className="form-select-custom"
                  value={formData.categoryId}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      categoryId: Number(e.target.value),
                    })
                  }
                  disabled={!canEdit || loading}
                  required
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="col-md-6">
                <label className="form-label-custom">
                  <Globe size={16} /> {t("inventory.settings.visibility", "Visibility")}
                </label>
                <div className="visibility-toggle">
                  <span className="fs-14 fw-500 text-primary">
                    {formData.isPublic ? t("inventory.settings.public", "Public Inventory") : t("inventory.settings.private", "Private Inventory")}
                  </span>
                  <div className="form-check form-switch p-0 m-0">
                    <input
                      className="form-check-input ms-0"
                      style={{ cursor: 'pointer', width: '2.5rem', height: '1.25rem' }}
                      type="checkbox"
                      checked={formData.isPublic}
                      onChange={(e) =>
                        setFormData({ ...formData, isPublic: e.target.checked })
                      }
                      disabled={!canEdit || loading}
                    />
                  </div>
                </div>
              </div>

              <div className="col-12">
                <label className="form-label-custom">
                  <Tag size={16} /> {t("inventory.settings.tags", "Keywords & Tags")}
                </label>
                <CreatableSelect
                  isMulti
                  styles={selectStyles}
                  options={tagOptions}
                  value={selectedTags}
                  onChange={(selected) => {
                    setFormData({
                      ...formData,
                      tags: selected
                        ? (selected as any[]).map((opt) => opt.value)
                        : [],
                    });
                  }}
                  isDisabled={!canEdit || loading}
                  placeholder={t("inventory.settings.tagsPlaceholder", "Type to search...")}
                />
              </div>

              {canEdit && (
                <div className="col-12 d-flex justify-content-end mt-2">
                  <button
                    type="submit"
                    className="btn-save-custom"
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                    ) : (
                      <Save size={18} />
                    )}
                    {t("inventory.settings.saveChanges", "Save Changes")}
                  </button>
                </div>
              )}
            </div>
          </div>
        </form>

        {canEdit && (
          <div className="settings-section danger-section">
            <div className="section-header danger-header">
              <ShieldAlert size={20} />
              <h3>{t("inventory.settings.dangerZone", "Danger Zone")}</h3>
            </div>
            <div className="section-body">
              <div className="danger-content">
                <div className="danger-text">
                  <h4>{t("inventory.settings.deleteTitle", "Delete this inventory")}</h4>
                  <p>
                    {t("inventory.settings.deleteDesc", "Once you delete an inventory, all data will be permanently removed.")}
                  </p>
                </div>
                <button
                  type="button"
                  className="btn-delete-custom"
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={loading}
                >
                  <Trash2 size={18} /> {t("inventory.settings.deleteBtn", "Delete Permanently")}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={showDeleteConfirm}
        title={t("inventories.deleteConfirm", "Delete Inventory")}
        message={t("inventory.settings.deleteDesc", "Are you sure? All items will be removed.")}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  );
};

export default SettingsTab;
