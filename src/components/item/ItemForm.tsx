import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import "../../styles/InventoryForModal.css"; // Reuse similar styles
import type {
  Item,
  CreateItemDto,
  UpdateItemDto,
  CustomFields,
} from "../../types";

interface Props {
  isEdit: boolean;
  initialData?: Item;
  onSubmit: (data: CreateItemDto | UpdateItemDto) => void;
  onCancel: () => void;
}

const ItemForm: React.FC<Props> = ({
  isEdit,
  initialData,
  onSubmit,
  onCancel,
}) => {
  const { t } = useTranslation();

  const [tags, setTags] = useState<string[]>(initialData?.tags || []);
  const [customFields, setCustomFields] = useState<CustomFields>(
    initialData?.customFields || {
      strings: ["", "", ""],
      texts: ["", "", ""],
      numbers: [0, 0, 0],
      links: ["", "", ""],
      booleans: [false, false, false],
    },
  );

  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTags(
      value
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag),
    );
  };

  const handleCustomFieldChange = (
    type: keyof CustomFields,
    index: number,
    value: string | number | boolean,
  ) => {
    setCustomFields((prev) => ({
      ...prev,
      [type]: prev[type].map((item, i) => (i === index ? value : item)),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = isEdit
      ? ({
          tags,
          customFields,
          rowVersion: initialData!.rowVersion,
        } as UpdateItemDto)
      : ({ tags, customFields } as CreateItemDto);
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit} className="item-form">
      <div className="form-group">
        <label>{t("items.form.tags", "Tags")}</label>
        <input
          type="text"
          value={tags.join(", ")}
          onChange={handleTagsChange}
          placeholder={t(
            "items.form.tagsPlaceholder",
            "Enter tags separated by commas",
          )}
        />
      </div>

      <h3>{t("items.form.customFields", "Custom Fields")}</h3>

      {/* Strings */}
      {[0, 1, 2].map((i) => (
        <div key={`string-${i}`} className="form-group">
          <label>
            {t("items.form.stringField", "String Field {{index}}", {
              index: i + 1,
            })}
          </label>
          <input
            type="text"
            value={customFields.strings[i]}
            onChange={(e) =>
              handleCustomFieldChange("strings", i, e.target.value)
            }
          />
        </div>
      ))}

      {/* Texts */}
      {[0, 1, 2].map((i) => (
        <div key={`text-${i}`} className="form-group">
          <label>
            {t("items.form.textField", "Text Field {{index}}", {
              index: i + 1,
            })}
          </label>
          <textarea
            value={customFields.texts[i]}
            onChange={(e) =>
              handleCustomFieldChange("texts", i, e.target.value)
            }
          />
        </div>
      ))}

      {/* Numbers */}
      {[0, 1, 2].map((i) => (
        <div key={`number-${i}`} className="form-group">
          <label>
            {t("items.form.numberField", "Number Field {{index}}", {
              index: i + 1,
            })}
          </label>
          <input
            type="number"
            value={customFields.numbers[i]}
            onChange={(e) =>
              handleCustomFieldChange(
                "numbers",
                i,
                parseFloat(e.target.value) || 0,
              )
            }
          />
        </div>
      ))}

      {/* Links */}
      {[0, 1, 2].map((i) => (
        <div key={`link-${i}`} className="form-group">
          <label>
            {t("items.form.linkField", "Link Field {{index}}", {
              index: i + 1,
            })}
          </label>
          <input
            type="url"
            value={customFields.links[i]}
            onChange={(e) =>
              handleCustomFieldChange("links", i, e.target.value)
            }
          />
        </div>
      ))}

      {/* Booleans */}
      {[0, 1, 2].map((i) => (
        <div key={`boolean-${i}`} className="form-group">
          <label>
            <input
              type="checkbox"
              checked={customFields.booleans[i]}
              onChange={(e) =>
                handleCustomFieldChange("booleans", i, e.target.checked)
              }
            />
            {t("items.form.booleanField", "Boolean Field {{index}}", {
              index: i + 1,
            })}
          </label>
        </div>
      ))}

      <div className="form-actions">
        <button type="submit">
          {isEdit ? t("common.save", "Save") : t("common.create", "Create")}
        </button>
        <button type="button" onClick={onCancel}>
          {t("common.cancel", "Cancel")}
        </button>
      </div>
    </form>
  );
};

export default ItemForm;
