"use client";

import type { PropsWithChildren, ReactNode } from "react";
import { AlertCircle, RefreshCw01, SearchLg } from "@untitledui/icons";
import { EmptyState } from "@/components/application/empty-state/empty-state";
import { LoadingIndicator } from "@/components/application/loading-indicator/loading-indicator";
import { Button } from "@/components/base/buttons/button";

interface PageStateProps {
    isLoading: boolean;
    error: string | null;
    onRetry?: () => void;
    isEmpty?: boolean;
    emptyText?: string;
    emptyAction?: ReactNode;
}

/** Shows a loading, error or empty state, otherwise renders the children. */
export const PageState = ({ isLoading, error, onRetry, isEmpty, emptyText, emptyAction, children }: PropsWithChildren<PageStateProps>) => {
    if (isLoading)
        return (
            <div className="flex justify-center py-20">
                <LoadingIndicator type="line-spinner" size="md" label="กำลังโหลด..." />
            </div>
        );

    if (error || isEmpty)
        return (
            <div className="rounded-xl bg-primary py-16 shadow-xs ring-1 ring-secondary">
                <EmptyState size="md">
                    <EmptyState.Header pattern="none">
                        <EmptyState.FeaturedIcon icon={error ? AlertCircle : SearchLg} color={error ? "error" : "gray"} theme="light" />
                    </EmptyState.Header>
                    <EmptyState.Content>
                        <EmptyState.Title>{error ? "เกิดข้อผิดพลาด" : emptyText}</EmptyState.Title>
                        {error && <EmptyState.Description>{error}</EmptyState.Description>}
                    </EmptyState.Content>
                    <EmptyState.Footer>
                        {error && onRetry ? (
                            <Button color="secondary" iconLeading={RefreshCw01} onPress={onRetry}>
                                ลองใหม่
                            </Button>
                        ) : (
                            emptyAction
                        )}
                    </EmptyState.Footer>
                </EmptyState>
            </div>
        );

    return <>{children}</>;
};
