import axiosInstance from "./axiosInstance";
import type {
  ItemDto,
  ItemListItemDto,
  CreateItemDto,
  UpdateItemDto,
  PagedResult,
} from "../types";

export const itemsApi = {
  getItems: async (
    inventoryId: number,
    page: number,
    size: number
  ): Promise<PagedResult<ItemListItemDto>> => {
    const response = await axiosInstance.get<PagedResult<ItemListItemDto>>(
      `/inventories/${inventoryId}/items?page=${page}&size=${size}`
    );
    return response.data;
  },

  getItem: async (inventoryId: number, itemId: number): Promise<ItemDto> => {
    const response = await axiosInstance.get<ItemDto>(
      `/inventories/${inventoryId}/items/${itemId}`
    );
    return response.data;
  },

  createItem: async (
    inventoryId: number,
    dto: CreateItemDto
  ): Promise<ItemDto> => {
    const response = await axiosInstance.post<ItemDto>(
      `/inventories/${inventoryId}/items`,
      dto
    );
    return response.data;
  },

  updateItem: async (
    inventoryId: number,
    itemId: number,
    dto: UpdateItemDto
  ): Promise<ItemDto> => {
    const response = await axiosInstance.put<ItemDto>(
      `/inventories/${inventoryId}/items/${itemId}`,
      dto
    );
    return response.data;
  },

  deleteItem: async (inventoryId: number, itemId: number): Promise<void> => {
    await axiosInstance.delete(`/inventories/${inventoryId}/items/${itemId}`);
  },
};
