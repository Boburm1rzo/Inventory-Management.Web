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

  const config = PART_TYPE_CONFIG[part.type];
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(part.config || "");

  const handleClick = () => {
    if (part.type === "FixedText" && canEdit) {
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

  useEffect(() => {
    loadParts();
    loadPreview();
  }, [inventoryId]);

  const loadParts = async () => {
    try {
      const data = await getIdFormatParts(inventoryId);
      setParts(data);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong";
      setError(message);
    }
  };

  const loadPreview = async () => {
    try {
      setLoading(true);
      const data = await previewId(inventoryId);
      setPreview(data);
    } catch (err) {
      // Ignore preview errors
    } finally {
      setLoading(false);
    }
  };

  const handleAddPart = async (type: IdFormatPartType) => {
    const dto: CreateIdFormatPartDto = { type };
    if (type === "FixedText") dto.config = "PREFIX-";
    try {
      const newPart = await addIdFormatPart(inventoryId, dto);
      setParts([...parts, newPart]);
      loadPreview();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong";
      setError(message);
    }
  };

  const handleDeletePart = async (partId: number) => {
    try {
      await deleteIdFormatPart(inventoryId, partId);
      setParts(parts.filter((p) => p.id !== partId));
      setDeletePartId(null);
      loadPreview();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong";
      setError(message);
    }
  };

  const handleConfigChange = (partId: number, config: string) => {
    setParts(parts.map((p) => (p.id === partId ? { ...p, config } : p)));
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
        loadPreview();
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Something went wrong";
        setError(message);
        // Revert on error
        setParts(parts);
      }
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <ErrorAlert message={error} />;

  return (
    <div className="custom-id-tab">
      <div className="preview-section">
        <h3>{t("inventory.customId.preview", "PREVIEW")}</h3>
        <div className="preview-box">
          <span className="preview-text">
            {preview || "No parts added yet"}
          </span>
          <button onClick={loadPreview} className="refresh-btn">
            🔄 {t("common.refresh", "Refresh")}
          </button>
        </div>
      </div>
      <div className="parts-section">
        <h3>{t("inventory.customId.parts", "ID PARTS (drag to reorder)")}</h3>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={parts.map((p) => p.id)}
            strategy={verticalListSortingStrategy}
          >
            {parts.map((part) => (
              <PartCard
                key={part.id}
                part={part}
                canEdit={canEdit}
                onDelete={setDeletePartId}
                onConfigChange={handleConfigChange}
              />
            ))}
          </SortableContext>
        </DndContext>
      </div>
      {canEdit && (
        <div className="add-parts-section">
          <h3>{t("inventory.customId.addParts", "ADD PARTS")}</h3>
          <div className="add-buttons">
            {Object.entries(PART_TYPE_CONFIG).map(([type, config]) => (
              <button
                key={type}
                onClick={() => handleAddPart(type as IdFormatPartType)}
                className="add-part-btn"
                style={{ borderColor: config.color }}
              >
                {config.label}
              </button>
            ))}
          </div>
        </div>
      )}
      {deletePartId && (
        <ConfirmModal
          isOpen={true}
          title={t("inventory.customId.confirmDelete", "Delete Part")}
          message={t(
            "inventory.customId.confirmDeleteMessage",
            "Are you sure you want to delete this part?",
          )}
          onConfirm={() => handleDeletePart(deletePartId)}
          onCancel={() => setDeletePartId(null)}
        />
      )}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .custom-id-tab {
          padding: 20px;
        }
        .preview-section {
          margin-bottom: 30px;
        }
        .preview-box {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px;
          border: 2px dashed var(--border);
          border-radius: var(--radius-md);
          background: var(--bg-secondary);
          font-family: "Courier New", monospace;
          font-size: 1.5rem;
          font-weight: 700;
        }
        .refresh-btn {
          background: var(--accent);
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: var(--radius-sm);
          cursor: pointer;
        }
        .refresh-btn:hover {
          background: var(--accent-hover);
        }
        .parts-section,
        .add-parts-section {
          margin-bottom: 20px;
        }
        .add-buttons {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
        }
        .add-part-btn {
          background: var(--bg-card);
          border: 2px solid;
          padding: 12px;
          border-radius: var(--radius-sm);
          cursor: pointer;
          transition: transform 0.15s ease;
        }
        .add-part-btn:hover {
          transform: scale(1.03);
        }
      `,
        }}
      />
    </div>
  );
};

export default CustomIdTab;
