import { SiteHeader } from "@/components/landing/site-header";
import { Hero } from "@/components/landing/hero";
import { Features } from "@/components/landing/features";
import { HowItWorks } from "@/components/landing/how-it-works";
import { ArchitecturePreview } from "@/components/landing/architecture-preview";
import { Testimonials } from "@/components/landing/testimonials";
import { FinalCta } from "@/components/landing/final-cta";
import { SiteFooter } from "@/components/landing/site-footer";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col font-sans">
      <SiteHeader />
      <div className="flex flex-1 flex-col">
        <Hero />
        <Features />
        <HowItWorks />
        <ArchitecturePreview />
        {/* <Testimonials /> */}
        <FinalCta />
      </div>
      <SiteFooter />
    </main>
  );
}
