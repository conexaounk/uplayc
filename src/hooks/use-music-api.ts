// hooks/use-music-api.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/apiService";
import { toast } from "sonner";

export function useMusicApi() {
  const queryClient = useQueryClient();

  // Buscar músicas da sua API (D1)
  const useTracks = (search?: string) => useQuery({
    queryKey: ['tracks', search],
    queryFn: () => api.fetch(search ? `/tracks?search=${search}` : '/tracks')
  });

  // Fazer Upload e Criar Track
  const uploadMutation = useMutation({
    mutationFn: ({ file, metadata, onProgress }: { file: File, metadata: any, onProgress: any }) => 
      api.uploadTrack(file, metadata, onProgress),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tracks'] });
      toast.success("Música enviada com sucesso!");
    }
  });

  // Adicionar à biblioteca (User Library)
  const addToLibraryMutation = useMutation({
    mutationFn: (trackId: string) => 
      api.fetch("/user-library", {
        method: "POST",
        body: JSON.stringify({ track_id: trackId })
      }),
    onSuccess: () => toast.success("Adicionado à sua biblioteca!")
  });

  return { useTracks, uploadMutation, addToLibraryMutation };
}
