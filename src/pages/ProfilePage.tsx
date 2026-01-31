import { useAuth } from "@/hooks/use-auth";
import { useUpdateProfile, useDJs } from "@/hooks/use-djs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertProfileSchema, type InsertProfile } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2, Save } from "lucide-react";
import { useEffect } from "react";
import { useLocation } from "wouter";

export default function ProfilePage() {
  const { user, isLoading: authLoading } = useAuth();
  const { data: djs } = useDJs();
  const updateProfile = useUpdateProfile();
  const [, setLocation] = useLocation();

  // Find current user's DJ profile
  const myProfile = djs?.find((dj: any) => dj.userId === user?.id);

  const form = useForm<Omit<InsertProfile, "userId">>({
    resolver: zodResolver(insertProfileSchema.omit({ userId: true })),
    defaultValues: {
      displayName: "",
      emojiAvatar: "🎧",
      genre: "",
      bio: "",
      instagram: "",
      soundcloud: "",
    },
  });

  // Load existing data when available
  useEffect(() => {
    if (myProfile) {
      form.reset({
        displayName: myProfile.displayName,
        emojiAvatar: myProfile.emojiAvatar || "🎧",
        genre: myProfile.genre || "",
        bio: myProfile.bio || "",
        instagram: myProfile.instagram || "",
        soundcloud: myProfile.soundcloud || "",
      });
    }
  }, [myProfile, form]);

  if (authLoading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;
  
  if (!user) {
    setLocation("/");
    return null;
  }

  const onSubmit = (data: Omit<InsertProfile, "userId">) => {
    updateProfile.mutate(data);
  };

  return (
    <div className="min-h-screen pt-24 pb-20 container max-w-4xl mx-auto px-4">
      <Card className="bg-card border-white/10 shadow-2xl">
        <CardHeader className="border-b border-white/5 pb-8">
           <div className="flex items-center gap-6">
             <div className="w-24 h-24 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-5xl">
               {form.watch("emojiAvatar")}
             </div>
             <div>
               <CardTitle className="text-3xl font-bold mb-2">Perfil do Artista</CardTitle>
               <p className="text-muted-foreground">Gerencie sua presença pública no marketplace.</p>
             </div>
           </div>
        </CardHeader>
        <CardContent className="pt-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="displayName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome Artístico</FormLabel>
                      <FormControl>
                        <Input placeholder="ex: DJ Cyberpunk" {...field} className="bg-background/50 border-white/10" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="emojiAvatar"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Emoji do Avatar</FormLabel>
                      <FormControl>
                        <Input placeholder="🎧" {...field} className="bg-background/50 border-white/10" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="genre"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gênero Principal</FormLabel>
                      <FormControl>
                        <Input placeholder="Techno, House, DnB..." {...field} value={field.value || ""} className="bg-background/50 border-white/10" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                    control={form.control}
                    name="instagram"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Instagram</FormLabel>
                        <FormControl>
                          <Input placeholder="apenas_usuario" {...field} value={field.value || ""} className="bg-background/50 border-white/10" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
              </div>

              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bio</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Conte-nos sobre seu som..." 
                        className="min-h-[120px] bg-background/50 border-white/10 resize-none" 
                        {...field} 
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end pt-4">
                <Button 
                  type="submit" 
                  size="lg"
                  className="bg-primary hover:bg-primary/80 font-bold min-w-[150px]"
                  disabled={updateProfile.isPending}
                >
                  {updateProfile.isPending ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2" size={18} />}
                  Salvar Perfil
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
