"use client";

import type { Key } from "react-aria-components";
import { SearchLg } from "@untitledui/icons";
import { ButtonGroup, ButtonGroupItem } from "@/components/base/button-group/button-group";
import { Input } from "@/components/base/input/input";
import { formatNumber } from "@/utils/format";

export interface FilterOption<T extends string> {
    id: T;
    label: string;
    count: number;
}

interface ProductFiltersProps<T extends string> {
    query: string;
    onQueryChange: (query: string) => void;
    options: FilterOption<T>[];
    filter: T;
    onFilterChange: (filter: T) => void;
    shownCount: number;
    totalCount: number;
}

export const ProductFilters = <T extends string>({
    query,
    onQueryChange,
    options,
    filter,
    onFilterChange,
    shownCount,
    totalCount,
}: ProductFiltersProps<T>) => (
    <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <Input
                aria-label="ค้นหาสินค้า"
                placeholder="ค้นหาชื่อหรือรหัสสินค้า"
                icon={SearchLg}
                size="md"
                value={query}
                onChange={onQueryChange}
                className="lg:max-w-80"
            />
            <div className="overflow-x-auto">
                <ButtonGroup
                    size="sm"
                    aria-label="กรองตามสถานะ"
                    disallowEmptySelection
                    selectedKeys={new Set<Key>([filter])}
                    onSelectionChange={(keys) => {
                        const [next] = keys;
                        if (next !== undefined) onFilterChange(next as T);
                    }}
                >
                    {options.map((option) => (
                        <ButtonGroupItem key={option.id} id={option.id}>
                            {option.label}
                            <span className="text-xs font-medium text-quaternary">{formatNumber(option.count)}</span>
                        </ButtonGroupItem>
                    ))}
                </ButtonGroup>
            </div>
        </div>
        {shownCount !== totalCount && (
            <p className="text-sm text-tertiary">
                พบ <span className="font-semibold text-secondary">{formatNumber(shownCount)}</span> จาก {formatNumber(totalCount)} รายการ
            </p>
        )}
    </div>
);
