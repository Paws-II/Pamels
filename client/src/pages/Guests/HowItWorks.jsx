import React, { useEffect, useRef } from "react";
import {
  Heart,
  Home,
  Video,
  Search,
  FileText,
  Dog,
  ArrowDown,
} from "lucide-react";

const HowItWorks = () => {
  const sectionRef = useRef(null);

  const steps = [
    {
      id: 1,
      title: "Choose Your Pet",
      description: "Find the one that steals your heart",
      icon: Dog,
      gradient: `
      radial-gradient(circle at 30% 30%,
        #facc15 0%,
        #f59e0b 45%,
        #78350f 100%)
    `,
    },
    {
      id: 2,
      title: "Submit Your Application",
      description: "Tell us why you're the perfect match",
      icon: FileText,
      gradient: `
      radial-gradient(circle at 30% 30%,
        #38bdf8 0%,
        #0284c7 50%,
        #020617 100%)
    `,
    },
    {
      id: 3,
      title: "Application Review",
      description: "We verify details to ensure a safe home",
      icon: Search,
      gradient: `
      radial-gradient(circle at 30% 30%,
        #a78bfa 0%,
        #6d28d9 50%,
        #2e1065 100%)
    `,
    },
    {
      id: 4,
      title: "Video Verification",
      description: "A quick face-to-face to build trust",
      icon: Video,
      gradient: `
      radial-gradient(circle at 30% 30%,
        #3f3f46 0%,
        #18181b 45%,
        #09090b 75%,
        #000000 100%)
    `,
    },
    {
      id: 5,
      title: "Home Visit",
      description: "Because every pet deserves the right space",
      icon: Home,
      gradient: `
      radial-gradient(circle at 30% 30%,
        #10b981 0%,
        #065f46 55%,
        #022c22 100%)
    `,
    },
    {
      id: 6,
      title: "Welcome Them Home",
      description: "Done. Your forever companion is yours",
      icon: Heart,
      gradient: `
      radial-gradient(circle at 30% 30%,
        #ff3b3b 0%,
        #a00000 55%,
        #3a0000 100%)
    `,
    },
  ];

  useEffect(() => {
    const gsap = window.gsap;
    const ScrollTrigger = window.ScrollTrigger;
    if (!gsap || !ScrollTrigger) return;

    ScrollTrigger.getAll().forEach((t) => t.kill());

    const cards = gsap.utils.toArray(".step-card");
    const heading = document.querySelector(".how-heading");

    cards.forEach((card, index) => {
      if (index === cards.length - 1) return;

      const cardContent = card.querySelector(".card-content");
      const nextCard = cards[index + 1];
      const cardsAfter = cards.length - 1 - index;
      const toScale = 1 - cardsAfter * 0.06;

      ScrollTrigger.create({
        trigger: nextCard,
        start: "top bottom",
        end: "top top",
        scrub: 1.2,
        onUpdate: (self) => {
          const p = self.progress;

          gsap.to(cardContent, {
            scale: gsap.utils.interpolate(1, toScale, p),
            filter: `brightness(${gsap.utils.interpolate(1, 0.65, p)})`,
            duration: 0,
            overwrite: true,
          });
        },
      });
    });

    if (heading && cards.length) {
      ScrollTrigger.create({
        trigger: cards[0],
        start: "top bottom",
        end: "top top",
        scrub: 1.2,
        onUpdate: (self) => {
          const p = self.progress;

          gsap.to(heading, {
            scale: gsap.utils.interpolate(1, 0.82, p),
            yPercent: gsap.utils.interpolate(-50, -80, p),
            filter: `brightness(${gsap.utils.interpolate(1, 0.6, p)})`,
            opacity: gsap.utils.interpolate(1, 0.35, p),
            duration: 0,
            overwrite: true,
          });
        },
      });
    }
    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      style={{
        position: "relative",
        minHeight: "100vh",
        paddingTop: "clamp(80px, 12vh, 140px)",
        paddingBottom: "clamp(80px, 12vh, 140px)",
        paddingLeft: "24px",
        paddingRight: "24px",
        color: "white",
        background:
          "radial-gradient(circle at 50% 40%, #0f1f33 0%, #081423 40%, #03070c 75%, #000 100%)",
      }}
    >
      <div
        className="how-heading"
        style={{
          position: "sticky",
          top: "50%",
          transform: "translateY(-50%)",
          zIndex: 5,
          maxWidth: "1000px",
          margin: "0 auto 140px",
          textAlign: "center",
          transformOrigin: "center center",
          willChange: "transform",
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            position: "relative",
            display: "inline-block",
            padding: "32px 56px",
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)",
            backdropFilter: "blur(20px)",
            borderRadius: "24px",
            border: "2px solid rgba(255,255,255,0.2)",
            boxShadow:
              "0 8px 32px rgba(0,0,0,0.4), 0 0 60px rgba(59,130,246,0.15), inset 0 1px 0 rgba(255,255,255,0.2), inset 0 -1px 0 rgba(0,0,0,0.2)",
          }}
        >
          {/* Animated gradient border glow */}
          <div
            style={{
              position: "absolute",
              inset: "-3px",
              background:
                "linear-gradient(135deg, rgba(59,130,246,0.4), rgba(147,51,234,0.4), rgba(236,72,153,0.4), rgba(59,130,246,0.4))",
              borderRadius: "26px",
              opacity: 0.6,
              filter: "blur(8px)",
              zIndex: -1,
              animation: "rotate 8s linear infinite",
            }}
          />

          {/* Corner accents */}
          <div
            style={{
              position: "absolute",
              top: "12px",
              left: "12px",
              width: "40px",
              height: "40px",
              borderTop: "3px solid rgba(59,130,246,0.6)",
              borderLeft: "3px solid rgba(59,130,246,0.6)",
              borderRadius: "8px 0 0 0",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: "12px",
              right: "12px",
              width: "40px",
              height: "40px",
              borderTop: "3px solid rgba(147,51,234,0.6)",
              borderRight: "3px solid rgba(147,51,234,0.6)",
              borderRadius: "0 8px 0 0",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: "12px",
              left: "12px",
              width: "40px",
              height: "40px",
              borderBottom: "3px solid rgba(236,72,153,0.6)",
              borderLeft: "3px solid rgba(236,72,153,0.6)",
              borderRadius: "0 0 0 8px",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: "12px",
              right: "12px",
              width: "40px",
              height: "40px",
              borderBottom: "3px solid rgba(59,130,246,0.6)",
              borderRight: "3px solid rgba(59,130,246,0.6)",
              borderRadius: "0 0 8px 0",
            }}
          />

          <h2
            style={{
              fontSize: "clamp(2.8rem, 6vw, 4.5rem)",
              fontWeight: 800,
              fontFamily: "'Space Grotesk', sans-serif",
              background:
                "linear-gradient(135deg, #ffffff 0%, #e0e7ff 50%, #ffffff 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              marginBottom: "0",
              position: "relative",
            }}
          >
            How Whisper Tails Works
          </h2>

          <div
            style={{
              marginTop: "28px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "8px",
              pointerEvents: "auto",
              opacity: 0.85,
            }}
          >
            <span
              style={{
                fontSize: "0.7rem",
                letterSpacing: "0.35em",
                textTransform: "uppercase",
                fontWeight: 700,
                color: "rgba(255,255,255,0.75)",
                fontFamily: "'Space Grotesk', sans-serif",
              }}
            >
              Scroll
            </span>

            <ArrowDown
              size={28}
              strokeWidth={2}
              style={{
                color: "white",
                animation: "scrollHint 1.8s ease-in-out infinite",
                filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.4))",
              }}
            />
          </div>
        </div>
      </div>

      <div style={{ height: "90vh" }} />

      <div
        style={{
          position: "relative",
          zIndex: 10,
          maxWidth: "1000px",
          marginLeft: "auto",
          marginRight: "auto",
        }}
      >
        {steps.map((step, index) => {
          const Icon = step.icon;
          const offsetTop = 20 + index * 30;

          return (
            <div
              key={step.id}
              className="step-card"
              style={{
                position: "sticky",
                top: "120px",
                paddingTop: `${offsetTop}px`,
                marginBottom: index === steps.length - 1 ? 0 : "40px",
              }}
            >
              <div
                className="card-content"
                style={{
                  width: "100%",
                  minHeight: "clamp(350px, 70vh, 550px)",
                  position: "relative",
                  background: step.gradient,
                  borderRadius: "32px",
                  boxShadow:
                    "0 30px 80px rgba(0,0,0,0.4), 0 10px 30px rgba(0,0,0,0.3)",
                  willChange: "transform",
                  transformOrigin: "center top",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    opacity: 0.15,
                    pointerEvents: "none",
                    background:
                      "radial-gradient(circle at 70% 70%, rgba(255,255,255,0.4) 0%, transparent 60%)",
                  }}
                />

                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    opacity: 0.03,
                    pointerEvents: "none",
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                    mixBlendMode: "overlay",
                  }}
                />

                <div
                  style={{
                    position: "relative",
                    zIndex: 10,
                    height: "100%",
                    display: "flex",
                    flexDirection: window.innerWidth < 768 ? "column" : "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "clamp(2.8rem, 5.5vw, 4.2rem)",
                    gap: "48px",
                    minHeight: "inherit",
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        display: "flex",
                        gap: "32px",
                        alignItems: "flex-start",
                      }}
                    >
                      <div
                        style={{
                          width: "2px",
                          height: "140px",
                          background:
                            "linear-gradient(to bottom, rgba(255,255,255,0.45), rgba(255,255,255,0.05))",
                          borderRadius: "2px",
                          marginTop: "6px",
                          flexShrink: 0,
                        }}
                      />

                      <div>
                        <div
                          style={{
                            display: "inline-block",
                            position: "relative",
                            marginBottom: "24px",
                          }}
                        >
                          <div
                            style={{
                              fontSize: "0.7rem",
                              letterSpacing: "0.35em",
                              textTransform: "uppercase",
                              fontWeight: 800,
                              fontFamily: "'Space Grotesk', sans-serif",
                              background: "rgba(255,255,255,0.12)",
                              backdropFilter: "blur(10px)",
                              padding: "10px 20px",
                              borderRadius: "100px",
                              border: "1px solid rgba(255,255,255,0.25)",
                              boxShadow:
                                "0 4px 16px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.3)",
                              color: "rgba(255,255,255,0.95)",
                              textShadow: "0 2px 8px rgba(0,0,0,0.4)",
                              display: "inline-block",
                            }}
                          >
                            STEP {step.id}
                          </div>
                          <div
                            style={{
                              position: "absolute",
                              inset: "-2px",
                              background:
                                "linear-gradient(135deg, rgba(255,255,255,0.3), transparent 50%, rgba(255,255,255,0.1))",
                              borderRadius: "100px",
                              opacity: 0.4,
                              pointerEvents: "none",
                              zIndex: -1,
                            }}
                          />
                        </div>

                        <h3
                          style={{
                            fontSize: "clamp(2.6rem, 5vw, 4.2rem)",
                            fontWeight: 900,
                            lineHeight: 0.98,
                            letterSpacing: "-0.03em",
                            marginBottom: "32px",
                            fontFamily: "'Space Grotesk', sans-serif",
                            textShadow:
                              "0 4px 20px rgba(0,0,0,0.6), 0 12px 40px rgba(0,0,0,0.4)",
                            color: "rgba(255,255,255,0.98)",
                          }}
                        >
                          {step.title}
                        </h3>

                        <p
                          style={{
                            maxWidth: "40ch",
                            fontSize: "1.15rem",
                            lineHeight: 1.7,
                            fontWeight: 400,
                            color: "rgba(255,255,255,0.92)",
                            fontFamily: "'Inter', sans-serif",
                            textShadow: "0 2px 12px rgba(0,0,0,0.4)",
                            letterSpacing: "0.002em",
                            position: "relative",
                            paddingLeft: "24px",
                            borderLeft: "3px solid rgba(255,255,255,0.25)",
                            background:
                              "linear-gradient(90deg, rgba(255,255,255,0.06) 0%, transparent 100%)",
                            padding: "20px 24px",
                            borderRadius: "8px",
                            backdropFilter: "blur(4px)",
                            boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
                          }}
                        >
                          {step.description}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div style={{ flexShrink: 0 }}>
                    <div
                      style={{
                        width: "clamp(110px, 18vw, 180px)",
                        height: "clamp(110px, 18vw, 180px)",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "rgba(255,255,255,0.18)",
                        backdropFilter: "blur(20px)",
                        boxShadow:
                          "0 16px 50px rgba(0,0,0,0.45), inset 0 2px 4px rgba(255,255,255,0.3), inset 0 -2px 4px rgba(0,0,0,0.2)",
                        border: "1px solid rgba(255,255,255,0.2)",
                      }}
                    >
                      <Icon
                        size={window.innerWidth < 768 ? 50 : 72}
                        strokeWidth={1.8}
                        style={{
                          color: "white",
                          filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.3))",
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    opacity: 0.08,
                    pointerEvents: "none",
                    background:
                      "linear-gradient(135deg, rgba(255,255,255,0.4) 0%, transparent 50%, rgba(0,0,0,0.3) 100%)",
                  }}
                />

                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: "2px",
                    background:
                      "linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)",
                    opacity: 0.6,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default HowItWorks;
