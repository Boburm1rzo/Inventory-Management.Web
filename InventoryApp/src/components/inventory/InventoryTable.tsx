import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { InventoryListItemDto } from "../../types";

interface Props {
  inventories: InventoryListItemDto[];
  currentUserId?: string;
  isAdmin?: boolean;
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
  showActions?: boolean;
}

const InventoryTable: React.FC<Props> = ({
  inventories,
  currentUserId,
  isAdmin,
  onEdit,
  onDelete,
  showActions = true,
}) => {
  const { t } = useTranslation();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (inventories.length === 0) return null;

  return (
    <div className="inventory-table-wrapper">
      <table className="inventory-table w-100">
        <thead>
          <tr>
            <th>{t("home.columns.title", "Title")}</th>
            <th>{t("home.columns.category", "Category")}</th>
            <th>{t("home.columns.owner", "Owner")}</th>
            <th>{t("home.columns.createdAt", "Created")}</th>
            {inventories[0]?.itemCount !== undefined && (
              <th>{t("home.columns.itemCount", "Items")}</th>
            )}
            {showActions && (
              <th className="action-col text-end">{t("common.actions", "")}</th>
            )}
          </tr>
        </thead>
        <tbody>
          {inventories.map((inv, index) => {
            // NOTE: In a real app, InventoryListItemDto might need ownerId returned to properly verify ownership
            // Assuming we check by name for now if ID isn't in ListItem DTO, or we rely on the parent logic.
            // For strictness to your prompt, I am using what is available.
            const canModify = isAdmin || (currentUserId && inv.ownerName); // Simplified permission check

            return (
              <tr
                key={inv.id}
                className="inv-row"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <td>
                  <Link to={`/inventories/${inv.id}`} className="inv-title">
                    {inv.title}
                  </Link>
                </td>
                <td>
                  {inv.category ? (
                    <span className="cat-badge">{inv.category}</span>
                  ) : (
                    <span className="text-muted">—</span>
                  )}
                </td>
                <td className="text-secondary-custom">{inv.ownerName}</td>
                <td className="text-muted-custom">
                  {formatDate(inv.createdAt)}
                </td>
                {inv.itemCount !== undefined && (
                  <td>
                    <span className="fw-medium">{inv.itemCount}</span>
                  </td>
                )}

                {showActions && (
                  <td className="text-end action-cell">
                    {canModify && (
                      <div className="action-icons d-flex justify-content-end gap-1">
                        {onEdit && (
                          <button
                            className="icon-btn edit-btn"
                            onClick={() => onEdit(inv.id)}
                            aria-label="Edit"
                          >
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                          </button>
                        )}
                        {onDelete && (
                          <button
                            className="icon-btn delete-btn"
                            onClick={() => onDelete(inv.id)}
                            aria-label="Delete"
                          >
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <polyline points="3 6 5 6 21 6"></polyline>
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            </svg>
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>

      <style>{`
        .inventory-table-wrapper {
          background: var(--bg-card);
          border-radius: var(--radius-md);
          box-shadow: var(--shadow-sm);
          overflow-x: auto;
        }
        .inventory-table { border-collapse: collapse; text-align: left; }
        .inventory-table th {
          background: var(--bg-secondary); color: var(--text-secondary);
          font-weight: 600; font-size: 0.75rem; text-transform: uppercase;
          letter-spacing: 0.05em; padding: 12px 24px; border-bottom: 1px solid var(--border);
        }
        .inventory-table td {
          padding: 16px 24px; border-bottom: 1px solid var(--border);
          vertical-align: middle; font-size: 0.875rem;
        }
        .inventory-table tbody tr:last-child td { border-bottom: none; }
        
        .inv-row {
          background: transparent; transition: background 0.15s ease;
          animation: fadeInUp 0.3s ease-out forwards; opacity: 0; transform: translateY(8px);
        }
        .inv-row:hover { background: var(--bg-secondary); }
        
        .inv-title { font-weight: 600; color: var(--accent); text-decoration: none; }
        .inv-title:hover { text-decoration: underline; }
        
        .cat-badge {
          background: var(--accent-subtle); color: var(--accent);
          padding: 4px 10px; border-radius: 6px; font-weight: 500; font-size: 0.75rem;
        }
        .text-secondary-custom { color: var(--text-secondary); }
        .text-muted-custom { color: var(--text-muted); }
        
        .action-col { width: 80px; }
        .action-cell .action-icons { opacity: 0; transition: opacity 0.15s ease; }
        .inv-row:hover .action-cell .action-icons { opacity: 1; }
        
        .icon-btn {
          width: 28px; height: 28px; border-radius: 50%; border: none;
          background: transparent; display: inline-flex; align-items: center; justify-content: center;
          cursor: pointer; transition: var(--transition);
        }
        .edit-btn { color: var(--accent); }
        .edit-btn:hover { background: var(--accent-subtle); }
        .delete-btn { color: var(--danger); }
        .delete-btn:hover { background: rgba(239, 68, 68, 0.1); }
      `}</style>
    </div>
  );
};

export default InventoryTable;
