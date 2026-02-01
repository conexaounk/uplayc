# 🎵 Audio Preview Feature - 30 Segundos

## Visão Geral
Implementação de prévia de áudio interativa com limite de **30 segundos** em toda a aplicação. Os usuários agora podem ouvir trechos das músicas antes de comprar.

## Componentes Implementados

### 1. **AudioPreview.tsx** ✨
- **Localização:** `src/components/AudioPreview.tsx`
- **Funcionalidades:**
  - Play/Pause com toggle automático
  - Barra de progresso clicável (seek)
  - Limite automático de 30 segundos
  - Display de tempo formatado (00:00 / 00:30)
  - Controle de volume com mute
  - Tamanhos responsivos: `sm`, `md`, `lg`
  - Opção `showTime` para exibir tempo atual
  - Animações suaves com Framer Motion

**Uso Básico:**
```tsx
<AudioPreview
  url="https://example.com/track.mp3"
  title="Track Name"
  size="md"
  showTime={true}
/>
```

### 2. Páginas Atualizadas

#### ProfileViewPage.tsx
- Integração do AudioPreview na listagem de próprias músicas
- Remoção de estado manual de áudio
- Layout melhorado com glassmorphism
- Metadata da track exibida (genre, BPM, etc)

#### DJProfilePage.tsx
- Integração do AudioPreview na visualização pública do perfil do DJ
- Listagem de tracks disponíveis para compra
- Design consistente com premium aesthetic

#### PackDetailsModal.tsx
- AudioPreview para cada track no pack
- Exibição de metadados (duration, BPM, key)
- Integração suave com carrinho de compras

## 🎯 Recursos Técnicos

### HTML5 Audio API
- Controle nativo de reprodução
- Suporte a crossOrigin="anonymous" para CORS
- Eventos: `timeupdate`, `ended`, `play`, `pause`

### 30 Segundos Hard Limit
```tsx
if (audio.currentTime >= 30) {
  audio.pause();
  audio.currentTime = 0;
  setIsPlaying(false);
}
```

### Barra de Progresso Interativa
```tsx
handleProgressClick = (e) => {
  const rect = progressRef.current.getBoundingClientRect();
  const percent = (e.clientX - rect.left) / rect.width;
  const newTime = Math.min(percent * 30, 30); // Máximo 30s
  audio.currentTime = newTime;
}
```

## 📊 Estados e Hooks

### Estados do AudioPreview
- `isPlaying`: boolean - Estado de reprodução
- `currentTime`: number - Tempo atual em segundos
- `duration`: number - Duração total (limitada a 30s)
- `volume`: number - Volume de 0 a 1
- `isMuted`: boolean - Estado do mute

### Referências
- `audioRef`: HTMLAudioElement - Acesso direto ao elemento de áudio

## 🎨 Estilos e Tema

- **Cores:** Usando tema premium escuro (primary, secondary, muted)
- **Glassmorphism:** Efeito de vidro fosco em fundos
- **Animações:** Transições suaves com Framer Motion
- **Responsividade:** Totalmente adaptado para mobile/tablet/desktop

## ✅ Casos de Uso

1. **ProfileViewPage:** Usuário ouve prévia de suas próprias tracks
2. **DJProfilePage:** Visitante ouve prévia das tracks do DJ
3. **PackDetailsModal:** Comprador ouve trechos antes de comprar o pack
4. **Futuro:** Integrar em DJCard, HomePage, etc.

## 🚀 Benefícios

- ✨ Melhor experiência de usuário
- 💾 Reduz quantidade de áudio enviado (30s vs arquivo completo)
- 🔒 Proteção de conteúdo (não disponibiliza download direto)
- 📱 Responsive em todos os dispositivos
- ♿ Acessível com controles claros

## 🔧 Próximos Passos Opcionais

1. Adicionar AudioPreview em DJCard (homepage)
2. Integrar em HomePage para featured tracks
3. Adicionar waveform visual
4. Suporte a keyboard shortcuts (espaço para play/pause)
5. Sincronização com múltiplos players (pause outros ao play este)

## 📝 Notas Técnicas

- Todos os arquivos de áudio devem ter CORS habilitado
- O limite de 30s é aplicado no lado do cliente (pode ser bypassado se desejado backend enforcement)
- Compatível com todos os navegadores modernos
- Performance otimizada para múltiplas instâncias simultâneas
