import type {
    LoginRequest,
    LoginResponse,
    Product,
    CreateProductRequest,
    InventoryItem,
} from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// ─── Generic fetch wrapper ─────────────────────────────
async function apiFetch<T>(
    endpoint: string,
    options: RequestInit = {},
): Promise<T> {
    const token =
        typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string>),
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
    });

    if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || `API Error: ${res.status}`);
    }

    // Handle 204 No Content
    if (res.status === 204) return {} as T;

    return res.json();
}

// ─── Auth ───────────────────────────────────────────────
export const authApi = {
    login: (data: LoginRequest) =>
        apiFetch<LoginResponse>('/auth/login', {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    register: (data: LoginRequest) =>
        apiFetch<{ message: string }>('/auth/register', {
            method: 'POST',
            body: JSON.stringify(data),
        }),
};

// ─── Catalog ────────────────────────────────────────────
export const catalogApi = {
    getAll: () => apiFetch<Product[]>('/products'),

    getOne: (id: number) => apiFetch<Product>(`/products/${id}`),

    create: (data: CreateProductRequest) =>
        apiFetch<Product>('/products', {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    delete: (id: number) =>
        apiFetch<void>(`/products/${id}`, { method: 'DELETE' }),
};

// ─── Inventory ──────────────────────────────────────────
export const inventoryApi = {
    getAll: () => apiFetch<InventoryItem[]>('/inventory'),

    getByVariation: (productVariationId: number) =>
        apiFetch<InventoryItem>(`/inventory/${productVariationId}`),

    updateStock: (id: number, quantity: number) =>
        apiFetch<InventoryItem>(`/inventory/${id}/stock`, {
            method: 'PATCH',
            body: JSON.stringify({ quantity }),
        }),
};
