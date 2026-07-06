import { Hero } from "@/components/shared/Hero";
import { TagTicker } from "@/components/shared/TagTicker";
import { AboutSection } from "@/components/shared/AboutSection";
import { ServicesGrid } from "@/components/shared/ServicesGrid";
import { BenefitsSection } from "@/components/shared/BenefitsSection";
import { GallerySection } from "@/components/shared/GallerySection";
import { EventsSection } from "@/components/shared/EventsSection";
import { AnnouncementsSection } from "@/components/shared/AnnouncementsSection";
import { ContactSection } from "@/components/shared/ContactSection";
import { JoinCta } from "@/components/shared/JoinCta";

export default function Home() {
  return (
    <>
      <Hero />
      <TagTicker />
      <AboutSection />
      <ServicesGrid />
      <BenefitsSection />
      <GallerySection />
      <EventsSection />
      <AnnouncementsSection />
      <ContactSection />
      <JoinCta />
    </>
  );
}
