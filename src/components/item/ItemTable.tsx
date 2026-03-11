import React from "react";
import { useTranslation } from "react-i18next";
import "../../styles/InventoryTable.css"; // Reuse similar styles
import type { ItemDto } from "../../types";

interface Props {
  items: ItemDto[];
  onRowClick: (item: ItemDto) => void;
}

const ItemTable: React.FC<Props> = ({ items, onRowClick }) => {
  const { t } = useTranslation();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (!items || items.length === 0) return null;

  return (
    <div className="inventory-table-wrapper">
      <table className="inventory-table w-100">
        <thead>
          <tr>
            <th>{t("items.columns.customId", "Custom ID")}</th>
            <th>{t("items.columns.tags", "Tags")}</th>
            <th>{t("items.columns.createdAt", "Created")}</th>
            <th>{t("items.columns.updatedAt", "Updated")}</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr
              key={item.id}
              onClick={() => onRowClick(item)}
              className="clickable-row"
            >
              <td>{item.customId}</td>
              <td>{item.tags?.join(", ") || ""}</td>
              <td>{formatDate(item.createdAt)}</td>
              <td>{formatDate(item.updatedAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ItemTable;
