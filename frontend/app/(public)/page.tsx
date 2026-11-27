"use client";

import { Hero } from "@/components/shared/Hero";
import { StatsStrip } from "@/components/shared/StatsStrip";
import { TagTicker } from "@/components/shared/TagTicker";
import { AboutSection } from "@/components/shared/AboutSection";
import { ServicesGrid } from "@/components/shared/ServicesGrid";
import { HowToJoin } from "@/components/shared/HowToJoin";
import { BenefitsSection } from "@/components/shared/BenefitsSection";
import { GallerySection } from "@/components/shared/GallerySection";
import { EventsSection } from "@/components/shared/EventsSection";
import { AnnouncementsSection } from "@/components/shared/AnnouncementsSection";
import { ContactSection } from "@/components/shared/ContactSection";
import { JoinCta } from "@/components/shared/JoinCta";
import { useSiteContent } from "@/hooks/useSiteContent";

export default function Home() {
  const { content } = useSiteContent();
  const show = (id: string) => !content.hidden.includes(id);
  return (
    <>
      {show("hero") && <Hero data={content.hero} />}
      {show("stats") && <StatsStrip stats={content.stats} />}
      {show("ticker") && <TagTicker tags={content.ticker} />}
      {show("about") && <AboutSection data={content.about} />}
      {show("activities") && <ServicesGrid data={content.activities} />}
      {show("how_to_join") && <HowToJoin data={content.how_to_join} />}
      {show("benefits") && <BenefitsSection data={content.benefits} />}
      <GallerySection />
      <EventsSection />
      <AnnouncementsSection />
      {show("contact") && <ContactSection data={content.contact} />}
      {show("join_cta") && <JoinCta data={content.join_cta} />}
    </>
  );
}
