// 🔧 ADICIONE ESTA ROTA AO SEU WORKER (api/index.js)
// Cole isso ANTES da linha: return jsonResponse({ error: "Route Not Found" }, corsHeaders, 404);

  // ========================================
  // DELETE TRACK
  // ========================================
  if (url.pathname.match(/^\/tracks\/[^\/]+$/) && request.method === "DELETE") {
    const trackId = url.pathname.split("/")[2];
    
    // Validar que o usuário é o dono ou admin
    const userId = await getUserIdFromAuth(request.headers.get("Authorization"), env);
    if (!userId) return jsonResponse({ error: "Não autorizado" }, corsHeaders, 401);
    
    // Verificar se o track pertence ao usuário
    const track = await env.tracks.prepare("SELECT user_id FROM tracks WHERE id = ?").bind(trackId).first();
    if (!track) return jsonResponse({ error: "Track não encontrada" }, corsHeaders, 404);
    if (track.user_id !== userId) return jsonResponse({ error: "Acesso negado" }, corsHeaders, 403);
    
    // Deletar o track
    await env.tracks.prepare("DELETE FROM tracks WHERE id = ?").bind(trackId).run();
    return jsonResponse({ success: true, message: "Track removida com sucesso" }, corsHeaders);
  }
