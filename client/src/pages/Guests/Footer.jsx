import React from "react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      style={{
        background:
          "linear-gradient(180deg, #000 0%, #03070c 40%, #081423 100%)",
        color: "white",
        padding: "80px 24px 40px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: "100%",
          height: "1px",
          background:
            "linear-gradient(90deg, transparent 0%, rgba(159, 180, 207, 0.3) 50%, transparent 100%)",
        }}
      />

      <div
        style={{
          position: "absolute",
          top: "-200px",
          left: "50%",
          transform: "translateX(-50%)",
          width: "500px",
          height: "500px",
          background:
            "radial-gradient(circle, rgba(79, 134, 191, 0.08) 0%, transparent 70%)",
          filter: "blur(100px)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          position: "relative",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "60px",
            marginBottom: "80px",
          }}
        >
          <div>
            <h3
              style={{
                fontSize: "clamp(1.8rem, 3vw, 2.2rem)",
                fontWeight: 700,
                marginBottom: "16px",
                background: "linear-gradient(135deg, #ffffff 0%, #9fb4cf 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                letterSpacing: "-0.02em",
              }}
            >
              Building Trust
            </h3>
            <p
              style={{
                fontSize: "1rem",
                lineHeight: 1.7,
                color: "rgba(255,255,255,0.6)",
                marginBottom: "24px",
              }}
            >
              Where patience meets presence, and every bond is honored at its
              own pace.
            </p>
            <div style={{ display: "flex", gap: "16px" }}>
              {["twitter", "linkedin", "instagram"].map((social) => (
                <a
                  key={social}
                  href="#"
                  style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "50%",
                    background:
                      "linear-gradient(180deg, rgba(255,255,255,0.1), rgba(255,255,255,0.03))",
                    backdropFilter: "blur(10px)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "rgba(255,255,255,0.7)",
                    textDecoration: "none",
                    transition: "all 0.3s ease",
                    fontSize: "1.1rem",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background =
                      "linear-gradient(180deg, rgba(159, 180, 207, 0.3), rgba(159, 180, 207, 0.1))";
                    e.currentTarget.style.borderColor =
                      "rgba(159, 180, 207, 0.5)";
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background =
                      "linear-gradient(180deg, rgba(255,255,255,0.1), rgba(255,255,255,0.03))";
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  {social[0].toUpperCase()}
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4
              style={{
                fontSize: "1.1rem",
                fontWeight: 600,
                marginBottom: "20px",
                color: "rgba(255,255,255,0.9)",
                letterSpacing: "0.05em",
              }}
            >
              NAVIGATE
            </h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {["Home", "About", "Services", "FAQ", "Contact"].map((link) => (
                <li key={link} style={{ marginBottom: "12px" }}>
                  <a
                    href="#"
                    style={{
                      color: "rgba(255,255,255,0.6)",
                      textDecoration: "none",
                      fontSize: "1rem",
                      transition: "all 0.3s ease",
                      display: "inline-block",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = "rgba(159, 180, 207, 1)";
                      e.currentTarget.style.transform = "translateX(4px)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = "rgba(255,255,255,0.6)";
                      e.currentTarget.style.transform = "translateX(0)";
                    }}
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4
              style={{
                fontSize: "1.1rem",
                fontWeight: 600,
                marginBottom: "20px",
                color: "rgba(255,255,255,0.9)",
                letterSpacing: "0.05em",
              }}
            >
              RESOURCES
            </h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {["Blog", "Guides", "Community", "Support", "Privacy"].map(
                (link) => (
                  <li key={link} style={{ marginBottom: "12px" }}>
                    <a
                      href="#"
                      style={{
                        color: "rgba(255,255,255,0.6)",
                        textDecoration: "none",
                        fontSize: "1rem",
                        transition: "all 0.3s ease",
                        display: "inline-block",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = "rgba(159, 180, 207, 1)";
                        e.currentTarget.style.transform = "translateX(4px)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = "rgba(255,255,255,0.6)";
                        e.currentTarget.style.transform = "translateX(0)";
                      }}
                    >
                      {link}
                    </a>
                  </li>
                )
              )}
            </ul>
          </div>

          <div>
            <h4
              style={{
                fontSize: "1.1rem",
                fontWeight: 600,
                marginBottom: "20px",
                color: "rgba(255,255,255,0.9)",
                letterSpacing: "0.05em",
              }}
            >
              STAY CONNECTED
            </h4>
            <p
              style={{
                fontSize: "0.95rem",
                lineHeight: 1.6,
                color: "rgba(255,255,255,0.6)",
                marginBottom: "20px",
              }}
            >
              Gentle reminders, thoughtful insights, sent at a comfortable pace.
            </p>
            <div style={{ display: "flex", gap: "8px" }}>
              <input
                type="email"
                placeholder="Your email"
                style={{
                  flex: 1,
                  padding: "12px 16px",
                  borderRadius: "12px",
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  color: "white",
                  fontSize: "0.95rem",
                  outline: "none",
                  transition: "all 0.3s ease",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor =
                    "rgba(159, 180, 207, 0.5)";
                  e.currentTarget.style.background = "rgba(255,255,255,0.08)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)";
                  e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                }}
              />
              <button
                style={{
                  padding: "12px 24px",
                  borderRadius: "12px",
                  background:
                    "linear-gradient(135deg, #4f86bf 0%, #3a6a99 100%)",
                  border: "none",
                  color: "white",
                  fontSize: "0.95rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  boxShadow: "0 4px 12px rgba(79, 134, 191, 0.3)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow =
                    "0 6px 20px rgba(79, 134, 191, 0.4)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow =
                    "0 4px 12px rgba(79, 134, 191, 0.3)";
                }}
              >
                Join
              </button>
            </div>
          </div>
        </div>

        <div
          style={{
            width: "100%",
            height: "1px",
            background:
              "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.15) 50%, transparent 100%)",
            marginBottom: "40px",
          }}
        />

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "20px",
          }}
        >
          <p
            style={{
              fontSize: "0.9rem",
              color: "rgba(255,255,255,0.5)",
              margin: 0,
            }}
          >
            © {currentYear} Building Trust. All rights reserved.
          </p>
          <div style={{ display: "flex", gap: "24px" }}>
            {["Terms", "Privacy", "Cookies"].map((item) => (
              <a
                key={item}
                href="#"
                style={{
                  fontSize: "0.9rem",
                  color: "rgba(255,255,255,0.5)",
                  textDecoration: "none",
                  transition: "color 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "rgba(159, 180, 207, 0.9)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "rgba(255,255,255,0.5)";
                }}
              >
                {item}
              </a>
            ))}
          </div>
        </div>

        <div
          style={{
            marginTop: "60px",
            textAlign: "center",
            fontFamily: "'Cormorant Garamond', 'Playfair Display', serif",
            fontSize: "clamp(1rem, 2vw, 1.3rem)",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.4)",
          }}
        >
          Built with patience, designed for connection
        </div>
      </div>
    </footer>
  );
};

export default Footer;
