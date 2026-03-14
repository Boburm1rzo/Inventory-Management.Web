import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import CreatableSelect from "react-select/creatable";
import type { StylesConfig } from "react-select";
import type {
  InventoryDto,
  CreateInventoryDto,
  CategoryDto,
  TagDto,
} from "../../types";
import { inventoriesApi } from "../../api/inventories.api";
import ErrorAlert from "../common/ErrorAlert";
import "../../styles/InventoryForModal.css";

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
    categoryId: 0,
    imageUrl: "",
    isPublic: false,
    tags: [],
  });

  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [availableTags, setAvailableTags] = useState<TagDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      const fetchData = async () => {
        setInitialLoading(true);
        try {
          const [catRes, tagRes] = await Promise.all([
            inventoriesApi.getCategories(),
            inventoriesApi.getTags(),
          ]);
          setCategories(catRes);
          setAvailableTags(tagRes);
        } catch (err: any) {
          setError(t("errors.network", "Failed to load categories/tags"));
        } finally {
          setInitialLoading(false);
        }
      };
      fetchData();
    }
  }, [isOpen, t]);

  useEffect(() => {
    if (isOpen && !initialLoading) {
      if (editInventory) {
        setFormData({
          title: editInventory.title,
          description: editInventory.description || "",
          categoryId: editInventory.categoryId || 0,
          imageUrl: editInventory.imageUrl || "",
          isPublic: editInventory.isPublic,
          tags: editInventory.tags || [],
        });
      } else {
        setFormData({
          title: "",
          description: "",
          categoryId: categories.length > 0 ? categories[0].id : 0,
          imageUrl: "",
          isPublic: false,
          tags: [],
        });
      }
      setError(null);
    }
  }, [editInventory, isOpen, initialLoading, categories]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (formData.categoryId === 0 && categories.length > 0) {
      setError(t("errors.required", "Please select a category"));
      setLoading(false);
      return;
    }

    try {
      if (editInventory) {
        await inventoriesApi.updateInventory(editInventory.id, {
          ...formData,
          rowVersion: editInventory.rowVersion,
        });
      } else {
        await inventoriesApi.createInventory(formData);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || t("errors.general", "Xatolik yuz berdi"));
    } finally {
      setLoading(false);
    }
  };

  const tagOptions = availableTags.map((t) => ({ value: t.name, label: t.name }));
  const selectedTags = formData.tags.map((tag) => ({ value: tag, label: tag }));

  const customSelectStyles: StylesConfig<any, true> = {
    control: (base) => ({
      ...base,
      backgroundColor: "var(--bg-primary)",
      borderColor: "var(--border)",
      color: "var(--text-primary)",
      "&:hover": { borderColor: "var(--accent)" },
    }),
    menu: (base) => ({
      ...base,
      backgroundColor: "var(--bg-card)",
      border: "1px solid var(--border)",
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isFocused ? "var(--accent-subtle)" : "transparent",
      color: "var(--text-primary)",
      "&:active": { backgroundColor: "var(--accent)" },
    }),
    multiValue: (base) => ({
      ...base,
      backgroundColor: "var(--accent-subtle)",
      borderRadius: "4px",
    }),
    multiValueLabel: (base) => ({
      ...base,
      color: "var(--accent)",
      fontWeight: 600,
    }),
    multiValueRemove: (base) => ({
      ...base,
      color: "var(--accent)",
      "&:hover": { backgroundColor: "var(--accent)", color: "white" },
    }),
    input: (base) => ({ ...base, color: "var(--text-primary)" }),
    singleValue: (base) => ({ ...base, color: "var(--text-primary)" }),
    placeholder: (base) => ({ ...base, color: "var(--text-muted)" }),
  };

  return (
    <div className="custom-modal-backdrop">
      <div className="custom-modal-content p-4" style={{ maxWidth: "600px" }}>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h3 className="m-0 h4 fw-bold">
            {editInventory ? t("common.edit") : t("form.create")}
          </h3>
          <button className="btn-close" onClick={onClose}></button>
        </div>

        {error && <ErrorAlert message={error} onDismiss={() => setError(null)} />}

        {initialLoading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" />
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">{t("form.inventoryTitle")}</label>
              <input
                type="text"
                className="form-control"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                disabled={loading}
              />
            </div>

            <div className="mb-3">
              <label className="form-label">{t("form.description")}</label>
              <textarea
                className="form-control"
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                disabled={loading}
              />
            </div>

            <div className="mb-3">
              <label className="form-label">{t("form.imageUrl", "Image URL (Optional)")}</label>
              <input
                type="text"
                className="form-control"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                disabled={loading}
              />
            </div>

            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">{t("form.category")}</label>
                <select
                  className="form-select"
                  required
                  value={formData.categoryId}
                  onChange={(e) =>
                    setFormData({ ...formData, categoryId: parseInt(e.target.value) })
                  }
                  disabled={loading}
                >
                  <option value={0} disabled>{t("common.select", "Select...")}</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div className="col-md-6 mb-3 d-flex align-items-end">
                <div className="form-check mb-2">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="isPublicCheck"
                    checked={formData.isPublic}
                    onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                    disabled={loading}
                  />
                  <label className="form-check-label" htmlFor="isPublicCheck">
                    {t("form.isPublic")}
                  </label>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <label className="form-label">{t("items.form.tags")}</label>
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
                styles={customSelectStyles}
                placeholder={t("items.form.tagsPlaceholder")}
                isDisabled={loading}
                formatCreateLabel={(inputValue) => `Create "${inputValue}"`}
              />
            </div>

            <div className="d-flex justify-content-end gap-2 mt-4">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
                disabled={loading}
              >
                {t("form.cancel")}
              </button>
              <button
                type="submit"
                className="btn btn-primary btn-save"
                disabled={loading}
              >
                {loading ? "..." : t("form.save")}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default InventoryFormModal;
