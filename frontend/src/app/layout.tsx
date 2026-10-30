import type { Metadata, Viewport } from "next";
import { IBM_Plex_Sans_Thai, Inter } from "next/font/google";
import { AppHeader } from "@/components/app-header";
import { CartProvider } from "@/providers/cart-provider";
import { RouteProvider } from "@/providers/router-provider";
import { Theme } from "@/providers/theme";
import { ToastProvider } from "@/providers/toast-provider";
import "@/styles/globals.css";
import { cx } from "@/utils/cx";

const inter = Inter({
    subsets: ["latin"],
    display: "swap",
    variable: "--font-inter",
});

const plexThai = IBM_Plex_Sans_Thai({
    subsets: ["thai"],
    weight: ["400", "500", "600", "700"],
    display: "swap",
    variable: "--font-thai",
});

export const metadata: Metadata = {
    title: "E-Shop",
    description: "ระบบเลือกซื้อสินค้าและจัดการ Stock",
};

export const viewport: Viewport = {
    themeColor: "#7f56d9",
    colorScheme: "light dark",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="th" suppressHydrationWarning>
            <body className={cx(inter.variable, plexThai.variable, "bg-secondary antialiased")}>
                <RouteProvider>
                    <Theme>
                        <ToastProvider>
                            <CartProvider>
                                <AppHeader />
                                <main className="mx-auto w-full max-w-container px-4 py-8 md:px-8">{children}</main>
                            </CartProvider>
                        </ToastProvider>
                    </Theme>
                </RouteProvider>
            </body>
        </html>
    );
}
