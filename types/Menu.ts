export interface Menu {
  id: string;
  label: string;
  url: string | null;
  icon: string | null;
  order: number;
  parentId: string | null;
  isActive: boolean;
  parent?: {
    id: string;
    label: string;
  } | null;
  subMenus?: Menu[];
}
