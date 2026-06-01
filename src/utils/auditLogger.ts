import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/firestore";
import type { UserRole } from "../types";

interface AuditLogInput {
  action: "create" | "update" | "delete";
  entityType: "salesEntry" | "bookPhoto";
  entityId: string;
  performedBy: string;
  performedByName: string;
  performedByRole: UserRole;
  before?: Record<string, unknown> | null;
  after?: Record<string, unknown> | null;
}

export const createAuditLog = async (input: AuditLogInput) => {
  try {
    await addDoc(collection(db, "auditLogs"), {
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId,
      performedBy: input.performedBy,
      performedByName: input.performedByName,
      performedByRole: input.performedByRole,
      before: input.before ?? null,
      after: input.after ?? null,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Failed to create audit log:", error);
  }
};
