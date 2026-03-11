import axiosInstance from "./axiosInstance";
import type { AdminStatsDto, AdminUserDto, PagedResult } from "../types";

export const adminApi = {
  getAdminStats: async (): Promise<AdminStatsDto> => {
    const response = await axiosInstance.get<AdminStatsDto>("/admin/stats");
    return response.data;
  },

  getUsers: async (
    page: number,
    size: number,
    search?: string,
  ): Promise<PagedResult<AdminUserDto>> => {
    const response = await axiosInstance.get<PagedResult<AdminUserDto>>(
      `/admin/users?page=${page}&size=${size}${search ? `&search=${encodeURIComponent(search)}` : ""}`,
    );
    return response.data;
  },

  blockUser: async (userId: string): Promise<void> => {
    await axiosInstance.post(`/admin/users/${userId}/block`);
  },

  unblockUser: async (userId: string): Promise<void> => {
    await axiosInstance.post(`/admin/users/${userId}/unblock`);
  },

  deleteUser: async (userId: string): Promise<void> => {
    await axiosInstance.delete(`/admin/users/${userId}`);
  },
};
