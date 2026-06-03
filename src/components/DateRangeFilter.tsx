interface Props {
  startDate: string;
  endDate: string;
  onStartDateChange: (val: string) => void;
  onEndDateChange: (val: string) => void;
  onPreset?: (preset: "today" | "yesterday" | "week" | "month" | "year") => void;
}

export function DateRangeFilter({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onPreset,
}: Props) {
  return (
    <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-1 sm:gap-2">
      <div className="flex items-center gap-1 sm:gap-2">
        <input
          type="date"
          value={startDate}
          onChange={(e) => onStartDateChange(e.target.value)}
          className="bg-white border border-stone-200 rounded px-2 sm:px-3 py-2 text-sm text-stone-700 w-[calc(50vw-2.5rem)] sm:w-32 lg:w-36"
        />
        <span className="text-xs text-stone-400 shrink-0">to</span>
        <input
          type="date"
          value={endDate}
          onChange={(e) => onEndDateChange(e.target.value)}
          className="bg-white border border-stone-200 rounded px-2 sm:px-3 py-2 text-sm text-stone-700 w-[calc(50vw-2.5rem)] sm:w-32 lg:w-36"
        />
      </div>
      {onPreset && (
        <div className="flex gap-1">
          {(["today", "yesterday", "week", "month", "year"] as const).map((p) => (
            <button
              key={p}
              onClick={() => onPreset(p)}
              className="px-2.5 sm:px-3 py-2 text-xs rounded bg-stone-100 text-stone-500 hover:bg-stone-200 transition-colors capitalize"
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
