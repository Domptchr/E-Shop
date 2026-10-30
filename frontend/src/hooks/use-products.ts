"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { Product } from "@/types/api";

export const useProducts = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const reload = useCallback(async () => {
        try {
            setProducts(await api.getProducts());
            setError(null);
        } catch (e) {
            setError(e instanceof Error ? e.message : "โหลดข้อมูลสินค้าไม่สำเร็จ");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        void reload();
    }, [reload]);

    return { products, isLoading, error, reload };
};
