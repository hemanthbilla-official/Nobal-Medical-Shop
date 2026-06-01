import { useState, useRef } from "react";
import { useAuth } from "../auth/useAuth";
import { useBookPhotos } from "../../hooks/useBookPhotos";
import { getTodayString } from "../../utils/date";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import { EmptyState } from "../../components/EmptyState";
import toast from "react-hot-toast";

export function BookPhotoUploader() {
  const { user } = useAuth();
  const { photos, loading, uploading, uploadPhotos, fetchPhotos } = useBookPhotos(user);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const today = getTodayString();

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
    try {
      await uploadPhotos(selectedFiles, today);
      toast.success(`${selectedFiles.length} photo(s) uploaded`);
      setSelectedFiles([]);
      setPreviews([]);
    } catch { toast.error("Upload failed"); }
  };

  const todayPhotos = photos.filter((p) => p.date === today);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-medium text-stone-800 mb-3">Upload Book Photos</h2>
        <div className="border border-stone-200 rounded p-4 bg-white space-y-3">
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
        <h3 className="text-sm font-medium text-stone-500 uppercase tracking-wider mb-2">Today's Photos ({todayPhotos.length})</h3>
        {loading ? <LoadingSpinner /> : todayPhotos.length === 0 ? (
          <EmptyState title="No photos today" message="Upload book photos using the section above." />
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {todayPhotos.map((photo) => (
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
