import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { SalesEntry } from "../types";

export const exportToPdf = (
  entries: SalesEntry[],
  title: string,
  dateRange: string
) => {
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text(title, 14, 22);

  doc.setFontSize(11);
  doc.text(`Date Range: ${dateRange}`, 14, 32);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 40);

  const activeEntries = entries.filter((e) => !e.isDeleted);
  const totalSales = activeEntries.reduce((sum, e) => sum + e.amount, 0);
  const cashTotal = activeEntries
    .filter((e) => e.paymentType === "cash")
    .reduce((sum, e) => sum + e.amount, 0);
  const scanTotal = activeEntries
    .filter((e) => e.paymentType === "scan")
    .reduce((sum, e) => sum + e.amount, 0);

  doc.setFontSize(12);
  doc.text("Summary", 14, 52);
  doc.setFontSize(10);
  doc.text(`Total Sales: \u20B9${totalSales.toLocaleString("en-IN")}`, 14, 62);
  doc.text(`Cash Total: \u20B9${cashTotal.toLocaleString("en-IN")}`, 14, 70);
  doc.text(`Scan Total: \u20B9${scanTotal.toLocaleString("en-IN")}`, 14, 78);
  doc.text(`Total Entries: ${activeEntries.length}`, 14, 86);

  const tableData = activeEntries.map((e, i) => [
    i + 1,
    e.serialNumber,
    e.itemName,
    e.paymentType === "cash" ? "Cash" : "Scan",
    `\u20B9${e.amount.toLocaleString("en-IN")}`,
    e.date,
    e.time,
    e.workerName,
  ]);

  autoTable(doc, {
    head: [
      ["#", "S.No", "Item", "Type", "Amount", "Date", "Time", "Worker"],
    ],
    body: tableData,
    startY: 92,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [41, 65, 97] },
  });

  doc.save(`${title.replace(/\s+/g, "_")}.pdf`);
};
