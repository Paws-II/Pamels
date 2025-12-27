import React, { useRef, useEffect } from "react";
import { Quote } from "lucide-react";

const Stories = () => {
  const containerParentRef = useRef(null);
  const containerRef = useRef(null);
  const stickySectionRef = useRef(null);

  const stories = [
    {
      name: "Hachi",
      adjective: "Faithful",
      story: `He waited by the door every evening. Not because he was taught to — but because once, someone came back. Time passed, and the door stayed quiet. Still, he returned to the same spot, day after day. Hope, for him, wasn't loud or desperate. It was patient. It was faithful. It was simply believing that waiting still mattered.`,
      backgroundColor: "#1a2942",
      image:
        "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=1200&q=80",
    },
    {
      name: "Luna",
      adjective: "Gentle",
      story: `For weeks, she wouldn't meet anyone's eyes. Every sound made her flinch. Every movement felt like too much. One night, she rested her head on a knee. Just for a moment. That was all the trust she had — and it was enough. No one moved. No one spoke. And in that stillness, something began to heal.`,
      backgroundColor: "#2d1f1a",
      image:
        "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=1200&q=80",
    },
    {
      name: "Bruno",
      adjective: "Brave",
      story: `He used to pull away from every touch. Hands meant uncertainty. Closeness felt like danger. Then one day, he didn't step back. Nothing dramatic happened. No moment worth announcing. Just a quiet pause — and a choice to stay. Nothing changed — except how safe he felt.`,
      backgroundColor: "#1a3833",
      image:
        "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=1200&q=80",
    },
    {
      name: "Miso",
      adjective: "Calm",
      story: `She learned the sound of quiet footsteps. The kind that don't rush. The kind that don't demand attention. At first, she watched from a distance. Then she stopped hiding. Not to run — but to stay. Some bonds don't begin with excitement. They begin with silence that feels kind.`,
      backgroundColor: "#3d2d26",
      image:
        "https://images.unsplash.com/photo-1574158622682-e40e69881006?w=1200&q=80",
    },
    {
      name: "Shadow",
      adjective: "Steady",
      story: `He slept facing the door every night. Not guarding — just waiting. Listening to the world beyond the walls. He didn't ask for reassurance. He didn't need promises. He just needed to know that leaving didn't always mean loss. Some connections don't need words. They just need consistency.`,
      backgroundColor: "#1f2838",
      image:
        "https://images.unsplash.com/photo-1561037404-61cd46aa615b?w=1200&q=80",
    },
    {
      name: "Willow",
      adjective: "Patient",
      story: `She followed slowly, always a step behind. Never pulling ahead. Never asking for more than she was ready for. Days passed. The distance stayed — until it didn't. One morning, she walked beside them instead. No signal. No celebration. Just trust catching up at its own pace. Trust doesn't rush.`,
      backgroundColor: "#2a2228",
      image:
        "https://images.unsplash.com/photo-1552053831-71594a27632d?w=1200&q=80",
    },
  ];

  useEffect(() => {
    const gsapScript = document.createElement("script");
    gsapScript.src =
      "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js";
    gsapScript.async = true;

    const scrollTriggerScript = document.createElement("script");
    scrollTriggerScript.src =
      "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js";
    scrollTriggerScript.async = true;

    document.body.appendChild(gsapScript);

    gsapScript.onload = () => {
      document.body.appendChild(scrollTriggerScript);

      scrollTriggerScript.onload = () => {
        const { gsap } = window;
        const { ScrollTrigger } = window;

        gsap.registerPlugin(ScrollTrigger);

        const container = containerRef.current;
        if (!container) return;

        const getScrollAmount = () => {
          return -(container.scrollWidth - window.innerWidth);
        };

        gsap.to(container, {
          x: getScrollAmount,
          ease: "none",
          scrollTrigger: {
            trigger: containerParentRef.current,
            start: "top top",
            end: () => `+=${container.scrollWidth - window.innerWidth}`,
            scrub: 1,
            pin: stickySectionRef.current,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });

        return () => {
          ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
        };
      };
    };

    return () => {
      document.body.removeChild(gsapScript);
      if (document.body.contains(scrollTriggerScript)) {
        document.body.removeChild(scrollTriggerScript);
      }
    };
  }, []);

  return (
    <div
      style={{
        background:
          "radial-gradient(circle at 50% 40%, #0f1f33 0%, #081423 40%, #03070c 75%, #000 100%)",
      }}
    >
      <div
        style={{
          padding: "clamp(80px, 12vh, 120px) 24px clamp(40px, 6vh, 60px)",
          textAlign: "center",
          maxWidth: "900px",
          margin: "0 auto",
        }}
      >
        <h2
          style={{
            fontSize: "clamp(2.5rem, 5vw, 4rem)",
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
            fontSize: "clamp(1rem, 2vw, 1.25rem)",
            color: "rgba(255, 255, 255, 0.6)",
            fontWeight: "300",
            letterSpacing: "0.02em",
          }}
        >
          Real bonds formed through patience, not force.
        </p>
      </div>

      <section
        ref={containerParentRef}
        style={{
          height: `${stories.length * 120}vh`,
        }}
      >
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
              gap: "clamp(40px, 5vw, 60px)",
              paddingLeft: "10vw",
              paddingRight: "10vw",
              willChange: "transform",
            }}
          >
            {stories.map((story, index) => (
              <div
                key={index}
                style={{
                  minWidth: "clamp(280px, 60vw, 760px)",
                  aspectRatio: "1.65",
                  borderRadius: "clamp(20px, 3vw, 40px)",
                  position: "relative",
                  overflow: "hidden",
                  backgroundColor: story.backgroundColor,
                  boxShadow:
                    "0 40px 80px rgba(0, 0, 0, 0.5), inset 0 0 0 1px rgba(255, 255, 255, 0.1)",
                  transition: "transform 0.3s ease",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "scale(1.02)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    backgroundImage: `url(${story.image})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    opacity: 0.6,
                    filter: "blur(1px)",
                  }}
                />

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
                    borderRadius: "clamp(20px, 3vw, 40px)",
                    pointerEvents: "none",
                  }}
                />

                <div
                  style={{
                    position: "relative",
                    height: "100%",
                    padding: "clamp(30px, 4vw, 50px)",
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
                          fontSize: "clamp(3rem, 8vw, 6rem)",
                          fontWeight: "900",
                          color: "rgba(255, 255, 255, 0.05)",
                          lineHeight: "1",
                          letterSpacing: "-0.03em",
                          textTransform: "uppercase",
                          position: "absolute",
                          top: "-10px",
                          left: "-5px",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {story.adjective}
                      </div>

                      <div
                        style={{
                          fontSize: "clamp(2rem, 5vw, 3.5rem)",
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
                      size={clamp(32, 40)}
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
                        fontSize: "clamp(0.9rem, 1.5vw, 1.1rem)",
                        lineHeight: "1.8",
                        color: "rgba(255, 255, 255, 0.85)",
                        fontWeight: "300",
                        maxWidth: "90%",
                        textShadow: "0 2px 10px rgba(0, 0, 0, 0.3)",
                      }}
                    >
                      {story.story}
                    </p>
                  </div>

                  <div
                    style={{
                      alignSelf: "flex-start",
                      marginTop: "24px",
                      paddingLeft: "4px",
                      borderLeft: "2px solid rgba(255, 255, 255, 0.25)",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "clamp(1.1rem, 2vw, 1.4rem)",
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

function clamp(min, max) {
  return Math.min(Math.max(min, window.innerWidth * 0.04), max);
}

export default Stories;
