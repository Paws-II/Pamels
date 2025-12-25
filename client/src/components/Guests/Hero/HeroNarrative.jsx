import React, { useEffect, useRef } from "react";

const HeroNarrative = ({
  titleRef,
  sectionRef,
  leftRef,
  rightRef,
  centerRef,
  images,
}) => {
  return (
    <div ref={sectionRef} className="space-y-6 mt-20">
      <style>
        {` 
        .jp-title { 
        position: absolute; 
        top: 100%; 
        left: 16rem; 
        transform: translateY(-0.95em); 
        font-family: 'Noto Serif JP','Cormorant Garamond',serif; font-weight: 900; 
        font-size: clamp(1.4rem, 2vw, 1.8rem); 
        letter-spacing: 0.32em; 
        background: linear-gradient( 90deg, rgba(255,255,255,1), rgba(255,255,255,0.6) ); 
        -webkit-background-clip: text; 
        background-clip: text; 
        color: transparent; 
        -webkit-text-stroke: 0.6px rgba(255,255,255,0.25); 
        opacity: 0.95; 
        white-space: nowrap; 
        pointer-events: none; 
        } 
         `}
      </style>
      <div className="relative inline-block">
        <h1
          ref={titleRef}
          className="relative pb-6 text-6xl md:text-7xl lg:text-8xl leading-[1.05] bg-clip-text text-transparent"
          style={{
            fontFamily: "'Allura','Pacifico',cursive",
            fontWeight: 600,
            letterSpacing: "-0.015em",
            WebkitTextStroke: "0.6px rgba(255,255,255,0.12)",
          }}
        >
          WhisperTails
        </h1>
        <span className="jp-title">ウィスパーテイル</span>
      </div>
      <div className="relative mt-5 h-[460px]">
        <img
          ref={leftRef}
          src={images.left}
          className="absolute top-16 left-[20px] w-[260px] rounded-2xl shadow-2xl"
          draggable={false}
        />
        <img
          ref={rightRef}
          src={images.right}
          className="absolute top-16 right-[20px] w-[260px] rounded-2xl shadow-2xl"
          draggable={false}
        />
        <img
          ref={centerRef}
          src={images.center}
          className="absolute top-14 left-1/2 -translate-x-1/2 w-[260px] rounded-2xl shadow-2xl"
          draggable={false}
        />
      </div>
    </div>
  );
};

export default HeroNarrative;
