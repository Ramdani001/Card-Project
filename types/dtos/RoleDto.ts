import { CategoryCardDto } from "./CategoryCardDto";
import { MenuDto } from "./MenuDto";

export interface ApiPermissionStateDto {
  url: string;
  description?: string;
  canRead: boolean;
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
}

export interface RoleDto {
  id: string;
  name: string;
  createdAt: string;
  cardCategoryRoleAccesses?: {
    categoryId: string;
    category?: CategoryCardDto;
  }[];
  roleMenuAccesses?: {
    menuId: string;
    menu?: MenuDto;
  }[];
  roleApiAccesses?: {
    canRead: boolean;
    canCreate: boolean;
    canUpdate: boolean;
    canDelete: boolean;
    apiEndpoints: { url: string; description?: string };
  }[];
  _count?: {
    users: number;
  };
}
