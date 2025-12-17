import React, { useEffect, useState } from "react";
import Hero from "./pages/Guests/Hero";
import Navbar from "./pages/Guests/Navbar";
import Demo from "./pages/Guests/Demo";

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
      <Demo />
    </div>
  );
};

export default App;
