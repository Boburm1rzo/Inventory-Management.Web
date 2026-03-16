import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { itemsApi } from "../../api/items.api";
import type {
  ItemDto,
  InventoryFieldDto,
  CreateItemFieldValueDto,
} from "../../types";
import ErrorAlert from "../common/ErrorAlert";

interface Props {
  inventoryId: number;
  fields: InventoryFieldDto[];
  item?: ItemDto | null;
  onSuccess: () => void;
  onCancel: () => void;
}

const ItemForm: React.FC<Props> = ({
  inventoryId,
  fields,
  item,
  onSuccess,
  onCancel,
}) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<Record<number, string | number | boolean>>({});

  useEffect(() => {
    if (item) {
      const initialValues: Record<number, string | number | boolean> = {};
      item.fieldValues.forEach((fv) => {
        if (fv.fieldType === "Boolean")
          initialValues[fv.fieldId] = !!fv.booleanValue;
        else if (fv.fieldType === "Numeric")
          initialValues[fv.fieldId] = fv.numericValue ?? "";
        else initialValues[fv.fieldId] = fv.textValue || "";
      });
      setFormValues(initialValues);
    } else {
      const initialValues: Record<number, string | number | boolean> = {};
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
      else if (f.type === "Numeric")
        dto.numericValue = val === "" ? undefined : Number(val);
      else dto.textValue = String(val || "");
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
    } catch (err: unknown) {
      const errorObj = err as { message?: string };
      if (errorObj.message?.includes("409")) {
        setError(
          "This item was modified by someone else. Please refresh and try again.",
        );
      } else {
        setError(errorObj.message || "Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  };

  const updateVal = (id: number, val: string | number | boolean) => {
    setFormValues((prev) => ({ ...prev, [id]: val }));
  };

  return (
    <div className="item-form">
      <h3 className="m-0 h4 fw-bold mb-4">
        {item ? t("items.edit", "Edit Item") : t("items.add", "Add New Item")}
      </h3>

      {error && (
        <ErrorAlert message={error} onDismiss={() => setError(null)} />
      )}

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
                value={String(formValues[f.id] || "")}
                onChange={(e) => updateVal(f.id, e.target.value)}
                disabled={loading}
              />
            ) : f.type === "Numeric" ? (
              <input
                type="number"
                className="form-control"
                value={String(formValues[f.id] ?? "")}
                onChange={(e) => updateVal(f.id, e.target.value)}
                disabled={loading}
              />
            ) : (
              <input
                type={f.type === "Link" ? "url" : "text"}
                className="form-control"
                value={String(formValues[f.id] || "")}
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
                  href={String(formValues[f.id])}
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
            onClick={onCancel}
            disabled={loading}
          >
            {t("common.cancel", "Cancel")}
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? "..." : item ? t("common.save", "Save") : t("common.create", "Create")}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ItemForm;
