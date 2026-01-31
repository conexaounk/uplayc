import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import {
  Upload,
  Music,
  X,
  Loader2,
  Search,
  Plus,
} from "lucide-react";

import { toast } from "sonner";

import { useAuth } from "@/hooks/use-auth";
import { useDJ } from "@/hooks/use-djs";
import { useMusicApi } from "@/hooks/use-music-api";

const MAX_FILE_SIZE = 500 * 1024 * 1024;

const GENRES = [
  "Tribal House",
  "PsyTrance",
  "Hip-Hop",
  "House",
  "Techno",
  "Funk",
  "Outro",
];

const metadataSchema = z.object({
  title: z.string().min(1, "Título é obrigatório"),
  genre: z.string().min(1, "Gênero é obrigatório"),
  collaborations: z.string().optional(),
});

type MetadataForm = z.infer<typeof metadataSchema>;

interface UploadTrackModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UploadTrackModal({
  open,
  onOpenChange,
}: UploadTrackModalProps) {
  const { user } = useAuth();
  const { data: djProfile } = useDJ(user?.id || "");
  const {
    uploadMutation,
    tracks,
    tracksLoading,
    addToLibraryMutation,
  } = useMusicApi();

  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [activeTab, setActiveTab] = useState("upload");
  const [searchQuery, setSearchQuery] = useState("");

  const form = useForm<MetadataForm>({
    resolver: zodResolver(metadataSchema),
    defaultValues: {
      title: "",
      genre: "",
      collaborations: "",
    },
  });

  function processFile(file: File) {
    if (file.size > MAX_FILE_SIZE) {
      toast.error("Arquivo muito grande (máx. 500MB)");
      return;
    }
    setFile(file);
  }

  async function onSubmit(data: MetadataForm) {
    if (!file || !user || !djProfile) return;

    const mainArtist = djProfile.dj_name;
    const feat = data.collaborations
      ? ` (feat. ${data.collaborations})`
      : "";
    const displayArtist = `${mainArtist}${feat}`;

    try {
      await uploadMutation.mutateAsync({
        file,
        metadata: {
          title: data.title,
          artist: mainArtist,
          display_artist: displayArtist,
          genre: data.genre,
          collaborations: data.collaborations,
          userId: user.id,
        },
        onProgress: setUploadProgress,
      });

      toast.success("Música publicada com sucesso!");
      setFile(null);
      form.reset();
      onOpenChange(false);
    } catch {
      toast.error("Erro ao fazer upload");
    }
  }

  function handleSelectTrack(trackId: string) {
    addToLibraryMutation.mutate(trackId);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Adicionar Música</DialogTitle>
          <DialogDescription>
            Upload para o R2 ou selecione do banco
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload">Upload Novo</TabsTrigger>
            <TabsTrigger value="browse">Buscar Existente</TabsTrigger>
          </TabsList>

          {/* ================= UPLOAD ================= */}
          <TabsContent value="upload" className="space-y-6">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {!file ? (
                <div
                  onClick={() =>
                    document.getElementById("audio-input")?.click()
                  }
                  className="border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer border-white/10 hover:bg-white/5"
                >
                  <input
                    id="audio-input"
                    type="file"
                    accept="audio/*"
                    className="hidden"
                    onChange={(e) =>
                      e.target.files && processFile(e.target.files[0])
                    }
                  />
                  <Upload className="w-10 h-10 mx-auto mb-4 text-zinc-500" />
                  <p className="text-sm text-muted-foreground">
                    Clique para enviar (até 500MB)
                  </p>
                </div>
              ) : (
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <Music className="text-primary" />
                  <p className="flex-1 truncate">{file.name}</p>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setFile(null)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              )}

              {file && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-4"
                >
                  <Input
                    placeholder="Título"
                    {...form.register("title")}
                  />

                  <select
                    {...form.register("genre")}
                    className="w-full h-10 bg-background border rounded-md px-3"
                  >
                    <option value="">Selecione o gênero</option>
                    {GENRES.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>

                  <Input
                    placeholder="Colaborações (opcional)"
                    {...form.register("collaborations")}
                  />

                  <Button
                    type="submit"
                    disabled={uploadMutation.isPending}
                    className="w-full"
                  >
                    {uploadMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 animate-spin" />
                        {uploadProgress}%
                      </>
                    ) : (
                      "Publicar Música"
                    )}
                  </Button>
                </motion.div>
              )}
            </form>
          </TabsContent>

          {/* ================= BROWSE ================= */}
          <TabsContent value="browse" className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4" />
              <Input
                className="pl-9"
                placeholder="Buscar no banco..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {tracksLoading ? (
              <Loader2 className="mx-auto animate-spin" />
            ) : (
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {tracks.map((track: any) => (
                  <div
                    key={track.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex gap-3">
                      <Music className="text-primary" />
                      <div>
                        <p className="text-sm font-medium">
                          {track.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {track.artist}
                        </p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={addToLibraryMutation.isPending}
                      onClick={() => handleSelectTrack(track.id)}
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Adicionar
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
