export type UserRole = 'visitor' | 'user' | 'admin';

export interface User {
  id: number;
  username: string;
  email: string;
  password_hash: string;
  role: UserRole;
  avatar: string | null;
  bio: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserPublic {
  id: number;
  username: string;
  email: string;
  role: UserRole;
  avatar: string | null;
  bio: string | null;
  created_at: string;
}

export type PhotoVisibility = 'public' | 'private';
export type LayoutMode = 'grid' | 'masonry';

export interface Photo {
  id: number;
  user_id: number;
  filename: string;
  title: string;
  description: string | null;
  category: string;
  tags: string;
  visibility: PhotoVisibility;
  width: number;
  height: number;
  file_size: number;
  created_at: string;
  updated_at: string;
  username?: string;
}

export interface PhotoWithUser extends Photo {
  username: string;
}

export interface PhotoUploadData {
  title?: string;
  description?: string;
  category?: string;
  tags?: string;
  visibility?: PhotoVisibility;
}

export interface PhotoQuery {
  category?: string;
  tag?: string;
  search?: string;
  visibility?: PhotoVisibility;
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface Setting {
  id: number;
  key: string;
  value: string | null;
  updated_at: string;
}

export interface DashboardStats {
  totalPhotos: number;
  publicPhotos: number;
  privatePhotos: number;
  categoriesCount: number;
  totalSize: number;
}
