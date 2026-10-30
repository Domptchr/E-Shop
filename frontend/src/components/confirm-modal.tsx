"use client";

import type { FC, ReactNode } from "react";
import { Heading as AriaHeading } from "react-aria-components";
import { Dialog, Modal, ModalOverlay } from "@/components/application/modals/modal";
import { Button } from "@/components/base/buttons/button";
import { CloseButton } from "@/components/base/buttons/close-button";
import { FeaturedIcon } from "@/components/foundations/featured-icon/featured-icon";

interface ConfirmModalProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    icon: FC<{ className?: string }>;
    color: "brand" | "error";
    title: string;
    description?: ReactNode;
    children?: ReactNode;
    confirmLabel: string;
    isConfirming?: boolean;
    onConfirm: () => void;
}

export const ConfirmModal = ({
    isOpen,
    onOpenChange,
    icon,
    color,
    title,
    description,
    children,
    confirmLabel,
    isConfirming,
    onConfirm,
}: ConfirmModalProps) => (
    <ModalOverlay isOpen={isOpen} onOpenChange={onOpenChange} isDismissable={!isConfirming}>
        <Modal className="max-w-md">
            <Dialog>
                <div className="flex w-full flex-col gap-5 p-6">
                    <div className="flex items-start justify-between">
                        <FeaturedIcon icon={icon} color={color} theme="light" size="lg" />
                        <CloseButton size="sm" label="ปิด" onPress={() => onOpenChange(false)} isDisabled={isConfirming} />
                    </div>
                    <div className="flex flex-col gap-1">
                        <AriaHeading slot="title" className="text-lg font-semibold text-primary">
                            {title}
                        </AriaHeading>
                        {description && <p className="text-sm text-tertiary">{description}</p>}
                    </div>
                    {children}
                    <div className="grid grid-cols-2 gap-3 pt-2">
                        <Button color="secondary" size="lg" onPress={() => onOpenChange(false)} isDisabled={isConfirming}>
                            ยกเลิก
                        </Button>
                        <Button
                            color={color === "error" ? "primary-destructive" : "primary"}
                            size="lg"
                            isLoading={isConfirming}
                            showTextWhileLoading
                            onPress={onConfirm}
                        >
                            {confirmLabel}
                        </Button>
                    </div>
                </div>
            </Dialog>
        </Modal>
    </ModalOverlay>
);
