"use client";

import { useMemo } from "react";
import { FilterLines, RefreshCw01 } from "@untitledui/icons";
import { Table, TableCard } from "@/components/application/table/table";
import { Badge } from "@/components/base/badges/badges";
import { Button } from "@/components/base/buttons/button";
import { HighlightText } from "@/components/highlight-text";
import { PageState } from "@/components/page-state";
import { ProductFilters } from "@/components/product-filters";
import { StockBadge } from "@/components/stock-badge";
import { type FilterDefinition, useProductFilter } from "@/hooks/use-product-filter";
import { useProducts } from "@/hooks/use-products";
import type { Product } from "@/types/api";
import { cx } from "@/utils/cx";
import { formatCurrency, formatNumber } from "@/utils/format";
import { getStockStatus } from "@/utils/stock";

type StockFilter = "all" | "ok" | "low" | "out" | "reserved";

const filters: FilterDefinition<StockFilter>[] = [
    { id: "all", label: "ทั้งหมด", predicate: () => true },
    { id: "ok", label: "มีสินค้า", predicate: (p) => getStockStatus(p.availableQty) === "ok" },
    { id: "low", label: "ใกล้หมด", predicate: (p) => getStockStatus(p.availableQty) === "low" },
    { id: "out", label: "สินค้าหมด", predicate: (p) => getStockStatus(p.availableQty) === "out" },
    { id: "reserved", label: "มีการจอง", predicate: (p) => p.reservedQty > 0 },
];

interface SummaryRow {
    id: "summary";
    count: number;
    stock: number;
    reserved: number;
    available: number;
}

const isSummary = (row: Product | SummaryRow): row is SummaryRow => row.id === "summary";

const sumOf = (products: Product[]) =>
    products.reduce(
        (sum, p) => ({
            stock: sum.stock + p.stockQty,
            reserved: sum.reserved + p.reservedQty,
            available: sum.available + p.availableQty,
            value: sum.value + p.stockQty * p.unitPrice,
        }),
        { stock: 0, reserved: 0, available: 0, value: 0 },
    );

// Numeric columns are right-aligned so digits line up with the summary row.
const numericHead = "[&_div]:justify-end";
const numericCell = "text-right tabular-nums";

const StatCard = ({ label, value, hint }: { label: string; value: string; hint?: string }) => (
    <div className="flex flex-col gap-2 rounded-xl bg-primary p-5 shadow-xs ring-1 ring-secondary">
        <span className="text-sm font-medium text-tertiary">{label}</span>
        <span className="text-display-xs font-semibold text-primary">{value}</span>
        {hint && <span className="text-sm text-tertiary">{hint}</span>}
    </div>
);

export default function StockPage() {
    const { products, isLoading, error, reload } = useProducts();
    const { query, setQuery, filter, setFilter, reset, filtered, options } = useProductFilter(products, filters);

    const overall = useMemo(() => sumOf(products), [products]);

    const rows = useMemo<(Product | SummaryRow)[]>(() => {
        const totals = sumOf(filtered);
        return [...filtered, { id: "summary", count: filtered.length, ...totals }];
    }, [filtered]);

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div className="flex flex-col gap-1">
                    <h1 className="text-display-xs font-semibold text-primary">Stock สินค้า</h1>
                    <p className="text-md text-tertiary">รายการสินค้าและจำนวนคงเหลือในคลัง</p>
                </div>
                <Button color="secondary" iconLeading={RefreshCw01} onPress={reload}>
                    รีเฟรช
                </Button>
            </div>

            <PageState isLoading={isLoading} error={error} onRetry={reload} isEmpty={products.length === 0} emptyText="ยังไม่มีสินค้าในระบบ">
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard label="จำนวนรายการสินค้า" value={`${formatNumber(products.length)} รายการ`} />
                    <StatCard label="คงเหลือใน Stock ทั้งหมด" value={`${formatNumber(overall.stock)} ชิ้น`} hint={`มูลค่า ${formatCurrency(overall.value)}`} />
                    <StatCard label="ถูกจองในตะกร้า" value={`${formatNumber(overall.reserved)} ชิ้น`} />
                    <StatCard label="พร้อมขาย" value={`${formatNumber(overall.available)} ชิ้น`} />
                </div>

                <ProductFilters
                    query={query}
                    onQueryChange={setQuery}
                    options={options}
                    filter={filter}
                    onFilterChange={setFilter}
                    shownCount={filtered.length}
                    totalCount={products.length}
                />

                <PageState
                    isLoading={false}
                    error={null}
                    isEmpty={filtered.length === 0}
                    emptyText="ไม่พบสินค้าที่ตรงกับเงื่อนไข"
                    emptyAction={
                        <Button color="secondary" iconLeading={FilterLines} onPress={reset}>
                            ล้างตัวกรอง
                        </Button>
                    }
                >
                    <TableCard.Root>
                        <TableCard.Header
                            title="รายการ Stock"
                            badge={`${formatNumber(filtered.length)} รายการ`}
                            description="คงเหลือ = จำนวนจริงในคลัง · ถูกจอง = อยู่ในตะกร้าที่ยังไม่ชำระเงิน · พร้อมขาย = คงเหลือ − ถูกจอง"
                        />
                        <Table aria-label="รายการ Stock สินค้า">
                            <Table.Header>
                                <Table.Head id="code" label="รหัสสินค้า" isRowHeader />
                                <Table.Head id="name" label="ชื่อสินค้า" />
                                <Table.Head id="price" label="ราคาขาย/หน่วย" className={numericHead} />
                                <Table.Head id="stock" label="คงเหลือ" className={numericHead} />
                                <Table.Head id="reserved" label="ถูกจอง" className={numericHead} />
                                <Table.Head id="available" label="พร้อมขาย" className={numericHead} />
                                <Table.Head id="status" label="สถานะ" />
                            </Table.Header>
                            <Table.Body items={rows}>
                                {(row) =>
                                    isSummary(row) ? (
                                        <Table.Row id="summary" className="bg-secondary font-semibold">
                                            <Table.Cell className="text-primary">รวม</Table.Cell>
                                            <Table.Cell className="text-tertiary">{formatNumber(row.count)} รายการ</Table.Cell>
                                            <Table.Cell />
                                            <Table.Cell className={cx(numericCell, "text-primary")}>{formatNumber(row.stock)}</Table.Cell>
                                            <Table.Cell className={cx(numericCell, "text-primary")}>{formatNumber(row.reserved)}</Table.Cell>
                                            <Table.Cell className={cx(numericCell, "text-primary")}>{formatNumber(row.available)}</Table.Cell>
                                            <Table.Cell />
                                        </Table.Row>
                                    ) : (
                                        <Table.Row id={row.id}>
                                            <Table.Cell>
                                                <Badge type="modern" color="gray" size="sm">
                                                    <HighlightText text={row.productCode} query={query} />
                                                </Badge>
                                            </Table.Cell>
                                            <Table.Cell className="font-medium text-primary">
                                                <HighlightText text={row.productName} query={query} />
                                            </Table.Cell>
                                            <Table.Cell className={cx(numericCell, "whitespace-nowrap")}>{formatCurrency(row.unitPrice)}</Table.Cell>
                                            <Table.Cell className={cx(numericCell, "font-semibold text-primary")}>{formatNumber(row.stockQty)}</Table.Cell>
                                            <Table.Cell className={cx(numericCell, row.reservedQty > 0 && "text-warning-primary")}>
                                                {formatNumber(row.reservedQty)}
                                            </Table.Cell>
                                            <Table.Cell
                                                className={cx(numericCell, "font-semibold", row.availableQty <= 0 ? "text-error-primary" : "text-success-primary")}
                                            >
                                                {formatNumber(row.availableQty)}
                                            </Table.Cell>
                                            <Table.Cell>
                                                <StockBadge availableQty={row.availableQty} />
                                            </Table.Cell>
                                        </Table.Row>
                                    )
                                }
                            </Table.Body>
                        </Table>
                    </TableCard.Root>
                </PageState>
            </PageState>
        </div>
    );
}
