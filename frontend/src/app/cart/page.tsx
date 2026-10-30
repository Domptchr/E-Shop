"use client";

import { useState } from "react";
import { CreditCard01, Minus, Plus, ShoppingBag03, Trash01 } from "@untitledui/icons";
import { useRouter } from "next/navigation";
import { Table, TableCard } from "@/components/application/table/table";
import { Badge } from "@/components/base/badges/badges";
import { Button } from "@/components/base/buttons/button";
import { ButtonUtility } from "@/components/base/buttons/button-utility";
import { ConfirmModal } from "@/components/confirm-modal";
import { PageState } from "@/components/page-state";
import { useCart } from "@/providers/cart-provider";
import { useToast } from "@/providers/toast-provider";
import type { CartItem } from "@/types/api";
import { formatCurrency, formatNumber } from "@/utils/format";

export default function CartPage() {
    const router = useRouter();
    const { cart, isLoading, error, reload, updateItem, removeItem, clear, checkout } = useCart();
    const { showToast } = useToast();

    const [busyProductId, setBusyProductId] = useState<number | null>(null);
    const [isClearOpen, setIsClearOpen] = useState(false);
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const items = cart?.items ?? [];

    const run = async (productId: number, action: () => Promise<unknown>, successMessage?: string) => {
        setBusyProductId(productId);
        try {
            await action();
            if (successMessage) showToast("success", successMessage);
        } catch (e) {
            showToast("error", "ไม่สามารถทำรายการได้", e instanceof Error ? e.message : undefined);
        } finally {
            setBusyProductId(null);
        }
    };

    const changeQuantity = (item: CartItem, delta: number) => {
        const next = item.quantity + delta;
        if (next < 1) return run(item.productId, () => removeItem(item.productId), `ลบ ${item.productName} ออกจากตะกร้าแล้ว`);
        return run(item.productId, () => updateItem(item.productId, next));
    };

    const handleClear = async () => {
        setIsSubmitting(true);
        try {
            await clear();
            setIsClearOpen(false);
            showToast("success", "ล้างตะกร้าเรียบร้อยแล้ว", "คืนยอดสินค้าเข้า Stock แล้ว");
        } catch (e) {
            showToast("error", "ล้างตะกร้าไม่สำเร็จ", e instanceof Error ? e.message : undefined);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCheckout = async () => {
        setIsSubmitting(true);
        try {
            const order = await checkout();
            setIsCheckoutOpen(false);
            showToast("success", "ชำระเงินสำเร็จ", `เลขที่คำสั่งซื้อ ${order.orderNo}`);
            router.push(`/orders/${order.id}`);
        } catch (e) {
            showToast("error", "ชำระเงินไม่สำเร็จ", e instanceof Error ? e.message : undefined);
            await reload();
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-1">
                <h1 className="text-display-xs font-semibold text-primary">ตะกร้าสินค้า</h1>
                <p className="text-md text-tertiary">ปรับจำนวน ลบรายการ หรือกดชำระเงินเพื่อยืนยันคำสั่งซื้อ</p>
            </div>

            <PageState
                isLoading={isLoading && !cart}
                error={error}
                onRetry={reload}
                isEmpty={items.length === 0}
                emptyText="ยังไม่มีสินค้าในตะกร้า"
                emptyAction={
                    <Button href="/" iconLeading={ShoppingBag03}>
                        เลือกซื้อสินค้า
                    </Button>
                }
            >
                <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[1fr_340px]">
                    <TableCard.Root>
                        <TableCard.Header
                            title="รายการสินค้า"
                            badge={`${formatNumber(items.length)} รายการ`}
                            contentTrailing={
                                <Button color="secondary-destructive" size="sm" iconLeading={Trash01} onPress={() => setIsClearOpen(true)}>
                                    ล้างตะกร้า
                                </Button>
                            }
                        />
                        <Table aria-label="รายการสินค้าในตะกร้า">
                            <Table.Header>
                                <Table.Head id="product" label="สินค้า" isRowHeader />
                                <Table.Head id="price" label="ราคา/หน่วย" />
                                <Table.Head id="quantity" label="จำนวน" />
                                <Table.Head id="total" label="รวม" />
                                <Table.Head id="actions" />
                            </Table.Header>
                            <Table.Body items={items}>
                                {(item) => {
                                    const isBusy = busyProductId === item.productId;
                                    return (
                                        <Table.Row id={item.productId}>
                                            <Table.Cell>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-medium text-primary">{item.productName}</span>
                                                    <span className="text-sm text-tertiary">{item.productCode}</span>
                                                </div>
                                            </Table.Cell>
                                            <Table.Cell className="whitespace-nowrap">{formatCurrency(item.unitPrice)}</Table.Cell>
                                            <Table.Cell>
                                                <div className="flex flex-col items-start gap-1">
                                                    <div className="flex items-center gap-1">
                                                        <ButtonUtility
                                                            size="xs"
                                                            color="secondary"
                                                            icon={Minus}
                                                            tooltip="ลดจำนวน"
                                                            isDisabled={isBusy}
                                                            onPress={() => changeQuantity(item, -1)}
                                                        />
                                                        <span className="w-10 text-center text-sm font-semibold text-primary">{formatNumber(item.quantity)}</span>
                                                        <ButtonUtility
                                                            size="xs"
                                                            color="secondary"
                                                            icon={Plus}
                                                            tooltip={item.availableQty > 0 ? "เพิ่มจำนวน" : "ครบจำนวนแล้ว"}
                                                            isDisabled={isBusy || item.availableQty <= 0}
                                                            onPress={() => changeQuantity(item, 1)}
                                                        />
                                                    </div>
                                                    {/* availableQty already excludes our own reservation, so the cart quantity is the most we can hold */}
                                                    {item.availableQty <= 0 && (
                                                        <span className="text-xs text-warning-primary">ครบจำนวนแล้ว (สูงสุด {formatNumber(item.quantity)} ชิ้น)</span>
                                                    )}
                                                </div>
                                            </Table.Cell>
                                            <Table.Cell className="font-medium whitespace-nowrap text-primary">{formatCurrency(item.lineTotal)}</Table.Cell>
                                            <Table.Cell>
                                                <ButtonUtility
                                                    size="xs"
                                                    color="tertiary"
                                                    icon={Trash01}
                                                    tooltip="ลบรายการ"
                                                    isDisabled={isBusy}
                                                    onPress={() => run(item.productId, () => removeItem(item.productId), `ลบ ${item.productName} ออกจากตะกร้าแล้ว`)}
                                                />
                                            </Table.Cell>
                                        </Table.Row>
                                    );
                                }}
                            </Table.Body>
                        </Table>
                    </TableCard.Root>

                    <div className="flex flex-col gap-5 rounded-xl bg-primary p-6 shadow-xs ring-1 ring-secondary lg:sticky lg:top-24">
                        <h2 className="text-lg font-semibold text-primary">สรุปคำสั่งซื้อ</h2>
                        <dl className="flex flex-col gap-3 text-sm">
                            <div className="flex justify-between">
                                <dt className="text-tertiary">จำนวนรายการ</dt>
                                <dd className="font-medium text-primary">{formatNumber(items.length)} รายการ</dd>
                            </div>
                            <div className="flex justify-between">
                                <dt className="text-tertiary">จำนวนสินค้าทั้งหมด</dt>
                                <dd className="font-medium text-primary">{formatNumber(cart?.totalQuantity ?? 0)} ชิ้น</dd>
                            </div>
                            <div className="flex items-baseline justify-between border-t border-secondary pt-3">
                                <dt className="font-semibold text-primary">ยอดที่ต้องชำระ</dt>
                                <dd className="text-display-xs font-semibold text-brand-secondary">{formatCurrency(cart?.totalAmount ?? 0)}</dd>
                            </div>
                        </dl>
                        <Button size="xl" iconLeading={CreditCard01} onPress={() => setIsCheckoutOpen(true)}>
                            ชำระเงิน (Checkout)
                        </Button>
                    </div>
                </div>
            </PageState>

            <ConfirmModal
                isOpen={isClearOpen}
                onOpenChange={setIsClearOpen}
                icon={Trash01}
                color="error"
                title="ล้างตะกร้าสินค้า?"
                description="สินค้าทั้งหมดจะถูกลบออกจากตะกร้า และคืนยอดกลับเข้า Stock"
                confirmLabel="ล้างตะกร้า"
                isConfirming={isSubmitting}
                onConfirm={handleClear}
            />

            <ConfirmModal
                isOpen={isCheckoutOpen}
                onOpenChange={setIsCheckoutOpen}
                icon={CreditCard01}
                color="brand"
                title="ยืนยันการชำระเงิน"
                description="ตรวจสอบรายการและยอดที่ต้องชำระก่อนยืนยัน"
                confirmLabel="ยืนยันชำระเงิน"
                isConfirming={isSubmitting}
                onConfirm={handleCheckout}
            >
                <div className="flex flex-col gap-2 rounded-lg bg-secondary p-4 text-sm">
                    {items.map((item) => (
                        <div key={item.productId} className="flex justify-between gap-3">
                            <span className="text-secondary">
                                {item.productName} <span className="text-tertiary">× {formatNumber(item.quantity)}</span>
                            </span>
                            <span className="font-medium whitespace-nowrap text-primary">{formatCurrency(item.lineTotal)}</span>
                        </div>
                    ))}
                    <div className="mt-1 flex items-baseline justify-between border-t border-secondary pt-3">
                        <span className="font-semibold text-primary">ยอดที่ต้องชำระ</span>
                        <Badge type="pill-color" color="brand" size="lg">
                            {formatCurrency(cart?.totalAmount ?? 0)}
                        </Badge>
                    </div>
                </div>
            </ConfirmModal>
        </div>
    );
}
