import React, { useEffect, useState } from "react";
import Hero from "./pages/Guests/Hero";
import Navbar from "./pages/Guests/Navbar";
import TwoWorldsOpening from "./pages/Guests/TwoWorldsOpening";
import HowItWorks from "./pages/Guests/HowItWorks";
import DoDont from "./pages/Guests/DoDont";
import Stories from "./pages/Guests/Stroies";
import Conclusion from "./pages/Guests/Conclusion";
import Faq from "./pages/Guests/Faq";
import Testimonials from "./pages/Guests/Testimonials";
import Footer from "./pages/Guests/Footer";

const App = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [themeIndex, setThemeIndex] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div>
      <Navbar
        isScrolled={isScrolled}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        currentSlideIndex={activeIndex}
      />
      <Hero
        activeIndex={activeIndex}
        setActiveIndex={setActiveIndex}
        onThemeChange={setThemeIndex}
      />

      <TwoWorldsOpening />

      <HowItWorks />

      <DoDont />

      <Stories />
      <Conclusion />
      <Testimonials />
      <Faq />
      <Footer />
    </div>
  );
};

export default App;
