export interface LogItemDto {
  id: string;
  status: string;
  note: string;
  createdBy: string;
  createdAt: string;
  user?: {
    name: string;
    email: string;
    role: string;
  } | null;
}
