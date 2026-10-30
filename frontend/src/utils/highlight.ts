export interface HighlightPart {
    text: string;
    match: boolean;
}

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Splits `text` into parts that do / don't match `query` (case-insensitive). */
export const splitHighlight = (text: string, query: string): HighlightPart[] => {
    const q = query.trim();
    if (!q) return [{ text, match: false }];

    const pattern = new RegExp(`(${escapeRegExp(q)})`, "gi");
    return text
        .split(pattern)
        .filter((part) => part !== "")
        .map((part) => ({ text: part, match: part.toLowerCase() === q.toLowerCase() }));
};

/** True when the product name or code contains `query` (case-insensitive). */
export const matchesQuery = (query: string, ...fields: string[]) => {
    const q = query.trim().toLowerCase();
    return !q || fields.some((field) => field.toLowerCase().includes(q));
};
