import React, { useRef, useEffect, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SnowFall from "react-snowfall";
import moonImg from "../../../assets/Guests/moon.png";

gsap.registerPlugin(ScrollTrigger);

const HeroCompanion = () => {
  const sectionRef = useRef(null);
  const headingRef = useRef(null);
  const dividerRef = useRef(null);
  const textBoxRef = useRef(null);
  const imageCardRef = useRef(null);
  const moonRef = useRef(null);
  const [showSnow, setShowSnow] = useState(false);

  useEffect(() => {
    let snowTrigger;
    let moonGlow;

    const ctx = gsap.context(() => {
      gsap.set(headingRef.current, { opacity: 0, y: -60 });
      gsap.set(dividerRef.current, { opacity: 0, scaleX: 0 });
      gsap.set(textBoxRef.current, { opacity: 0, x: -80, y: 40 });
      gsap.set(imageCardRef.current, { opacity: 0, x: 80, y: 40 });
      gsap.set(moonRef.current, { opacity: 0, y: -80, scale: 0.92 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 60%",
          end: "top 10%",
          scrub: 1.2,
        },
      });

      tl.to(headingRef.current, { opacity: 1, y: 0, duration: 0.8 }, 0)
        .to(dividerRef.current, { opacity: 0.7, scaleX: 1, duration: 0.6 }, 0.3)
        .to(textBoxRef.current, { opacity: 1, x: 0, y: 0, duration: 1 }, 0.6)
        .to(imageCardRef.current, { opacity: 1, x: 0, y: 0, duration: 1 }, 0.7)
        .to(
          moonRef.current,
          { opacity: 0.35, y: 0, scale: 1, duration: 0.9 },
          0
        );

      snowTrigger = ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top 55%",
        onEnter: () => setShowSnow(true),
        onLeaveBack: () => setShowSnow(false),
      });
    }, sectionRef);

    return () => {
      snowTrigger?.kill();

      ctx.revert();
    };
  }, []);

  return (
    <div
      ref={sectionRef}
      className="
        relative min-h-screen overflow-hidden
        bg-[radial-gradient(circle_at_50%_15%,#0f1f33_0%,#081423_35%,#03070c_70%,#000000_100%)]


      "
    >
      {showSnow && <SnowFall color="#82C3D9" snowflakeCount={220} />}

      <div
        className="
          absolute top-[-15%] left-1/2 -translate-x-1/2
          w-[800px] h-[800px] rounded-full
         bg-[radial-gradient(circle,rgba(255,255,255,0.18)_0%,rgba(255,255,255,0.08)_32%,transparent_65%)]


          blur-2xl
          pointer-events-none
        "
        style={{
          animation: "pulse 6s ease-in-out infinite",
        }}
      />

      <div
        ref={moonRef}
        className="
    absolute top-[4%] left-1/2 -translate-x-1/2
    pointer-events-none
    z-[2]
  "
      >
        <img
          src={moonImg}
          alt="Moon"
          className="
      w-[240px] md:w-[320px] lg:w-[380px]

      opacity-90
      drop-shadow-[0_0_35px_rgba(200,230,255,0.55)]
    "
          style={{
            filter:
              "brightness(1.05) contrast(1.05) drop-shadow(0 0 60px rgba(190,220,255,0.35))",
          }}
        />
      </div>

      <div className="absolute inset-0 pointer-events-none z-[3] overflow-hidden">
        <div className="cloud cloud-1" />
        <div className="cloud cloud-2" />
      </div>

      <div
        className="
    absolute inset-0
    bg-[radial-gradient(circle_at_50%_30%,transparent_0%,rgba(0,0,0,0.55)_70%,rgba(0,0,0,0.85)_100%)
    pointer-events-none
  "
      />

      <div
        className="
          absolute inset-0
          bg-[linear-gradient(180deg,rgba(120,160,200,0.08),rgba(5,10,18,0.85))]

          pointer-events-none
        "
      />

      <div
        className="
    absolute bottom-0 left-0 w-full
    h-[60%] sm:h-[50%] md:h-[45%] lg:h-[40%] xl:h-[35%]
    max-h-[520px]
    bg-[linear-gradient(180deg,transparent,#03070c_90%)]
    pointer-events-none
  "
      />

      <div className="relative z-10 min-h-screen flex flex-col pt-14">
        <div className="text-center px-6">
          <h2
            ref={headingRef}
            className="
              text-4xl md:text-5xl lg:text-7xl
              text-white font-semibold
              tracking-tight leading-[1.1]
              drop-shadow-[0_0_25px_rgba(255,255,255,0.25)]
            "
            style={{
              fontFamily: "'Cormorant Garamond','Noto Serif JP',serif",
            }}
          >
            Some bonds don't need words
          </h2>

          <div
            ref={dividerRef}
            className="mt-4 h-[2px] w-32 mx-auto bg-linear-to-r from-transparent via-white to-transparent"
          />
        </div>

        <div className="mt-24 max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center pb-20">
          <div
            ref={textBoxRef}
            className="
              p-12 rounded-3xl
              border border-white/25
              bg-linear-to-br from-white/10 to-white/5
              backdrop-blur-xl
              shadow-[0_8px_60px_rgba(180,220,255,0.18)]
            "
          >
            <p className="text-xl text-white/85 leading-relaxed">
              In the quiet moments, a connection forms — built on trust,
              patience, and unconditional care.
              <br />
              <br />
              <span className="text-white font-medium text-2xl">
                WhisperTails exists for those moments.
              </span>
            </p>
          </div>

          <div ref={imageCardRef} className="flex justify-center">
            {/* <div
              className="
                relative rounded-3xl
                border border-white/30
                bg-linear-to-br from-white/10 to-white/5
                backdrop-blur-lg
                shadow-[0_12px_80px_rgba(160,210,255,0.25)]
                overflow-hidden
              "
            > */}
            {/* <div className="w-[320px] md:w-[420px] h-[400px] md:h-[500px] bg-linear-to-br from-blue-300/20 via-purple-300/20 to-pink-300/20 flex items-center justify-center text-white/70">
                <div className="text-center">
                  <p>Companion Moment</p>
                </div>
              </div> */}

            {/* <div className="absolute top-4 left-4 w-12 h-12 border-t-2 border-l-2 border-white/60 rounded-tl-2xl" />
              <div className="absolute top-4 right-4 w-12 h-12 border-t-2 border-r-2 border-white/60 rounded-tr-2xl" />
              <div className="absolute bottom-4 left-4 w-12 h-12 border-b-2 border-l-2 border-white/60 rounded-bl-2xl" />
              <div className="absolute bottom-4 right-4 w-12 h-12 border-b-2 border-r-2 border-white/60 rounded-br-2xl" /> */}
            {/* </div> */}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }

        .cloud {
  position: absolute;
  top: 14%;
  width: 140%;
  height: 260px;
  background: radial-gradient(
    ellipse at center,
    rgba(255, 255, 255, 0.22),
    rgba(255, 255, 255, 0.12),
    rgba(255, 255, 255, 0.05),
    transparent 75%
  );
  filter: blur(28px);
  opacity: 0.6;
}


.cloud-1 {
  animation: cloudMove 70s linear infinite;
}

.cloud-2 {
  top: 26%;
  animation: cloudMove 95s linear infinite reverse;
}


@keyframes cloudMove {
  from {
    transform: translateX(-20%);
  }
  to {
    transform: translateX(20%);
  }
}

      `}</style>
    </div>
  );
};

export default HeroCompanion;
