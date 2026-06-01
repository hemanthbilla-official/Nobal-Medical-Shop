import { useState, useCallback } from "react";
import {
  collection,
  query,
  orderBy,
  getDocs,
  limit,
  type QueryConstraint,
} from "firebase/firestore";
import { db } from "../firebase/firestore";
import type { AuditLog } from "../types";

export function useAuditLogs() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = useCallback(async (max = 200) => {
    setLoading(true);
    try {
      const constraints: QueryConstraint[] = [
        orderBy("createdAt", "desc"),
        limit(max),
      ];
      const q = query(collection(db, "auditLogs"), ...constraints);
      const snapshot = await getDocs(q);
      const list = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as AuditLog[];
      setLogs(list);
    } catch (error) {
      console.error("Error fetching audit logs:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  return { logs, loading, fetchLogs };
}
