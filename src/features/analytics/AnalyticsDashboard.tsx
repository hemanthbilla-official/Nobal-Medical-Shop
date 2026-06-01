import { useState, useEffect, useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { useAuth } from "../auth/useAuth";
import { useAllEntries } from "../../hooks/useSalesEntries";
import { useUsers } from "../../hooks/useUsers";
import { useAllBookPhotos } from "../../hooks/useBookPhotos";
import { useAuditLogs } from "../../hooks/useAuditLogs";
import { SummaryCard } from "../../components/SummaryCard";
import { DateRangeFilter } from "../../components/DateRangeFilter";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import { EmptyState } from "../../components/EmptyState";
import { getDateRangePreset } from "../../utils/date";
import { exportToExcel } from "../../utils/exportExcel";
import { exportToPdf } from "../../utils/exportPdf";
import toast from "react-hot-toast";

const COLORS = ["#059669", "#2563eb"];

export function AnalyticsDashboard() {
  const { user } = useAuth();
  const { entries, loading, fetchAll } = useAllEntries();
  const { users } = useUsers();
  const { photos } = useAllBookPhotos();
  const { logs } = useAuditLogs();
  const [fetched, setFetched] = useState(false);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("");
  const [workerFilter, setWorkerFilter] = useState("");
  const [itemSearch, setItemSearch] = useState("");

  useEffect(() => { if (!fetched) { fetchAll(); setFetched(true); } }, [fetchAll, fetched]);

  const filtered = useMemo(() => {
    let list = entries.filter((e) => !e.isDeleted);
    if (startDate) list = list.filter((e) => e.date >= startDate);
    if (endDate) list = list.filter((e) => e.date <= endDate);
    if (paymentFilter) list = list.filter((e) => e.paymentType === paymentFilter);
    if (workerFilter) list = list.filter((e) => e.workerId === workerFilter);
    if (itemSearch) list = list.filter((e) => e.itemName.toLowerCase().includes(itemSearch.toLowerCase()));
    return list;
  }, [entries, startDate, endDate, paymentFilter, workerFilter, itemSearch]);

  const totalSales = filtered.reduce((s, e) => s + e.amount, 0);
  const cashTotal = filtered.filter((e) => e.paymentType === "cash").reduce((s, e) => s + e.amount, 0);
  const scanTotal = filtered.filter((e) => e.paymentType === "scan").reduce((s, e) => s + e.amount, 0);
  const photoCount = photos.filter((p) => {
    if (startDate && p.date < startDate) return false;
    if (endDate && p.date > endDate) return false;
    return true;
  }).length;

  const salesByDay = useMemo(() => {
    const map = new Map<string, number>();
    filtered.forEach((e) => map.set(e.date, (map.get(e.date) || 0) + e.amount));
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b)).map(([date, total]) => ({ date, total }));
  }, [filtered]);

  const cashVsScan = useMemo(() => [
    { name: "Cash", value: cashTotal },
    { name: "Scan", value: scanTotal },
  ], [cashTotal, scanTotal]);

  const itemTotals = useMemo(() => {
    const map = new Map<string, number>();
    filtered.forEach((e) => {
      map.set(e.itemName, (map.get(e.itemName) || 0) + e.amount);
    });
    return Array.from(map.entries()).sort(([, a], [, b]) => b - a).slice(0, 20).map(([item, amount]) => ({ item, amount }));
  }, [filtered]);

  const selCss = "bg-white border border-stone-200 rounded px-3 py-2 text-sm text-stone-700";

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-medium text-stone-800">Analytics</h2>
        <div className="flex gap-1.5">
          <button onClick={() => { exportToExcel(filtered, `Sales_${startDate || "all"}_to_${endDate || "all"}`); toast.success("Excel exported"); }} className="px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-600 rounded text-xs font-medium transition-colors border border-stone-200">Excel</button>
          <button onClick={() => { exportToPdf(filtered, "Medical Shop Sales Report", startDate && endDate ? `${startDate} to ${endDate}` : "All time"); toast.success("PDF exported"); }} className="px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-600 rounded text-xs font-medium transition-colors border border-stone-200">PDF</button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6 sm:gap-4">
        <SummaryCard label="Total Sales" value={"\u20B9" + totalSales.toLocaleString("en-IN")} />
        <SummaryCard label="Cash Total" value={"\u20B9" + cashTotal.toLocaleString("en-IN")} />
        <SummaryCard label="Scan Total" value={"\u20B9" + scanTotal.toLocaleString("en-IN")} />
        <SummaryCard label="Entries" value={filtered.length} />
        <SummaryCard label="Photos" value={photoCount} />
        <SummaryCard label="Audit Events" value={logs.length} />
      </div>

      <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 items-stretch sm:items-center">
        <DateRangeFilter startDate={startDate} endDate={endDate} onStartDateChange={setStartDate} onEndDateChange={setEndDate} onPreset={(p) => { const r = getDateRangePreset(p); setStartDate(r.startDate); setEndDate(r.endDate); }} />
        <div className="flex gap-2 items-stretch flex-wrap sm:flex-nowrap">
          <select value={paymentFilter} onChange={(e) => setPaymentFilter(e.target.value)} className={"bg-white border border-stone-200 rounded px-3 py-2 text-sm text-stone-700 flex-1 sm:flex-initial min-w-0"}>
            <option value="">All payments</option>
            <option value="cash">Cash</option>
            <option value="scan">Scan</option>
          </select>
          <select value={workerFilter} onChange={(e) => setWorkerFilter(e.target.value)} className={"bg-white border border-stone-200 rounded px-3 py-2 text-sm text-stone-700 flex-1 sm:flex-initial min-w-0"}>
            <option value="">All workers</option>
            {users.map((u) => <option key={u.uid} value={u.uid}>{u.name}</option>)}
          </select>
          <input type="text" value={itemSearch} onChange={(e) => setItemSearch(e.target.value)} className="bg-white border border-stone-200 rounded px-3 py-2 text-sm text-stone-700 w-full sm:w-36" placeholder="Search..." />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="border border-stone-200 rounded p-3 bg-white">
          <h3 className="text-xs uppercase tracking-wider text-stone-400 mb-3">Sales by Day</h3>
          {salesByDay.length === 0 ? <EmptyState title="No data" /> : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={salesByDay}>
                <XAxis dataKey="date" tick={{ fill: "#a8a29e", fontSize: 10 }} />
                <YAxis tick={{ fill: "#a8a29e", fontSize: 10 }} />
                <Tooltip contentStyle={{ background: "#fff", border: "1px solid #e7e5e4", borderRadius: 4, fontSize: 11 }} />
                <Bar dataKey="total" fill="#059669" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="border border-stone-200 rounded p-3 bg-white">
          <h3 className="text-xs uppercase tracking-wider text-stone-400 mb-3">Cash vs Scan</h3>
          {cashVsScan.every((c) => c.value === 0) ? <EmptyState title="No data" /> : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={cashVsScan} cx="50%" cy="50%" outerRadius={70} dataKey="value" label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}>
                  {cashVsScan.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "#fff", border: "1px solid #e7e5e4", borderRadius: 4, fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="border border-stone-200 rounded p-3 bg-white lg:col-span-2">
          <h3 className="text-xs uppercase tracking-wider text-stone-400 mb-3">Item-wise Sales</h3>
          {itemTotals.length === 0 ? <EmptyState title="No data" /> : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-stone-200 text-[10px] uppercase tracking-wider text-stone-400">
                    <th className="text-left py-1.5 px-2 font-medium">Item</th>
                    <th className="text-right py-1.5 px-2 font-medium">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {itemTotals.map((item) => (
                    <tr key={item.item} className="border-b border-stone-100">
                      <td className="py-1.5 px-2 text-stone-700">{item.item}</td>
                      <td className="py-1.5 px-2 text-stone-700 text-right font-medium">{"\u20B9" + item.amount.toLocaleString("en-IN")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
