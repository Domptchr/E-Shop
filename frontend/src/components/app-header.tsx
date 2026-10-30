"use client";

import { Package, ShoppingBag03, ShoppingCart01 } from "@untitledui/icons";
import { usePathname } from "next/navigation";
import { AppLogo } from "@/components/app-logo";
import { Button } from "@/components/base/buttons/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { useCart } from "@/providers/cart-provider";
import { cx } from "@/utils/cx";

const navItems = [
    { label: "เลือกซื้อสินค้า", href: "/", icon: ShoppingBag03 },
    { label: "Stock สินค้า", href: "/stock", icon: Package },
];

export const AppHeader = () => {
    const pathname = usePathname();
    const { cart } = useCart();
    const itemCount = cart?.totalQuantity ?? 0;

    return (
        <header className="sticky top-0 z-40 border-b border-secondary bg-primary">
            <div className="mx-auto flex h-16 w-full max-w-container items-center gap-4 px-4 md:px-8">
                <a href="/" className="mr-2 flex items-center gap-2 rounded-xs outline-focus-ring focus-visible:outline-2 focus-visible:outline-offset-2">
                    <AppLogo className="size-8" />
                    <span className="text-lg font-semibold text-primary max-sm:hidden">E-Shop</span>
                </a>

                <nav className="flex items-center gap-1">
                    {navItems.map((item) => {
                        const isCurrent = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
                        return (
                            <Button
                                key={item.href}
                                href={item.href}
                                size="sm"
                                color="tertiary"
                                iconLeading={item.icon}
                                className={cx(isCurrent && "bg-active text-secondary_hover")}
                            >
                                {item.label}
                            </Button>
                        );
                    })}
                </nav>

                <div className="ml-auto flex items-center gap-3">
                    <ThemeToggle />
                    <div className="relative">
                        <Button href="/cart" size="sm" color={pathname === "/cart" ? "primary" : "secondary"} iconLeading={ShoppingCart01}>
                            ตะกร้าสินค้า
                        </Button>
                        {itemCount > 0 && (
                            <span className="absolute -top-2 -right-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-error-solid px-1 text-xs font-bold text-white">
                                {itemCount}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};
