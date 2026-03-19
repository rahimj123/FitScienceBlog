import { AboutSection } from "@/components/landing/AboutSection";
import { BenefitsSection } from "@/components/landing/BenefitsSection";
import { ContactSection } from "@/components/landing/ContactSection";
import { CtaSection } from "@/components/landing/CtaSection";
import { DisclaimerSection } from "@/components/landing/DisclaimerSection";
import { LandingFooter } from "@/components/landing/Footer";
import { HeroSection } from "@/components/landing/HeroSection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { IntakeSection } from "@/components/landing/IntakeSection";
import { Navbar } from "@/components/landing/Navbar";
import { PathwayComparisonSection } from "@/components/landing/PathwayComparisonSection";
import { ServicesSection } from "@/components/landing/ServicesSection";
import { TestimonialsSection } from "@/components/landing/TestimonialsSection";

function Home() {
  return (
    <div className="bg-background text-foreground">
      <Navbar />
      <main id="top">
        <HeroSection />
        <AboutSection />
        <HowItWorksSection />
        <PathwayComparisonSection />
        <ServicesSection />
        <BenefitsSection />
        <IntakeSection />
        <DisclaimerSection />
        <TestimonialsSection />
        <CtaSection />
        <ContactSection />
      </main>
      <LandingFooter />
    </div>
  );
}

export default Home;
