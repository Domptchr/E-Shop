"use client";

import { useEffect, useState } from "react";
import { Moon01, Sun } from "@untitledui/icons";
import { useTheme } from "next-themes";
import { ButtonUtility } from "@/components/base/buttons/button-utility";

/** Switches between light and dark mode. */
export const ThemeToggle = () => {
    const { resolvedTheme, setTheme } = useTheme();
    // The theme is only known on the client; render a stable placeholder icon until mounted to avoid a hydration mismatch.
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    const isDark = mounted && resolvedTheme === "dark";

    return (
        <ButtonUtility
            size="sm"
            color="secondary"
            icon={isDark ? Sun : Moon01}
            tooltip={isDark ? "เปลี่ยนเป็นโหมดสว่าง" : "เปลี่ยนเป็นโหมดมืด"}
            tooltipPlacement="bottom"
            onPress={() => setTheme(isDark ? "light" : "dark")}
        />
    );
};
