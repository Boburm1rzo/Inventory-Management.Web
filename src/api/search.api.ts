import axiosInstance from "./axiosInstance";
import type { SearchResultDto } from "../types";

export const searchApi = {
  search: async (query: string): Promise<SearchResultDto> => {
    const response = await axiosInstance.get<SearchResultDto>(
      `/search?query=${encodeURIComponent(query)}`,
    );
    return response.data;
  },
};
