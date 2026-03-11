import axiosInstance from "./axiosInstance";
import type {
  ItemDto,
  Item,
  CreateItemDto,
  UpdateItemDto,
  PagedResult,
} from "../types";

export const itemsApi = {
  getItems: async (
    inventoryId: number,
    page: number,
    size: number,
  ): Promise<PagedResult<ItemDto>> => {
    const response = await axiosInstance.get<PagedResult<ItemDto>>(
      `/inventories/${inventoryId}/items?page=${page}&size=${size}`,
    );
    return (
      response.data || {
        items: [],
        totalCount: 0,
        page,
        pageSize: size,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false,
      }
    );
  },

  getItemById: async (inventoryId: number, itemId: number): Promise<Item> => {
    const response = await axiosInstance.get<Item>(
      `/inventories/${inventoryId}/items/${itemId}`,
    );
    return response.data;
  },

  createItem: async (
    inventoryId: number,
    data: CreateItemDto,
  ): Promise<Item> => {
    const response = await axiosInstance.post<Item>(
      `/inventories/${inventoryId}/items`,
      data,
    );
    return response.data;
  },

  updateItem: async (
    inventoryId: number,
    itemId: number,
    data: UpdateItemDto,
  ): Promise<Item> => {
    const response = await axiosInstance.put<Item>(
      `/inventories/${inventoryId}/items/${itemId}`,
      data,
    );
    return response.data;
  },

  deleteItem: async (inventoryId: number, itemId: number): Promise<void> => {
    await axiosInstance.delete(`/inventories/${inventoryId}/items/${itemId}`);
  },
};
