import React, { useRef, useEffect, useState } from "react";
import { Quote } from "lucide-react";

const Stories = () => {
  const containerParentRef = useRef(null);
  const containerRef = useRef(null);
  const stickySectionRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);

  const stories = [
    {
      name: "Hachi",
      adjective: "Faithful",
      story: `He waited by the door every evening. Not because he was taught to — but because once, someone came back. Time passed, and the door stayed quiet. Still, he returned to the same spot, day after day. Hope, for him, wasn't loud or desperate. It was patient. It was faithful. It was simply believing that waiting still mattered.`,
      backgroundColor: "#1a2942",
    },
    {
      name: "Luna",
      adjective: "Gentle",
      story: `For weeks, she wouldn't meet anyone's eyes. Every sound made her flinch. Every movement felt like too much. One night, she rested her head on a knee. Just for a moment. That was all the trust she had — and it was enough. No one moved. No one spoke. And in that stillness, something began to heal.`,
      backgroundColor: "#2d1f1a",
    },
    {
      name: "Bruno",
      adjective: "Brave",
      story: `He used to pull away from every touch. Hands meant uncertainty. Closeness felt like danger. Then one day, he didn't step back. Nothing dramatic happened. No moment worth announcing. Just a quiet pause — and a choice to stay. Nothing changed — except how safe he felt.`,
      backgroundColor: "#1a3833",
    },
    {
      name: "Miso",
      adjective: "Calm",
      story: `She learned the sound of quiet footsteps. The kind that don't rush. The kind that don't demand attention. At first, she watched from a distance. Then she stopped hiding. Not to run — but to stay. Some bonds don't begin with excitement. They begin with silence that feels kind.`,
      backgroundColor: "#3d2d26",
    },
    {
      name: "Shadow",
      adjective: "Steady",
      story: `He slept facing the door every night. Not guarding — just waiting. Listening to the world beyond the walls. He didn't ask for reassurance. He didn't need promises. He just needed to know that leaving didn't always mean loss. Some connections don't need words. They just need consistency.`,
      backgroundColor: "#1f2838",
    },
    {
      name: "Willow",
      adjective: "Patient",
      story: `She followed slowly, always a step behind. Never pulling ahead. Never asking for more than she was ready for. Days passed. The distance stayed — until it didn't. One morning, she walked beside them instead. No signal. No celebration. Just trust catching up at its own pace. Trust doesn't rush.`,
      backgroundColor: "#2a2228",
    },
  ];

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (isMobile) return;

    const gsapScript = document.createElement("script");
    gsapScript.src =
      "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js";
    gsapScript.async = true;

    const scrollTriggerScript = document.createElement("script");
    scrollTriggerScript.src =
      "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js";
    scrollTriggerScript.async = true;

    document.body.appendChild(gsapScript);

    let setHeight;

    gsapScript.onload = () => {
      document.body.appendChild(scrollTriggerScript);

      scrollTriggerScript.onload = () => {
        const { gsap } = window;
        const { ScrollTrigger } = window;

        if (!gsap || !ScrollTrigger) return;

        gsap.registerPlugin(ScrollTrigger);

        const parent = containerParentRef.current;
        const container = containerRef.current;
        const sticky = stickySectionRef.current;

        if (!parent || !container || !sticky) return;

        setHeight = () => {
          const rawDistance = container.scrollWidth - window.innerWidth;
          const scrollDistance = Math.max(rawDistance, window.innerWidth * 0.5);
          const buffer = window.innerHeight * 1.2;

          parent.style.height = `${
            scrollDistance + window.innerHeight + buffer
          }px`;
          ScrollTrigger.refresh();
        };

        setHeight();
        window.addEventListener("resize", setHeight);

        gsap.to(container, {
          x: () => -(container.scrollWidth - window.innerWidth),
          ease: "none",
          scrollTrigger: {
            trigger: parent,
            start: "top top",
            end: () =>
              `+=${
                container.scrollWidth -
                window.innerWidth +
                window.innerHeight * 0.5
              }`,
            scrub: 1,
            pin: sticky,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            pinSpacing: true,
            fastScrollEnd: false,
          },
        });
      };
    };

    return () => {
      if (setHeight) {
        window.removeEventListener("resize", setHeight);
      }

      if (window.ScrollTrigger) {
        window.ScrollTrigger.getAll().forEach((t) => t.kill());
      }

      if (document.body.contains(gsapScript)) {
        document.body.removeChild(gsapScript);
      }
      if (document.body.contains(scrollTriggerScript)) {
        document.body.removeChild(scrollTriggerScript);
      }
    };
  }, [isMobile]);

  const getCardWidth = () => {
    const vw = window.innerWidth;
    if (vw < 640) return "85vw";
    if (vw < 1024) return "70vw";
    if (vw < 1440) return "55vw";
    if (vw < 1920) return "45vw";
    return "760px";
  };

  if (isMobile) {
    return (
      <div
        style={{
          background:
            "radial-gradient(circle at 50% 40%, #0f1f33 0%, #081423 40%, #03070c 75%, #000 100%)",
          minHeight: "100vh",
        }}
      >
        <div
          style={{
            padding: "60px 20px 40px",
            textAlign: "center",
            maxWidth: "900px",
            margin: "0 auto",
          }}
        >
          <h2
            style={{
              fontSize: "clamp(2rem, 8vw, 3rem)",
              fontWeight: "700",
              marginBottom: "16px",
              background: "linear-gradient(135deg, #ffffff 0%, #a0b5d0 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              letterSpacing: "-0.02em",
            }}
          >
            Stories That Stayed
          </h2>
          <p
            style={{
              fontSize: "clamp(0.9rem, 4vw, 1.1rem)",
              color: "rgba(255, 255, 255, 0.6)",
              fontWeight: "300",
              letterSpacing: "0.02em",
            }}
          >
            Real bonds formed through patience, not force.
          </p>
        </div>

        <div
          style={{
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            gap: "30px",
          }}
        >
          {stories.map((story, index) => (
            <div
              key={index}
              style={{
                width: "100%",
                minHeight: "400px",
                borderRadius: "24px",
                position: "relative",
                overflow: "hidden",
                backgroundColor: story.backgroundColor,
                boxShadow: "0 20px 40px rgba(0, 0, 0, 0.5)",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: `linear-gradient(135deg, ${story.backgroundColor}cc 0%, ${story.backgroundColor}aa 50%, ${story.backgroundColor}cc 100%)`,
                }}
              />

              <div
                style={{
                  position: "relative",
                  height: "100%",
                  padding: "30px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    marginBottom: "20px",
                  }}
                >
                  <div style={{ position: "relative" }}>
                    <div
                      style={{
                        fontSize: "clamp(2.5rem, 10vw, 4rem)",
                        fontWeight: "900",
                        color: "rgba(255, 255, 255, 0.05)",
                        lineHeight: "1",
                        letterSpacing: "-0.03em",
                        textTransform: "uppercase",
                        position: "absolute",
                        top: "-8px",
                        left: "-4px",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {story.adjective}
                    </div>

                    <div
                      style={{
                        fontSize: "clamp(1.8rem, 8vw, 2.5rem)",
                        fontWeight: "900",
                        WebkitTextStroke: "2px rgba(255, 255, 255, 0.8)",
                        color: "transparent",
                        lineHeight: "1",
                        letterSpacing: "-0.02em",
                        textTransform: "uppercase",
                        position: "relative",
                        zIndex: 1,
                      }}
                    >
                      {story.adjective}
                    </div>
                  </div>

                  <Quote
                    size={32}
                    style={{ color: "rgba(255, 255, 255, 0.3)", flexShrink: 0 }}
                  />
                </div>

                <div
                  style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                  }}
                >
                  <p
                    style={{
                      fontSize: "clamp(0.95rem, 3.5vw, 1.05rem)",
                      lineHeight: "1.7",
                      color: "rgba(255, 255, 255, 0.85)",
                      fontWeight: "300",
                      textShadow: "0 2px 10px rgba(0, 0, 0, 0.3)",
                    }}
                  >
                    {story.story}
                  </p>
                </div>

                <div
                  style={{
                    alignSelf: "flex-start",
                    marginTop: "20px",
                    paddingLeft: "12px",
                    borderLeft: "2px solid rgba(255, 255, 255, 0.25)",
                  }}
                >
                  <span
                    style={{
                      fontSize: "clamp(1rem, 4vw, 1.2rem)",
                      fontWeight: "500",
                      color: "rgba(255, 255, 255, 0.9)",
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      fontFamily:
                        "'Cormorant Garamond', 'Playfair Display', serif",
                    }}
                  >
                    {story.name.toLowerCase()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        background:
          "radial-gradient(circle at 50% 40%, #0f1f33 0%, #081423 40%, #03070c 75%, #000 100%)",
      }}
    >
      <div
        style={{
          padding: "clamp(60px, 10vh, 100px) 24px clamp(30px, 5vh, 50px)",
          textAlign: "center",
          maxWidth: "900px",
          margin: "0 auto",
        }}
      >
        <h2
          style={{
            fontSize: "clamp(2.5rem, 4.5vw, 3.5rem)",
            fontWeight: "700",
            marginBottom: "20px",
            background: "linear-gradient(135deg, #ffffff 0%, #a0b5d0 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            letterSpacing: "-0.02em",
          }}
        >
          Stories That Stayed
        </h2>
        <p
          style={{
            fontSize: "clamp(1rem, 1.8vw, 1.2rem)",
            color: "rgba(255, 255, 255, 0.6)",
            fontWeight: "300",
            letterSpacing: "0.02em",
          }}
        >
          Real bonds formed through patience, not force.
        </p>
      </div>

      <section ref={containerParentRef}>
        <div
          ref={stickySectionRef}
          style={{
            position: "sticky",
            top: 0,
            height: "100vh",
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
          }}
        >
          <div
            ref={containerRef}
            style={{
              display: "flex",
              gap: "clamp(30px, 4vw, 50px)",
              paddingLeft: "clamp(5vw, 8vw, 10vw)",
              paddingRight: "clamp(5vw, 8vw, 10vw)",
              willChange: "transform",
            }}
          >
            {stories.map((story, index) => (
              <div
                key={index}
                style={{
                  width: getCardWidth(),
                  minWidth: getCardWidth(),
                  height: "clamp(400px, 70vh, 550px)",
                  borderRadius: "clamp(16px, 2.5vw, 32px)",
                  position: "relative",
                  overflow: "hidden",
                  backgroundColor: story.backgroundColor,
                  boxShadow:
                    "0 30px 60px rgba(0, 0, 0, 0.5), inset 0 0 0 1px rgba(255, 255, 255, 0.1)",
                  transform: "translateZ(0)",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: `linear-gradient(135deg, ${story.backgroundColor}cc 0%, ${story.backgroundColor}aa 50%, ${story.backgroundColor}cc 100%)`,
                  }}
                />

                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    border: "1px solid rgba(255, 255, 255, 0.15)",
                    borderRadius: "clamp(16px, 2.5vw, 32px)",
                    pointerEvents: "none",
                  }}
                />

                <div
                  style={{
                    position: "relative",
                    height: "100%",
                    padding: "clamp(24px, 3.5vw, 40px)",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      justifyContent: "space-between",
                      marginBottom: "16px",
                    }}
                  >
                    <div style={{ position: "relative" }}>
                      <div
                        style={{
                          fontSize: "clamp(2.5rem, 6vw, 4.5rem)",
                          fontWeight: "900",
                          color: "rgba(255, 255, 255, 0.05)",
                          lineHeight: "1",
                          letterSpacing: "-0.03em",
                          textTransform: "uppercase",
                          position: "absolute",
                          top: "-8px",
                          left: "-4px",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {story.adjective}
                      </div>

                      <div
                        style={{
                          fontSize: "clamp(1.8rem, 4vw, 3rem)",
                          fontWeight: "900",
                          WebkitTextStroke: "2px rgba(255, 255, 255, 0.8)",
                          color: "transparent",
                          lineHeight: "1",
                          letterSpacing: "-0.02em",
                          textTransform: "uppercase",
                          position: "relative",
                          zIndex: 1,
                        }}
                      >
                        {story.adjective}
                      </div>
                    </div>

                    <Quote
                      size={window.innerWidth < 1024 ? 28 : 36}
                      style={{
                        color: "rgba(255, 255, 255, 0.3)",
                        flexShrink: 0,
                      }}
                    />
                  </div>

                  <div
                    style={{
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                    }}
                  >
                    <p
                      style={{
                        fontSize: "clamp(0.9rem, 1.3vw, 1.05rem)",
                        lineHeight: "1.75",
                        color: "rgba(255, 255, 255, 0.85)",
                        fontWeight: "300",
                        maxWidth: "95%",
                        textShadow: "0 2px 10px rgba(0, 0, 0, 0.3)",
                      }}
                    >
                      {story.story}
                    </p>
                  </div>

                  <div
                    style={{
                      alignSelf: "flex-start",
                      marginTop: "20px",
                      paddingLeft: "12px",
                      borderLeft: "2px solid rgba(255, 255, 255, 0.25)",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "clamp(1rem, 1.5vw, 1.25rem)",
                        fontWeight: "500",
                        color: "rgba(255, 255, 255, 0.9)",
                        letterSpacing: "0.12em",
                        textTransform: "uppercase",
                        fontFamily:
                          "'Cormorant Garamond', 'Playfair Display', serif",
                      }}
                    >
                      {story.name.toLowerCase()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Stories;
