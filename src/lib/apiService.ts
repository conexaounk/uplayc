// lib/apiService.ts
import { supabase } from "@/integrations/supabase/client";

const API_BASE = "https://api.conexaounk.com";

export const api = {
  // Função mestre para qualquer chamada (GET, POST, DELETE)
  async fetch(endpoint: string, options: RequestInit = {}) {
    const { data: { session } } = await supabase.auth.getSession();
    
    const headers = new Headers(options.headers);
    if (session?.access_token) {
      headers.set("Authorization", `Bearer ${session.access_token}`);
    }
    if (!(options.body instanceof FormData)) {
      headers.set("Content-Type", "application/json");
    }

    const response = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
    if (!response.ok) throw new Error(await response.text());
    return response.json();
  },

  // Lógica específica de upload (Chunked)
  async uploadTrack(file: File, metadata: any, onProgress: (p: number) => void) {
    const { data: { session } } = await supabase.auth.getSession();

    const formData = new FormData();
    formData.append("file", file);

    // Adicionar campos de metadata como itens separados no FormData
    Object.entries(metadata).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, String(value));
      }
    });

    const headers = new Headers();
    if (session?.access_token) {
      headers.set("Authorization", `Bearer ${session.access_token}`);
    }
    // NÃO definir Content-Type manualmente - o navegador faz isso automaticamente para FormData

    const response = await fetch(`${API_BASE}/upload-chunked`, {
      method: "POST",
      body: formData,
      headers,
    });

    if (!response.ok) throw new Error(await response.text());
    return response.json();
  }
};
