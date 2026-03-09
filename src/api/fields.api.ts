import axiosInstance from "./axiosInstance";
import type {
  InventoryFieldDto,
  CreateInventoryFieldDto,
  UpdateInventoryFieldDto,
  ReorderFieldsDto,
} from "../types";

export const getFields = async (
  inventoryId: number,
): Promise<InventoryFieldDto[]> => {
  const response = await axiosInstance.get(
    `/inventories/${inventoryId}/fields`,
  );
  return response.data || [];
};

export const addField = async (
  inventoryId: number,
  dto: CreateInventoryFieldDto,
): Promise<InventoryFieldDto> => {
  const response = await axiosInstance.post(
    `/inventories/${inventoryId}/fields`,
    dto,
  );
  return response.data;
};

export const updateField = async (
  inventoryId: number,
  fieldId: number,
  dto: UpdateInventoryFieldDto,
): Promise<InventoryFieldDto> => {
  const response = await axiosInstance.put(
    `/inventories/${inventoryId}/fields/${fieldId}`,
    dto,
  );
  return response.data;
};

export const deleteField = async (
  inventoryId: number,
  fieldId: number,
): Promise<void> => {
  await axiosInstance.delete(`/inventories/${inventoryId}/fields/${fieldId}`);
};

export const reorderFields = async (
  inventoryId: number,
  dto: ReorderFieldsDto,
): Promise<void> => {
  await axiosInstance.put(`/inventories/${inventoryId}/fields/reorder`, dto);
};
