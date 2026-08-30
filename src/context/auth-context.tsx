import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { login as loginRequest } from "@/lib/api/auth";
import { setToken } from "@/lib/api/client";
import type { ApiUser } from "@/lib/api/types";

export type Role = "admin" | "user";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
  jobTitle?: string;
  phone?: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, password: string, remember: boolean) => Promise<AuthUser>;
  logout: () => void;
  updateProfile: (patch: Partial<AuthUser>) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);
const STORAGE_KEY = "taskboard.auth";

function toAuthUser(apiUser: ApiUser): AuthUser {
  return {
    id: String(apiUser.id),
    name: apiUser.fullname,
    email: apiUser.email,
    role: apiUser.role,
    jobTitle: apiUser.job_title ?? undefined,
    phone: apiUser.phone ?? undefined,
  };
}

const DEMO_ACCOUNTS: Array<AuthUser & { password: string }> = [
  {
    id: "u-admin",
    name: "آرش محمدی",
    email: "admin@demo.ir",
    role: "admin",
    password: "123456",
    jobTitle: "مدیر پروژه",
  },
  {
    id: "u-user",
    name: "نگار رضایی",
    email: "user@demo.ir",
    role: "user",
    password: "123456",
    jobTitle: "طراح محصول",
  },
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const raw =
        typeof window !== "undefined"
          ? window.localStorage.getItem(STORAGE_KEY) ||
            window.sessionStorage.getItem(STORAGE_KEY)
          : null;
      if (raw) setUser(JSON.parse(raw));
    } catch {
      /* ignore */
    }
    setIsLoading(false);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      async login(email, password, remember) {
        const { token, user: apiUser } = await loginRequest(email, password);
        const safe = toAuthUser(apiUser);
        setToken(token, remember);
        setUser(safe);
        const store = remember ? window.localStorage : window.sessionStorage;
        store.setItem(STORAGE_KEY, JSON.stringify(safe));
        // Clear the other store to avoid stale sessions
        (remember ? window.sessionStorage : window.localStorage).removeItem(STORAGE_KEY);
        return safe;
      },
      logout() {
        setUser(null);
        setToken(null);
        window.localStorage.removeItem(STORAGE_KEY);
        window.sessionStorage.removeItem(STORAGE_KEY);
      },
      updateProfile(patch) {
        setUser((prev) => {
          if (!prev) return prev;
          const next = { ...prev, ...patch };
          const store = window.localStorage.getItem(STORAGE_KEY)
            ? window.localStorage
            : window.sessionStorage;
          store.setItem(STORAGE_KEY, JSON.stringify(next));
          return next;
        });
      },
    }),
    [user, isLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}

export const DEMO_CREDENTIALS = DEMO_ACCOUNTS.map(({ email, password, role }) => ({
  email,
  password,
  role,
}));
