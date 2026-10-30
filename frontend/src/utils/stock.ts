/** Available quantity at or below this is shown as "ใกล้หมด" (low stock). */
export const LOW_STOCK_THRESHOLD = 5;

export type StockStatus = "out" | "low" | "ok";

export const getStockStatus = (availableQty: number): StockStatus =>
    availableQty <= 0 ? "out" : availableQty <= LOW_STOCK_THRESHOLD ? "low" : "ok";
