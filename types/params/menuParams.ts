export interface CreateMenuParams {
  label: string;
  url?: string;
  icon?: string;
  order?: number;
  parentId?: string | null;
  isDashboardMenu: boolean;
}

export interface UpdateMenuParams {
  id: string;
  label?: string;
  url?: string;
  icon?: string;
  order?: number;
  parentId?: string | null;
  isDashboardMenu: boolean;
}