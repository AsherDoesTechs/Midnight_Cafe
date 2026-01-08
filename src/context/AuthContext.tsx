/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import type { ReactNode } from "react";
import { supabase } from "../libs/supabaseClient";
import type { User as SupabaseUser } from "@supabase/supabase-js";

interface User {
  id: string;
  email?: string;
  role: string;
  displayName?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  logout: () => Promise<void>;
  updateUser: (newUserData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const mapUser = useCallback((sbUser: SupabaseUser | null): User | null => {
    if (!sbUser) return null;

    return {
      id: sbUser.id,
      email: sbUser.email ?? undefined,
      role: (sbUser.user_metadata?.role as string) ?? "guest",
      displayName:
        (sbUser.user_metadata?.displayName as string) ??
        sbUser.email?.split("@")[0],
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    const loadSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (mounted) {
        setUser(mapUser(session?.user ?? null));
        setIsLoading(false);
      }
    };

    loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        setUser(mapUser(session?.user ?? null));
        setIsLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [mapUser]);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
  }, []);

  const updateUser = useCallback((newUserData: Partial<User>) => {
    setUser((prev) => (prev ? { ...prev, ...newUserData } : null));
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
