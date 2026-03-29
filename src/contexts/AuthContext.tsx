import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

export type UserRole = "admin" | "armazem" | "funcionario";

export interface AppUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  store?: string | null;
}

interface AuthContextType {
  user: AppUser | null;
  authUser: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserRole = async (supaUser: User): Promise<AppUser> => {
    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role, store")
      .eq("user_id", supaUser.id)
      .single();

    return {
      id: supaUser.id,
      name: supaUser.user_metadata?.full_name || supaUser.email || "",
      email: supaUser.email || "",
      role: (roleData?.role as UserRole) || "funcionario",
      store: roleData?.store || null,
    };
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setAuthUser(session.user);
          // Use setTimeout to avoid potential deadlock with Supabase client
          setTimeout(async () => {
            const appUser = await fetchUserRole(session.user);
            setUser(appUser);
            setLoading(false);
          }, 0);
        } else {
          setAuthUser(null);
          setUser(null);
          setLoading(false);
        }
      }
    );

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        setAuthUser(session.user);
        const appUser = await fetchUserRole(session.user);
        setUser(appUser);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return !error;
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, authUser, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
