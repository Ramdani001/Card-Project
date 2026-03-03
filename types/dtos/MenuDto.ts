export interface MenuDto {
  id: string;
  label: string;
  url: string | null;
  icon: string | null;
  order: number;
  parentId: string | null;
  isDashboardMenu: boolean;
  parent?: {
    id: string;
    label: string;
  } | null;
  subMenus?: MenuDto[];
}
