export interface Menu {
  idMenu: number;
  code: string;
  label: string;

  url: string | null;
  icon: string | null;
  order: number;

  parentCode: string | null;
  subMenus?: Menu[];

  createdAt: string;
  updatedAt: string;
}
