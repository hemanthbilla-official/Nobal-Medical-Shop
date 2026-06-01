import type { SalesEntry } from "../types";
import { PaymentTypeBadge } from "./PaymentTypeBadge";

interface Props {
  entries: SalesEntry[];
  onEdit?: (entry: SalesEntry) => void;
  onDelete?: (entry: SalesEntry) => void;
  showWorker?: boolean;
  loading?: boolean;
}

export function SalesEntryTable({
  entries,
  onEdit,
  onDelete,
  showWorker = false,
  loading = false,
}: Props) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-6 w-6 rounded-full border-2 border-stone-300 border-t-stone-600 animate-spin" />
      </div>
    );
  }

  if (entries.length === 0) {
    return <p className="text-sm text-stone-400 py-10 text-center">No entries</p>;
  }

  return (
    <div className="overflow-x-auto -mx-4 sm:mx-0">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-stone-200 text-xs uppercase tracking-wider text-stone-400">
            <th className="text-left py-3 px-4 font-medium">S.No</th>
            <th className="text-left py-3 px-4 font-medium">Item</th>
            <th className="text-left py-3 px-4 font-medium">Type</th>
            <th className="text-right py-3 px-4 font-medium">Amount</th>
            <th className="text-left py-3 px-4 font-medium hidden sm:table-cell">Date</th>
            {showWorker && <th className="text-left py-3 px-4 font-medium hidden sm:table-cell">Worker</th>}
            <th className="text-right py-3 px-4 font-medium"></th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry, index) => (
            <tr key={entry.id} className="border-b border-stone-100 hover:bg-stone-50 transition-colors">
              <td className="py-3 px-4 text-stone-600">{index + 1}</td>
              <td className="py-3 px-4 text-stone-800 font-medium">{entry.itemName}</td>
              <td className="py-3 px-4"><PaymentTypeBadge type={entry.paymentType} /></td>
              <td className="py-3 px-4 text-stone-800 text-right font-medium">{"\u20B9"}{entry.amount.toLocaleString("en-IN")}</td>
              <td className="py-3 px-4 text-stone-400 hidden sm:table-cell">{entry.date}</td>
              {showWorker && <td className="py-3 px-4 text-stone-400 hidden sm:table-cell">{entry.workerName}</td>}
              <td className="py-3 px-4 text-right whitespace-nowrap">
                {onEdit && (
                  <button onClick={() => onEdit(entry)} className="text-xs text-stone-400 hover:text-stone-600 transition-colors mr-3 py-1">Edit</button>
                )}
                {onDelete && (
                  <button onClick={() => onDelete(entry)} className="text-xs text-stone-400 hover:text-red-600 transition-colors py-1">Delete</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
