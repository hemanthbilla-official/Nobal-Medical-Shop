import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAllEntries } from "../../hooks/useSalesEntries";
import { useUsers } from "../../hooks/useUsers";
import { SalesEntryTable } from "../../components/SalesEntryTable";
import { SummaryCard } from "../../components/SummaryCard";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import { EmptyState } from "../../components/EmptyState";
import { DateRangeFilter } from "../../components/DateRangeFilter";
import { summaryCardData } from "../../utils/format";
import { getDateRangePreset, getTodayString, getYesterdayString, toDateString } from "../../utils/date";
import type { SalesEntry } from "../../types";

const selectCss = "bg-white border border-stone-200 rounded px-3 py-2 text-sm text-stone-700 flex-1 sm:flex-initial min-w-0";

const getEntryCreatedDate = (entry: SalesEntry): string => {
  const createdAt = entry.createdAt;
  if (createdAt?.toDate) {
    return toDateString(createdAt.toDate());
  }
  if (createdAt?.seconds) {
    return toDateString(new Date(createdAt.seconds * 1000));
  }
  return "";
};

export function OwnerDashboard() {
  const { entries, loading, fetchAll } = useAllEntries();
  const { entries: missedEntriesSource, loading: missedLoading, fetchAll: fetchMissedEntries } = useAllEntries();
  const { users } = useUsers();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [workerFilter, setWorkerFilter] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("");
  const [itemSearch, setItemSearch] = useState("");
  const today = getTodayString();

  useEffect(() => {
    void Promise.resolve().then(() =>
      fetchAll({
        startDate,
        endDate,
        workerId: workerFilter,
        paymentType: paymentFilter,
      })
    );
  }, [endDate, fetchAll, paymentFilter, startDate, workerFilter]);

  useEffect(() => {
    void Promise.resolve().then(() =>
      fetchMissedEntries({
        endDate: getYesterdayString(),
      })
    );
  }, [fetchMissedEntries]);

  const filtered = useMemo(() => {
    if (!itemSearch) return entries;
    return entries.filter((e) => e.itemName.toLowerCase().includes(itemSearch.toLowerCase()));
  }, [entries, itemSearch]);

  const missedEntries = useMemo(
    () => missedEntriesSource.filter((entry) => entry.date < today && getEntryCreatedDate(entry) === today),
    [missedEntriesSource, today]
  );
  const stats = summaryCardData(filtered);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-medium text-stone-800">Dashboard</h2>
          <p className="text-xs text-stone-400 mt-0.5">Review daily totals and missed-date activity.</p>
        </div>
        <Link to="/owner/entries" className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-white rounded text-sm font-medium transition-colors text-center">
          Manage Entries
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <SummaryCard label="Total Sales" value={"\u20B9" + stats.totalSales.toLocaleString("en-IN")} />
        <SummaryCard label="Cash" value={"\u20B9" + stats.cashTotal.toLocaleString("en-IN")} />
        <SummaryCard label="Scan" value={"\u20B9" + stats.scanTotal.toLocaleString("en-IN")} />
        <SummaryCard label="Entries" value={filtered.length} />
      </div>

      <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 items-stretch sm:items-center">
        <DateRangeFilter startDate={startDate} endDate={endDate} onStartDateChange={setStartDate} onEndDateChange={setEndDate} onPreset={(p) => { const r = getDateRangePreset(p); setStartDate(r.startDate); setEndDate(r.endDate); }} />
        <div className="flex gap-2 items-stretch flex-wrap sm:flex-nowrap">
          <select value={workerFilter} onChange={(e) => setWorkerFilter(e.target.value)} className={selectCss}>
            <option value="">All workers</option>
            {users.map((u) => <option key={u.uid} value={u.uid}>{u.name}</option>)}
          </select>
          <select value={paymentFilter} onChange={(e) => setPaymentFilter(e.target.value)} className={selectCss}>
            <option value="">All payments</option>
            <option value="cash">Cash</option>
            <option value="scan">Scan</option>
          </select>
          <input type="text" value={itemSearch} onChange={(e) => setItemSearch(e.target.value)} className="bg-white border border-stone-200 rounded px-3 py-2 text-sm text-stone-700 w-full sm:w-36" placeholder="Search item..." />
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-stone-500 uppercase tracking-wider mb-2">Review Entries</h3>
        {loading ? <LoadingSpinner /> : filtered.length === 0 ? (
          <EmptyState title="No entries" message="Adjust filters or manage entries from the Entries page." />
        ) : (
          <div className="border border-stone-200 rounded bg-white overflow-hidden">
            <SalesEntryTable entries={filtered} showWorker />
          </div>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-stone-500 uppercase tracking-wider">Missed Entries</h3>
          <span className="text-xs text-stone-400">Created today with an older sale date</span>
        </div>
        {missedLoading ? <LoadingSpinner /> : missedEntries.length === 0 ? (
          <EmptyState title="No missed entries today" message="Backdated entries created today will appear here." />
        ) : (
          <div className="border border-stone-200 rounded bg-white overflow-hidden">
            <SalesEntryTable entries={missedEntries} showWorker />
          </div>
        )}
      </div>
    </div>
  );
}
