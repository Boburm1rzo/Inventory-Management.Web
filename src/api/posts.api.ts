import axiosInstance from "./axiosInstance";
import type { PostDto, CreatePostDto } from "../types";

export const postsApi = {
  getPosts: async (inventoryId: number): Promise<PostDto[]> => {
    const response = await axiosInstance.get<PostDto[]>(
      `/inventories/${inventoryId}/posts`,
    );
    return response.data;
  },

  createPost: async (
    inventoryId: number,
    dto: CreatePostDto,
  ): Promise<PostDto> => {
    const response = await axiosInstance.post<PostDto>(
      `/inventories/${inventoryId}/posts`,
      dto,
    );
    return response.data;
  },

  deletePost: async (inventoryId: number, postId: number): Promise<void> => {
    await axiosInstance.delete(`/inventories/${inventoryId}/posts/${postId}`);
  },
};
