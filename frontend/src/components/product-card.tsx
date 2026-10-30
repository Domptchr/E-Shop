"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Check, PackageX, ShoppingCart01 } from "@untitledui/icons";
import { Badge } from "@/components/base/badges/badges";
import { Button } from "@/components/base/buttons/button";
import { InputNumber } from "@/components/base/input/input-number";
import { HighlightText } from "@/components/highlight-text";
import { StockBadge } from "@/components/stock-badge";
import type { Product } from "@/types/api";
import { DEFAULT_ADD_QTY, getAddButtonState } from "@/utils/add-button-state";
import { cx } from "@/utils/cx";
import { formatNumber, formatPrice } from "@/utils/format";
import { getStockStatus } from "@/utils/stock";

/** How long the "เพิ่มแล้ว" confirmation stays on the button. */
const ADDED_FEEDBACK_MS = 1500;

interface ProductCardProps {
    product: Product;
    /** Quantity of this product already in the shopper's cart. */
    inCartQty: number;
    /** Current search text; matching parts of the name are highlighted. */
    query: string;
    /** Resolves to true when the item was added, false when it failed (the caller shows the error). */
    onAdd: (product: Product, quantity: number) => Promise<boolean>;
}

export const ProductCard = ({ product, inCartQty, query, onAdd }: ProductCardProps) => {
    const [quantity, setQuantity] = useState(DEFAULT_ADD_QTY);
    const [isAdding, setIsAdding] = useState(false);
    const [phase, setPhase] = useState<"idle" | "added">("idle");

    useEffect(() => {
        if (phase !== "added") return;
        const timer = setTimeout(() => setPhase("idle"), ADDED_FEEDBACK_MS);
        return () => clearTimeout(timer);
    }, [phase]);

    const button = getAddButtonState(product, quantity, inCartQty, phase);
    const status = getStockStatus(product.availableQty);
    const isSoldOut = button.kind === "out-of-stock";
    const isMaxReached = button.kind === "max-reached";
    const isInCart = inCartQty > 0;
    const isInvalidQty = Number.isNaN(quantity) || quantity < 1;
    const exceedsStock = !isMaxReached && quantity > product.availableQty;

    const handleAdd = async () => {
        setIsAdding(true);
        try {
            if (await onAdd(product, quantity)) {
                setQuantity(DEFAULT_ADD_QTY);
                setPhase("added");
            }
        } finally {
            setIsAdding(false);
        }
    };

    return (
        <div
            className={cx(
                "flex flex-col gap-4 rounded-xl bg-primary p-5 shadow-xs ring-1 ring-secondary transition duration-100 ease-linear",
                isInCart && "ring-2 ring-brand",
                isSoldOut && "opacity-60",
            )}
        >
            <div className="flex min-h-6 items-start justify-between gap-3">
                <span className="font-mono text-xs text-tertiary">
                    <HighlightText text={product.productCode} query={query} />
                </span>
                <div className="flex flex-wrap justify-end gap-1.5">
                    {isInCart && (
                        <Badge type="pill-color" color="brand" size="sm">
                            ในตะกร้า {formatNumber(inCartQty)}
                        </Badge>
                    )}
                    <StockBadge availableQty={product.availableQty} hideWhenOk />
                </div>
            </div>

            <div className="flex flex-1 flex-col gap-2">
                <h3 className="text-lg font-semibold text-primary">
                    <HighlightText text={product.productName} query={query} />
                </h3>
                <p className="flex items-baseline gap-1">
                    <span className="text-display-xs font-semibold text-primary">{formatPrice(product.unitPrice)}</span>
                    <span className="text-sm text-tertiary">/ชิ้น</span>
                </p>
            </div>

            {isSoldOut ? (
                <div className="flex items-center justify-center gap-2 rounded-lg bg-secondary px-4 py-3 text-sm font-medium text-tertiary">
                    <PackageX className="size-5 text-fg-quaternary" aria-hidden="true" />
                    สินค้าหมด
                </div>
            ) : (
                <div className="flex flex-col gap-3">
                    <div className="flex flex-col gap-1.5">
                        <InputNumber
                            aria-label={`จำนวน ${product.productName}`}
                            size="md"
                            orientation="horizontal"
                            minValue={1}
                            value={quantity}
                            onChange={setQuantity}
                            isDisabled={isMaxReached}
                            isInvalid={exceedsStock || isInvalidQty}
                        />
                        {isMaxReached ? (
                            <p className="text-sm text-tertiary">เพิ่มสินค้านี้ลงตะกร้าครบตามจำนวนที่มีแล้ว</p>
                        ) : exceedsStock ? (
                            <p className="text-sm text-error-primary">สินค้าคงเหลือไม่เพียงพอ (เหลือ {formatNumber(product.availableQty)} ชิ้น)</p>
                        ) : isInvalidQty ? (
                            <p className="text-sm text-error-primary">กรุณาระบุจำนวนอย่างน้อย 1 ชิ้น</p>
                        ) : status === "low" ? (
                            <p className="flex items-center gap-1 text-sm font-medium text-warning-primary">
                                <AlertTriangle className="size-4" aria-hidden="true" />
                                เหลือ {formatNumber(product.availableQty)} ชิ้น
                            </p>
                        ) : (
                            <p className="text-sm text-tertiary">พร้อมขาย {formatNumber(product.availableQty)} ชิ้น</p>
                        )}
                    </div>
                    <Button
                        size="md"
                        color={button.color}
                        iconLeading={button.showCheck ? Check : ShoppingCart01}
                        isDisabled={button.isDisabled}
                        isLoading={isAdding}
                        showTextWhileLoading
                        onPress={handleAdd}
                        className={button.className}
                    >
                        {button.label}
                    </Button>
                </div>
            )}
        </div>
    );
};
