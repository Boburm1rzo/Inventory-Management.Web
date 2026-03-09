import axiosInstance from "./axiosInstance";
import type { AuthResponseDto, UserResponseDto } from "../types";

export const authApi = {
  register: async (data: Record<string, string>): Promise<AuthResponseDto> => {
    const response = await axiosInstance.post<AuthResponseDto>(
      "/auth/register",
      data,
    );
    return response.data;
  },

  login: async (data: Record<string, string>): Promise<AuthResponseDto> => {
    const response = await axiosInstance.post<AuthResponseDto>(
      "/auth/login",
      data,
    );
    return response.data;
  },

  getMe: async (): Promise<UserResponseDto> => {
    const response = await axiosInstance.get<UserResponseDto>("/auth/me");
    return response.data;
  },
};
