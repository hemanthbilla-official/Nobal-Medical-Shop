import { useState, useEffect } from "react";
import { useAuth } from "../auth/useAuth";
import { useAllEntries } from "../../hooks/useSalesEntries";
import { SalesEntryTable } from "../../components/SalesEntryTable";
import { SalesEntryForm } from "../../components/SalesEntryForm";
import { DateRangeFilter } from "../../components/DateRangeFilter";
import { ConfirmDialog } from "../../components/ConfirmDialog";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import { EmptyState } from "../../components/EmptyState";
import { addDoc, collection, updateDoc, doc, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase/firestore";
import { createAuditLog } from "../../utils/auditLogger";
import { getDateRangePreset, getTodayString } from "../../utils/date";
import toast from "react-hot-toast";
import type { SalesEntry, SalesEntryFormData } from "../../types";

export function AllSalesEntries() {
  const { user } = useAuth();
  const { entries, loading, fetchAll } = useAllEntries();
  const [editingEntry, setEditingEntry] = useState<SalesEntry | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<SalesEntry | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("");
  const [itemSearch, setItemSearch] = useState("");

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const activeEntries = entries.filter((e) => !e.isDeleted);
  const todayStr = getTodayString();
  const todayEntries = activeEntries.filter((e) => e.date === todayStr);

  const filtered = activeEntries.filter((e) => {
    if (startDate && e.date < startDate) return false;
    if (endDate && e.date > endDate) return false;
    if (paymentFilter && e.paymentType !== paymentFilter) return false;
    if (itemSearch && !e.itemName.toLowerCase().includes(itemSearch.toLowerCase())) return false;
    return true;
  });

  const handleUpdate = async (data: SalesEntryFormData & { serialNumber: string; time: string }) => {
    if (!editingEntry) return;
    try {
      await updateDoc(doc(db, "salesEntries", editingEntry.id), { ...data, updatedAt: serverTimestamp() });
      await createAuditLog({ action: "update", entityType: "salesEntry", entityId: editingEntry.id, performedBy: user!.uid, performedByName: user!.name, performedByRole: user!.role, before: editingEntry as unknown as Record<string, unknown>, after: { ...editingEntry, ...data } as unknown as Record<string, unknown> });
      toast.success("Entry updated");
      setEditingEntry(null);
      await fetchAll();
    } catch { toast.error("Failed to update entry"); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await updateDoc(doc(db, "salesEntries", deleteTarget.id), { isDeleted: true, deletedAt: serverTimestamp(), updatedAt: serverTimestamp() });
      await createAuditLog({ action: "delete", entityType: "salesEntry", entityId: deleteTarget.id, performedBy: user!.uid, performedByName: user!.name, performedByRole: user!.role, before: deleteTarget as unknown as Record<string, unknown>, after: { ...deleteTarget, isDeleted: true } as unknown as Record<string, unknown> });
      toast.success("Entry deleted");
      setDeleteTarget(null);
      await fetchAll();
    } catch { toast.error("Failed to delete entry"); }
  };

  const handleCreate = async (data: SalesEntryFormData & { serialNumber: string; time: string }) => {
    try {
      const entryData = { ...data, workerId: user!.uid, workerName: user!.name, createdBy: user!.uid, createdAt: serverTimestamp(), updatedAt: null, deletedAt: null, isDeleted: false };
      const docRef = await addDoc(collection(db, "salesEntries"), entryData);
      await createAuditLog({ action: "create", entityType: "salesEntry", entityId: docRef.id, performedBy: user!.uid, performedByName: user!.name, performedByRole: user!.role, after: entryData as unknown as Record<string, unknown> });
      toast.success("Sale added");
      setShowAddForm(false);
      await fetchAll();
    } catch { toast.error("Failed to add sale"); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-medium text-stone-800">All Entries</h2>
        <button onClick={() => setShowAddForm(!showAddForm)} className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-white rounded text-sm font-medium transition-colors">
          {showAddForm ? "Cancel" : "Add Sale"}
        </button>
      </div>

      {showAddForm && !editingEntry && (
        <div className="border border-stone-200 rounded p-4 bg-white">
          <SalesEntryForm onSubmit={handleCreate} submitLabel="Add Sale" nextSerialNumber={todayEntries.length + 1} />
        </div>
      )}

      {editingEntry && (
        <div className="border border-stone-200 rounded p-4 bg-white">
          <SalesEntryForm onSubmit={handleUpdate} initialData={{ serialNumber: editingEntry.serialNumber, itemName: editingEntry.itemName, paymentType: editingEntry.paymentType, amount: editingEntry.amount, date: editingEntry.date, time: editingEntry.time }} submitLabel="Update Sale" />
          <button onClick={() => setEditingEntry(null)} className="mt-3 text-xs text-stone-400 hover:text-stone-600">Cancel</button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 items-stretch sm:items-center">
        <DateRangeFilter startDate={startDate} endDate={endDate} onStartDateChange={setStartDate} onEndDateChange={setEndDate} onPreset={(p) => { const r = getDateRangePreset(p); setStartDate(r.startDate); setEndDate(r.endDate); }} />
        <div className="flex gap-2 items-stretch">
          <select value={paymentFilter} onChange={(e) => setPaymentFilter(e.target.value)} className="bg-white border border-stone-200 rounded px-3 py-2 text-sm text-stone-700 flex-1 sm:flex-initial min-w-0">
            <option value="">All payments</option>
            <option value="cash">Cash</option>
            <option value="scan">Scan</option>
          </select>
          <input type="text" value={itemSearch} onChange={(e) => setItemSearch(e.target.value)} className="bg-white border border-stone-200 rounded px-3 py-2 text-sm text-stone-700 w-full sm:w-36" placeholder="Search..." />
        </div>
      </div>

      {loading ? <LoadingSpinner /> : filtered.length === 0 ? (
        <EmptyState title="No entries" message="Adjust filters or add a new sale." />
      ) : (
        <div className="border border-stone-200 rounded bg-white overflow-hidden">
          <SalesEntryTable entries={filtered} onEdit={setEditingEntry} onDelete={setDeleteTarget} showWorker />
        </div>
      )}

      <ConfirmDialog open={!!deleteTarget} title="Delete Entry" message={`Delete ${deleteTarget?.itemName} (S.No ${deleteTarget?.serialNumber})?`} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />
    </div>
  );
}
