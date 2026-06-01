import { useState, useEffect } from "react";
import { useAuditLogs } from "../../hooks/useAuditLogs";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import { EmptyState } from "../../components/EmptyState";
import { formatTimestamp } from "../../utils/date";

export function AuditLogTable() {
  const { logs, loading, fetchLogs } = useAuditLogs();
  const [filter, setFilter] = useState("");

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const filtered = filter ? logs.filter((l) => l.action === filter) : logs;

  const actionStyles: Record<string, string> = {
    create: "text-emerald-600",
    update: "text-blue-600",
    delete: "text-red-600",
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-medium text-stone-800">Audit Logs</h2>
        <button onClick={() => fetchLogs()} className="px-3 py-2 text-xs bg-stone-100 hover:bg-stone-200 text-stone-600 rounded transition-colors">Refresh</button>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {["", "create", "update", "delete"].map((a) => (
          <button key={a} onClick={() => setFilter(a)} className={`px-3 py-2 rounded text-xs transition-colors font-medium ${filter === a ? "bg-stone-800 text-white" : "bg-stone-100 text-stone-500 hover:bg-stone-200"}`}>
            {a || "All"}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="No audit logs" message="Actions appear here as entries are created, edited, or deleted." />
      ) : (
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-stone-200 text-[10px] uppercase tracking-wider text-stone-400">
                <th className="text-left py-2 px-3 font-medium">Action</th>
                <th className="text-left py-2 px-3 font-medium">Type</th>
                <th className="text-left py-2 px-3 font-medium">By</th>
                <th className="text-left py-2 px-3 font-medium hidden sm:table-cell">Role</th>
                <th className="text-left py-2 px-3 font-medium hidden md:table-cell">Time</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((log) => (
                <tr key={log.id} className="border-b border-stone-100 hover:bg-stone-50 transition-colors">
                  <td className="py-2 px-3"><span className={`text-[10px] font-medium uppercase ${actionStyles[log.action] || "text-stone-400"}`}>{log.action}</span></td>
                  <td className="py-2 px-3 text-stone-500">{log.entityType === "salesEntry" ? "Sale" : "Photo"}</td>
                  <td className="py-2 px-3 text-stone-600">{log.performedByName}</td>
                  <td className="py-2 px-3 text-stone-400 hidden sm:table-cell">{log.performedByRole}</td>
                  <td className="py-2 px-3 text-stone-400 hidden md:table-cell whitespace-nowrap">{log.createdAt ? formatTimestamp(log.createdAt) : "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
