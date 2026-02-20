import { CategoryCard } from "./CategoryCard";
import { Menu } from "./Menu";

export interface ApiPermissionState {
  url: string;
  description?: string;
  canRead: boolean;
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
}

export interface Role {
  id: string;
  name: string;
  createdAt: string;
  cardCategoryRoleAccesses?: {
    categoryId: string;
    category?: CategoryCard;
  }[];
  roleMenuAccesses?: {
    menuId: string;
    menu?: Menu;
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
