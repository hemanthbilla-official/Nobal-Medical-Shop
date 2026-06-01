import { useState } from "react";
import { useAuth } from "../auth/useAuth";
import { useSalesEntries } from "../../hooks/useSalesEntries";
import { SalesEntryForm } from "../../components/SalesEntryForm";
import { SalesEntryTable } from "../../components/SalesEntryTable";
import { SummaryCard } from "../../components/SummaryCard";
import { ConfirmDialog } from "../../components/ConfirmDialog";
import { EmptyState } from "../../components/EmptyState";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import { summaryCardData } from "../../utils/format";
import { getTodayString } from "../../utils/date";
import toast from "react-hot-toast";
import type { SalesEntry, SalesEntryFormData } from "../../types";

export function WorkerDashboard() {
  const { user } = useAuth();
  const { entries, loading, createEntry, updateEntry, deleteEntry, fetchEntries } = useSalesEntries(user);
  const [editingEntry, setEditingEntry] = useState<SalesEntry | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<SalesEntry | null>(null);
  const today = getTodayString();

  const todayEntries = entries.filter((e) => !e.isDeleted && e.date === today);
  const stats = summaryCardData(todayEntries);

  const handleCreate = async (data: SalesEntryFormData & { serialNumber: string; time: string }) => {
    try {
      await createEntry(data);
      toast.success("Sale added");
      await fetchEntries({ date: today });
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
      await fetchEntries({ date: today });
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
      await fetchEntries({ date: today });
    } catch {
      toast.error("Failed to delete entry");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-medium text-stone-800 mb-3">Add Sale</h2>
        <div className="border border-stone-200 rounded p-4 bg-white">
          <SalesEntryForm
            onSubmit={handleCreate}
            submitLabel="Add Sale"
            nextSerialNumber={todayEntries.length + 1}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <SummaryCard label="Total" value={"\u20B9" + stats.totalSales.toLocaleString("en-IN")} />
        <SummaryCard label="Cash" value={"\u20B9" + stats.cashTotal.toLocaleString("en-IN")} />
        <SummaryCard label="Scan" value={"\u20B9" + stats.scanTotal.toLocaleString("en-IN")} />
        <SummaryCard label="Entries" value={todayEntries.length} />
      </div>

      <div>
        <h3 className="text-sm font-medium text-stone-500 uppercase tracking-wider mb-2">Today's Sales</h3>
        {loading ? <LoadingSpinner /> : todayEntries.length === 0 ? (
          <EmptyState title="No sales yet today" message="Add a sale using the form above." />
        ) : (
          <div className="border border-stone-200 rounded bg-white overflow-hidden">
            <SalesEntryTable
              entries={todayEntries}
              onEdit={(entry) => entry.date === today && setEditingEntry(entry)}
              onDelete={(entry) => entry.date === today && setDeleteTarget(entry)}
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
