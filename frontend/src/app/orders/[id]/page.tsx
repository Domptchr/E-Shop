"use client";

import { useCallback, useEffect, useState } from "react";
import { CheckCircle, Package, ShoppingBag03 } from "@untitledui/icons";
import { useParams } from "next/navigation";
import { Table, TableCard } from "@/components/application/table/table";
import { Button } from "@/components/base/buttons/button";
import { FeaturedIcon } from "@/components/foundations/featured-icon/featured-icon";
import { PageState } from "@/components/page-state";
import { api } from "@/lib/api";
import type { Order } from "@/types/api";
import { formatCurrency, formatDateTime, formatNumber } from "@/utils/format";

export default function OrderSummaryPage() {
    const { id } = useParams<{ id: string }>();
    const [order, setOrder] = useState<Order | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const load = useCallback(async () => {
        setIsLoading(true);
        try {
            setOrder(await api.getOrder(id));
            setError(null);
        } catch (e) {
            setError(e instanceof Error ? e.message : "โหลดคำสั่งซื้อไม่สำเร็จ");
        } finally {
            setIsLoading(false);
        }
    }, [id]);

    useEffect(() => {
        void load();
    }, [load]);

    return (
        <PageState isLoading={isLoading} error={error} onRetry={load}>
            {order && (
                <div className="mx-auto flex max-w-3xl flex-col gap-6">
                    <div className="flex flex-col items-center gap-4 rounded-xl bg-primary p-8 text-center shadow-xs ring-1 ring-secondary">
                        <FeaturedIcon icon={CheckCircle} color="success" theme="light" size="xl" />
                        <div className="flex flex-col gap-1">
                            <h1 className="text-display-xs font-semibold text-primary">ชำระเงินสำเร็จ</h1>
                            <p className="text-md text-tertiary">
                                เลขที่คำสั่งซื้อ <span className="font-semibold text-secondary">{order.orderNo}</span> · {formatDateTime(order.createdAt)}
                            </p>
                        </div>
                        <div className="flex flex-col items-center">
                            <span className="text-sm text-tertiary">ยอดที่ชำระทั้งหมด</span>
                            <span className="text-display-md font-semibold text-brand-secondary">{formatCurrency(order.totalAmount)}</span>
                        </div>
                    </div>

                    <TableCard.Root>
                        <TableCard.Header title="รายการสินค้า" badge={`${formatNumber(order.totalQuantity)} ชิ้น`} />
                        <Table aria-label="รายการสินค้าในคำสั่งซื้อ">
                            <Table.Header>
                                <Table.Head id="product" label="สินค้า" isRowHeader />
                                <Table.Head id="price" label="ราคา/หน่วย" />
                                <Table.Head id="quantity" label="จำนวน" />
                                <Table.Head id="total" label="รวม" />
                            </Table.Header>
                            <Table.Body items={order.items}>
                                {(item) => (
                                    <Table.Row id={item.productId}>
                                        <Table.Cell>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium text-primary">{item.productName}</span>
                                                <span className="text-sm text-tertiary">{item.productCode}</span>
                                            </div>
                                        </Table.Cell>
                                        <Table.Cell>{formatCurrency(item.unitPrice)}</Table.Cell>
                                        <Table.Cell>{formatNumber(item.quantity)}</Table.Cell>
                                        <Table.Cell className="font-medium text-primary">{formatCurrency(item.lineTotal)}</Table.Cell>
                                    </Table.Row>
                                )}
                            </Table.Body>
                        </Table>
                        <div className="flex items-baseline justify-end gap-4 border-t border-secondary px-6 py-4">
                            <span className="text-md font-semibold text-primary">ยอดรวมทั้งสิ้น</span>
                            <span className="text-xl font-semibold text-brand-secondary">{formatCurrency(order.totalAmount)}</span>
                        </div>
                    </TableCard.Root>

                    <div className="flex flex-wrap justify-center gap-3">
                        <Button href="/stock" color="secondary" size="lg" iconLeading={Package}>
                            ดู Stock สินค้า
                        </Button>
                        <Button href="/" size="lg" iconLeading={ShoppingBag03}>
                            เลือกซื้อสินค้าต่อ
                        </Button>
                    </div>
                </div>
            )}
        </PageState>
    );
}
