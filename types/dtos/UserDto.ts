import { RoleDto } from "./RoleDto";

export interface UserDto {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  avatar: string | null;
  roleId: string | null;
  role: RoleDto;
  facebookUrl: string;
  instagramUrl: string;
  twitterUrl: string;
  createdAt: string;
}
