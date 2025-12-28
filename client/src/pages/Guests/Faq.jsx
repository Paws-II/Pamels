import React, { useState } from "react";

const Faq = () => {
  const faqs = [
    {
      q: "Why does trust take time?",
      a: "Because trust is not a reaction — it's a decision. It forms when someone feels safe enough to stay, without pressure or expectation.",
    },
    {
      q: "Is patience really that important?",
      a: "Yes. Patience creates space. And in that space, fear has room to soften into understanding.",
    },
    {
      q: "What if progress feels slow?",
      a: "Slow progress is still progress. Some bonds don't announce themselves — they arrive quietly when readiness meets consistency.",
    },
    {
      q: "Can trust be forced?",
      a: "No. Trust given under pressure doesn't last. Trust offered gently, without urgency, tends to stay.",
    },
    {
      q: "How do I know when a bond has formed?",
      a: "You'll notice it not in excitement, but in calm. In presence without fear. In silence that feels safe.",
    },
    {
      q: "What if someone pulls away?",
      a: "Let them. Distance isn't always rejection — sometimes it's protection. The ones meant to return will, when they're ready.",
    },
    {
      q: "Does vulnerability mean weakness?",
      a: "No. Vulnerability is the bridge between isolation and connection. It takes courage to let someone see you, not weakness.",
    },
    {
      q: "How do I know if I'm being too patient?",
      a: "Patience honors timing. But if you're silencing your needs to keep someone comfortable, that's not patience — that's abandoning yourself.",
    },
    {
      q: "Can broken trust be rebuilt?",
      a: "Sometimes. But it requires more than apologies — it needs changed behavior, time, and a willingness to start smaller than before.",
    },
    {
      q: "What if I've been hurt before?",
      a: "Then you know what betrayal feels like. And that knowledge, painful as it is, can teach you to recognize safety when it appears.",
    },
  ];

  const [openIndex, setOpenIndex] = useState(null);

  return (
    <section
      style={{
        minHeight: "100vh",
        padding: "clamp(100px, 14vh, 180px) 24px",
        background:
          "radial-gradient(circle at 50% 40%, #0f1f33 0%, #081423 40%, #03070c 75%, #000 100%)",
        color: "white",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "20%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "600px",
          height: "600px",
          background:
            "radial-gradient(circle, rgba(79, 134, 191, 0.15) 0%, transparent 70%)",
          filter: "blur(80px)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{ maxWidth: "900px", margin: "0 auto", position: "relative" }}
      >
        <h2
          style={{
            fontSize: "clamp(2.6rem, 5vw, 4.2rem)",
            fontWeight: 700,
            marginBottom: "20px",
            background: "linear-gradient(135deg, #ffffff 0%, #9fb4cf 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            letterSpacing: "-0.02em",
            textAlign: "center",
          }}
        >
          Questions, Answered Gently
        </h2>

        <p
          style={{
            textAlign: "center",
            fontSize: "clamp(1rem, 2vw, 1.2rem)",
            color: "rgba(255,255,255,0.65)",
            marginBottom: "64px",
          }}
        >
          There's no rush. Take your time.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {faqs.map((item, index) => {
            const isOpen = openIndex === index;

            return (
              <div
                key={index}
                style={{
                  borderRadius: "24px",
                  background:
                    "linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02))",
                  backdropFilter: "blur(10px)",
                  WebkitBackdropFilter: "blur(10px)",
                  boxShadow: isOpen
                    ? "0 30px 80px rgba(0,0,0,0.45), inset 0 0 0 1px rgba(255,255,255,0.18), 0 0 40px rgba(79, 134, 191, 0.2)"
                    : "0 30px 80px rgba(0,0,0,0.45), inset 0 0 0 1px rgba(255,255,255,0.12)",
                  overflow: "hidden",
                  transition: "all 0.35s ease",
                  transform: isOpen ? "translateY(-2px)" : "translateY(0)",
                }}
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  style={{
                    width: "100%",
                    background: "none",
                    border: "none",
                    padding: "28px 32px",
                    textAlign: "left",
                    color: "white",
                    cursor: "pointer",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span
                    style={{
                      fontSize: "clamp(1.1rem, 2vw, 1.35rem)",
                      fontWeight: 500,
                      letterSpacing: "-0.01em",
                    }}
                  >
                    {item.q}
                  </span>

                  <span
                    style={{
                      fontSize: "1.8rem",
                      lineHeight: 1,
                      transform: isOpen ? "rotate(45deg)" : "rotate(0deg)",
                      transition: "transform 0.3s ease",
                      color: isOpen
                        ? "rgba(159, 180, 207, 0.9)"
                        : "rgba(255,255,255,0.6)",
                    }}
                  >
                    +
                  </span>
                </button>

                <div
                  style={{
                    maxHeight: isOpen ? "240px" : "0px",
                    opacity: isOpen ? 1 : 0,
                    padding: isOpen ? "0 32px 28px" : "0 32px",
                    overflow: "hidden",
                    transition:
                      "max-height 0.4s ease, opacity 0.3s ease, padding 0.4s ease",
                  }}
                >
                  <p
                    style={{
                      fontSize: "clamp(0.95rem, 1.8vw, 1.1rem)",
                      lineHeight: 1.8,
                      color: "rgba(255,255,255,0.75)",
                      fontWeight: 300,
                    }}
                  >
                    {item.a}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div
          style={{
            marginTop: "80px",
            textAlign: "center",
            fontFamily: "'Cormorant Garamond', 'Playfair Display', serif",
            fontSize: "clamp(1.1rem, 2.5vw, 1.5rem)",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.85)",
            animation: "fadeIn 1s ease-in-out",
          }}
        >
          Trust grows at its own pace
        </div>
      </div>
    </section>
  );
};

export default Faq;
