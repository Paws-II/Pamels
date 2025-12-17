import React from "react";
import { Heart } from "lucide-react";

const HeroShowcase = ({
  slides,
  activeIndex,
  cardRefs,
  carouselContainerRef,
  states,
  onCarouselMouseEnter,
  onCarouselMouseLeave,
  onActiveCardMouseEnter,
  onActiveCardMouseMove,
  onActiveCardMouseLeave,
}) => {
  return (
    <div
      ref={carouselContainerRef}
      className="relative h-[500px] perspective-1000"
      onMouseEnter={onCarouselMouseEnter}
      onMouseLeave={onCarouselMouseLeave}
      style={{ perspective: "1000px" }}
    >
      <div className="absolute inset-0 bg-linear-to-tr from-white/20 to-transparent rounded-3xl blur-2xl"></div>

      {slides.map((slide, idx) => (
        <div
          key={slide.id}
          ref={(el) => (cardRefs.current[idx] = el)}
          className="absolute inset-0 rounded-3xl overflow-hidden shadow-2xl shadow-black/40 border border-white/20 h-[500px] bg-cover bg-center will-change-transform"
          style={{
            backgroundImage: `url(${slide.image})`,
            transformStyle: "preserve-3d",
          }}
          onMouseEnter={
            idx === states.active.index ? onActiveCardMouseEnter : undefined
          }
          onMouseMove={
            idx === states.active.index ? onActiveCardMouseMove : undefined
          }
          onMouseLeave={
            idx === states.active.index ? onActiveCardMouseLeave : undefined
          }
        >
          <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent"></div>
        </div>
      ))}

      <div className="absolute -bottom-6 -left-6 bg-black/70 backdrop-blur-lg p-6 rounded-2xl border border-white/20 shadow-xl z-10">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-linear-to-br from-white to-white/80 rounded-full flex items-center justify-center">
            <Heart className="text-slate-900" size={24} />
          </div>
          <div>
            <div className="text-sm text-white/70">This Week</div>
            <div className="text-xl font-bold text-white">45 Adoptions</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroShowcase;
