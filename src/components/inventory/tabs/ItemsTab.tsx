import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { itemsApi } from "../../../api/items.api";
import type { ItemDto, PagedResult } from "../../../types";
import ItemTable from "../../item/ItemTable";
import Pagination from "../../../components/common/Pagination";
import LoadingSpinner from "../../../components/common/LoadingSpinner";
import ErrorAlert from "../../../components/common/ErrorAlert";

interface Props {
  inventoryId: number;
  canEdit: boolean;
}

const ItemsTab: React.FC<Props> = ({ inventoryId, canEdit }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [items, setItems] = useState<PagedResult<ItemDto> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    fetchItems(currentPage);
  }, [currentPage]);

  const fetchItems = async (page: number) => {
    try {
      setLoading(true);
      const data = await itemsApi.getItems(inventoryId, page, pageSize);
      setItems(data);
    } catch (err: any) {
      setError(err.message || "Network error");
    } finally {
      setLoading(false);
    }
  };

  const handleRowClick = (item: ItemDto) => {
    navigate(`/inventories/${inventoryId}/items/${item.id}`);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorAlert message={error} />;

  return (
    <div className="items-tab">
      {canEdit && (
        <div className="actions">
          <button
            onClick={() => navigate(`/inventories/${inventoryId}/items/new`)}
          >
            {t("items.createNew", "Create New Item")}
          </button>
        </div>
      )}

      {items && items.items.length > 0 ? (
        <>
          <ItemTable items={items.items} onRowClick={handleRowClick} />
          <Pagination
            page={items.page}
            totalPages={items.totalPages}
            onPageChange={handlePageChange}
          />
        </>
      ) : (
        <p>{t("items.noItems", "No items found.")}</p>
      )}
    </div>
  );
};

export default ItemsTab;
