import * as XLSX from "xlsx";
import type { SalesEntry } from "../types";

export const exportToExcel = (
  entries: SalesEntry[],
  filename: string
) => {
  const data = entries.map((e) => ({
    "S.No": e.serialNumber,
    "Item": e.itemName,
    "Payment": e.paymentType === "cash" ? "Cash" : "Scan",
    "Amount": e.amount,
    "Date": e.date,
    "Time": e.time,
    "Worker": e.workerName,
    "Created At": e.createdAt?.toDate?.()?.toLocaleString() ?? "",
    "Updated At": e.updatedAt?.toDate?.()?.toLocaleString() ?? "",
    "Status": e.isDeleted ? "Deleted" : "Active",
  }));

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(data);

  const colWidths = [
    { wch: 8 },
    { wch: 22 },
    { wch: 10 },
    { wch: 10 },
    { wch: 12 },
    { wch: 8 },
    { wch: 18 },
    { wch: 20 },
    { wch: 20 },
    { wch: 10 },
  ];
  ws["!cols"] = colWidths;

  XLSX.utils.book_append_sheet(wb, ws, "Sales Entries");

  const totalSales = entries
    .filter((e) => !e.isDeleted)
    .reduce((sum, e) => sum + e.amount, 0);
  const cashTotal = entries
    .filter((e) => !e.isDeleted && e.paymentType === "cash")
    .reduce((sum, e) => sum + e.amount, 0);
  const scanTotal = entries
    .filter((e) => !e.isDeleted && e.paymentType === "scan")
    .reduce((sum, e) => sum + e.amount, 0);

  const summaryData = [
    { Metric: "Total Sales", Value: totalSales },
    { Metric: "Cash Total", Value: cashTotal },
    { Metric: "Scan Total", Value: scanTotal },
    { Metric: "Total Entries", Value: entries.filter((e) => !e.isDeleted).length },
  ];
  const summaryWs = XLSX.utils.json_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, summaryWs, "Summary");

  XLSX.writeFile(wb, `${filename}.xlsx`);
};
