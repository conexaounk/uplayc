import { useState, useEffect } from "react";
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
import { Label } from "@/components/ui/label";

import {
  Upload,
  Music,
  X,
  Loader2,
  Search,
  Plus,
  Activity,
  Hash,
  Sparkles,
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

const KEYS = [
  "1A", "1B", "2A", "2B", "3A", "3B", "4A", "4B", "5A", "5B", "6A", "6B",
  "7A", "7B", "8A", "8B", "9A", "9B", "10A", "10B", "11A", "11B", "12A", "12B"
];



const metadataSchema = z.object({
  title: z.string().min(1, "Título é obrigatório"),
  genre: z.string().min(1, "Gênero é obrigatório"),
  track_type: z.enum(["mashup", "remix"]),
  // aceita valores vindos de inputs como string e converte para number
  price_cents: z.coerce.number().optional(),
  collaborations: z.string().optional(),
  bpm: z.string()
    .optional()
    .refine(
      (val) => !val || val === "" || (!isNaN(Number(val)) && Number(val) > 0 && Number(val) <= 300),
      "BPM deve ser entre 1 e 300"
    ),
  key: z.string().optional(),
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
  
  const { uploadMutation, useTracks, addTrackToProfileMutation } = useMusicApi();
  
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [activeTab, setActiveTab] = useState("upload");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: tracks = [], isLoading: tracksLoading } = useTracks(undefined, searchQuery);

  const form = useForm<MetadataForm>({
    resolver: zodResolver(metadataSchema),
    defaultValues: {
      title: "",
      genre: "",
      track_type: "mashup",
      price_cents: undefined,
      collaborations: "",
      bpm: "",
      key: "",
    },
  });

  // Observa mudanças de tipo e preço para atualizar a UI condicional
  const trackType = form.watch("track_type");
  const priceCents = form.watch("price_cents");

  // Preço do Mashup vindo do D1 (em reais)
  const [mashupPrice, setMashupPrice] = useState<number>(15);

  useEffect(() => {
    // Busca o preço do D1 quando o modal abrir
    if (!open) return;
    fetch('https://api.conexaounk.com/settings')
      .then((res) => res.json())
      .then((data) => {
        try {
          const raw = data?.settings?.mashup_unit_price;
          if (raw !== undefined && raw !== null) {
            // Suporta tanto valor em centavos (ex: 1500) quanto string '15.00'
            const num = Number(raw);
            if (!isNaN(num)) {
              // Se o número parecer grande (>100), assumimos que veio em centavos
              const value = num > 100 ? (num / 100) : num;
              setMashupPrice(value);
            }
          }
        } catch (e) {
          console.warn('Erro ao processar settings:', e);
        }
      })
      .catch((e) => {
        console.warn('Erro ao buscar settings:', e);
      });
  }, [open]);

  function processFile(file: File) {
    if (file.size > MAX_FILE_SIZE) {
      toast.error("Arquivo muito grande (máx. 500MB)");
      return;
    }
    setFile(file);
    const fileName = file.name.replace(/\.[^/.]+$/, "");
    if (!form.getValues("title")) {
      form.setValue("title", fileName);
    }
  }

  async function onSubmit(data: MetadataForm) {
    if (!file || !user || !djProfile) {
      toast.error("Informações incompletas para upload");
      return;
    }

    const mainArtist = djProfile.dj_name;
    
    // Metadados completos para o D1 - apenas campos com valores válidos
    const metadata = {
      title: data.title,
      artist: mainArtist,
      genre: data.genre,
      track_type: data.track_type,
      user_id: user.id, // OBRIGATÓRIO para o seu Worker
      price_cents: data.track_type === "mashup" 
        ? Math.round(mashupPrice * 100) 
        : (data.price_cents ?? 0),
      collaborations: data.collaborations?.trim() || null,
      bpm: data.bpm && data.bpm.trim() ? Number(data.bpm) : null,
      key: (data.key && data.key.trim()) ? data.key.trim() : null,
      is_public: false,
    };

    console.log("📤 Iniciando upload:", {
      fileName: file.name,
      fileSize: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
      metadata
    });

    try {
      const result = await uploadMutation.mutateAsync({
        file,
        metadata,
        onProgress: (progress) => {
          console.log(`📊 Progresso: ${progress}%`);
          setUploadProgress(progress);
        },
      });

      console.log("✅ Upload e salvamento no D1 concluído:", result);
      
      toast.success("Música publicada e salva no banco!");
      setFile(null);
      setUploadProgress(0);
      form.reset();
      onOpenChange(false);
    } catch (error) {
      console.error("❌ Erro ao processar upload ou salvar no banco:", error);
      toast.error("Erro ao processar upload ou salvar no banco");
      setUploadProgress(0);
    }
  }

  function handleSelectTrack(trackId: string) {
    addTrackToProfileMutation.mutate(trackId, {
      onSuccess: () => {
        toast.success("Música adicionada ao seu perfil!");
        onOpenChange(false);
      },
      onError: () => {
        toast.error("Erro ao adicionar música");
      }
    });
  }

  function handleOpenChange(open: boolean) {
    if (!open) {
      setFile(null);
      setUploadProgress(0);
      form.reset();
      setSearchQuery("");
    }
    onOpenChange(open);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] glass-effect w-[95vw] sm:w-[90vw] md:w-full p-0 overflow-hidden rounded-2xl">
        {/* Header com gradiente */}
        <div className="relative overflow-hidden bg-gradient-to-r from-primary/20 via-secondary/20 to-primary/20 border-b border-white/10 p-6 sm:p-8">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-50" />
          <div className="relative z-10">
            <DialogTitle className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
              Gerenciar Músicas
            </DialogTitle>
            <DialogDescription className="text-sm sm:text-base text-muted-foreground mt-2">
              Compartilhe suas produções com o mundo ou explore a biblioteca global
            </DialogDescription>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-0">
          <TabsList className="grid w-full grid-cols-2 bg-transparent border-b border-white/10 h-12 sm:h-14 rounded-none mx-0 p-0">
            <TabsTrigger value="upload" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent text-xs sm:text-sm font-medium transition-all">
              <Upload className="w-4 h-4 mr-2" />
              Novo Upload
            </TabsTrigger>
            <TabsTrigger value="browse" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent text-xs sm:text-sm font-medium transition-all">
              <Search className="w-4 h-4 mr-2" />
              Banco Global
            </TabsTrigger>
          </TabsList>

          {/* ================= UPLOAD ================= */}
          <TabsContent value="upload" className="space-y-3 mt-6 p-4 sm:p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
              {!file ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => document.getElementById("audio-input")?.click()}
                  className="group relative overflow-hidden rounded-xl sm:rounded-2xl border-2 border-dashed border-white/20 p-8 sm:p-12 md:p-16 text-center cursor-pointer hover:border-primary/50 transition-all duration-300 glass-effect-subtle"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <input
                    id="audio-input"
                    type="file"
                    accept="audio/*"
                    className="hidden"
                    onChange={(e) => e.target.files && processFile(e.target.files[0])}
                  />
                  <div className="relative z-10">
                    <motion.div
                      animate={{ y: [0, -8, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="w-16 sm:w-20 h-16 sm:h-20 mx-auto mb-4 sm:mb-6 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center group-hover:from-primary/30 group-hover:to-secondary/30 transition-all"
                    >
                      <Upload className="w-8 sm:w-10 h-8 sm:h-10 text-primary group-hover:text-secondary transition-colors" />
                    </motion.div>
                    <h3 className="text-base sm:text-lg font-semibold mb-2">
                      Solte sua faixa aqui
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      MP3, WAV, AIFF • até 500MB
                    </p>
                  </div>
                </motion.div>
              ) : (
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex items-center gap-4 p-4 sm:p-5 glass-effect rounded-xl hover:border-primary/50 transition-all">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center flex-shrink-0">
                      <Music className="text-primary w-6 h-6 sm:w-7 sm:h-7" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm sm:text-base truncate">{file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setFile(null)}
                      type="button"
                      disabled={uploadMutation.isPending}
                      className="hover:bg-destructive/10 hover:text-destructive h-9 w-9 p-0 rounded-lg"
                    >
                      <X className="w-5 h-5" />
                    </Button>
                  </div>

                  {/* Barra de progresso */}
                  {uploadMutation.isPending && uploadProgress > 0 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="space-y-2"
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-medium text-muted-foreground">Enviando...</span>
                        <span className="text-xs font-bold text-primary">{uploadProgress.toFixed(0)}%</span>
                      </div>
                      <div className="h-2.5 bg-muted/30 rounded-full overflow-hidden glass-effect">
                        <motion.div 
                          className="h-full bg-gradient-to-r from-primary to-secondary"
                          initial={{ width: 0 }}
                          animate={{ width: `${uploadProgress}%` }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                    </motion.div>
                  )}
                </div>
              )}

              {file && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-5 sm:space-y-6"
                >
                  {/* Título */}
                  <div className="space-y-0.5">
                    <Label className="text-xs font-semibold text-foreground">
                      Título da Faixa <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      placeholder="Ex: Toca Toca"
                      {...form.register("title")}
                      disabled={uploadMutation.isPending}
                      className="premium-input h-7 text-xs"
                    />
                    {form.formState.errors.title && (
                      <p className="text-destructive text-xs font-medium">{form.formState.errors.title.message}</p>
                    )}
                  </div>

                  {/* Gênero */}
                  <div className="space-y-0.5">
                    <Label className="text-xs font-semibold text-foreground">
                      Gênero <span className="text-destructive">*</span>
                    </Label>
                    <select
                      {...form.register("genre")}
                      disabled={uploadMutation.isPending}
                      className="premium-input h-7 text-xs w-full"
                    >
                      <option value="">Selecione um gênero...</option>
                      {GENRES.map((g) => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                    {form.formState.errors.genre && (
                      <p className="text-red-500 text-xs">{form.formState.errors.genre.message}</p>
                    )}

                    <div className="space-y-1 mt-2">
                      <Label className="text-xs font-medium">Tipo de Produção</Label>
                      <div className="grid grid-cols-2 gap-1.5 mt-1.5">
                        <Button
                          type="button"
                          variant={trackType === "mashup" ? "default" : "outline"}
                          onClick={() => form.setValue("track_type", "mashup")}
                          className={`h-7 text-[11px] font-semibold transition-all ${
                            trackType === "mashup"
                              ? "bg-gradient-to-r from-primary to-secondary text-white shadow-lg shadow-primary/30"
                              : "glass-effect hover:bg-white/10"
                          }`}
                        >
                          <Music className="w-3.5 h-3.5 mr-1" />
                          Mashup
                        </Button>
                        <Button
                          type="button"
                          variant={trackType === "remix" ? "default" : "outline"}
                          onClick={() => form.setValue("track_type", "remix")}
                          className={`h-7 text-[11px] font-semibold transition-all ${
                            trackType === "remix"
                              ? "bg-gradient-to-r from-primary to-secondary text-white shadow-lg shadow-primary/30"
                              : "glass-effect hover:bg-white/10"
                          }`}
                        >
                          <Sparkles className="w-3.5 h-3.5 mr-1" />
                          Remix
                        </Button>
                      </div>
                      {form.formState.errors.track_type && (
                        <p className="text-destructive text-xs font-medium mt-2">{form.formState.errors.track_type.message}</p>
                      )}

                      {/* Lógica de preço condicional */}
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-2 rounded-lg glass-effect mt-1.5"
                      >
                        {trackType === "mashup" ? (
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="text-[10px] font-bold uppercase text-muted-foreground">Preço Tabelado</p>
                              <p className="text-xs text-muted-foreground mt-0.5">Definido pela plataforma</p>
                            </div>
                            <div className="text-right">
                              <div className="text-xl sm:text-2xl font-black bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                                R$ {mashupPrice.toFixed(2).replace('.', ',')}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-0.5 mt-1.5">
                            <Label className="text-xs font-semibold">Valor do Remix (R$)</Label>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-semibold">R$</span>
                              <Input
                                type="number"
                                placeholder="19,90"
                                className="pl-10 premium-input h-7 text-xs"
                                value={priceCents !== undefined && priceCents !== null ? (priceCents / 100) : ''}
                                onChange={(e) => {
                                  const v = e.target.value;
                                  const n = Number(v);
                                  if (isNaN(n)) {
                                    form.setValue("price_cents", undefined);
                                  } else {
                                    form.setValue("price_cents", Math.round(n * 100));
                                  }
                                }}
                              />
                            </div>
                            <p className="text-[10px] text-muted-foreground">
                              *Remixes individuais têm preço livre.
                            </p>
                          </div>
                        )}
                      </motion.div>
                    </div>
                  </div>

                  {/* BPM e Key - OPCIONAIS */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div className="space-y-0.5">
                      <Label className="text-xs font-semibold flex items-center gap-1">
                        <Activity className="w-3 h-3 text-secondary" />
                        BPM
                        <span className="text-[10px] text-muted-foreground font-normal">(opt.)</span>
                      </Label>
                      <Input
                        type="number"
                        placeholder="128"
                        {...form.register("bpm")}
                        disabled={uploadMutation.isPending}
                        className="premium-input h-7 text-xs"
                        min="1"
                        max="300"
                      />
                      {form.formState.errors.bpm && (
                        <p className="text-destructive text-xs font-medium">{form.formState.errors.bpm.message}</p>
                      )}
                    </div>

                    <div className="space-y-0.5">
                      <Label className="text-xs font-semibold flex items-center gap-1">
                        <Hash className="w-3 h-3 text-secondary" />
                        Key
                        <span className="text-[10px] text-muted-foreground font-normal">(opt.)</span>
                      </Label>
                      <select
                        {...form.register("key")}
                        disabled={uploadMutation.isPending}
                        className="premium-input h-7 text-xs w-full"
                      >
                        <option value="">Selecione uma key...</option>
                        {KEYS.map((k) => (
                          <option key={k} value={k}>{k}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Colaborações */}
                  <div className="space-y-0.5">
                    <Label className="text-xs font-semibold flex items-center gap-1">
                      <Music className="w-3 h-3 text-secondary" />
                      Colaborações (Feat)
                      <span className="text-[10px] text-muted-foreground font-normal">(opt.)</span>
                    </Label>
                    <Input
                      placeholder="MC Fulano, DJ Ciclano..."
                      {...form.register("collaborations")}
                      disabled={uploadMutation.isPending}
                      className="premium-input h-7 text-xs"
                    />
                  </div>

                  {/* Botão de envio */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mt-2"
                  >
                    <Button
                      type="submit"
                      disabled={uploadMutation.isPending}
                      className="w-full h-8 text-xs font-bold bg-gradient-to-r from-primary to-secondary hover:shadow-lg hover:shadow-primary/30 transition-all"
                    >
                      {uploadMutation.isPending ? (
                        <>
                          <Loader2 className="mr-1.5 animate-spin" size={14} />
                          <span>
                            Enviando {uploadProgress > 0 ? `${uploadProgress.toFixed(0)}%` : '...'}
                          </span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-3 h-3 mr-1.5" />
                          Publicar
                        </>
                      )}
                    </Button>
                  </motion.div>
                </motion.div>
              )}
            </form>
          </TabsContent>

          {/* ================= BROWSE ================= */}
          <TabsContent value="browse" className="space-y-4 mt-6 p-6 sm:p-8 overflow-y-auto max-h-[calc(90vh-200px)]">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                className="pl-12 premium-input"
                placeholder="Buscar por título, artista ou gênero..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {tracksLoading ? (
              <div className="py-16 flex justify-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <Loader2 className="text-primary" size={32} />
                </motion.div>
              </div>
            ) : (
              <div className="grid gap-3 max-h-[350px] sm:max-h-[400px] overflow-y-auto pr-2">
                {tracks.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-12"
                  >
                    <Music className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
                    <p className="text-muted-foreground text-sm">
                      {searchQuery 
                        ? "Nenhuma música encontrada." 
                        : "Nenhuma música disponível."}
                    </p>
                  </motion.div>
                ) : (
                  tracks.map((track: any) => (
                    <motion.div
                      key={track.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="group flex items-center justify-between gap-3 p-3 sm:p-4 glass-effect rounded-lg hover:border-primary/50 transition-all cursor-pointer"
                      onClick={() => handleSelectTrack(track.id)}
                    >
                      <div className="flex gap-3 items-center overflow-hidden flex-1">
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center flex-shrink-0 group-hover:from-primary/30 group-hover:to-secondary/30 transition-all">
                          <Music className="text-primary w-5 h-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold truncate">
                            {track.title}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {track.artist}
                            {track.collaborations && (
                              <span className="text-secondary"> • {track.collaborations}</span>
                            )}
                          </p>
                          <div className="flex flex-wrap gap-2 mt-2">
                            <span className="text-xs px-2 py-1 bg-primary/20 text-primary/80 rounded-md font-medium">
                              {track.genre}
                            </span>
                            {track.bpm && (
                              <span className="text-[9px] sm:text-[10px] px-1.5 py-0.5 bg-muted text-muted-foreground rounded flex items-center gap-0.5">
                                <Activity className="w-2.5 h-2.5" />
                                {track.bpm} BPM
                              </span>
                            )}
                            {track.key && (
                              <span className="text-[9px] sm:text-[10px] px-1.5 py-0.5 bg-muted text-muted-foreground rounded flex items-center gap-0.5">
                                <Hash className="w-2.5 h-2.5" />
                                {track.key}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="hover:bg-primary/10 hover:text-primary h-8 w-8 sm:h-9 sm:w-9 p-0 flex-shrink-0"
                        disabled={addTrackToProfileMutation.isPending}
                        onClick={() => handleSelectTrack(track.id)}
                        title="Adicionar ao seu perfil"
                      >
                        <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </Button>
                    </motion.div>
                  ))
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
