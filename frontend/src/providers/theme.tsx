"use client";

import { ThemeProvider } from "next-themes";

/** Only light and dark are offered (no "system"); the choice is remembered in localStorage. */
export function Theme({ children }: { children: React.ReactNode }) {
    return (
        <ThemeProvider
            attribute="class"
            themes={["light", "dark"]}
            value={{ light: "light-mode", dark: "dark-mode" }}
            defaultTheme="light"
            enableSystem={false}
            disableTransitionOnChange
        >
            {children}
        </ThemeProvider>
    );
}
