import type { PaymentType } from "../types";

interface Props {
  type: PaymentType;
}

export function PaymentTypeBadge({ type }: Props) {
  return (
    <span
      className={`inline-block text-xs font-medium px-2 py-0.5 rounded ${
        type === "cash"
          ? "bg-emerald-50 text-emerald-600"
          : "bg-blue-50 text-blue-600"
      }`}
    >
      {type === "cash" ? "Cash" : "Scan"}
    </span>
  );
}
