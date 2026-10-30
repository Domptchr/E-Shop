export interface ApiResponse<T> {
    success: boolean;
    message?: string | null;
    data?: T | null;
    errors?: Record<string, string[]> | null;
}

export interface Product {
    id: number;
    productCode: string;
    productName: string;
    unitPrice: number;
    /** Physical quantity in the warehouse. */
    stockQty: number;
    /** Quantity held in shopping carts. */
    reservedQty: number;
    /** stockQty - reservedQty: what can still be added to a cart. */
    availableQty: number;
}

export interface CartItem {
    productId: number;
    productCode: string;
    productName: string;
    unitPrice: number;
    quantity: number;
    lineTotal: number;
    availableQty: number;
}

export interface Cart {
    id: string;
    items: CartItem[];
    totalQuantity: number;
    totalAmount: number;
}

export interface OrderItem {
    productId: number;
    productCode: string;
    productName: string;
    unitPrice: number;
    quantity: number;
    lineTotal: number;
}

export interface Order {
    id: number;
    orderNo: string;
    createdAt: string;
    items: OrderItem[];
    totalQuantity: number;
    totalAmount: number;
}
