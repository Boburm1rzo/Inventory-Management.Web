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
  categoryName?: string;
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
  categoryName?: string;
  categoryId?: number;
  tags: string[];
  tagIds?: number[];
  createdAt: string;
  rowVersion: string;
}

export interface CreateInventoryDto {
  title: string;
  description: string;
  categoryId: number;
  imageUrl: string;
  isPublic: boolean;
  tags: string[];
}

export interface CategoryDto {
  id: number;
  name: string;
}

export interface TagDto {
  id: number;
  name: string;
}

export interface CustomFields {
  strings: string[]; // Up to 3 strings
  texts: string[]; // Up to 3 multiline texts
  numbers: number[]; // Up to 3 numbers
  links: string[]; // Up to 3 links
  booleans: boolean[]; // Up to 3 booleans
}

export interface ItemFieldValueDto {
  fieldId: number;
  fieldTitle: string;
  fieldType: FieldType;
  textValue?: string;
  numericValue?: number;
  booleanValue?: boolean;
}

export interface ItemDto {
  id: number;
  customId: string;
  createdAt: string;
  updatedAt: string;
  createdByName: string;
  fieldValues: ItemFieldValueDto[];
  rowVersion: string;
}

export interface ItemListItemDto {
  id: number;
  customId: string;
  createdAt: string;
  createdByName: string;
  fieldValues: ItemFieldValueDto[];
}

export interface CreateItemFieldValueDto {
  fieldId: number;
  textValue?: string;
  numericValue?: number;
  booleanValue?: boolean;
}

export interface CreateItemDto {
  fieldValues: CreateItemFieldValueDto[];
}

export interface UpdateItemDto {
  fieldValues: CreateItemFieldValueDto[];
  rowVersion: string;
}

export interface InventoryStatsDto {
  totalItems: number;
  totalLikes: number;
  itemsPerDay: { date: string; count: number }[];
}

export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
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

export interface InventoryAccessDto {
  userId: string;
  displayName: string;
  avatarUrl?: string;
  grantedAt: string;
}

export interface AddAccessDto {
  userId: string;
}

export interface UserSearchDto {
  id: string;
  displayName: string;
  email: string;
  avatarUrl?: string;
}

export interface PostDto {
  id: number;
  content: string;
  authorName: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface CreatePostDto {
  content: string;
}

export interface ItemSearchResultDto {
  itemId: number;
  customId: string;
  inventoryId: number;
  inventoryTitle: string;
  matchedFields: string[];
}

export interface SearchResultDto {
  inventories: InventoryListItemDto[];
  items: ItemSearchResultDto[];
}

export interface AdminUserDto {
  id: string;
  displayName: string;
  email: string;
  avatarUrl?: string;
  isBlocked: boolean;
  createdAt: string;
  inventoryCount: number;
  itemCount: number;
}

export interface AdminStatsDto {
  totalUsers: number;
  totalInventories: number;
  totalItems: number;
  topInventoriesByItems: InventoryListItemDto[];
  recentUsers: AdminUserDto[];
}

export interface PersonalStatsDto {
  totalInventories: number;
  totalItems: number;
  totalLikes: number;
  inventories: InventoryListItemDto[];
}

export interface LikeDto {
  itemId: number;
  likedByCurrentUser: boolean;
  totalLikes: number;
}
