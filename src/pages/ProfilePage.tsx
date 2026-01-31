import { useAuth } from "@/hooks/use-auth";
import { useUpdateProfile, useDJ } from "@/hooks/use-djs";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2, Save, Music2, MapPin, User } from "lucide-react";
import { useEffect } from "react";
import { useLocation } from "wouter";
import { getStorageUrl } from "@/lib/storageUtils";
import { EmojiAvatarPicker } from "@/components/EmojiAvatarPicker";

interface ProfileFormData {
  dj_name: string;
  bio: string;
  city: string;
  avatar_emoji?: string;
}

export default function ProfilePage() {
  const { user, isLoading: authLoading } = useAuth();
  const { data: myProfile, isLoading: profileLoading } = useDJ(user?.id || "");
  const updateProfile = useUpdateProfile();
  const [, setLocation] = useLocation();

  const form = useForm<ProfileFormData>({
    defaultValues: {
      dj_name: "",
      bio: "",
      city: "",
      avatar_emoji: "",
    },
  });

  useEffect(() => {
    if (myProfile) {
      form.reset({
        dj_name: myProfile.dj_name || "",
        bio: myProfile.bio || "",
        city: myProfile.city || "",
        avatar_emoji: (myProfile as any).avatar_emoji || "",
      });
    }
  }, [myProfile, form]);

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

  const onSubmit = (data: ProfileFormData) => {
    updateProfile.mutate({ id: user.id, ...data });
  };

  const avatarUrl = getStorageUrl(myProfile?.avatar_url, "avatars") || "/placeholder.svg";
  const avatarEmoji = (myProfile as any)?.avatar_emoji;

  return (
    <div className="min-h-screen pt-20 pb-20">
      {/* Header Section */}
      <div className="border-b border-white/5 bg-gradient-to-b from-background to-background/50 backdrop-blur-sm">
        <div className="container max-w-6xl mx-auto px-4 py-12">
          <div className="flex items-center gap-4 mb-2">
            {avatarEmoji && (
              <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                <span className="text-2xl">{avatarEmoji}</span>
              </div>
            )}
            <div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                {myProfile?.dj_name || "Seu Nome Artístico"}
              </h1>
              {myProfile?.city && (
                <div className="flex items-center gap-2 mt-2 text-muted-foreground">
                  <MapPin size={16} />
                  <span>{myProfile.city}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="container max-w-6xl mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <Card className="bg-card/50 border-white/10 backdrop-blur-sm p-8">
              <div className="flex items-center gap-3 mb-6">
                <User className="text-primary" size={24} />
                <h2 className="text-2xl font-bold">Informações do Perfil</h2>
              </div>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="dj_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base">Nome Artístico</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="ex: DJ Cyberpunk" 
                            {...field} 
                            className="bg-background/50 border-white/10 h-12 text-lg" 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base">Localização</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="São Paulo, SP" 
                            {...field} 
                            className="bg-background/50 border-white/10 h-12" 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="bio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base">Sobre Você</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Conte sua história, estilo musical, influências..."
                            className="min-h-[160px] bg-background/50 border-white/10 resize-none text-base leading-relaxed"
                            {...field}
                          />
                        </FormControl>
                        <p className="text-sm text-muted-foreground mt-2">
                          Apresente seu som e conecte-se com sua audiência
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end pt-4 border-t border-white/5">
                    <Button
                      type="submit"
                      size="lg"
                      className="bg-primary hover:bg-primary/90 font-semibold min-w-[180px] h-12"
                      disabled={updateProfile.isPending}
                    >
                      {updateProfile.isPending ? (
                        <Loader2 className="animate-spin mr-2" size={20} />
                      ) : (
                        <Save className="mr-2" size={20} />
                      )}
                      Salvar Alterações
                    </Button>
                  </div>
                </form>
              </Form>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Avatar Picker */}
            <Card className="bg-card/50 border-white/10 backdrop-blur-sm p-6">
              <div className="flex items-center gap-3 mb-4">
                <Music2 className="text-primary" size={20} />
                <h3 className="font-bold text-lg">Avatar</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Escolha um emoji para personalizar seu perfil (opcional)
              </p>
              <Form {...form}>
                <FormField
                  control={form.control}
                  name="avatar_emoji"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <EmojiAvatarPicker
                          value={field.value}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </Form>
            </Card>

            {/* Stats Card */}
            <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20 backdrop-blur-sm p-6">
              <h3 className="font-bold text-lg mb-4">Seu Perfil no UNK</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center pb-3 border-b border-white/10">
                  <span className="text-muted-foreground">Status</span>
                  <span className="font-semibold text-primary">Ativo</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-white/10">
                  <span className="text-muted-foreground">Tipo</span>
                  <span className="font-semibold">Artista</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Membro desde</span>
                  <span className="font-semibold">2024</span>
                </div>
              </div>
            </Card>

            {/* Tips Card */}
            <Card className="bg-card/30 border-white/5 backdrop-blur-sm p-6">
              <h3 className="font-semibold text-sm mb-3 text-muted-foreground uppercase tracking-wider">
                Dicas de Perfil
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex gap-2">
                  <span className="text-primary">•</span>
                  <span>Use um nome artístico único e memorável</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary">•</span>
                  <span>Descreva seu estilo musical na bio</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary">•</span>
                  <span>Mantenha suas informações atualizadas</span>
                </li>
              </ul>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
