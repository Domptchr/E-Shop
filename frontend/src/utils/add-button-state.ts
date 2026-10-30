import type { Product } from "@/types/api";
import { formatNumber } from "@/utils/format";

export type AddButtonKind = "added" | "out-of-stock" | "max-reached" | "invalid" | "dirty" | "in-cart" | "default";

export interface AddButtonState {
    kind: AddButtonKind;
    /** Button text; empty for "out-of-stock" where no button is rendered. */
    label: string;
    color: "primary" | "tonal";
    isDisabled: boolean;
    /** Show a check icon instead of the cart icon. */
    showCheck: boolean;
    /** Extra classes, e.g. the system grey for disabled states instead of a faded brand colour. */
    className?: string;
}

/** Quantity the stepper starts at; any other value means the shopper changed it but hasn't added yet. */
export const DEFAULT_ADD_QTY = 1;

const disabledGrey =
    "disabled:opacity-100 disabled:bg-tertiary disabled:text-quaternary disabled:shadow-none disabled:ring-0 disabled:*:data-icon:text-fg-quaternary";

/**
 * Decides how the product card's add-to-cart button looks.
 * `product.availableQty` already excludes every cart's reservation (including ours),
 * so "max reached" means nothing more can be reserved while this product is in our cart.
 */
export const getAddButtonState = (product: Product, qty: number, cartQty: number, phase: "idle" | "added" = "idle"): AddButtonState => {
    const inCart = cartQty > 0;
    const idleLabel = inCart ? "เพิ่มอีก" : "เพิ่มลงตะกร้า";

    if (phase === "added") return { kind: "added", label: "เพิ่มแล้ว", color: "tonal", isDisabled: true, showCheck: true, className: "disabled:opacity-100" };

    if (product.availableQty <= 0) {
        return inCart
            ? { kind: "max-reached", label: "ครบจำนวนแล้ว", color: "tonal", isDisabled: true, showCheck: false, className: disabledGrey }
            : { kind: "out-of-stock", label: "", color: "tonal", isDisabled: true, showCheck: false };
    }

    if (Number.isNaN(qty) || qty < 1 || qty > product.availableQty) {
        return { kind: "invalid", label: idleLabel, color: "tonal", isDisabled: true, showCheck: false, className: disabledGrey };
    }

    if (qty !== DEFAULT_ADD_QTY) return { kind: "dirty", label: `${idleLabel} (${formatNumber(qty)})`, color: "primary", isDisabled: false, showCheck: false };

    return { kind: inCart ? "in-cart" : "default", label: idleLabel, color: "tonal", isDisabled: false, showCheck: false };
};
