import axiosInstance from "./axiosInstance";
import type {
  InventoryListItemDto,
  InventoryDto,
  CreateInventoryDto,
  PagedResult,
  CategoryDto,
  TagDto,
} from "../types";

export const inventoriesApi = {
  getInventories: async (
    page: number,
    size: number,
  ): Promise<PagedResult<InventoryListItemDto>> => {
    const response = await axiosInstance.get<PagedResult<InventoryListItemDto>>(
      `/inventories?page=${page}&size=${size}`,
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

  getLatestInventories: async (): Promise<InventoryListItemDto[]> => {
    const response = await axiosInstance.get<PagedResult<InventoryListItemDto>>(
      `/inventories?page=1&size=6`,
    );
    return response.data?.items || [];
  },

  getTopInventories: async (): Promise<InventoryListItemDto[]> => {
    const response = await axiosInstance.get<PagedResult<InventoryListItemDto>>(
      `/inventories?page=1&size=5&sort=itemCount`,
    );
    return response.data?.items || [];
  },

  getInventoryById: async (id: number): Promise<InventoryDto> => {
    const response = await axiosInstance.get<InventoryDto>(
      `/inventories/${id}`,
    );
    return response.data;
  },

  createInventory: async (dto: CreateInventoryDto): Promise<InventoryDto> => {
    const response = await axiosInstance.post<InventoryDto>(
      "/inventories",
      dto,
    );
    return response.data;
  },

  getCategories: async (): Promise<CategoryDto[]> => {
    const response = await axiosInstance.get<CategoryDto[]>("/categories");
    return response.data;
  },

  getTags: async (): Promise<TagDto[]> => {
    const response = await axiosInstance.get<TagDto[]>("/tags");
    return response.data;
  },

  updateInventory: async (
    id: number,
    dto: Partial<CreateInventoryDto> & { rowVersion: string },
  ): Promise<InventoryDto> => {
    const response = await axiosInstance.put<InventoryDto>(
      `/inventories/${id}`,
      dto,
    );
    return response.data;
  },

  deleteInventory: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/inventories/${id}`);
  },
};
