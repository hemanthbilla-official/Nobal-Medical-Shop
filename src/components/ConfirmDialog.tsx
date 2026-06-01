interface Props {
  open: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmLabel?: string;
  destructive?: boolean;
}

export function ConfirmDialog({
  open,
  title,
  message,
  onConfirm,
  onCancel,
  confirmLabel = "Delete",
  destructive = true,
}: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 px-2 sm:px-4">
      <div className="bg-white border border-stone-200 rounded-lg p-4 sm:p-6 w-full max-w-sm shadow-sm mx-2 sm:mx-0">
        <h3 className="text-base font-medium text-stone-800 mb-2">{title}</h3>
        <p className="text-sm text-stone-500 mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="flex-1 sm:flex-initial px-4 py-2.5 sm:py-2 text-sm rounded bg-stone-100 text-stone-600 hover:bg-stone-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 sm:flex-initial px-4 py-2.5 sm:py-2 text-sm rounded transition-colors ${
              destructive
                ? "bg-red-600 text-white hover:bg-red-500"
                : "bg-stone-800 text-white hover:bg-stone-700"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
