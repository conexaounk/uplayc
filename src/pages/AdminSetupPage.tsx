import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-notification";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Check } from "lucide-react";

export default function AdminSetupPage() {
  const { user, isAdmin } = useAuth();
  const [, setLocation] = useLocation();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState("");

  // Se já é admin, redireciona para o admin
  if (isAdmin) {
    setLocation("/admin");
    return null;
  }

  const handleAddAdminRole = async () => {
    const targetUserId = userId.trim() || user?.id;

    if (!targetUserId) {
      toast.error("Erro", "Você deve estar autenticado ou fornecer um ID de usuário");
      return;
    }

    setLoading(true);
    try {
      // Inserir na tabela user_roles
      const { error } = await supabase
        .from("user_roles")
        .insert({ user_id: targetUserId, role: "admin" });

      if (error) {
        if (error.code === "23505") {
          toast.error("Erro", "Este usuário já possui um role atribuído");
        } else {
          console.error("Erro detalhado:", error);
          throw error;
        }
      } else {
        toast.success("Sucesso", "Role de admin adicionado com sucesso!");

        // Se foi o usuário atual, redireciona para admin após 2 segundos
        if (targetUserId === user?.id) {
          setTimeout(() => {
            setLocation("/admin");
          }, 2000);
        } else {
          setUserId("");
        }
      }
    } catch (error: any) {
      console.error("Erro ao adicionar role:", error);
      toast.error("Erro", error?.message || "Erro ao adicionar role de admin");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-md mx-auto">
        <Card className="p-6 bg-card/50 border-white/10">
          <h2 className="text-xl font-bold mb-6">Configurar Admin</h2>

          {user ? (
            <div className="space-y-4">
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Check className="text-green-400" size={16} />
                  <span className="text-sm font-semibold text-green-400">Autenticado</span>
                </div>
                <p className="text-sm text-muted-foreground mb-2">ID do usuário:</p>
                <p className="font-mono text-xs break-all bg-background/50 p-2 rounded border border-white/5">
                  {user.id}
                </p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-3">
                  Você pode adicionar role de admin para si mesmo ou para outro usuário:
                </p>
                <Input
                  placeholder="Deixe em branco para usar seu próprio ID"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  disabled={loading}
                  className="bg-background/50 border-white/10 font-mono text-xs"
                />
              </div>

              <Button
                onClick={handleAddAdminRole}
                disabled={loading}
                className="w-full"
              >
                {loading ? <Loader2 className="animate-spin mr-2" size={16} /> : null}
                Adicionar Role Admin
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                Após adicionar o role, você será redirecionado para o painel de admin
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Você precisa estar autenticado para acessar esta página.
              </p>
              <Button onClick={() => setLocation("/login")} className="w-full">
                Ir para Login
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
