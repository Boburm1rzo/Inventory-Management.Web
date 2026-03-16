import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Save, Trash2 } from "lucide-react";
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
  const { t } = useTranslation();
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
      alert("Changes saved successfully!");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update inventory");
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
      setError(err instanceof Error ? err.message : "Failed to delete inventory");
      setLoading(false);
    }
  };

  const tagOptions = availableTags.map((t) => ({ value: t.name, label: t.name }));
  const selectedTags = formData.tags.map((tag) => ({ value: tag, label: tag }));

  return (
    <div className="settings-tab">
      <style>{`
        .settings-card {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          padding: 1.5rem;
          margin-bottom: 2rem;
        }
        .danger-zone {
          border: 1px solid #fee2e2;
          border-radius: var(--radius-md);
          padding: 1.25rem;
          margin-top: 2rem;
          background: #fffcfc;
        }
        .danger-zone h4 {
          color: var(--danger);
          font-size: 14px;
          margin-bottom: 8px;
          font-weight: 600;
        }
        .danger-zone p {
          font-size: 13px;
          color: var(--text-secondary);
          margin-bottom: 1rem;
        }
      `}</style>

      {error && <ErrorAlert message={error} onDismiss={() => setError(null)} />}

      <div className="settings-card">
        <h3 className="h5 fw-bold mb-4">General Settings</h3>
        <form onSubmit={handleSave}>
          <div className="row">
            <div className="col-md-4 mb-3">
              <label className="form-label">Inventory Image</label>
              <ImageUpload
                value={formData.imageUrl}
                onChange={(url) => setFormData({ ...formData, imageUrl: url })}
                disabled={!canEdit || loading}
              />
            </div>
            <div className="col-md-8">
              <div className="mb-3">
                <label className="form-label">Title</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  disabled={!canEdit || loading}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Description</label>
                <textarea
                  className="form-control"
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  disabled={!canEdit || loading}
                />
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">Category</label>
              <select
                className="form-select"
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: Number(e.target.value) })}
                disabled={!canEdit || loading}
                required
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">Visibility</label>
              <div className="form-check form-switch mt-2">
                <input
                  className="form-check-input"
                  type="checkbox"
                  checked={formData.isPublic}
                  onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                  disabled={!canEdit || loading}
                />
                <label className="form-check-label">Public (everyone can see)</label>
              </div>
            </div>
          </div>

          <div className="mb-4">
            <label className="form-label">Tags</label>
            <CreatableSelect
              isMulti
              options={tagOptions}
              value={selectedTags}
              onChange={(selected) => {
                setFormData({
                  ...formData,
                  tags: selected ? (selected as any[]).map((opt) => opt.value) : [],
                });
              }}
              isDisabled={!canEdit || loading}
              placeholder="Search or create tags..."
            />
          </div>

          {canEdit && (
            <div className="d-flex justify-content-end">
              <button type="submit" className="btn btn-primary d-flex align-items-center gap-2" disabled={loading}>
                <Save size={18} /> Save Changes
              </button>
            </div>
          )}
        </form>
      </div>

      {canEdit && (
        <div className="danger-zone">
          <h4>Danger Zone</h4>
          <p>Once you delete an inventory, there is no going back. Please be certain.</p>
          <button
            type="button"
            className="btn btn-outline-danger d-flex align-items-center gap-2"
            onClick={() => setShowDeleteConfirm(true)}
            disabled={loading}
          >
            <Trash2 size={18} /> Delete Inventory
          </button>
        </div>
      )}

      <ConfirmModal
        isOpen={showDeleteConfirm}
        title="Delete Inventory"
        message="Are you sure you want to delete this inventory? All items and fields within it will be permanently removed."
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  );
};

export default SettingsTab;
