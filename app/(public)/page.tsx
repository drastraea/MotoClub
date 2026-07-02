import { Hero } from "@/components/shared/Hero";
import { AboutSection } from "@/components/shared/AboutSection";
import { BenefitsSection } from "@/components/shared/BenefitsSection";
import { GalleryPreview } from "@/components/shared/GalleryPreview";
import { UpcomingEvents } from "@/components/shared/UpcomingEvents";
import { JoinCta } from "@/components/shared/JoinCta";

export default function Home() {
  return (
    <>
      <Hero />
      <AboutSection />
      <BenefitsSection />
      <GalleryPreview />
      <UpcomingEvents />
      <JoinCta />
    </>
  );
}
