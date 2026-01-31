import { useAuth } from "@/hooks/use-auth";
import { useDJ } from "@/hooks/use-djs";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Edit } from "lucide-react";
import { getStorageUrl } from "@/lib/storageUtils";

export default function ProfileViewPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { data: myProfile, isLoading: profileLoading } = useDJ(user?.id || "");
  const [, setLocation] = useLocation();

  if (authLoading || profileLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  if (!user) {
    setLocation("/");
    return null;
  }

  const avatarUrl = getStorageUrl(myProfile?.avatar_url, "avatars") || "/placeholder.svg";

  return (
    <div className="min-h-screen pt-24 pb-20 container max-w-4xl mx-auto px-4">
      <Card className="bg-card border-white/10 shadow-2xl">
        <CardHeader className="border-b border-white/5 pb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-white/5 border border-white/10">
                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              </div>
              <div>
                <CardTitle className="text-3xl font-bold mb-2">
                  {myProfile?.dj_name || "Meu Perfil"}
                </CardTitle>
                {myProfile?.city && (
                  <p className="text-muted-foreground mb-2">{myProfile.city}</p>
                )}
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
            </div>
            <Button
              onClick={() => setLocation("/profile/edit")}
              size="lg"
              className="bg-primary hover:bg-primary/80 font-bold"
            >
              <Edit className="mr-2" size={18} />
              Editar Perfil
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-8">
          {myProfile?.bio && (
            <div>
              <h3 className="text-lg font-semibold mb-3">Bio</h3>
              <p className="text-muted-foreground whitespace-pre-wrap">{myProfile.bio}</p>
            </div>
          )}
          {!myProfile?.bio && (
            <p className="text-muted-foreground italic">
              Nenhuma bio adicionada. Clique em "Editar Perfil" para adicionar uma.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
