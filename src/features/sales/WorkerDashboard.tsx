import { useEffect, useState } from "react";
import { useAuth } from "../auth/useAuth";
import { useSalesEntries } from "../../hooks/useSalesEntries";
import { SalesEntryForm } from "../../components/SalesEntryForm";
import { SalesEntryTable } from "../../components/SalesEntryTable";
import { SummaryCard } from "../../components/SummaryCard";
import { ConfirmDialog } from "../../components/ConfirmDialog";
import { EmptyState } from "../../components/EmptyState";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import { summaryCardData } from "../../utils/format";
import { addDaysToDateString, getTodayString, getYesterdayString } from "../../utils/date";
import toast from "react-hot-toast";
import type { SalesEntry, SalesEntryFormData } from "../../types";

export function WorkerDashboard() {
  const { user } = useAuth();
  const { entries, loading, createEntry, updateEntry, deleteEntry, fetchEntries } = useSalesEntries(user);
  const [editingEntry, setEditingEntry] = useState<SalesEntry | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<SalesEntry | null>(null);
  const [selectedDate, setSelectedDate] = useState(getTodayString());

  const activeEntries = entries.filter((e) => !e.isDeleted);
  const stats = summaryCardData(activeEntries);
  const dateButtonCss = "px-3 py-2 bg-white hover:bg-stone-100 text-stone-600 rounded text-xs font-medium transition-colors border border-stone-200";
  const shiftSelectedDate = (days: number) => {
    setSelectedDate((date) => addDaysToDateString(date || getTodayString(), days));
  };

  useEffect(() => {
    if (user) {
      void Promise.resolve().then(() => fetchEntries({ date: selectedDate }));
    }
  }, [fetchEntries, selectedDate, user]);

  const handleCreate = async (data: SalesEntryFormData & { serialNumber: string; time: string }) => {
    try {
      await createEntry(data);
      toast.success("Sale added");
      await fetchEntries({ date: data.date });
    } catch {
      toast.error("Failed to add sale");
    }
  };

  const handleUpdate = async (data: SalesEntryFormData & { serialNumber: string; time: string }) => {
    if (!editingEntry) return;
    try {
      await updateEntry(editingEntry.id, data, editingEntry);
      toast.success("Entry updated");
      setEditingEntry(null);
      await fetchEntries({ date: selectedDate });
    } catch {
      toast.error("Failed to update entry");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteEntry(deleteTarget.id, deleteTarget);
      toast.success("Entry deleted");
      setDeleteTarget(null);
      await fetchEntries({ date: selectedDate });
    } catch {
      toast.error("Failed to delete entry");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-3">
          <h2 className="text-base font-medium text-stone-800">Add Sale</h2>
          <div className="grid grid-cols-2 gap-1.5 sm:flex sm:flex-wrap">
            <button type="button" onClick={() => setSelectedDate(getTodayString())} className={dateButtonCss}>Today</button>
            <button type="button" onClick={() => setSelectedDate(getYesterdayString())} className={dateButtonCss}>Yesterday</button>
            <button type="button" onClick={() => shiftSelectedDate(-1)} className={dateButtonCss}>Previous Day</button>
            <button type="button" onClick={() => shiftSelectedDate(1)} className={dateButtonCss}>Next Day</button>
          </div>
        </div>
        <div className="border border-stone-200 rounded p-4 bg-white">
          <SalesEntryForm
            onSubmit={handleCreate}
            submitLabel="Add Sale"
            nextSerialNumber={activeEntries.length + 1}
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <SummaryCard label="Total" value={"\u20B9" + stats.totalSales.toLocaleString("en-IN")} />
        <SummaryCard label="Cash" value={"\u20B9" + stats.cashTotal.toLocaleString("en-IN")} />
        <SummaryCard label="Scan" value={"\u20B9" + stats.scanTotal.toLocaleString("en-IN")} />
        <SummaryCard label="Entries" value={activeEntries.length} />
      </div>

      <div>
        <h3 className="text-sm font-medium text-stone-500 uppercase tracking-wider mb-2">Sales for {selectedDate}</h3>
        {loading ? <LoadingSpinner /> : activeEntries.length === 0 ? (
          <EmptyState title="No sales yet" message="Add a sale using the form above." />
        ) : (
          <div className="border border-stone-200 rounded bg-white overflow-hidden">
            <SalesEntryTable
              entries={activeEntries}
              onEdit={setEditingEntry}
              onDelete={setDeleteTarget}
            />
          </div>
        )}
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Entry"
        message={`Delete ${deleteTarget?.itemName} (S.No ${deleteTarget?.serialNumber})?`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {editingEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 px-2 sm:px-4">
          <div className="bg-white border border-stone-200 rounded p-4 sm:p-5 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-sm mx-2 sm:mx-0">
            <h3 className="text-base font-medium text-stone-800 mb-3">Edit Sale</h3>
            <SalesEntryForm onSubmit={handleUpdate} initialData={{ serialNumber: editingEntry.serialNumber, itemName: editingEntry.itemName, paymentType: editingEntry.paymentType, amount: editingEntry.amount, date: editingEntry.date, time: editingEntry.time }} submitLabel="Update Sale" />
            <button onClick={() => setEditingEntry(null)} className="mt-3 text-xs text-stone-400 hover:text-stone-600">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
