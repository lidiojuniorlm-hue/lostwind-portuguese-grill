import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import GallerySection from "@/components/GallerySection";
import MenuSection from "@/components/MenuSection";
import StoresSection from "@/components/StoresSection";
import DeliverySection from "@/components/DeliverySection";
import AboutSection from "@/components/AboutSection";
import FooterSection from "@/components/FooterSection";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <GallerySection />
      <MenuSection />
      <StoresSection />
      <DeliverySection />
      <AboutSection />
      <FooterSection />
    </div>
  );
};

export default Index;
