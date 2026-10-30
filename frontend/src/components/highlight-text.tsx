import { splitHighlight } from "@/utils/highlight";

interface HighlightTextProps {
    text: string;
    query: string;
}

/** Renders `text` with the parts matching `query` wrapped in a highlight mark. */
export const HighlightText = ({ text, query }: HighlightTextProps) => (
    <>
        {splitHighlight(text, query).map((part, index) =>
            part.match ? (
                <mark key={index} className="rounded-xs bg-warning-secondary px-0.5 text-primary">
                    {part.text}
                </mark>
            ) : (
                <span key={index}>{part.text}</span>
            ),
        )}
    </>
);
