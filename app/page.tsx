import { Header } from "@/components/landing/header";
import { Hero } from "@/components/landing/hero";
import { MissionSection } from "@/components/landing/mission-section";
import { SessionsTimeline } from "@/components/landing/sessions-timeline";
import { CyberBlocksTeaser } from "@/components/landing/cyberblocks-teaser";
import { RegisterForm } from "@/components/landing/register-form";
import { StatStrip } from "@/components/landing/stat-strip";
import { Footer } from "@/components/landing/footer";

export default function LandingPage() {
  return (
    <main className="relative min-h-screen bg-obsidian text-fg overflow-x-hidden">
      <Header />
      <Hero />
      <MissionSection />
      <SessionsTimeline />
      <CyberBlocksTeaser />
      <RegisterForm />
      <StatStrip />
      <Footer />
    </main>
  );
}
