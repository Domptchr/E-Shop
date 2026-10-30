const currency = new Intl.NumberFormat("th-TH", { style: "currency", currency: "THB" });
const number = new Intl.NumberFormat("th-TH");
const dateTime = new Intl.DateTimeFormat("th-TH", { dateStyle: "medium", timeStyle: "short" });

const compactCurrency = new Intl.NumberFormat("th-TH", { style: "currency", currency: "THB", minimumFractionDigits: 0, maximumFractionDigits: 2 });

export const formatCurrency = (value: number) => currency.format(value);
/** Like formatCurrency but drops ".00" for whole amounts, e.g. ฿590. */
export const formatPrice = (value: number) => compactCurrency.format(value);
export const formatNumber = (value: number) => number.format(value);
export const formatDateTime = (value: string) => dateTime.format(new Date(value));
