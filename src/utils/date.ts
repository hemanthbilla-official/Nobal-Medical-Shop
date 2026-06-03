export const getTodayString = (): string => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const getCurrentTimeString = (): string => {
  const d = new Date();
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
};

export const toDateString = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const addDaysToDateString = (dateStr: string, days: number): string => {
  const [year, month, day] = dateStr.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() + days);
  return toDateString(date);
};

export const getYesterdayString = (): string => {
  return addDaysToDateString(getTodayString(), -1);
};

export const formatDate = (dateStr: string): string => {
  const [year, month, day] = dateStr.split("-");
  return `${day}/${month}/${year}`;
};

export const formatTimestamp = (timestamp: {
  toDate?: () => Date;
  seconds?: number;
}): string => {
  if (timestamp?.toDate) {
    return timestamp.toDate().toLocaleString();
  }
  if (timestamp?.seconds) {
    return new Date(timestamp.seconds * 1000).toLocaleString();
  }
  return "";
};

export const formatCurrency = (amount: number): string => {
  return amount.toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
};

export const getDateRangePreset = (
  preset: "today" | "yesterday" | "week" | "month" | "year"
): { startDate: string; endDate: string } => {
  const now = new Date();
  const end = getTodayString();

  if (preset === "today") {
    return { startDate: end, endDate: end };
  }

  if (preset === "yesterday") {
    const yesterday = getYesterdayString();
    return { startDate: yesterday, endDate: yesterday };
  }

  const start = new Date(now);
  if (preset === "week") {
    start.setDate(start.getDate() - start.getDay());
  } else if (preset === "month") {
    start.setDate(1);
  } else if (preset === "year") {
    start.setMonth(0, 1);
  }

  const sy = start.getFullYear();
  const sm = String(start.getMonth() + 1).padStart(2, "0");
  const sd = String(start.getDate()).padStart(2, "0");
  return { startDate: `${sy}-${sm}-${sd}`, endDate: end };
};
