import { ObjectId } from 'mongodb';

export interface GalleryImage {
  _id?: ObjectId;
  title: string;
  description?: string;
  cloudinaryId: string;
  cloudinaryUrl: string;
  publicId: string;
  format: string;
  width: number;
  height: number;
  bytes: number;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  uploadedBy?: string;
  isPublic: boolean;
}

export interface CreateImageRequest {
  title: string;
  description?: string;
  tags?: string[];
  isPublic?: boolean;
}

export interface UpdateImageRequest {
  title?: string;
  description?: string;
  tags?: string[];
  isPublic?: boolean;
}

export interface CloudinaryUploadResult {
  public_id: string;
  version: number;
  signature: string;
  width: number;
  height: number;
  format: string;
  resource_type: string;
  created_at: string;
  tags: string[];
  bytes: number;
  type: string;
  etag: string;
  placeholder: boolean;
  url: string;
  secure_url: string;
  access_mode: string;
  original_filename: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'updatedAt' | 'title';
  sortOrder?: 'asc' | 'desc';
  tags?: string;
  isPublic?: boolean;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface DatabaseStats {
  totalImages: number;
  publicImages: number;
  privateImages: number;
  totalSize: number;
  averageSize: number;
}

export interface SyncStatus {
  inSync: boolean;
  mongoCount: number;
  cloudinaryCount: number;
  discrepancies: string[];
}