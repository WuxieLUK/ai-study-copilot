import { Hero } from "@/components/marketing/hero";
import { Features } from "@/components/marketing/features";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { Demo } from "@/components/marketing/demo";
import { Cta } from "@/components/marketing/cta";
import { Proof } from "@/components/marketing/proof";
import { Faq } from "@/components/marketing/faq";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Features />
      <HowItWorks />
      <Demo />
      <Proof />
      <Faq />
      <Cta />
    </>
  );
}
