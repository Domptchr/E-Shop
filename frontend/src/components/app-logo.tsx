import type { SVGProps } from "react";

/** Shop logo mark. Keep in sync with the favicon at `src/app/icon.svg`. */
export const AppLogo = (props: SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 32 32" fill="none" aria-hidden="true" {...props}>
        <rect width="32" height="32" rx="8" fill="#7F56D9" />
        <path
            d="M6 7h2.6l2.7 12.2a1.6 1.6 0 0 0 1.6 1.3h9.5a1.6 1.6 0 0 0 1.6-1.2L26 11.5H9.7"
            stroke="#fff"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <circle cx="13.5" cy="25" r="1.8" fill="#fff" />
        <circle cx="22" cy="25" r="1.8" fill="#fff" />
    </svg>
);
