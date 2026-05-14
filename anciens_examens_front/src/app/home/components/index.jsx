import Exams from "./Exams";
import HeroSection from "./HeroSection";
import { ExamProvider } from "../../exam/context/ExamContext";
import CTASection from "./CTASection";
import StatsSection from "./StatsSection";
import NewsletterSection from "./NewsletterSection";
import TestimonialsSection from "./TestimonialsSection";

export default function Home() {
  return (
    <ExamProvider>
      <div className="w-full">
          <HeroSection />
          <StatsSection />
          <CTASection />
          <Exams />
          <TestimonialsSection />
          <NewsletterSection />
      </div>
    </ExamProvider>
  )
}