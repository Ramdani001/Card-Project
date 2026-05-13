export interface CreateUserParams {
  name: string;
  email: string;
  password: string;
  phone?: string;
  roleId?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  twitterUrl?: string;
  file?: File | null;
}

export interface UpdateUserParams {
  id: string;
  name?: string;
  email?: string;
  password?: string;
  phone?: string;
  roleId?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  twitterUrl?: string;
  file?: File | null;
}
