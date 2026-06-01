interface Props {
  label: string;
  value: string | number;
}

export function SummaryCard({ label, value }: Props) {
  return (
    <div className="border-b border-stone-100 py-2">
      <p className="text-xs uppercase tracking-wider text-stone-400">{label}</p>
      <p className="text-lg font-semibold text-stone-800 mt-0.5">{value}</p>
    </div>
  );
}
