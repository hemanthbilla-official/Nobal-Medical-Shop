export function LoadingSpinner({ text = "Loading..." }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <div className="h-6 w-6 rounded-full border-2 border-stone-300 border-t-stone-600 animate-spin" />
      {text && <p className="text-sm text-stone-400">{text}</p>}
    </div>
  );
}
