import { Hero } from "@/components/shared/Hero";
import { AboutSection } from "@/components/shared/AboutSection";
import { BenefitsSection } from "@/components/shared/BenefitsSection";
import { GallerySection } from "@/components/shared/GallerySection";
import { EventsSection } from "@/components/shared/EventsSection";
import { ContactSection } from "@/components/shared/ContactSection";
import { JoinCta } from "@/components/shared/JoinCta";

export default function Home() {
  return (
    <>
      <Hero />
      <AboutSection />
      <BenefitsSection />
      <GallerySection />
      <EventsSection />
      <ContactSection />
      <JoinCta />
    </>
  );
}
