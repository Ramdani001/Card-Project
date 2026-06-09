import { RoleDto } from "./RoleDto";

export interface VoucherRoleDto {
  id: string;
  voucherId: string;
  roleId: string;
  role: RoleDto;
  createdAt: string | Date;
  updatedAt: string | Date;
}
