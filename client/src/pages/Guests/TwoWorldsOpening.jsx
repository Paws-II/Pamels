import React, { useEffect, useRef } from "react";
import img001 from "../../assets/twoWorlds/001.png";
import img002 from "../../assets/twoWorlds/002.png";
import img003 from "../../assets/twoWorlds/003.png";
import img004 from "../../assets/twoWorlds/004.png";
import img005 from "../../assets/twoWorlds/005.png";
import img006 from "../../assets/twoWorlds/006.png";
import img007 from "../../assets/twoWorlds/007.png";
import img008 from "../../assets/twoWorlds/008.png";
import img009 from "../../assets/twoWorlds/009.png";
import img010 from "../../assets/twoWorlds/010.png";

const TwoWorldsOpening = () => {
  <style>{`
        @keyframes float {
          0% {
            transform: translate(0, 0);
          }
          100% {
            transform: translate(-40px, -40px);
          }
        }
        .scroll-heading {
          transform: translateY(-40px);
          font-family: "Cormorant Garamond", "Playfair Display", serif;
          font-size: clamp(2.5rem, 7vw, 5rem);
          font-weight: 600;
          color: #ffffff;
          text-align: center;
          text-shadow: 0 0 25px rgba(255, 255, 255, 0.25),
            0 8px 40px rgba(0, 0, 0, 0.5);
          pointer-events: none;
          white-space: nowrap;
          letter-spacing: 0.02em;
        }
        @keyframes pulse {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }
        .card-left,
        .card-right {
          transform: translateZ(0);
          backface-visibility: hidden;
          perspective: 1000px;
        }
      `}</style>;

  const mainRef = useRef(null);

  const cardImages = [
    // ───────────────── Rescue ─────────────────
    {
      left: img001,
      right: img002,
      leftLabel: "Rescue",
      rightLabel: "Fearless",
    },

    // ───────────────── Trust ─────────────────
    {
      left: img003,
      right: img004,
      leftLabel: "Trust",
      rightLabel: "Gentle",
    },

    // ───────────────── Healing ─────────────────
    {
      left: img005,
      right: img006,
      leftLabel: "Healing",
      rightLabel: "Restorative",
    },

    // ───────────────── Adoption ─────────────────
    {
      left: img007,
      right: img008,
      leftLabel: "Adoption",
      rightLabel: "Hopeful",
    },
  ];

  useEffect(() => {
    const loadGSAP = async () => {
      if (window.gsap && window.ScrollTrigger) {
        initAnimations();
        return;
      }

      const gsapScript = document.createElement("script");
      gsapScript.src =
        "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js";

      const scrollTriggerScript = document.createElement("script");
      scrollTriggerScript.src =
        "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js";

      gsapScript.onload = () => {
        scrollTriggerScript.onload = () => {
          if (window.gsap && window.ScrollTrigger) {
            window.gsap.registerPlugin(window.ScrollTrigger);
            initAnimations();
          }
        };
        document.head.appendChild(scrollTriggerScript);
      };

      document.head.appendChild(gsapScript);
    };

    const getResponsiveValues = () => {
      const width = window.innerWidth;

      if (width <= 480) {
        return {
          leftX: [-1200, -1300, -600, -400],
          rightX: [1200, 1300, 600, 400],
          leftRot: [-40, -35, -45, -30],
          rightRot: [40, 35, 45, 30],
          yVals: [160, -220, -380, -520],

          scale: [0.8, 0.85, 0.9, 0.95],
        };
      } else if (width <= 768) {
        return {
          leftX: [-1000, -1100, -500, -350],
          rightX: [1000, 1100, 500, 350],
          leftRot: [-35, -30, -40, -25],
          rightRot: [35, 30, 40, 25],
          yVals: [140, -200, -350, -480],
          scale: [0.85, 0.9, 0.95, 1],
        };
      } else if (width <= 1024) {
        return {
          leftX: [-700, -800, -400, -300],
          rightX: [700, 800, 400, 300],
          leftRot: [-28, -25, -32, -20],
          rightRot: [28, 25, 32, 20],
          yVals: [130, -190, -335, -460],
          scale: [0.9, 0.95, 1, 1.05],
        };
      } else {
        return {
          leftX: [-900, -1000, -500, -350],
          rightX: [900, 1000, 500, 350],
          leftRot: [-32, -28, -38, -24],
          rightRot: [32, 28, 38, 24],
          yVals: [120, -180, -320, -450],
          scale: [0.95, 1, 1.05, 1.1],
        };
      }
    };

    const initAnimations = () => {
      const gsap = window.gsap;
      const ScrollTrigger = window.ScrollTrigger;

      if (!gsap || !ScrollTrigger) return;

      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());

      const values = getResponsiveValues();
      const rows = mainRef.current.querySelectorAll(".card-row");

      rows.forEach((row, i) => {
        const left = row.querySelector(".card-left");
        const right = row.querySelector(".card-right");

        gsap.set([left, right], {
          x: 0,
          y: 0,
          rotation: 0,
          scale: 1,
          opacity: 0,
          willChange: "transform, opacity",
        });

        gsap.to([left, right], {
          opacity: 1,
          duration: 0.6,
          ease: "power2.out",
          scrollTrigger: {
            trigger: row,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        });

        ScrollTrigger.create({
          trigger: ".content-section",
          start: "top 60%",
          end: "bottom 20%",
          scrub: 0.2,
          onUpdate: (self) => {
            const isLast = i === rows.length - 1;
            const progress = self.progress;
            const easedProgress = gsap.parseEase("power2.inOut")(progress);
            const scaleBoost = isLast ? 1.08 : values.scale[i];
            const rotationDamp = isLast ? 0.6 : 1;

            gsap.set(left, {
              x: easedProgress * values.leftX[i] * 0.92,
              y: easedProgress * values.yVals[i],
              rotation: easedProgress * values.leftRot[i] * rotationDamp,
              scale: 1 + easedProgress * (scaleBoost - 1),
              force3D: true,
            });

            gsap.set(right, {
              x: easedProgress * values.rightX[i] * 1.05,
              y: easedProgress * values.yVals[i],
              rotation: easedProgress * values.rightRot[i] * rotationDamp,
              scale: 1 + easedProgress * (scaleBoost - 1),
              force3D: true,
            });
          },
        });
      });

      gsap.fromTo(
        ".scroll-heading",
        {
          opacity: 0,
          y: 80,
          letterSpacing: "0.3em",
          filter: "blur(10px)",
        },
        {
          opacity: 1,
          y: 0,
          letterSpacing: "0.05em",
          filter: "blur(0px)",
          duration: 1.2,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".scroll-heading-wrapper",
            start: "top 75%",
            end: "top 45%",
            scrub: true,
          },
        }
      );
    };

    loadGSAP();

    let resizeTimer;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (window.gsap && window.ScrollTrigger) {
          initAnimations();
        }
      }, 250);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (window.ScrollTrigger) {
        window.ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
      }
    };
  }, []);

  return (
    <div
      ref={mainRef}
      className="min-h-screen relative overflow-hidden text-white"
      style={{
        background:
          "radial-gradient(circle at 50% 50%, #0f1f33 0%, #081423 35%, #03070c 70%, #000000 100%)",
      }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 50% 30%, transparent 0%, rgba(0,0,0,0.45) 70%, rgba(0,0,0,0.75) 100%)",
        }}
      />

      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(180deg, rgba(120,160,200,0.08), rgba(5,10,18,0.75))",
        }}
      />

      <div
        className="absolute bottom-0 left-0 w-full h-[45%] pointer-events-none"
        style={{
          background: "linear-gradient(180deg, transparent, #03070c 90%)",
        }}
      />

      <div className="content-section py-2 px-5 relative overflow-hidden z-10">
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, rgba(255,255,255,0.2) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
            animation: "float 25s linear infinite",
          }}
        />

        {cardImages.map((card, index) => (
          <React.Fragment key={index}>
            <div className="card-row flex justify-center items-center gap-[clamp(30px,6vw,80px)] my-[clamp(180px,22vh,280px)] px-5">
              <div
                className="card-left w-[clamp(260px,38vw,440px)] aspect-[5/4]
 rounded-[32px] overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.5)] border border-white/20 relative group"
              >
                <img
                  src={card.left}
                  alt={card.leftLabel}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div
                  className="absolute inset-0 opacity-15"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(120,160,200,0.2) 0%, rgba(5,10,18,0.3) 100%)",
                  }}
                />
                <div className="absolute inset-0 bg-linear-to-br from-white/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div
                  className="absolute bottom-6 left-6 right-6 text-white font-bold text-[clamp(1.1rem,2.5vw,1.4rem)] tracking-wide"
                  style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    textShadow:
                      "0 4px 12px rgba(0,0,0,0.7), 0 2px 4px rgba(0,0,0,0.5)",
                  }}
                >
                  {card.leftLabel}
                </div>
              </div>

              <div
                className="card-right w-[clamp(260px,38vw,440px)] aspect-[5/4]
 rounded-[32px] overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.5)] border border-white/20 relative group"
              >
                <img
                  src={card.right}
                  alt={card.rightLabel}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div
                  className="absolute inset-0 opacity-15"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(120,160,200,0.2) 0%, rgba(5,10,18,0.3) 100%)",
                  }}
                />
                <div className="absolute inset-0 bg-linear-to-br from-white/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div
                  className="absolute bottom-6 left-6 right-6 text-white font-bold text-[clamp(1.1rem,2.5vw,1.4rem)] tracking-wide"
                  style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    textShadow:
                      "0 4px 12px rgba(0,0,0,0.7), 0 2px 4px rgba(0,0,0,0.5)",
                  }}
                >
                  {card.rightLabel}
                </div>
              </div>
            </div>

            {index === 0 && (
              <div className="scroll-heading-wrapper my-[clamp(140px,18vh,220px)] flex justify-center items-center relative">
                <div
                  className="absolute w-[600px] h-[600px] rounded-full pointer-events-none opacity-30"
                  style={{
                    background:
                      "radial-gradient(circle, rgba(120,160,200,0.4) 0%, rgba(160,210,255,0.2) 30%, transparent 70%)",
                    filter: "blur(60px)",
                  }}
                />
                <h2 className="scroll-heading relative z-10">
                  A moment is all it takes.
                </h2>
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default TwoWorldsOpening;
