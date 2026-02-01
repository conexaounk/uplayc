import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Busca o role do usuário usando RPC function
  const fetchUserRole = useCallback(async (userId: string) => {
    console.log("Fetching role for user:", userId);
    try {
      // Chamar função RPC que não tem problemas de RLS
      const { data, error } = await supabase
        .rpc("get_user_role");

      console.log("Role RPC result:", { data, error });

      if (error) {
        console.log("Erro ao buscar role via RPC:", error.message, error.code);
        // Fallback: tentar query direta
        const { data: roleData, error: queryError } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", userId);

        if (queryError) {
          console.log("Fallback query também falhou:", queryError.message);
          setUserRole(null);
          return;
        }

        const role = (roleData && roleData.length > 0) ? roleData[0]?.role : null;
        console.log("Using fallback role:", role);
        setUserRole(role);
        return;
      }

      console.log("Setting user role from RPC:", data);
      setUserRole(data);
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
