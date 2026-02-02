import { useEffect, useRef, useState } from "react";

interface AudioPreviewProps {
  url: string;
  previewStart?: number; // em segundos
  previewDuration?: number; // em segundos
}

export default function AudioPreview({
  url,
  previewStart = 0,
  previewDuration = 30,
}: AudioPreviewProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);

  /* ----------------------------------
   * Reset total quando URL muda
   * ---------------------------------- */
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !url) return;

    audio.pause();
    audio.src = url;
    audio.load(); // 🔥 essencial

    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setError(null);
  }, [url]);

  /* ----------------------------------
   * Metadata carregada
   * ---------------------------------- */
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onLoadedMetadata = () => {
      setDuration(audio.duration || 0);
    };

    audio.addEventListener("loadedmetadata", onLoadedMetadata);

    return () => {
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
    };
  }, []);

  /* ----------------------------------
   * Controle play / pause seguro
   * ---------------------------------- */
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    let stopTimer: NodeJS.Timeout | null = null;

    const playSafe = async () => {
      try {
        // aguarda metadata se necessário
        if (audio.readyState < 1) {
          await new Promise<void>((resolve) => {
            const onMeta = () => {
              audio.removeEventListener("loadedmetadata", onMeta);
              resolve();
            };
            audio.addEventListener("loadedmetadata", onMeta);
          });
        }

        // proteção contra previewStart inválido
        const safeStart =
          previewStart < audio.duration ? previewStart : 0;

        audio.currentTime = safeStart;
        await audio.play();

        // corta o preview no tempo correto
        stopTimer = setTimeout(() => {
          audio.pause();
          setIsPlaying(false);
        }, previewDuration * 1000);
      } catch (err) {
        console.error("Erro ao reproduzir áudio:", err);
        setError("Erro ao reproduzir áudio");
        setIsPlaying(false);
      }
    };

    if (isPlaying) {
      playSafe();
    } else {
      audio.pause();
    }

    return () => {
      if (stopTimer) clearTimeout(stopTimer);
    };
  }, [isPlaying, previewStart, previewDuration]);

  /* ----------------------------------
   * Atualiza progresso
   * ---------------------------------- */
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    audio.addEventListener("timeupdate", onTimeUpdate);

    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
    };
  }, []);

  /* ----------------------------------
   * UI
   * ---------------------------------- */
  return (
    <div className="audio-preview">
      <audio ref={audioRef} preload="metadata" />

      <button
        onClick={() => setIsPlaying((p) => !p)}
        disabled={!url}
      >
        {isPlaying ? "Pausar" : "Play"}
      </button>

      <div className="progress">
        {Math.floor(currentTime)}s / {Math.floor(duration)}s
      </div>

      {error && <div className="error">{error}</div>}
    </div>
  );
}