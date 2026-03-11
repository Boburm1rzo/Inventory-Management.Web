import axiosInstance from "./axiosInstance";
import type { PersonalStatsDto } from "../types";

export const personalApi = {
  getMyStats: async (): Promise<PersonalStatsDto> => {
    const response = await axiosInstance.get<PersonalStatsDto>("/me/stats");
    return response.data;
  },
};
