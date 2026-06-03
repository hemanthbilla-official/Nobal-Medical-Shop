import { useEffect, useState, type ReactNode } from "react";
import { onAuthChange } from "../../firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase/firestore";
import { AuthContext } from "./auth-context-value";
import type { AppUser } from "../../types";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] =
    useState<import("firebase/auth").User | null>(null);
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthChange(async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        try {
          const userDoc = await getDoc(doc(db, "users", fbUser.uid));
          if (userDoc.exists()) {
            setUser({ uid: fbUser.uid, ...userDoc.data() } as unknown as AppUser);
          }
        } catch (err) {
          console.error("Error fetching user profile:", err);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const role = user?.role ?? null;

  return (
    <AuthContext.Provider value={{ user, firebaseUser, loading, role }}>
      {children}
    </AuthContext.Provider>
  );
}
