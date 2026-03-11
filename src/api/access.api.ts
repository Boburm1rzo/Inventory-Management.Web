import axiosInstance from "./axiosInstance";
import type { InventoryAccessDto, AddAccessDto, UserSearchDto } from "../types";

export const accessApi = {
  getAccessList: async (inventoryId: number): Promise<InventoryAccessDto[]> => {
    const response = await axiosInstance.get<InventoryAccessDto[]>(
      `/inventories/${inventoryId}/access`,
    );
    return response.data;
  },

  addAccess: async (inventoryId: number, dto: AddAccessDto): Promise<void> => {
    await axiosInstance.post(`/inventories/${inventoryId}/access`, dto);
  },

  removeAccess: async (inventoryId: number, userId: string): Promise<void> => {
    await axiosInstance.delete(`/inventories/${inventoryId}/access/${userId}`);
  },

  searchUsers: async (query: string): Promise<UserSearchDto[]> => {
    const response = await axiosInstance.get<UserSearchDto[]>(
      `/users/search?query=${encodeURIComponent(query)}`,
    );
    return response.data;
  },
};
