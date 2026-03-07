import axiosInstance from "./axiosInstance";
import type {
  InventoryIdFormatPartDto,
  CreateIdFormatPartDto,
  ReorderIdFormatPartsDto,
} from "../types";

export const getIdFormatParts = async (
  inventoryId: number,
): Promise<InventoryIdFormatPartDto[]> => {
  const response = await axiosInstance.get(
    `/inventories/${inventoryId}/id-format`,
  );
  return response.data;
};

export const addIdFormatPart = async (
  inventoryId: number,
  dto: CreateIdFormatPartDto,
): Promise<InventoryIdFormatPartDto> => {
  const response = await axiosInstance.post(
    `/inventories/${inventoryId}/id-format`,
    dto,
  );
  return response.data;
};

export const deleteIdFormatPart = async (
  inventoryId: number,
  partId: number,
): Promise<void> => {
  await axiosInstance.delete(`/inventories/${inventoryId}/id-format/${partId}`);
};

export const reorderIdFormatParts = async (
  inventoryId: number,
  dto: ReorderIdFormatPartsDto,
): Promise<void> => {
  await axiosInstance.put(`/inventories/${inventoryId}/id-format/reorder`, dto);
};

export const previewId = async (inventoryId: number): Promise<string> => {
  const response = await axiosInstance.get(
    `/inventories/${inventoryId}/id-format/preview`,
  );
  return response.data;
};
