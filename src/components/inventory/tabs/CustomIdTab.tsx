import React, { useState, useEffect, useCallback } from "react";
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
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type {
  InventoryIdFormatPartDto,
  CreateIdFormatPartDto,
  IdFormatPartType,
} from "../../../types";
import {
  getIdFormatParts,
  addIdFormatPart,
  deleteIdFormatPart,
  reorderIdFormatParts,
  previewId,
} from "../../../api/idformat.api";
import ConfirmModal from "../../common/ConfirmModal";
import ErrorAlert from "../../common/ErrorAlert";

interface CustomIdTabProps {
  inventoryId: number;
  canEdit: boolean;
}

interface PartCardProps {
  part: InventoryIdFormatPartDto;
  canEdit: boolean;
  onDelete: (partId: number) => void;
  onConfigChange: (partId: number, config: string) => void;
}

const PART_TYPE_CONFIG: Record<
  IdFormatPartType,
  { label: string; color: string; description: string }
> = {
  FixedText: {
    label: "Fixed Text",
    color: "#4361ee",
    description: "Custom text prefix/suffix",
  },
  Sequence: {
    label: "Sequence",
    color: "#059669",
    description: "Auto-incrementing number",
  },
  Random6Digit: {
    label: "6 Digits",
    color: "#d97706",
    description: "Random 6-digit number",
  },
  Random9Digit: {
    label: "9 Digits",
    color: "#d97706",
    description: "Random 9-digit number",
  },
  Guid: {
    label: "GUID",
    color: "#7c3aed",
    description: "Unique identifier (8 chars)",
  },
  DateTime: {
    label: "Date",
    color: "#0891b2",
    description: "Current date (yyyyMMdd)",
  },
};

const INDEX_TO_TYPE: Record<number, IdFormatPartType> = {
  0: "FixedText",
  1: "Sequence",
  2: "Random6Digit",
  3: "Random9Digit",
  4: "Guid",
  5: "DateTime",
};

const PartCard: React.FC<PartCardProps> = ({
  part,
  canEdit,
  onDelete,
  onConfigChange,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: part.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  // Handle both string and numeric types from backend
  const typeKey = typeof part.type === "number" 
    ? INDEX_TO_TYPE[part.type as number] 
    : (part.type as IdFormatPartType);
    
  const config = PART_TYPE_CONFIG[typeKey] || PART_TYPE_CONFIG.FixedText;
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(part.config || "");

  const handleClick = () => {
    // Check for both string name and its numeric representation (0 for FixedText)
    if ((part.type === "FixedText" || part.type === 0) && canEdit) {
      setIsEditing(true);
      setEditValue(part.config || "");
    }
  };

  const handleSave = () => {
    onConfigChange(part.id, editValue);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSave();
    if (e.key === "Escape") setIsEditing(false);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="part-card"
      onClick={handleClick}
    >
      <div className="drag-handle" {...attributes} {...listeners}>
        ⠿
      </div>
      <div className="part-type" style={{ backgroundColor: config.color }}>
        [{config.label}]
      </div>
      <div className="part-content">
        {isEditing ? (
          <input
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            placeholder="Enter text..."
            autoFocus
          />
        ) : (
          <span>{part.config || config.description}</span>
        )}
      </div>
      {canEdit && (
        <button onClick={() => onDelete(part.id)} className="delete-btn">
          ×
        </button>
      )}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .part-card {
          display: flex;
          align-items: center;
          padding: 12px;
          border: 1px solid var(--border);
          border-radius: var(--radius-sm);
          background: var(--bg-card);
          margin-bottom: 8px;
          gap: 12px;
          cursor: ${
            part.type === "FixedText" && canEdit ? "pointer" : "default"
          };
        }
        .drag-handle {
          cursor: grab;
          color: var(--text-muted);
          padding: 4px;
          border-radius: 4px;
        }
        .drag-handle:hover {
          color: var(--text-secondary);
          background: var(--bg-secondary);
        }
        .drag-handle:active {
          cursor: grabbing;
        }
        .part-type {
          color: white;
          font-weight: bold;
          padding: 4px 8px;
          border-radius: 4px;
        }
        .part-content {
          flex: 1;
        }
        .part-content input {
          width: 100%;
          border: 1px solid var(--border);
          border-radius: 4px;
          padding: 4px;
        }
        .delete-btn {
          background: none;
          border: none;
          cursor: pointer;
          color: var(--danger);
          font-size: 18px;
        }
        .delete-btn:hover {
          background: var(--danger);
          color: white;
        }
      `,
        }}
      />
    </div>
  );
};

const CustomIdTab: React.FC<CustomIdTabProps> = ({ inventoryId, canEdit }) => {
  const { t } = useTranslation();
  const [parts, setParts] = useState<InventoryIdFormatPartDto[]>([]);
  const [preview, setPreview] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletePartId, setDeletePartId] = useState<number | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const loadParts = useCallback(async () => {
    try {
      const data = await getIdFormatParts(inventoryId);
      setParts(data);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Something went wrong";
      setError(message);
    }
  }, [inventoryId]);

  const loadPreview = useCallback(async () => {
    try {
      const data = await previewId(inventoryId);
      setPreview(data);
    } catch {
      // Ignore preview errors
    }
  }, [inventoryId]);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([loadParts(), loadPreview()]);
      setLoading(false);
    };
    init();
  }, [loadParts, loadPreview]);

  const handleAddPart = async (type: IdFormatPartType) => {
    const dto: CreateIdFormatPartDto = { type };
    if (type === "FixedText") dto.config = "FIXED-";
    try {
      const newPart = await addIdFormatPart(inventoryId, dto);
      setParts((prev) => [...prev, newPart]);
      await loadPreview();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to add part";
      setError(message);
    }
  };

  const handleDeletePart = async (partId: number) => {
    try {
      await deleteIdFormatPart(inventoryId, partId);
      setParts(parts.filter((p) => p.id !== partId));
      setDeletePartId(null);
      await loadPreview();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to delete part";
      setError(message);
    }
  };

  const handleConfigChange = async (partId: number, config: string) => {
    // Note: If API supports individual part update, call it here.
    // For now, updating local state and preview.
    setParts(parts.map((p) => (p.id === partId ? { ...p, config } : p)));
    setTimeout(() => loadPreview(), 100);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = parts.findIndex((p) => p.id === active.id);
      const newIndex = parts.findIndex((p) => p.id === over.id);
      const newParts = arrayMove(parts, oldIndex, newIndex);
      setParts(newParts);
      try {
        await reorderIdFormatParts(inventoryId, {
          orderedIds: newParts.map((p: InventoryIdFormatPartDto) => p.id),
        });
        await loadPreview();
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to reorder";
        setError(message);
        setParts(parts); // Revert
      }
    }
  };

  if (loading) return (
    <div className="p-5 text-center text-muted">
      <div className="spinner-border spinner-border-sm me-2"></div>
      Loading configuration...
    </div>
  );

  return (
    <div className="custom-id-tab">
      <div className="preview-section card-style">
        <div className="section-title-box">
          <h3>{t("inventory.customId.preview", "Format Preview")}</h3>
          <button onClick={loadPreview} className="refresh-icon-btn" title="Refresh Preview">
            🔄
          </button>
        </div>
        <div className="preview-box">
          <code>{preview || "--- No Parts Configured ---"}</code>
        </div>
        <p className="preview-hint">This is how your item IDs will look when generated.</p>
      </div>

      <div className="parts-section card-style">
        <h3>{t("inventory.customId.parts", "Structure (Drag to Reorder)")}</h3>
        {parts.length === 0 ? (
          <div className="empty-parts">
            No parts added yet. Use the buttons below to build your ID format.
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={parts.map((p) => p.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="parts-list">
                {parts.map((part) => (
                  <PartCard
                    key={part.id}
                    part={part}
                    canEdit={canEdit}
                    onDelete={setDeletePartId}
                    onConfigChange={handleConfigChange}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      {canEdit && (
        <div className="add-parts-section card-style">
          <h3>{t("inventory.customId.addParts", "Available Components")}</h3>
          <div className="add-grid">
            {Object.entries(PART_TYPE_CONFIG).map(([type, config]) => (
              <button
                key={type}
                onClick={() => handleAddPart(type as IdFormatPartType)}
                className="add-part-card"
                style={{ "--accent-color": config.color } as any}
              >
                <span className="add-icon">+</span>
                <div className="add-info">
                  <span className="add-label">{config.label}</span>
                  <span className="add-desc">{config.description}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {deletePartId && (
        <ConfirmModal
          isOpen={true}
          title={t("inventory.customId.confirmDelete", "Remove Component")}
          message={t(
            "inventory.customId.confirmDeleteMessage",
            "Are you sure you want to remove this component from the ID format?",
          )}
          onConfirm={() => handleDeletePart(deletePartId)}
          onCancel={() => setDeletePartId(null)}
        />
      )}

      <style
        dangerouslySetInnerHTML={{
          __html: `
        .custom-id-tab {
          padding: 1rem;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        .card-style {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 1.25rem;
          box-shadow: var(--shadow-sm);
        }
        .card-style h3 {
          font-size: 0.9rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--text-secondary);
          margin-bottom: 1rem;
        }
        .section-title-box {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .preview-box {
          background: var(--bg-primary);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          padding: 1.5rem;
          text-align: center;
          margin-bottom: 0.75rem;
        }
        .preview-box code {
          font-family: 'JetBrains Mono', 'Fira Code', monospace;
          font-size: 1.75rem;
          font-weight: 700;
          color: var(--accent);
          word-break: break-all;
        }
        .preview-hint {
          font-size: 0.8rem;
          color: var(--text-muted);
          margin: 0;
        }
        .refresh-icon-btn {
          background: none;
          border: none;
          cursor: pointer;
          font-size: 1.25rem;
          padding: 4px;
          border-radius: 4px;
          transition: background 0.2s;
        }
        .refresh-icon-btn:hover { background: var(--bg-secondary); }

        .empty-parts {
          padding: 2rem;
          text-align: center;
          color: var(--text-muted);
          border: 2px dashed var(--border);
          border-radius: var(--radius-md);
        }

        .add-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
          gap: 0.75rem;
        }
        .add-part-card {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          background: var(--bg-primary);
          border: 1px solid var(--border);
          padding: 0.75rem;
          border-radius: var(--radius-md);
          cursor: pointer;
          text-align: left;
          transition: all 0.2s;
        }
        .add-part-card:hover {
          border-color: var(--accent-color);
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }
        .add-icon {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--accent-color);
          color: white;
          border-radius: 6px;
          font-size: 1.25rem;
          font-weight: 700;
        }
        .add-info { display: flex; flex-direction: column; }
        .add-label { font-weight: 600; font-size: 0.9rem; color: var(--text-primary); }
        .add-desc { font-size: 0.75rem; color: var(--text-muted); }
      `,
          }}
        />
      </div>
  );
};

export default CustomIdTab;
