import type { ApiResponse, Cart, Order, Product } from "@/types/api";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5100/api";

export class ApiError extends Error {
    constructor(
        message: string,
        public readonly status: number,
    ) {
        super(message);
    }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
    let response: Response;
    try {
        response = await fetch(`${BASE_URL}${path}`, {
            ...init,
            headers: { "Content-Type": "application/json", ...init?.headers },
            cache: "no-store",
        });
    } catch {
        throw new ApiError("ไม่สามารถเชื่อมต่อ API ได้ กรุณาตรวจสอบว่า Backend ทำงานอยู่", 0);
    }

    const body = (await response.json().catch(() => null)) as ApiResponse<T> | null;
    if (!response.ok || !body?.success) {
        const fieldError = body?.errors ? Object.values(body.errors).flat()[0] : undefined;
        throw new ApiError(fieldError ?? body?.message ?? "เกิดข้อผิดพลาด", response.status);
    }
    return body.data as T;
}

const json = (body: unknown) => JSON.stringify(body);

export const api = {
    getProducts: () => request<Product[]>("/products"),

    createCart: () => request<Cart>("/carts", { method: "POST" }),
    getCart: (cartId: string) => request<Cart>(`/carts/${cartId}`),
    addItem: (cartId: string, productId: number, quantity: number) =>
        request<Cart>(`/carts/${cartId}/items`, { method: "POST", body: json({ productId, quantity }) }),
    updateItem: (cartId: string, productId: number, quantity: number) =>
        request<Cart>(`/carts/${cartId}/items/${productId}`, { method: "PATCH", body: json({ quantity }) }),
    removeItem: (cartId: string, productId: number) => request<Cart>(`/carts/${cartId}/items/${productId}`, { method: "DELETE" }),
    clearCart: (cartId: string) => request<Cart>(`/carts/${cartId}/items`, { method: "DELETE" }),
    checkout: (cartId: string) => request<Order>(`/carts/${cartId}/checkout`, { method: "POST" }),

    getOrder: (id: number | string) => request<Order>(`/orders/${id}`),
};
