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
