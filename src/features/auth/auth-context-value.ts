import { createContext } from "react";
import type { User } from "firebase/auth";
import type { AppUser, UserRole } from "../../types";

interface AuthContextValue {
  user: AppUser | null;
  firebaseUser: User | null;
  loading: boolean;
  role: UserRole | null;
}

export const AuthContext = createContext<AuthContextValue>({
  user: null,
  firebaseUser: null,
  loading: true,
  role: null,
});
