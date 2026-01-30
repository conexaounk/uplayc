import { Music } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative py-20 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/10 mb-6">
            <Music className="w-4 h-4 text-primary" />
            <span className="text-sm text-primary">Marketplace para DJs</span>
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            Descubra{" "}
            <span className="neon-text">packs exclusivos</span>
            <br />
            dos melhores DJs
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Acesse coleções curadas de tracks profissionais.
            Downloads instantâneos em alta qualidade.
          </p>
        </div>
      </div>
    </section>
  );
}
