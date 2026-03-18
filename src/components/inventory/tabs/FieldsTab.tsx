import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type {
  InventoryFieldDto,
  CreateInventoryFieldDto,
  UpdateInventoryFieldDto,
  FieldType,
} from "../../../types";
import {
  getFields,
  addField,
  updateField,
  deleteField,
  reorderFields,
} from "../../../api/fields.api";
import ConfirmModal from "../../common/ConfirmModal";
import ErrorAlert from "../../common/ErrorAlert";

import {
  Edit2,
  Trash2,
  GripVertical,
} from "lucide-react";

interface FieldsTabProps {
  inventoryId: number;
  canEdit: boolean;
}

interface FieldCardProps {
  field: InventoryFieldDto;
  canEdit: boolean;
  onEdit: (field: InventoryFieldDto) => void;
  onDelete: (fieldId: number) => void;
}

const FIELD_TYPE_CONFIG: Record<FieldType, { icon: string; color: string }> = {
  SingleLineText: { icon: "T", color: "#4361ee" },
  MultiLineText: { icon: "¶", color: "#7c3aed" },
  Numeric: { icon: "#", color: "#059669" },
  Link: { icon: "🔗", color: "#0891b2" },
  Boolean: { icon: "✓", color: "#d97706" },
};

const FieldCard: React.FC<FieldCardProps> = ({
  field,
  canEdit,
  onEdit,
  onDelete,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: field.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const config = FIELD_TYPE_CONFIG[field.type] || { icon: "?", color: "#94a3b8" };

  return (
    <div ref={setNodeRef} style={style} className="field-card">
      <div className="drag-handle" {...attributes} {...listeners}>
        <GripVertical size={18} />
      </div>
      <div className="field-type" style={{ backgroundColor: config.color }}>
        {config.icon}
      </div>
      <div className="field-content">
        <div className="field-title">{field.title}</div>
        {field.description && (
          <div className="field-description">{field.description}</div>
        )}
        <div className="field-display">
          {field.displayInTable ? "Table ✓" : "Table ✗"}
        </div>
      </div>
      {canEdit && (
        <div className="field-actions">
          <button onClick={() => onEdit(field)} className="action-icon-btn edit" title="Edit">
            <Edit2 size={16} />
          </button>
          <button onClick={() => onDelete(field.id)} className="action-icon-btn delete" title="Delete">
            <Trash2 size={16} />
          </button>
        </div>
      )}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .field-card {
          display: flex;
          align-items: center;
          padding: 12px 16px;
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          background: var(--bg-card);
          margin-bottom: 8px;
          gap: 12px;
          transition: all 0.2s;
        }
        .field-card:hover {
          border-color: var(--accent-subtle);
          box-shadow: var(--shadow-sm);
        }
        .drag-handle {
          cursor: grab;
          color: var(--text-muted);
          padding: 4px;
          display: flex;
          align-items: center;
        }
        .drag-handle:active { cursor: grabbing; }
        
        .field-type {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 700;
          font-size: 0.9rem;
        }
        .field-content { flex: 1; min-width: 0; }
        .field-title { font-weight: 600; color: var(--text-primary); font-size: 0.95rem; }
        .field-description { font-size: 0.8rem; color: var(--text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .field-display { font-size: 0.75rem; color: var(--text-secondary); margin-top: 2px; }
        
        .field-actions {
          display: flex;
          gap: 4px;
          opacity: 0.6;
          transition: opacity 0.2s;
        }
        .field-card:hover .field-actions { opacity: 1; }
        
        .action-icon-btn {
          width: 32px;
          height: 32px;
          border-radius: 6px;
          border: none;
          background: transparent;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: var(--text-muted);
          transition: all 0.2s;
        }
        .action-icon-btn.edit:hover { background: var(--bg-secondary); color: var(--accent); }
        .action-icon-btn.delete:hover { background: #fee2e2; color: var(--danger); }
      `,
        }}
      />
    </div>
  );
};


const FieldsTab: React.FC<FieldsTabProps> = ({ inventoryId, canEdit }) => {
  const { t } = useTranslation();
  const [fields, setFields] = useState<InventoryFieldDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingField, setEditingField] = useState<InventoryFieldDto | null>(
    null,
  );
  const [deleteFieldId, setDeleteFieldId] = useState<number | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  useEffect(() => {
    loadFields();
  }, [inventoryId]);

  const loadFields = async () => {
    try {
      setLoading(true);
      const data = await getFields(inventoryId);
      setFields(data || []);
      setError(null);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddField = async (dto: CreateInventoryFieldDto) => {
    try {
      const newField = await addField(inventoryId, dto);
      setFields([...fields, newField]);
      setIsAddModalOpen(false);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong";
      setError(message);
    }
  };

  const handleUpdateField = async (
    fieldId: number,
    dto: UpdateInventoryFieldDto,
  ) => {
    try {
      const updatedField = await updateField(inventoryId, fieldId, dto);
      setFields(fields.map((f) => (f.id === fieldId ? updatedField : f)));
      setEditingField(null);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong";
      setError(message);
    }
  };

  const handleDeleteField = async (fieldId: number) => {
    try {
      await deleteField(inventoryId, fieldId);
      setFields(fields.filter((f) => f.id !== fieldId));
      setDeleteFieldId(null);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong";
      setError(message);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = fields.findIndex((f) => f.id === active.id);
      const newIndex = fields.findIndex((f) => f.id === over.id);
      const newFields = arrayMove(fields, oldIndex, newIndex);
      setFields(newFields);
      try {
        await reorderFields(inventoryId, {
          orderedIds: newFields.map((f: InventoryFieldDto) => f.id),
        });
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Something went wrong";
        setError(message);
        // Revert on error
        setFields(fields);
      }
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <ErrorAlert message={error} />;

  return (
    <div className="fields-tab">
      <div className="header">
        <h3>{t("inventory.fields.title", "Custom Fields")}</h3>
        {canEdit && (
          <button onClick={() => setIsAddModalOpen(true)} className="add-btn">
            + {t("inventory.fields.addField", "Add Field")}
          </button>
        )}
      </div>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={fields.map((f) => f.id)}
          strategy={verticalListSortingStrategy}
        >
          {fields.map((field) => (
            <FieldCard
              key={field.id}
              field={field}
              canEdit={canEdit}
              onEdit={setEditingField}
              onDelete={setDeleteFieldId}
            />
          ))}
        </SortableContext>
      </DndContext>
      {isAddModalOpen && (
        <AddFieldModal
          onClose={() => setIsAddModalOpen(false)}
          onSubmit={handleAddField}
          existingFields={fields}
        />
      )}
      {editingField && (
        <EditFieldModal
          field={editingField}
          onClose={() => setEditingField(null)}
          onSubmit={(dto) => handleUpdateField(editingField.id, dto)}
        />
      )}
      {deleteFieldId && (
        <ConfirmModal
          isOpen={true}
          title={t("inventory.fields.confirmDelete", "Delete Field")}
          message={t(
            "inventory.fields.confirmDeleteMessage",
            "Are you sure you want to delete this field?",
          )}
          onConfirm={() => handleDeleteField(deleteFieldId)}
          onCancel={() => setDeleteFieldId(null)}
        />
      )}

      <style
        dangerouslySetInnerHTML={{
          __html: `
        .fields-tab {
          padding: 20px;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        .add-btn {
          background: var(--accent);
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: var(--radius-sm);
          cursor: pointer;
        }
        .add-btn:hover {
          background: var(--accent-hover);
        }
      `,
        }}
      />
    </div>
  );
};

// AddFieldModal component
const AddFieldModal: React.FC<{
  onClose: () => void;
  onSubmit: (dto: CreateInventoryFieldDto) => void;
  existingFields: InventoryFieldDto[];
}> = ({ onClose, onSubmit, existingFields }) => {
  const { t } = useTranslation();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<FieldType>("SingleLineText");
  const [displayInTable, setDisplayInTable] = useState(false);

  const textFieldCount = (existingFields || []).filter(
    (f) => f.type === "SingleLineText" || f.type === "MultiLineText",
  ).length;
  const maxTextFields = 3;
  const isTextFieldLimitReached =
    (type === "SingleLineText" || type === "MultiLineText") &&
    textFieldCount >= maxTextFields;

  const handleSubmit = () => {
    if (!title.trim()) return;
    onSubmit({
      title: title.trim(),
      description: description.trim() || undefined,
      type,
      displayInTable,
    });
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content field-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{t("inventory.fields.addField", "Add Field")}</h3>
          <button className="close-x" onClick={onClose}>&times;</button>
        </div>
        
        <div className="modal-body">
          <div className="form-group">
            <label>{t("inventory.fields.title", "Title")} *</label>
            <input
              type="text"
              className="form-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t(
                "inventory.fields.titlePlaceholder",
                "Enter field title",
              )}
              autoFocus
            />
          </div>
          
          <div className="form-group">
            <label>{t("inventory.fields.description", "Description")}</label>
            <textarea
              className="form-input"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t(
                "inventory.fields.descriptionPlaceholder",
                "Optional description",
              )}
              rows={2}
            />
          </div>
          
          <div className="form-row">
            <div className="form-group flex-1">
              <label>{t("inventory.fields.type", "Type")}</label>
              <select
                className="form-select"
                value={type}
                onChange={(e) => setType(e.target.value as FieldType)}
              >
                <option value="SingleLineText">
                  {t("inventory.fields.types.singleLineText", "Single Line Text")}
                </option>
                <option value="MultiLineText">
                  {t("inventory.fields.types.multiLineText", "Multi Line Text")}
                </option>
                <option value="Numeric">
                  {t("inventory.fields.types.numeric", "Numeric")}
                </option>
                <option value="Link">
                  {t("inventory.fields.types.link", "Link")}
                </option>
                <option value="Boolean">
                  {t("inventory.fields.types.boolean", "Yes/No (Boolean)")}
                </option>
              </select>
            </div>
          </div>

          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={displayInTable}
                onChange={(e) => setDisplayInTable(e.target.checked)}
              />
              <span className="checkbox-text">
                {t("inventory.fields.displayInTable", "Display in table")}
              </span>
            </label>
          </div>

          {(type === "SingleLineText" || type === "MultiLineText") && (
            <div className={`limit-info ${isTextFieldLimitReached ? 'limit-reached' : ''}`}>
              <span className="limit-dot"></span>
              {t(
                "inventory.fields.textFieldsUsed",
                "Text fields: {{count}}/{{max}} used",
                { count: textFieldCount, max: maxTextFields },
              )}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="btn-cancel">
            {t("common.cancel", "Cancel")}
          </button>
          <button
            onClick={handleSubmit}
            disabled={!title.trim() || isTextFieldLimitReached}
            className="btn-submit"
          >
            {t("common.add", "Add")}
          </button>
        </div>

        <style
          dangerouslySetInnerHTML={{
            __html: `
          .modal-backdrop {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(15, 23, 42, 0.75);
            backdrop-filter: blur(4px);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            animation: fadeIn 0.2s ease-out;
          }
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          .field-modal {
            background: var(--bg-card);
            border-radius: var(--radius-lg);
            width: 440px;
            max-width: 95vw;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
            border: 1px solid var(--border);
            overflow: hidden;
            animation: scaleUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          }
          @keyframes scaleUp {
            from { transform: scale(0.95); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
          }
          .modal-header {
            padding: 20px 24px;
            border-bottom: 1px solid var(--border);
            display: flex;
            align-items: center;
            justify-content: space-between;
            background: var(--bg-secondary);
          }
          .modal-header h3 {
            margin: 0;
            font-size: 1.125rem;
            font-weight: 700;
            color: var(--text-primary);
          }
          .close-x {
            background: none;
            border: none;
            font-size: 1.5rem;
            color: var(--text-muted);
            cursor: pointer;
            padding: 4px;
            line-height: 1;
            transition: color 0.2s;
          }
          .close-x:hover { color: var(--text-primary); }
          
          .modal-body { padding: 24px; }
          .modal-footer {
            padding: 16px 24px;
            background: var(--bg-secondary);
            border-top: 1px solid var(--border);
            display: flex;
            justify-content: flex-end;
            gap: 12px;
          }
          
          .form-group { margin-bottom: 20px; }
          .form-group:last-child { margin-bottom: 0; }
          .form-group label {
            display: block;
            margin-bottom: 6px;
            font-size: 0.875rem;
            font-weight: 600;
            color: var(--text-secondary);
          }
          .form-input, .form-select {
            width: 100%;
            padding: 10px 12px;
            background: var(--bg-primary);
            border: 1px solid var(--border);
            border-radius: var(--radius-md);
            color: var(--text-primary);
            font-size: 0.95rem;
            transition: all 0.2s;
          }
          textarea.form-input { resize: vertical; min-height: 80px; }
          .form-input:focus, .form-select:focus {
            outline: none;
            border-color: var(--accent);
            box-shadow: 0 0 0 3px var(--accent-subtle);
          }
          
          .form-row { display: flex; gap: 16px; }
          .flex-1 { flex: 1; }
          
          .checkbox-group {
            background: var(--bg-secondary);
            padding: 12px;
            border-radius: var(--radius-md);
            margin-top: 4px;
          }
          .checkbox-label {
            display: flex;
            align-items: center;
            gap: 10px;
            cursor: pointer;
            user-select: none;
          }
          .checkbox-text { font-size: 0.95rem; color: var(--text-primary); }
          .checkbox-label input { width: 18px; height: 18px; cursor: pointer; }
          
          .limit-info {
            margin-top: 12px;
            font-size: 0.825rem;
            color: #d97706;
            display: flex;
            align-items: center;
            gap: 6px;
            padding: 8px 12px;
            background: #fffbeb;
            border-radius: var(--radius-sm);
            border: 1px solid #fef3c7;
          }
          .limit-dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }
          .limit-reached { color: var(--danger); background: #fef2f2; border-color: #fee2e2; }
          
          .btn-cancel, .btn-submit {
            padding: 10px 18px;
            border-radius: var(--radius-md);
            font-weight: 600;
            font-size: 0.95rem;
            cursor: pointer;
            transition: all 0.2s;
          }
          .btn-cancel {
            background: transparent;
            border: 1px solid var(--border);
            color: var(--text-secondary);
          }
          .btn-cancel:hover { background: var(--bg-primary); color: var(--text-primary); }
          
          .btn-submit {
            background: var(--accent);
            border: none;
            color: white;
            box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
          }
          .btn-submit:hover:not(:disabled) {
            background: var(--accent-hover);
            transform: translateY(-1px);
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          }
          .btn-submit:active:not(:disabled) { transform: translateY(0); }
          .btn-submit:disabled {
            background: var(--text-muted);
            opacity: 0.6;
            cursor: not-allowed;
          }
        `,
          }}
        />
      </div>
    </div>
  );
};

// EditFieldModal component
const EditFieldModal: React.FC<{
  field: InventoryFieldDto;
  onClose: () => void;
  onSubmit: (dto: UpdateInventoryFieldDto) => void;
}> = ({ field, onClose, onSubmit }) => {
  const { t } = useTranslation();
  const [title, setTitle] = useState(field.title);
  const [description, setDescription] = useState(field.description || "");
  const [displayInTable, setDisplayInTable] = useState(field.displayInTable);

  const handleSubmit = () => {
    if (!title.trim()) return;
    onSubmit({
      title: title.trim(),
      description: description.trim() || undefined,
      displayInTable,
    });
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content field-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{t("inventory.fields.editField", "Edit Field")}</h3>
          <button className="close-x" onClick={onClose}>&times;</button>
        </div>

        <div className="modal-body">
          <div className="form-group">
            <label>{t("inventory.fields.title", "Title")} *</label>
            <input
              type="text"
              className="form-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t(
                "inventory.fields.titlePlaceholder",
                "Enter field title",
              )}
              autoFocus
            />
          </div>
          
          <div className="form-group">
            <label>{t("inventory.fields.description", "Description")}</label>
            <textarea
              className="form-input"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t(
                "inventory.fields.descriptionPlaceholder",
                "Optional description",
              )}
              rows={2}
            />
          </div>

          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={displayInTable}
                onChange={(e) => setDisplayInTable(e.target.checked)}
              />
              <span className="checkbox-text">
                {t("inventory.fields.displayInTable", "Display in table")}
              </span>
            </label>
          </div>
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="btn-cancel">
            {t("common.cancel", "Cancel")}
          </button>
          <button
            onClick={handleSubmit}
            disabled={!title.trim()}
            className="btn-submit"
          >
            {t("common.save", "Save")}
          </button>
        </div>
        
        <style
          dangerouslySetInnerHTML={{
            __html: `
          .modal-backdrop {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(15, 23, 42, 0.75);
            backdrop-filter: blur(4px);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            animation: fadeIn 0.2s ease-out;
          }
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          .field-modal {
            background: var(--bg-card);
            border-radius: var(--radius-lg);
            width: 440px;
            max-width: 95vw;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
            border: 1px solid var(--border);
            overflow: hidden;
            animation: scaleUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          }
          @keyframes scaleUp {
            from { transform: scale(0.95); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
          }
          .modal-header {
            padding: 20px 24px;
            border-bottom: 1px solid var(--border);
            display: flex;
            align-items: center;
            justify-content: space-between;
            background: var(--bg-secondary);
          }
          .modal-header h3 {
            margin: 0;
            font-size: 1.125rem;
            font-weight: 700;
            color: var(--text-primary);
          }
          .close-x {
            background: none;
            border: none;
            font-size: 1.5rem;
            color: var(--text-muted);
            cursor: pointer;
            padding: 4px;
            line-height: 1;
            transition: color 0.2s;
          }
          .close-x:hover { color: var(--text-primary); }
          
          .modal-body { padding: 24px; }
          .modal-footer {
            padding: 16px 24px;
            background: var(--bg-secondary);
            border-top: 1px solid var(--border);
            display: flex;
            justify-content: flex-end;
            gap: 12px;
          }
          
          .form-group { margin-bottom: 20px; }
          .form-group:last-child { margin-bottom: 0; }
          .form-group label {
            display: block;
            margin-bottom: 6px;
            font-size: 0.875rem;
            font-weight: 600;
            color: var(--text-secondary);
          }
          .form-input {
            width: 100%;
            padding: 10px 12px;
            background: var(--bg-primary);
            border: 1px solid var(--border);
            border-radius: var(--radius-md);
            color: var(--text-primary);
            font-size: 0.95rem;
            transition: all 0.2s;
          }
          textarea.form-input { resize: vertical; min-height: 80px; }
          .form-input:focus {
            outline: none;
            border-color: var(--accent);
            box-shadow: 0 0 0 3px var(--accent-subtle);
          }
          
          .checkbox-group {
            background: var(--bg-secondary);
            padding: 12px;
            border-radius: var(--radius-md);
            margin-top: 4px;
          }
          .checkbox-label {
            display: flex;
            align-items: center;
            gap: 10px;
            cursor: pointer;
            user-select: none;
          }
          .checkbox-text { font-size: 0.95rem; color: var(--text-primary); }
          .checkbox-label input { width: 18px; height: 18px; cursor: pointer; }
          
          .btn-cancel, .btn-submit {
            padding: 10px 18px;
            border-radius: var(--radius-md);
            font-weight: 600;
            font-size: 0.95rem;
            cursor: pointer;
            transition: all 0.2s;
          }
          .btn-cancel {
            background: transparent;
            border: 1px solid var(--border);
            color: var(--text-secondary);
          }
          .btn-cancel:hover { background: var(--bg-primary); color: var(--text-primary); }
          
          .btn-submit {
            background: var(--accent);
            border: none;
            color: white;
            box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
          }
          .btn-submit:hover:not(:disabled) {
            background: var(--accent-hover);
            transform: translateY(-1px);
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          }
          .btn-submit:active:not(:disabled) { transform: translateY(0); }
          .btn-submit:disabled {
            background: var(--text-muted);
            opacity: 0.6;
            cursor: not-allowed;
          }
        `,
          }}
        />
      </div>
    </div>
  );
};

export default FieldsTab;
