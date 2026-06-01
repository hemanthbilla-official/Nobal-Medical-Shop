import { useState, useEffect } from "react";
import { useAllBookPhotos } from "../../hooks/useBookPhotos";
import { DateRangeFilter } from "../../components/DateRangeFilter";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import { EmptyState } from "../../components/EmptyState";
import { getDateRangePreset } from "../../utils/date";

export function BookPhotoHistory() {
  const { photos, loading, fetchAll } = useAllBookPhotos();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const filtered = photos.filter((p) => {
    if (startDate && p.date < startDate) return false;
    if (endDate && p.date > endDate) return false;
    return true;
  });

  const grouped = filtered.reduce<Record<string, typeof photos>>((acc, p) => {
    if (!acc[p.date]) acc[p.date] = [];
    acc[p.date].push(p);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <h2 className="text-base font-medium text-stone-800">Book Photo History</h2>

      <DateRangeFilter startDate={startDate} endDate={endDate} onStartDateChange={setStartDate} onEndDateChange={setEndDate} onPreset={(p) => { const r = getDateRangePreset(p); setStartDate(r.startDate); setEndDate(r.endDate); }} />

      {loading ? <LoadingSpinner /> : Object.keys(grouped).length === 0 ? (
        <EmptyState title="No photos found" message="No book photos uploaded for the selected range." />
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).sort(([a], [b]) => b.localeCompare(a)).map(([date, datePhotos]) => (
            <div key={date}>
              <h3 className="text-sm text-stone-500 mb-2">{date} ({datePhotos.length})</h3>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {datePhotos.map((photo) => (
                  <a key={photo.id} href={photo.downloadURL} target="_blank" rel="noopener noreferrer" className="block group">
                    <img src={photo.downloadURL} alt="" className="w-full h-24 object-cover rounded border border-stone-200 group-hover:opacity-80 transition-opacity" />
                    <p className="text-[10px] text-stone-400 mt-0.5">{photo.uploadedByName}</p>
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
