import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Music, Loader2, Edit, Play, ExternalLink } from "lucide-react";
import { api } from "@/lib/apiService"; 
import { useToast } from "@/hooks/use-notification";

// Interface exata do seu D1
interface Track {
  id: string;
  title: string;
  genre: string;
  user_id: string; // Este ID vem do Supabase Auth
  audio_url: string;
  artist: string;
  price_cents: number;
  duration: number;
  track_type: string;
  cover_url?: string;
  is_public: boolean;
}

export default function MyTracksPage() {
  // ✅ Pega o usuário logado via Supabase
  const { user, isLoading: authLoading } = useAuth();
  const toast = useToast();
  
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const fetchUserTracks = async () => {
    // Só busca se o usuário do Supabase estiver carregado
    if (!user?.id) return;
    
    setLoadingData(true);
    try {
      
      const res = await api.fetch('/tracks'); 
      const allTracks = Array.isArray(res) ? res : (res?.data || []);
      
      // ✅ Filtra as tracks do D1 usando o ID do Supabase
      const myTracks = allTracks.filter((t: Track) => t.user_id === user.id);
      
      setTracks(myTracks);
    } catch (error) {
      console.error("Erro ao buscar dados no D1:", error);
      toast.error("Erro de Conexão", "Não foi possível acessar o banco de dados D1.");
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchUserTracks();
    }
  }, [user?.id]);

  // 1. Estado de carregamento do Auth (Supabase)
  if (authLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // 2. Verificação de login
  if (!user) {
    return (
      <div className="text-center py-20 bg-black/20 rounded-xl border border-white/5 m-6">
        <p className="text-gray-400 mb-4">Sessão expirada ou não autenticada.</p>
        <Button onClick={() => window.location.href = '/auth'}>Fazer Login</Button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 p-6">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-white">Minhas Tracks</h1>
          <p className="text-gray-400 mt-2">
            Gerenciando tracks: <span className="text-primary/80 text-xs font-mono">{user.email}</span>
          </p>
        </div>
        <div className="text-right">
          <span className="text-2xl font-bold text-primary">{tracks.length}</span>
          <p className="text-[10px] uppercase tracking-widest text-gray-500">Total no D1</p>
        </div>
      </header>

      {loadingData ? (
        <div className="h-64 flex flex-col items-center justify-center gap-4">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
          <p className="text-sm text-gray-500">Consultando Cloudflare D1...</p>
        </div>
      ) : tracks.length > 0 ? (
        <div className="grid gap-3">
          {tracks.map((track, index) => (
            <motion.div
              key={track.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              className="group bg-[#121212] hover:bg-[#1a1a1a] p-4 rounded-xl border border-white/5 hover:border-primary/30 transition-all flex items-center gap-4"
            >
              {/* Thumbnail com fallback */}
              <div className="relative w-14 h-14 rounded-lg bg-gradient-to-br from-gray-800 to-gray-900 flex-shrink-0 overflow-hidden border border-white/10">
                {track.cover_url ? (
                  <img src={track.cover_url} className="w-full h-full object-cover" alt="" />
                ) : (
                  <Music className="absolute inset-0 m-auto text-gray-700" size={20} />
                )}
              </div>

              {/* Info da Track */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-white font-bold truncate">{track.title}</h3>
                  {track.is_public && <span className="text-[10px] bg-green-500/10 text-green-500 px-1.5 py-0.5 rounded border border-green-500/20">Público</span>}
                </div>
                <p className="text-sm text-gray-500 truncate">{track.artist || 'Artista desconhecido'} • {track.genre}</p>
              </div>

              {/* Ações e Preço */}
              <div className="flex items-center gap-6">
                <div className="text-right hidden md:block">
                  <p className="text-white font-mono text-sm">R$ {(track.price_cents / 100).toFixed(2)}</p>
                  <p className="text-[10px] text-gray-600 uppercase tracking-tighter">{track.track_type}</p>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="icon"
                    className="h-9 w-9 rounded-full bg-white/5 hover:bg-primary hover:text-white transition-colors"
                    onClick={() => window.open(track.audio_url, '_blank')}
                  >
                    <Play size={16} fill="currentColor" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 rounded-full text-gray-500 hover:text-white"
                  >
                    <Edit size={16} />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-24 border-2 border-dashed border-white/5 rounded-3xl bg-white/[0.02]">
          <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
            <Music className="text-gray-600" size={32} />
          </div>
          <h3 className="text-xl font-bold text-white">Nenhuma track no D1</h3>
          <p className="text-gray-500 max-w-xs mx-auto mt-2 text-sm">
            Você não possui registros vinculados de tracks.
          </p>
        </div>
      )}
    </div>
  );
}
