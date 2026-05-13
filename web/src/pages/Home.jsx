import { useEffect } from "react";
import StarField from "../components/home/StarField";
import HeroSection from "../components/home/HeroSection";
import FeaturesSection from "../components/home/FeaturesSection";
import ServicesSection from "../components/home/ServicesSection";
import TestimonialsSection from "../components/home/TestimonialsSection";
import CTASection from "../components/home/CTASection";
import DownloadSection from "../components/home/DownloadSection";

const Home = () => {
  useEffect(() => {
    // Scroll to top on mount
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen text-white relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <StarField count={60} />
        
        {/* Gradient Orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/10 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
      </div>

      {/* Header */}
      {/* Header is already rendered in App.jsx */}

      {/* Main Content */}
      <main className="relative z-10">
        <HeroSection />
        <FeaturesSection />
        <ServicesSection />
        <TestimonialsSection />
        <CTASection />
        <DownloadSection />
      </main>
    </div>
  );
};

export default Home;
