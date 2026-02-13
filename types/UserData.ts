import { Role } from "./Role";

export interface UserData {
  idUsr: number;
  email: string;
  role?: Role | null;
  createdAt: string;
}
