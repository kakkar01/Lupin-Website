import HeroSection from "@/components/HeroSection";
import ClientLayers from "@/components/ClientLayers";

export default function Home() {
  return (
    <main className="relative w-full h-screen bg-black overflow-hidden">
      {/* Layer 0+: client-only canvas/motion layers */}
      <ClientLayers />

      {/* Layer 1: scanlines */}
      <div className="scanlines" aria-hidden="true" />

      {/* Layer 1b: vignette */}
      <div className="vignette" aria-hidden="true" />

      {/* Layer 2: hero UI */}
      <HeroSection />
    </main>
  );
}
