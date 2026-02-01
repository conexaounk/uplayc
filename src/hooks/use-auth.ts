import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Busca o role do usuário na tabela user_roles
  const fetchUserRole = useCallback(async (userId: string) => {
    console.log("Fetching role for user:", userId);
    try {
      // TEMP: Se o user_id é "af2b2fe3-5301-447e-9794-b5daee3c287e", retorna admin para teste
      if (userId === "af2b2fe3-5301-447e-9794-b5daee3c287e") {
        console.log("Hardcoded admin user detected");
        setUserRole("admin");
        return;
      }

      // Query simples sem .single() para evitar RLS issues
      const { data, error } = await supabase
        .from("user_roles")
        .select("*");

      console.log("All roles result:", { data, error });

      if (error) {
        console.log("Erro ao buscar roles:", error.message);
        setUserRole(null);
        return;
      }

      // Encontrar o role do usuário atual na lista
      const userRoleRecord = data?.find((r: any) => r.user_id === userId);
      const role = userRoleRecord?.role || null;

      console.log("Found role for user:", { userId, role });
      setUserRole(role);
    } catch (err) {
      console.error("Erro ao buscar user role:", err);
      setUserRole(null);
    }
  }, []);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);

      // Busca o role se houver usuário autenticado
      if (currentUser?.id) {
        await fetchUserRole(currentUser.id);
      } else {
        setUserRole(null);
      }

      setIsLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const currentUser = session?.user ?? null;
        setUser(currentUser);

        // Busca o role se houver usuário autenticado
        if (currentUser?.id) {
          await fetchUserRole(currentUser.id);
        } else {
          setUserRole(null);
        }

        setIsLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, [fetchUserRole]);

  const logout = async () => {
    setUserRole(null);
    await supabase.auth.signOut();
  };

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      throw error;
    }
  };

  const signup = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) {
      throw error;
    }
  };

  return {
    user,
    userRole,
    isLoading,
    isAuthenticated: !!user,
    isAdmin: userRole === "admin",
    logout,
    login,
    signup,
  };
}
