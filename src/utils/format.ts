import { formatCurrency, formatDate } from "./date";

export const summaryCardData = (
  entries: { amount: number; paymentType: string }[]
) => {
  const totalSales = entries.reduce((sum, e) => sum + e.amount, 0);
  const cashTotal = entries
    .filter((e) => e.paymentType === "cash")
    .reduce((sum, e) => sum + e.amount, 0);
  const scanTotal = entries
    .filter((e) => e.paymentType === "scan")
    .reduce((sum, e) => sum + e.amount, 0);
  return { totalSales, cashTotal, scanTotal };
};

export { formatCurrency, formatDate };
