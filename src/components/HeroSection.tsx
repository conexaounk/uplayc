export function HeroSection() {
  return (
    <section className="relative overflow-hidden" style={{ paddingTop: "80px", display: "flex", flexDirection: "column" }}>
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto">
          {/* Title */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold" style={{ margin: "79px 0 24px" }}>
            <div style={{ marginLeft: "1px" }}>Descubra</div>
            <span className="neon-text">packs exclusivos</span>
            <br />
            <p>dos DJs</p>
          </h1>
        </div>
      </div>
    </section>
  );
}
