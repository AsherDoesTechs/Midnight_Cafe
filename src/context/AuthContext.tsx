import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { supabase } from "../libs/supabaseClient";

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

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const mapUser = useCallback((sbUser: any): User | null => {
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
    const loadSession = async () => {
      const { data } = await supabase.auth.getSession();
      setUser(mapUser(data.session?.user ?? null));
      setIsLoading(false);
    };

    loadSession();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(mapUser(session?.user ?? null));
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, [mapUser]);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
  }, []);

  const updateUser = useCallback((newUserData: Partial<User>) => {
    setUser((prev) => (prev ? { ...prev, ...newUserData } : prev));
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
