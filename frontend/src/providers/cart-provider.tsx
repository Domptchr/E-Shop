"use client";

import { type PropsWithChildren, createContext, useCallback, useContext, useEffect, useState } from "react";
import { ApiError, api } from "@/lib/api";
import type { Cart, Order } from "@/types/api";

const CART_ID_KEY = "ecommerce.cartId";

interface CartContextValue {
    cart: Cart | null;
    isLoading: boolean;
    error: string | null;
    addItem: (productId: number, quantity: number) => Promise<Cart>;
    updateItem: (productId: number, quantity: number) => Promise<Cart>;
    removeItem: (productId: number) => Promise<Cart>;
    clear: () => Promise<Cart>;
    checkout: () => Promise<Order>;
    reload: () => Promise<void>;
}

const CartContext = createContext<CartContextValue | null>(null);

// Shared while a load is running, so overlapping calls (e.g. React StrictMode running effects twice) don't create two carts.
let pendingLoad: Promise<Cart> | null = null;

/** Loads the cart whose id is stored in localStorage, or creates a new one if it is missing or gone. */
function loadOrCreateCart(): Promise<Cart> {
    pendingLoad ??= (async () => {
        const storedId = localStorage.getItem(CART_ID_KEY);
        if (storedId) {
            try {
                return await api.getCart(storedId);
            } catch (error) {
                if (!(error instanceof ApiError) || error.status !== 404) throw error;
            }
        }
        const cart = await api.createCart();
        localStorage.setItem(CART_ID_KEY, cart.id);
        return cart;
    })().finally(() => {
        pendingLoad = null;
    });
    return pendingLoad;
}

export const CartProvider = ({ children }: PropsWithChildren) => {
    const [cart, setCart] = useState<Cart | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const reload = useCallback(async () => {
        setIsLoading(true);
        try {
            setCart(await loadOrCreateCart());
            setError(null);
        } catch (e) {
            setError(e instanceof Error ? e.message : "โหลดตะกร้าไม่สำเร็จ");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        void reload();
    }, [reload]);

    // Runs a cart mutation and stores the returned cart; errors propagate so pages can show them.
    const mutate = useCallback(
        async (action: (cartId: string) => Promise<Cart>) => {
            if (!cart) throw new Error("ตะกร้ายังไม่พร้อมใช้งาน");
            try {
                const updated = await action(cart.id);
                setCart(updated);
                return updated;
            } catch (e) {
                // Keep the UI in sync with the server even when the change was rejected.
                if (e instanceof ApiError && e.status === 404) await reload();
                else api.getCart(cart.id).then(setCart, () => {});
                throw e;
            }
        },
        [cart, reload],
    );

    const checkout = useCallback(async () => {
        if (!cart) throw new Error("ตะกร้ายังไม่พร้อมใช้งาน");
        const order = await api.checkout(cart.id);
        setCart(await api.getCart(cart.id));
        return order;
    }, [cart]);

    const value: CartContextValue = {
        cart,
        isLoading,
        error,
        addItem: (productId, quantity) => mutate((id) => api.addItem(id, productId, quantity)),
        updateItem: (productId, quantity) => mutate((id) => api.updateItem(id, productId, quantity)),
        removeItem: (productId) => mutate((id) => api.removeItem(id, productId)),
        clear: () => mutate((id) => api.clearCart(id)),
        checkout,
        reload,
    };

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) throw new Error("useCart must be used inside CartProvider");
    return context;
};
