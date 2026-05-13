export interface ApiAccessInput {
  url: string;
  description?: string;
  canRead: boolean;
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
}

export interface CreateRoleParams {
  name: string;
  canAccessDashboard: boolean;
  categoryIds?: string[];
  menuIds?: string[];
  apiAccesses?: ApiAccessInput[];
}

export interface UpdateRoleParams {
  id: string;
  name?: string;
  canAccessDashboard: boolean;
  categoryIds?: string[];
  menuIds?: string[];
  apiAccesses?: ApiAccessInput[];
}
