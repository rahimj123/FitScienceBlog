import { AboutSection } from "@/components/landing/AboutSection";
import { BenefitsSection } from "@/components/landing/BenefitsSection";
import { ContactSection } from "@/components/landing/ContactSection";
import { CtaSection } from "@/components/landing/CtaSection";
import { LandingFooter } from "@/components/landing/Footer";
import { HeroSection } from "@/components/landing/HeroSection";
import { Navbar } from "@/components/landing/Navbar";
import { PhilosophySection } from "@/components/landing/PhilosophySection";
import { ServicesSection } from "@/components/landing/ServicesSection";
import { TestimonialsSection } from "@/components/landing/TestimonialsSection";

function Home() {
  return (
    <div className="bg-background text-foreground">
      <Navbar />
      <main id="top">
        <HeroSection />
        <AboutSection />
        <ServicesSection />
        <BenefitsSection />
        <TestimonialsSection />
        <PhilosophySection />
        <CtaSection />
        <ContactSection />
      </main>
      <LandingFooter />
    </div>
  );
}

export default Home;
