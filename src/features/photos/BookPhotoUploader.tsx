import { useEffect, useRef, useState } from "react";
import { useAuth } from "../auth/useAuth";
import { useBookPhotos } from "../../hooks/useBookPhotos";
import { addDaysToDateString, getTodayString, getYesterdayString } from "../../utils/date";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import { EmptyState } from "../../components/EmptyState";
import toast from "react-hot-toast";

export function BookPhotoUploader() {
  const { user } = useAuth();
  const { photos, loading, uploading, uploadPhotos, fetchPhotos } = useBookPhotos(user);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState(getTodayString());
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dateButtonCss = "px-3 py-2 bg-white hover:bg-stone-100 text-stone-600 rounded text-xs font-medium transition-colors border border-stone-200";

  useEffect(() => {
    if (user) {
      void Promise.resolve().then(() => fetchPhotos(selectedDate));
    }
  }, [fetchPhotos, selectedDate, user]);

  const shiftSelectedDate = (days: number) => {
    setSelectedDate((date) => addDaysToDateString(date || getTodayString(), days));
  };

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const fileArray = Array.from(files).filter((f) => f.type.startsWith("image/"));
    setSelectedFiles((prev) => [...prev, ...fileArray]);
    setPreviews((prev) => [...prev, ...fileArray.map((f) => URL.createObjectURL(f))]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => { URL.revokeObjectURL(prev[index]); return prev.filter((_, i) => i !== index); });
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) { toast.error("Select at least one photo"); return; }
    if (!selectedDate) { toast.error("Select a date"); return; }
    try {
      await uploadPhotos(selectedFiles, selectedDate);
      toast.success(`${selectedFiles.length} photo(s) uploaded`);
      setSelectedFiles([]);
      setPreviews([]);
    } catch { toast.error("Upload failed"); }
  };

  const selectedDatePhotos = photos.filter((p) => p.date === selectedDate);

  return (
    <div className="space-y-6">
      <div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-3">
          <h2 className="text-base font-medium text-stone-800">Upload Book Photos</h2>
          <div className="grid grid-cols-2 gap-1.5 sm:flex sm:flex-wrap">
            <button type="button" onClick={() => setSelectedDate(getTodayString())} className={dateButtonCss}>Today</button>
            <button type="button" onClick={() => setSelectedDate(getYesterdayString())} className={dateButtonCss}>Yesterday</button>
            <button type="button" onClick={() => shiftSelectedDate(-1)} className={dateButtonCss}>Previous Day</button>
            <button type="button" onClick={() => shiftSelectedDate(1)} className={dateButtonCss}>Next Day</button>
          </div>
        </div>
        <div className="border border-stone-200 rounded p-4 bg-white space-y-3">
          <div>
            <label className="block text-xs uppercase tracking-wider text-stone-400 mb-1">Date</label>
            <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="w-full sm:w-48 bg-white border border-stone-200 rounded px-3 py-2.5 text-sm text-stone-700 focus:outline-none focus:border-stone-400 transition-colors" />
          </div>
          <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-stone-200 rounded p-6 text-center cursor-pointer hover:border-stone-400 transition-colors">
            <p className="text-sm text-stone-400">Tap to select or capture photos</p>
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" multiple capture="environment" className="hidden" onChange={(e) => handleFiles(e.target.files)} />

          {previews.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {previews.map((src, i) => (
                <div key={i} className="relative group">
                  <img src={src} alt="" className="w-full h-24 object-cover rounded border border-stone-200" />
                  <button onClick={() => removeFile(i)} className="absolute top-0.5 right-0.5 h-5 w-5 bg-red-500 text-white rounded-full text-[10px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">x</button>
                </div>
              ))}
            </div>
          )}

          {previews.length > 0 && (
            <button onClick={handleUpload} disabled={uploading} className="px-5 py-2.5 bg-stone-800 hover:bg-stone-700 disabled:bg-stone-300 disabled:text-stone-500 text-white rounded text-sm font-medium transition-colors">
              {uploading ? "Uploading..." : `Upload ${selectedFiles.length} photo(s)`}
            </button>
          )}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-stone-500 uppercase tracking-wider mb-2">Photos for {selectedDate} ({selectedDatePhotos.length})</h3>
        {loading ? <LoadingSpinner /> : selectedDatePhotos.length === 0 ? (
          <EmptyState title="No photos found" message="Upload book photos using the section above." />
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {selectedDatePhotos.map((photo) => (
              <a key={photo.id} href={photo.downloadURL} target="_blank" rel="noopener noreferrer">
                <img src={photo.downloadURL} alt="" className="w-full h-24 object-cover rounded border border-stone-200 hover:opacity-80 transition-opacity" />
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
