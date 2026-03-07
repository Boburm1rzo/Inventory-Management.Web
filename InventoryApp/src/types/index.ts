export interface AuthResponseDto {
  token: string;
  displayName: string;
  email: string;
}

export interface UserResponseDto {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  roles: string[];
}

export interface InventoryListItemDto {
  id: number;
  title: string;
  category?: string;
  ownerName: string;
  createdAt: string;
  itemCount?: number;
}

export interface InventoryDto {
  id: number;
  title: string;
  description?: string;
  imageUrl?: string;
  isPublic: boolean;
  ownerName: string;
  ownerId: string;
  category?: string;
  tags: string[];
  createdAt: string;
  rowVersion: string;
}

export interface CreateInventoryDto {
  title: string;
  description?: string;
  isPublic: boolean;
  imageUrl?: string;
  categoryId?: number;
  tags: string[];
}

export interface CategoryDto {
  id: number;
  name: string;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// Field types enum
export type FieldType =
  | "SingleLineText"
  | "MultiLineText"
  | "Numeric"
  | "Link"
  | "Boolean";

// IdFormat part types enum
export type IdFormatPartType =
  | "FixedText"
  | "Sequence"
  | "Random6Digit"
  | "Random9Digit"
  | "Guid"
  | "DateTime";

export interface InventoryFieldDto {
  id: number;
  title: string;
  description?: string;
  type: FieldType;
  displayInTable: boolean;
  order: number;
}

export interface CreateInventoryFieldDto {
  title: string;
  description?: string;
  type: FieldType;
  displayInTable: boolean;
}

export interface UpdateInventoryFieldDto {
  title: string;
  description?: string;
  displayInTable: boolean;
}

export interface ReorderFieldsDto {
  orderedIds: number[];
}

export interface InventoryIdFormatPartDto {
  id: number;
  type: IdFormatPartType;
  order: number;
  config?: string;
}

export interface CreateIdFormatPartDto {
  type: IdFormatPartType;
  config?: string;
}

export interface ReorderIdFormatPartsDto {
  orderedIds: number[];
}
