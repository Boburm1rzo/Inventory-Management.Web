import axiosInstance from "./axiosInstance";
import type { LikeDto } from "../types";

export const likesApi = {
  getLikeStatus: async (itemId: number): Promise<LikeDto> => {
    const response = await axiosInstance.get<LikeDto>(`/items/${itemId}/likes`);
    return response.data;
  },

  toggleLike: async (itemId: number): Promise<LikeDto> => {
    const response = await axiosInstance.post<LikeDto>(`/items/${itemId}/likes`);
    return response.data;
  },
};
