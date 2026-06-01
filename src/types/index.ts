import type { Timestamp } from "firebase/firestore";

export type UserRole = "owner" | "worker";

export type PaymentType = "cash" | "scan";

export interface AppUser {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: Timestamp;
}

export interface SalesEntry {
  id: string;
  serialNumber: string;
  itemName: string;
  paymentType: PaymentType;
  amount: number;
  quantity: number;
  date: string;
  time: string;
  workerId: string;
  workerName: string;
  createdBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp | null;
  deletedAt: Timestamp | null;
  isDeleted: boolean;
}

export interface SalesEntryFormData {
  itemName: string;
  paymentType: PaymentType;
  amount: number;
  date: string;
}

export interface BookPhoto {
  id: string;
  date: string;
  uploadedBy: string;
  uploadedByName: string;
  storagePath: string;
  downloadURL: string;
  createdAt: Timestamp;
}

export interface AuditLog {
  id: string;
  action: "create" | "update" | "delete";
  entityType: "salesEntry" | "bookPhoto";
  entityId: string;
  performedBy: string;
  performedByName: string;
  performedByRole: UserRole;
  before: Record<string, unknown> | null;
  after: Record<string, unknown> | null;
  createdAt: Timestamp;
}

export interface AnalyticsFilters {
  startDate: string;
  endDate: string;
  paymentType: PaymentType | "";
  workerId: string;
  itemName: string;
}
