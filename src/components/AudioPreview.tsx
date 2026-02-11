import { useEffect, useRef, useState, useCallback } from "react";
import { Play, Pause } from "lucide-react";
import { motion } from "framer-motion";

interface AudioPreviewProps {
  url: string;
  previewStart?: number;
  previewDuration?: number;
}

export default function AudioPreview({
  url,
  previewStart = 0,
  previewDuration = 30,
}: AudioPreviewProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressRef = useRef<HTMLDivElement | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  // Reset when URL changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !url) return;
    audio.pause();
    audio.src = url;
    audio.load();
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setError(null);
  }, [url]);

  // Metadata
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onMeta = () => setDuration(audio.duration || 0);
    audio.addEventListener("loadedmetadata", onMeta);
    return () => audio.removeEventListener("loadedmetadata", onMeta);
  }, []);

  // Play / Pause
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    let stopTimer: NodeJS.Timeout | null = null;

    const playSafe = async () => {
      try {
        if (audio.readyState < 1) {
          await new Promise<void>((resolve) => {
            const cb = () => { audio.removeEventListener("loadedmetadata", cb); resolve(); };
            audio.addEventListener("loadedmetadata", cb);
          });
        }
        const safeStart = previewStart < audio.duration ? previewStart : 0;
        audio.currentTime = safeStart;
        await audio.play();
        stopTimer = setTimeout(() => { audio.pause(); setIsPlaying(false); }, previewDuration * 1000);
      } catch (err) {
        console.error("Erro ao reproduzir áudio:", err);
        setError("Erro ao reproduzir");
        setIsPlaying(false);
      }
    };

    if (isPlaying) playSafe(); else audio.pause();
    return () => { if (stopTimer) clearTimeout(stopTimer); };
  }, [isPlaying, previewStart, previewDuration]);

  // Time update
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onTime = () => setCurrentTime(audio.currentTime);
    audio.addEventListener("timeupdate", onTime);
    return () => audio.removeEventListener("timeupdate", onTime);
  }, []);

  // Seek on click
  const handleSeek = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    const bar = progressRef.current;
    if (!audio || !bar || !duration) return;
    const rect = bar.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    audio.currentTime = ratio * duration;
    setCurrentTime(audio.currentTime);
  }, [duration]);

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="flex items-center gap-3 w-full">
      <audio ref={audioRef} preload="metadata" />

      {/* Play/Pause Button */}
      <button
        onClick={() => setIsPlaying((p) => !p)}
        disabled={!url}
        className="w-9 h-9 flex-shrink-0 flex items-center justify-center rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-transform active:scale-95 disabled:opacity-40"
      >
        {isPlaying ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" className="ml-0.5" />}
      </button>

      {/* Progress area */}
      <div className="flex-1 min-w-0 space-y-1">
        {/* Progress Bar */}
        <div
          ref={progressRef}
          onClick={handleSeek}
          className="h-1.5 bg-muted/40 rounded-full overflow-hidden cursor-pointer group relative"
        >
          <motion.div
            className="absolute top-0 left-0 h-full bg-primary rounded-full"
            style={{ width: `${progress}%` }}
          />
          {/* Hover expand */}
          <div className="absolute inset-0 h-1.5 group-hover:h-2.5 transition-all rounded-full" />
        </div>

        {/* Time */}
        <div className="flex justify-between text-[10px] font-mono text-muted-foreground">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {error && <span className="text-[10px] text-destructive">{error}</span>}
    </div>
  );
}
