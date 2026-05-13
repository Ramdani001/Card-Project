export interface RegisterParams {
  email: string;
  password: string;
  name?: string;
  phone?: string;
  address?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  twitterUrl?: string;
  file?: File | null;
}

export interface UpdateProfileParams {
  userId: string;
  email?: string;
  name?: string;
  phone?: string;
  address?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  twitterUrl?: string;
  file?: File | null;
  password?: string;
}
