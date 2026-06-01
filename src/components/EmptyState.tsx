interface Props {
  title: string;
  message?: string;
}

export function EmptyState({ title, message }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-14 text-center">
      <div className="h-12 w-12 rounded-full bg-stone-100 flex items-center justify-center mb-3">
        <span className="text-stone-300 text-xl">-</span>
      </div>
      <h3 className="text-sm font-medium text-stone-600">{title}</h3>
      {message && <p className="text-sm text-stone-400 mt-1 max-w-xs">{message}</p>}
    </div>
  );
}
