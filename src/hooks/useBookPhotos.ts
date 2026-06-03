import { useState, useCallback } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import { db } from "../firebase/firestore";
import { storage } from "../firebase/storage";
import { createAuditLog } from "../utils/auditLogger";
import type { BookPhoto, AppUser } from "../types";

export function useBookPhotos(user: AppUser | null) {
  const [photos, setPhotos] = useState<BookPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const fetchPhotos = useCallback(
    async (date?: string) => {
      if (!user) return;
      setLoading(true);
      try {
        const constraints: import("@firebase/firestore").QueryConstraint[] = [
          orderBy("createdAt", "desc"),
        ];

        if (user.role === "worker") {
          constraints.push(where("uploadedBy", "==", user.uid));
        }

        if (date !== undefined) {
          constraints.push(where("date", "==", date));
        }

        const q = query(collection(db, "bookPhotos"), ...constraints);
        const snapshot = await getDocs(q);
        const list = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as BookPhoto[];
        setPhotos(list);
      } catch (error) {
        console.error("Error fetching photos:", error);
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  const uploadPhotos = async (
    files: File[],
    date: string
  ) => {
    if (!user) return;
    setUploading(true);
    try {
      const promises = files.map(async (file) => {
        const timestamp = Date.now();
        const storagePath = `bookPhotos/${date}/${user.uid}/${timestamp}_${file.name}`;
        const storageRef = ref(storage, storagePath);

        const uploadTask = await uploadBytesResumable(storageRef, file);
        const downloadURL = await getDownloadURL(uploadTask.ref);

        const docRef = await addDoc(collection(db, "bookPhotos"), {
          date,
          uploadedBy: user.uid,
          uploadedByName: user.name,
          storagePath,
          downloadURL,
          createdAt: serverTimestamp(),
        });

        await createAuditLog({
          action: "create",
          entityType: "bookPhoto",
          entityId: docRef.id,
          performedBy: user.uid,
          performedByName: user.name,
          performedByRole: user.role,
          after: {
            date,
            storagePath,
            downloadURL,
          },
        });

        return docRef.id;
      });

      await Promise.all(promises);
      await fetchPhotos(date);
    } catch (error) {
      console.error("Error uploading photos:", error);
      throw error;
    } finally {
      setUploading(false);
    }
  };

  return { photos, loading, uploading, fetchPhotos, uploadPhotos };
}

export function useAllBookPhotos() {
  const [photos, setPhotos] = useState<BookPhoto[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async (date?: string) => {
    setLoading(true);
    try {
      const constraints: import("@firebase/firestore").QueryConstraint[] = [
        orderBy("createdAt", "desc"),
      ];

      if (date !== undefined) {
        constraints.push(where("date", "==", date));
      }

      const q = query(collection(db, "bookPhotos"), ...constraints);
      const snapshot = await getDocs(q);
      const list = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as BookPhoto[];
      setPhotos(list);
    } catch (error) {
      console.error("Error fetching photos:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  return { photos, loading, fetchAll };
}
