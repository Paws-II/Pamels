import React, { useState, useEffect, useRef, useLayoutEffect } from "react";
import { gsap } from "gsap";
import HeroNarrative from "../../components/Guests/Hero/HeroNarrative";
import Navbar from "./Navbar";
import HeroShowcase from "../../components/Guests/Hero/HeroShowcase";
import dog from "../../assets/Guests/animals/dog.png";
import cat from "../../assets/Guests/animals/cat.png";
import bunny from "../../assets/Guests/animals/bunny.png";
import otter from "../../assets/Guests/animals/otter.png";
import panda from "../../assets/Guests/animals/panda.png";

const HERO_SLIDES = [
  {
    id: 1,
    image: dog,
    bgGradient:
      "radial-gradient(circle at center, #ffb07c 0%, #b35c27 60%, #5a2f12 100%)",
    textGradient: "linear-gradient(to right, #ffd3b0, #ff9c63, #ffcfad)",
  },
  {
    id: 2,
    image: cat,
    bgGradient:
      "radial-gradient(circle at center, #a067ff 0%, #4c0f80 60%, #23003f 100%)",
    textGradient: "linear-gradient(to right, #c7a6ff, #a978ff, #e0ccff)",
  },
  {
    id: 3,
    image: otter,
    bgGradient:
      "radial-gradient(circle at center, #89d6ff 0%, #1c5169 60%, #0c1f27 100%)",
    textGradient: "linear-gradient(to right, #bfe9ff, #7cc9f0, #d8f2ff)",
  },
  {
    id: 4,
    image: panda,
    bgGradient:
      "radial-gradient(circle at center, #ff86a0 0%, #7c1130 60%, #3d0a19 100%)",
    textGradient: "linear-gradient(to right, #ffc0cb, #ff7b96, #ffd6de)",
  },
  {
    id: 5,
    image: bunny,
    bgGradient:
      "radial-gradient(circle at center, #7cffb2 0%, #1e7f4f 55%, #0b2e1d 100%)",
    textGradient: "linear-gradient(to right, #b8ffd8, #6dffb0, #d9ffec)",
  },
];

const getCardStates = (activeIdx, totalCards) => {
  const prevIdx = (activeIdx - 1 + totalCards) % totalCards;
  const nextIdx = (activeIdx + 1) % totalCards;

  return {
    prev: { index: prevIdx, position: "prev" },
    active: { index: activeIdx, position: "active" },
    next: { index: nextIdx, position: "next" },
  };
};

const Hero = ({ activeIndex, setActiveIndex, onThemeChange }) => {
  const [isPaused, setIsPaused] = useState(false);

  const heroSectionRef = useRef(null);
  const titleRef = useRef(null);
  const cardRefs = useRef({});
  const carouselContainerRef = useRef(null);
  const hasMountedRef = useRef(false);
  const timelineRef = useRef(null);
  const hoverTimelineRef = useRef(null);
  const intervalRef = useRef(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const slide = HERO_SLIDES[0];

      gsap.set(heroSectionRef.current, {
        background: slide.bgGradient,
      });

      gsap.set(titleRef.current, {
        backgroundImage: slide.textGradient,
      });

      const states = getCardStates(0, HERO_SLIDES.length);

      Object.values(cardRefs.current).forEach((card, idx) => {
        if (idx === states.prev.index) {
          gsap.set(card, {
            x: -120,
            scale: 0.85,
            opacity: 0.4,
            zIndex: 1,
            filter: "blur(2px)",
          });
        } else if (idx === states.active.index) {
          gsap.set(card, {
            x: 0,
            scale: 1,
            opacity: 1,
            zIndex: 3,
            filter: "blur(0px)",
          });
        } else if (idx === states.next.index) {
          gsap.set(card, {
            x: 120,
            scale: 0.9,
            opacity: 0.6,
            zIndex: 2,
            filter: "blur(1px)",
          });
        } else {
          gsap.set(card, { x: 200, scale: 0.8, opacity: 0, zIndex: 0 });
        }
      });

      gsap.from(heroSectionRef.current, {
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
      });
    }, heroSectionRef);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    const startInterval = () => {
      intervalRef.current = setInterval(() => {
        if (!isPaused) {
          setActiveIndex((prev) => (prev + 1) % HERO_SLIDES.length);
        }
      }, 4000);
    };

    startInterval();

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPaused]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsPaused(true);
        if (timelineRef.current) {
          timelineRef.current.pause();
        }
      } else {
        setIsPaused(false);
        if (timelineRef.current) {
          timelineRef.current.resume();
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  useEffect(() => {
    const slide = HERO_SLIDES[activeIndex];
    if (!slide) return;

    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      return;
    }

    onThemeChange(activeIndex);

    if (timelineRef.current) {
      timelineRef.current.kill();
    }
    gsap.killTweensOf([
      heroSectionRef.current,
      titleRef.current,
      ...Object.values(cardRefs.current),
    ]);

    const states = getCardStates(activeIndex, HERO_SLIDES.length);
    const tl = gsap.timeline({
      defaults: { ease: "power2.inOut" },
      paused: isPaused || document.hidden,
    });

    timelineRef.current = tl;

    tl.to(
      heroSectionRef.current,
      {
        background: slide.bgGradient,
        duration: 0.8,
      },
      0
    );

    tl.to(
      titleRef.current,
      {
        backgroundImage: slide.textGradient,
        duration: 0.8,
      },
      0
    );

    Object.values(cardRefs.current).forEach((card, idx) => {
      if (idx === states.prev.index) {
        tl.to(
          card,
          {
            x: -120,
            scale: 0.85,
            opacity: 0.4,
            zIndex: 1,
            filter: "blur(2px)",
            duration: 0.8,
          },
          0
        );
      } else if (idx === states.active.index) {
        tl.to(
          card,
          {
            x: 0,
            scale: 1,
            opacity: 1,
            zIndex: 3,
            filter: "blur(0px)",
            duration: 0.8,
          },
          0
        );
      } else if (idx === states.next.index) {
        tl.to(
          card,
          {
            x: 120,
            scale: 0.9,
            opacity: 0.6,
            zIndex: 2,
            filter: "blur(1px)",
            duration: 0.8,
          },
          0
        );
      } else {
        tl.to(
          card,
          {
            x: 200,
            scale: 0.8,
            opacity: 0,
            zIndex: 0,
            duration: 0.8,
          },
          0
        );
      }
    });

    if (!isPaused && !document.hidden) {
      tl.play();
    }
  }, [activeIndex, isPaused]);

  const handleCarouselMouseEnter = () => {
    setIsPaused(true);
    if (timelineRef.current) {
      timelineRef.current.pause();
    }
  };

  const handleCarouselMouseLeave = () => {
    setIsPaused(false);
    if (timelineRef.current) {
      timelineRef.current.resume();
    }
  };

  const handleActiveCardMouseEnter = (e) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    if (hoverTimelineRef.current) {
      hoverTimelineRef.current.kill();
    }

    hoverTimelineRef.current = gsap.timeline();

    hoverTimelineRef.current.to(card, {
      y: -8,
      rotateX: 2,
      rotateY: 1,
      duration: 0.4,
      ease: "power2.out",
    });
  };

  const handleActiveCardMouseMove = (e) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateY = ((x - centerX) / centerX) * 3;
    const rotateX = ((centerY - y) / centerY) * 3;

    gsap.to(card, {
      rotateX: rotateX,
      rotateY: rotateY,
      duration: 0.3,
      ease: "power2.out",
      overwrite: "auto",
    });
  };

  const handleActiveCardMouseLeave = (e) => {
    const card = e.currentTarget;

    if (hoverTimelineRef.current) {
      hoverTimelineRef.current.kill();
    }

    hoverTimelineRef.current = gsap.timeline();

    hoverTimelineRef.current.to(card, {
      y: 0,
      rotateX: 0,
      rotateY: 0,
      duration: 0.5,
      ease: "power2.out",
    });
  };

  const states = getCardStates(activeIndex, HERO_SLIDES.length);

  return (
    <div
      ref={heroSectionRef}
      className="min-h-screen text-[#bfc0d1] overflow-x-hidden transition-colors duration-1000"
    >
      <section className="relative min-h-screen flex items-center pt-20 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-black/20 via-transparent to-black/30"></div>

        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-26 items-center relative z-10">
          <HeroNarrative titleRef={titleRef} />

          <HeroShowcase
            slides={HERO_SLIDES}
            activeIndex={activeIndex}
            cardRefs={cardRefs}
            carouselContainerRef={carouselContainerRef}
            states={states}
            onCarouselMouseEnter={handleCarouselMouseEnter}
            onCarouselMouseLeave={handleCarouselMouseLeave}
            onActiveCardMouseEnter={handleActiveCardMouseEnter}
            onActiveCardMouseMove={handleActiveCardMouseMove}
            onActiveCardMouseLeave={handleActiveCardMouseLeave}
          />
        </div>
      </section>
    </div>
  );
};

export default Hero;
