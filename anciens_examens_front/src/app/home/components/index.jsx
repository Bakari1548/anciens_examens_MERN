import Exams from "./Exams";
import HeroSection from "./HeroSection";
import SearchBar from "./SearchBar";
import { ExamProvider } from "../context/ExamContext";
import CTASection from "./CTASection";


export default function Home() {
  return (
    <ExamProvider>
      <div className="w-full">
          <HeroSection />
          <SearchBar />
          <Exams />
          <CTASection />
      </div>
    </ExamProvider>
  )
}