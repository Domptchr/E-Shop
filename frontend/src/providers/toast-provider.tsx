"use client";

import { type PropsWithChildren, createContext, useCallback, useContext, useState } from "react";
import { AlertCircle, CheckCircle } from "@untitledui/icons";
import { CloseButton } from "@/components/base/buttons/close-button";
import { FeaturedIcon } from "@/components/foundations/featured-icon/featured-icon";

type ToastType = "success" | "error";

interface Toast {
    id: number;
    type: ToastType;
    title: string;
    description?: string;
}

interface ToastContextValue {
    showToast: (type: ToastType, title: string, description?: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

let nextId = 1;

export const ToastProvider = ({ children }: PropsWithChildren) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const dismiss = useCallback((id: number) => setToasts((list) => list.filter((t) => t.id !== id)), []);

    const showToast = useCallback(
        (type: ToastType, title: string, description?: string) => {
            const id = nextId++;
            setToasts((list) => [...list, { id, type, title, description }]);
            setTimeout(() => dismiss(id), 4000);
        },
        [dismiss],
    );

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}

            <div aria-live="polite" className="pointer-events-none fixed right-4 bottom-4 z-60 flex w-full max-w-sm flex-col gap-3">
                {toasts.map((toast) => (
                    <div
                        key={toast.id}
                        role={toast.type === "error" ? "alert" : "status"}
                        className="pointer-events-auto flex items-start gap-4 rounded-xl bg-primary p-4 shadow-lg ring-1 ring-secondary duration-300 animate-in fade-in slide-in-from-bottom-2"
                    >
                        <FeaturedIcon
                            icon={toast.type === "success" ? CheckCircle : AlertCircle}
                            color={toast.type === "success" ? "success" : "error"}
                            theme="outline"
                            size="md"
                        />
                        <div className="flex min-w-0 flex-1 flex-col gap-1 pt-0.5">
                            <p className="text-sm font-semibold text-primary">{toast.title}</p>
                            {toast.description && <p className="text-sm text-tertiary">{toast.description}</p>}
                        </div>
                        <CloseButton size="xs" label="ปิด" onPress={() => dismiss(toast.id)} />
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) throw new Error("useToast must be used inside ToastProvider");
    return context;
};
