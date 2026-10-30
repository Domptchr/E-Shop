"use client";

import { useMemo, useState } from "react";
import type { FilterOption } from "@/components/product-filters";
import type { Product } from "@/types/api";
import { matchesQuery } from "@/utils/highlight";

export interface FilterDefinition<T extends string> {
    id: T;
    label: string;
    predicate: (product: Product) => boolean;
}

/**
 * Search (product name / code) + status filter for a product list.
 * Option counts reflect the current search, so they match what clicking the option would show.
 */
export const useProductFilter = <T extends string>(products: Product[], definitions: FilterDefinition<T>[]) => {
    const [query, setQuery] = useState("");
    const [filter, setFilter] = useState<T>(definitions[0].id);

    const result = useMemo(() => {
        const searched = products.filter((p) => matchesQuery(query, p.productName, p.productCode));
        const predicate = definitions.find((d) => d.id === filter)?.predicate ?? (() => true);
        const options: FilterOption<T>[] = definitions.map((d) => ({
            id: d.id,
            label: d.label,
            count: searched.filter(d.predicate).length,
        }));
        return { filtered: searched.filter(predicate), options };
    }, [products, definitions, query, filter]);

    const reset = () => {
        setQuery("");
        setFilter(definitions[0].id);
    };

    return { query, setQuery, filter, setFilter, reset, ...result };
};
