// ─── Auth ───────────────────────────────────────────────
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
}

// ─── Catalog ────────────────────────────────────────────
export interface Category {
  id: number;
  name: string;
}

export interface Product {
  id: number;
  code: string;
  title: string;
  variationType: string;
  description?: string | null;
  about?: string[];
  details?: Record<string, unknown> | null;
  isActive: boolean;
  merchantId: number;
  categoryId: number;
  category?: Category;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductRequest {
  title: string;
  code: string;
  description?: string;
  variationType?: string;
  categoryId: number;
}

// ─── Inventory ──────────────────────────────────────────
export interface ProductVariation {
  id: number;
  productId: number;
  product?: Product;
  sizeCode: string;
  colorName: string;
  imageUrls: string[];
  createdAt: string;
  updatedAt: string;
}

export interface InventoryItem {
  id: number;
  productVariationId: number;
  productVariation?: ProductVariation;
  countryCode: string;
  quantity: number;
  createdAt: string;
  updatedAt: string;
}

// ─── Toast ──────────────────────────────────────────────
export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}
