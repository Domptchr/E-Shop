import { BadgeWithDot } from "@/components/base/badges/badges";
import { getStockStatus } from "@/utils/stock";

const config = {
    out: { color: "error", label: "สินค้าหมด" },
    low: { color: "warning", label: "ใกล้หมด" },
    ok: { color: "success", label: "มีสินค้า" },
} as const;

interface StockBadgeProps {
    availableQty: number;
    /** Hide the badge when stock is normal (used on product cards). */
    hideWhenOk?: boolean;
}

export const StockBadge = ({ availableQty, hideWhenOk = false }: StockBadgeProps) => {
    const status = getStockStatus(availableQty);
    if (status === "ok" && hideWhenOk) return null;

    const { color, label } = config[status];
    return (
        <BadgeWithDot type="pill-color" color={color} size="sm">
            {label}
        </BadgeWithDot>
    );
};
