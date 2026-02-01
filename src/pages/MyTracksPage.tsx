import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Music, Loader2, Edit, Play } from "lucide-react";
import { api } from "@/lib/apiService";
import { useToast } from "@/hooks/use-notification";

// Interface baseada no seu esquema do Cloudflare D1
interface Track {
  id: string;
  title: string;
  genre: string;
  user_id: string;
  audio_url: string;
  artist: string;
  price_cents: number;
  duration: number;
  track_type: string;
  cover_url?: string;
}

export default function MyTracksPage() {
  const { user } = useAuth();
  const toast = useToast();
  const [tracks, setTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // ✅ Busca as tracks diretamente da tabela 'tracks' do D1
  const fetchUserTracks = async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    try {
      // Ajuste o endpoint conforme sua API que consulta o D1
      const res = await api.fetch('/tracks'); 
      
      const allTracks = Array.isArray(res) ? res : (res?.data || []);
      
      // ✅ Filtra as tracks onde o user_id é igual ao ID do usuário logado
      const filtered = allTracks.filter((t: Track) => t.user_id === user.id);
      
      setTracks(filtered);
    } catch (error) {
      console.error("Erro ao buscar tracks do D1:", error);
      toast.error("Erro", "Não foi possível carregar suas músicas.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserTracks();
  }, [user?.id]);

  if (!user) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-400">Por favor, faça login para ver suas tracks</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 p-6">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <h1 className="text-4xl font-black text-white mt-7">Minhas Tracks</h1>
        <p className="text-gray-400">
          Você tem {tracks.length} track{tracks.length !== 1 ? "s" : ""} postada{tracks.length !== 1 ? "s" : ""} no D1
        </p>
      </motion.div>

      {isLoading ? (
        <div className="h-64 flex items-center justify-center">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
        </div>
      ) : tracks.length > 0 ? (
        <div className="grid gap-4">
          {tracks.map((track, index) => (
            <motion.div
              key={track.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white/5 p-4 rounded-lg border border-white/10 hover:border-primary/50 transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-4 flex-1 min-w-0">
                {/* Capa ou Ícone */}
                <div className="w-12 h-12 rounded bg-primary/20 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {track.cover_url ? (
                    <img src={track.cover_url} alt={track.title} className="w-full h-full object-cover" />
                  ) : (
                    <Music className="text-primary" />
                  )}
                </div>
                
                <div className="min-w-0">
                  <h3 className="text-white font-semibold truncate group-hover:text-primary transition">
                    {track.title}
                  </h3>
                  <div className="flex gap-2 text-xs text-gray-400 mt-1">
                    <span>{track.artist}</span>
                    <span>•</span>
                    <span>{track.genre}</span>
                    <span>•</span>
                    <span>{track.track_type}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 ml-4">
                <div className="text-right mr-4 hidden sm:block">
                  <p className="text-white font-medium">R$ {(track.price_cents / 100).toFixed(2)}</p>
                  <p className="text-[10px] text-gray-500">{track.duration}s</p>
                </div>

                {/* Botão para ouvir (usando audio_url do seu D1) */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open(track.audio_url, '_blank')}
                  className="text-gray-400 hover:text-white"
                >
                  <Play size={18} />
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  className="border-white/10 hover:bg-white/10"
                >
                  <Edit size={16} className="mr-2" />
                  Editar
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 border border-dashed border-white/10 rounded-2xl">
          <Music className="w-12 h-12 text-gray-500 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">Nenhuma track encontrada no seu perfil</p>
          <p className="text-gray-500 text-sm mt-2">As tracks que você postar no D1 aparecerão aqui.</p>
        </div>
      )}
    </div>
  );
}
