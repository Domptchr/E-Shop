"use client";

import { useMemo } from "react";
import { FilterLines } from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";
import { PageState } from "@/components/page-state";
import { ProductCard } from "@/components/product-card";
import { ProductFilters } from "@/components/product-filters";
import { type FilterDefinition, useProductFilter } from "@/hooks/use-product-filter";
import { useProducts } from "@/hooks/use-products";
import { useCart } from "@/providers/cart-provider";
import { useToast } from "@/providers/toast-provider";
import type { Product } from "@/types/api";
import { formatNumber } from "@/utils/format";
import { getStockStatus } from "@/utils/stock";

type ShopFilter = "all" | "available" | "low" | "out";

const filters: FilterDefinition<ShopFilter>[] = [
    { id: "all", label: "ทั้งหมด", predicate: () => true },
    { id: "available", label: "พร้อมขาย", predicate: (p) => p.availableQty > 0 },
    { id: "low", label: "ใกล้หมด", predicate: (p) => getStockStatus(p.availableQty) === "low" },
    { id: "out", label: "สินค้าหมด", predicate: (p) => getStockStatus(p.availableQty) === "out" },
];

export default function ShopPage() {
    const { products, isLoading, error, reload } = useProducts();
    const { cart, addItem } = useCart();
    const { showToast } = useToast();

    const inCart = useMemo(() => new Map(cart?.items.map((i) => [i.productId, i.quantity]) ?? []), [cart]);
    const { query, setQuery, filter, setFilter, reset, filtered, options } = useProductFilter(products, filters);

    const handleAdd = async (product: Product, quantity: number) => {
        try {
            await addItem(product.id, quantity);
            showToast("success", "เพิ่มสินค้าลงตะกร้าแล้ว", `${product.productName} จำนวน ${formatNumber(quantity)} ชิ้น`);
            return true;
        } catch (e) {
            showToast("error", "ไม่สามารถเพิ่มสินค้าลงตะกร้าได้", e instanceof Error ? e.message : undefined);
            return false;
        } finally {
            // Stock may have changed (ours or someone else's reservation), so refresh availability.
            await reload();
        }
    };

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-1">
                <h1 className="text-display-xs font-semibold text-primary">เลือกซื้อสินค้า</h1>
                <p className="text-md text-tertiary">เลือกสินค้าและจำนวนที่ต้องการ แล้วกดเพิ่มลงตะกร้า</p>
            </div>

            <PageState isLoading={isLoading} error={error} onRetry={reload} isEmpty={products.length === 0} emptyText="ยังไม่มีสินค้าในระบบ">
                <ProductFilters
                    query={query}
                    onQueryChange={setQuery}
                    options={options}
                    filter={filter}
                    onFilterChange={setFilter}
                    shownCount={filtered.length}
                    totalCount={products.length}
                />

                <PageState
                    isLoading={false}
                    error={null}
                    isEmpty={filtered.length === 0}
                    emptyText="ไม่พบสินค้าที่ตรงกับเงื่อนไข"
                    emptyAction={
                        <Button color="secondary" iconLeading={FilterLines} onPress={reset}>
                            ล้างตัวกรอง
                        </Button>
                    }
                >
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {filtered.map((product) => (
                            <ProductCard key={product.id} product={product} inCartQty={inCart.get(product.id) ?? 0} query={query} onAdd={handleAdd} />
                        ))}
                    </div>
                </PageState>
            </PageState>
        </div>
    );
}
