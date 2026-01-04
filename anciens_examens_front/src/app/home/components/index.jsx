import Exams from "./Exams";
import HeroSection from "./HeroSection";
import SearchBar from "./SearchBar";


export default function Home() {
  return (
    <div className="w-full">
        <HeroSection />
        <SearchBar />
        <Exams />
    </div>
  )
}