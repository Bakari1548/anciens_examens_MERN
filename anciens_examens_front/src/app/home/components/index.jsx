import Exams from "./Exams";
import HeroSection from "./HeroSection";
import { ExamProvider } from "../../exam/context/ExamContext";
import CTASection from "./CTASection";
import StatsSection from "./StatsSection";
import NewsletterSection from "./NewsletterSection";
import TestimonialsSection from "./TestimonialsSection";
import FAQSection from "./FAQSection";

export default function Home() {
  return (
    <ExamProvider>
      <div className="w-full">
          <HeroSection />
          <StatsSection />
          <Exams />
          <TestimonialsSection />
          <CTASection />
          <FAQSection />
          <NewsletterSection />
      </div>
    </ExamProvider>
  )
}