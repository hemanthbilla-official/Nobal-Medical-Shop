import { useState, useCallback } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
  type Timestamp,
} from "firebase/firestore";
import { db } from "../firebase/firestore";
import { createAuditLog } from "../utils/auditLogger";
import type { SalesEntry, SalesEntryFormData, AppUser } from "../types";

export function useSalesEntries(user: AppUser | null) {
  const [entries, setEntries] = useState<SalesEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEntries = useCallback(
    async (filters?: {
      date?: string;
      workerId?: string;
    }) => {
      if (!user) return;
      setLoading(true);
      try {
        const constraints: import("@firebase/firestore").QueryConstraint[] = [];

        if (user.role === "worker") {
          constraints.push(where("workerId", "==", user.uid));
          if (filters && "date" in filters) {
            constraints.push(where("date", "==", filters.date));
          }
        } else {
          constraints.push(where("isDeleted", "==", false));
          if (filters && "date" in filters) {
            constraints.push(where("date", "==", filters.date));
          }
          if (filters?.workerId) {
            constraints.push(where("workerId", "==", filters.workerId));
          }
        }

        const q = query(collection(db, "salesEntries"), ...constraints);
        const snapshot = await getDocs(q);
        let list = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as SalesEntry[];

        if (user.role === "worker") {
          list = list.filter((e) => !e.isDeleted);
        } else {
          list = list.filter((e) => !e.isDeleted);
        }

        list.sort((a, b) => {
          const dateCmp = (b.date ?? "").localeCompare(a.date ?? "");
          if (dateCmp !== 0) return dateCmp;
          return (b.time ?? "").localeCompare(a.time ?? "");
        });
        setEntries(list);
      } catch (error) {
        console.error("Error fetching entries:", error);
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  const createEntry = async (data: SalesEntryFormData & { serialNumber: string; time: string }) => {
    if (!user) return;
    const entryData = {
      ...data,
      workerId: user.uid,
      workerName: user.name,
      createdBy: user.uid,
      createdAt: serverTimestamp(),
      updatedAt: null,
      deletedAt: null,
      isDeleted: false,
    };
    const docRef = await addDoc(collection(db, "salesEntries"), entryData);
    await createAuditLog({
      action: "create",
      entityType: "salesEntry",
      entityId: docRef.id,
      performedBy: user.uid,
      performedByName: user.name,
      performedByRole: user.role,
      after: entryData as unknown as Record<string, unknown>,
    });
    return docRef.id;
  };

  const updateEntry = async (
    entryId: string,
    data: Partial<SalesEntryFormData & { serialNumber: string; time: string }>,
    previousData: SalesEntry
  ) => {
    if (!user) return;
    const updateData = {
      ...data,
      updatedAt: serverTimestamp(),
    };
    await updateDoc(doc(db, "salesEntries", entryId), updateData);
    await createAuditLog({
      action: "update",
      entityType: "salesEntry",
      entityId: entryId,
      performedBy: user.uid,
      performedByName: user.name,
      performedByRole: user.role,
      before: previousData as unknown as Record<string, unknown>,
      after: { ...previousData, ...data, updatedAt: serverTimestamp() } as unknown as Record<string, unknown>,
    });
  };

  const deleteEntry = async (
    entryId: string,
    previousData: SalesEntry
  ) => {
    if (!user) return;
    await updateDoc(doc(db, "salesEntries", entryId), {
      isDeleted: true,
      deletedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    await createAuditLog({
      action: "delete",
      entityType: "salesEntry",
      entityId: entryId,
      performedBy: user.uid,
      performedByName: user.name,
      performedByRole: user.role,
      before: previousData as unknown as Record<string, unknown>,
      after: {
        ...previousData,
        isDeleted: true,
        deletedAt: serverTimestamp() as Timestamp,
      } as unknown as Record<string, unknown>,
    });
  };

  return { entries, loading, fetchEntries, createEntry, updateEntry, deleteEntry };
}

export function useAllEntries() {
  const [entries, setEntries] = useState<SalesEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(
    async (filters?: {
      startDate?: string;
      endDate?: string;
      paymentType?: string;
      workerId?: string;
      itemName?: string;
      includeDeleted?: boolean;
    }) => {
      setLoading(true);
      try {
        const constraints: import("@firebase/firestore").QueryConstraint[] = [];

        if (!filters?.includeDeleted) {
          constraints.push(where("isDeleted", "==", false));
        }
        if (filters?.startDate) {
          constraints.push(where("date", ">=", filters.startDate));
        }
        if (filters?.endDate) {
          constraints.push(where("date", "<=", filters.endDate));
        }
        if (filters?.paymentType) {
          constraints.push(where("paymentType", "==", filters.paymentType));
        }
        if (filters?.workerId) {
          constraints.push(where("workerId", "==", filters.workerId));
        }

        const q = query(collection(db, "salesEntries"), ...constraints);
        const snapshot = await getDocs(q);
        let list = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as SalesEntry[];
        list.sort((a, b) => {
          const dateCmp = (b.date ?? "").localeCompare(a.date ?? "");
          if (dateCmp !== 0) return dateCmp;
          return (b.time ?? "").localeCompare(a.time ?? "");
        });

        if (filters?.itemName) {
          list = list.filter((e) =>
            e.itemName.toLowerCase().includes(filters.itemName!.toLowerCase())
          );
        }

        setEntries(list);
      } catch (error) {
        console.error("Error fetching entries:", error);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { entries, loading, fetchAll };
}
