import { useState } from "react";
import type { SalesEntryFormData, PaymentType } from "../types";
import { getTodayString, getCurrentTimeString } from "../utils/date";

interface Props {
  onSubmit: (data: SalesEntryFormData & { serialNumber: string; time: string }) => Promise<void>;
  initialData?: SalesEntryFormData & { serialNumber: string; time: string };
  submitLabel?: string;
  nextSerialNumber?: number;
}

export function SalesEntryForm({
  onSubmit,
  initialData,
  submitLabel = "Add Sale",
  nextSerialNumber = 1,
}: Props) {
  const [itemName, setItemName] = useState(initialData?.itemName ?? "");
  const [paymentType, setPaymentType] = useState<PaymentType>(
    initialData?.paymentType ?? "cash"
  );
  const [amount, setAmount] = useState(initialData?.amount ?? 0);
  const [date, setDate] = useState(initialData?.date ?? getTodayString());
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const serialNumber = initialData?.serialNumber ?? String(nextSerialNumber);
  const time = initialData?.time ?? getCurrentTimeString();

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!itemName.trim()) errs.itemName = "Required";
    if (amount < 0) errs.amount = "Must be 0 or more";
    if (!paymentType) errs.paymentType = "Required";
    if (!date) errs.date = "Required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      await onSubmit({
        itemName: itemName.trim(),
        paymentType,
        amount,
        date,
        serialNumber,
        time,
      });
      if (!initialData) {
        setItemName("");
        setPaymentType("cash");
        setAmount(0);
        setDate(getTodayString());
      }
    } catch {
      // handled by caller
    } finally {
      setSaving(false);
    }
  };

  const ipt = "w-full bg-white border border-stone-200 rounded px-3 py-2.5 text-sm text-stone-700 placeholder-stone-400 focus:outline-none focus:border-stone-400 transition-colors";
  const lbl = "block text-xs uppercase tracking-wider text-stone-400 mb-1";
  const errTxt = "text-xs text-red-500 mt-0.5";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        <div>
          <label className={lbl}>Item</label>
          <input type="text" value={itemName} onChange={(e) => setItemName(e.target.value)} className={ipt} />
          {errors.itemName && <p className={errTxt}>{errors.itemName}</p>}
        </div>
        <div>
          <label className={lbl}>Amount</label>
          <input type="text" inputMode="numeric" value={amount || ""} onChange={(e) => { const v = e.target.value.replace(/\D/g, ""); setAmount(v ? Number(v) : 0); }} className={ipt} />
          {errors.amount && <p className={errTxt}>{errors.amount}</p>}
        </div>
        <div>
          <label className={lbl}>Payment</label>
          <div className="flex gap-1.5">
            {(["cash", "scan"] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setPaymentType(type)}
                className={`flex-1 py-2.5 rounded text-sm font-medium transition-colors ${
                  paymentType === type
                    ? type === "cash"
                      ? "bg-emerald-600 text-white"
                      : "bg-blue-600 text-white"
                    : "bg-stone-100 text-stone-500 border border-stone-200"
                }`}
              >
                {type === "cash" ? "Cash" : "Scan"}
              </button>
            ))}
          </div>
          {errors.paymentType && <p className={errTxt}>{errors.paymentType}</p>}
        </div>
        <div>
          <label className={lbl}>Date</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={ipt} />
          {errors.date && <p className={errTxt}>{errors.date}</p>}
        </div>
      </div>

      <button
        type="submit"
        disabled={saving}
        className="px-5 py-2.5 bg-stone-800 hover:bg-stone-700 disabled:bg-stone-300 disabled:text-stone-500 text-white rounded text-sm font-medium transition-colors"
      >
        {saving ? "Saving..." : submitLabel}
      </button>
    </form>
  );
}
