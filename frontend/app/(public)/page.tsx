"use client";

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
import { useSiteContent } from "@/hooks/useSiteContent";

export default function Home() {
  const { content } = useSiteContent();
  return (
    <>
      <Hero data={content.hero} />
      <TagTicker tags={content.ticker} />
      <AboutSection data={content.about} />
      <ServicesGrid data={content.activities} />
      <BenefitsSection data={content.benefits} />
      <GallerySection />
      <EventsSection />
      <AnnouncementsSection />
      <ContactSection data={content.contact} />
      <JoinCta data={content.join_cta} />
    </>
  );
}
