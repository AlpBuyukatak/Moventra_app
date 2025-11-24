import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      style={{
        width: "100%",
        marginTop: "3rem",
        padding: "1.5rem 1rem 2.5rem",
        background: "var(--bg)",
        color: "var(--fg)",
        fontFamily: "system-ui, sans-serif",
        borderTop: "1px solid rgba(15,23,42,0.7)",
      }}
    >
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: "1.5rem",
        }}
      >
        {/* Üst CTA banner */}
        <section
          style={{
            borderRadius: 24,
            padding: "1.6rem 1.8rem",
            background:
              "linear-gradient(135deg, rgba(37,99,235,0.96), rgba(56,189,248,0.85))",
            color: "#0f172a",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
            boxShadow: "0 18px 40px rgba(15,23,42,0.55)",
          }}
        >
          <div
            style={{
              maxWidth: 520,
              display: "flex",
              flexDirection: "column",
              gap: 6,
            }}
          >
            <h2
              style={{
                fontSize: 20,
                fontWeight: 700,
                letterSpacing: 0.3,
              }}
            >
              Do you host events?
            </h2>
            <p
              style={{
                fontSize: 14,
                opacity: 0.9,
              }}
            >
              Let Moventra help you fill your small group meetups with people
              who share the same hobbies. Create an event in a few clicks.
            </p>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 10,
              alignItems: "flex-end",
              minWidth: 180,
            }}
          >
            <Link
              href="/events/new"
              style={{
                padding: "0.7rem 1.3rem",
                borderRadius: 999,
                border: "none",
                background:
                  "linear-gradient(135deg,rgba(248,250,252,0.98),rgba(226,232,240,0.98))",
                color: "#020617",
                fontSize: 14,
                fontWeight: 700,
                textDecoration: "none",
                boxShadow: "0 10px 22px rgba(15,23,42,0.4)",
              }}
            >
              Create an event
            </Link>
            <p
              style={{
                fontSize: 11,
                opacity: 0.8,
                textAlign: "right",
                maxWidth: 220,
              }}
            >
              No big crowd tools here – focused on small, hobby-based groups.
            </p>
          </div>
        </section>

        {/* Alt footer alanı */}
        <section
          style={{
            borderRadius: 24,
            padding: "1.6rem 1.8rem",
            backgroundColor: "var(--card-bg)",
            border: "1px solid var(--card-border)",
            display: "grid",
            gridTemplateColumns: "minmax(0,2fr) repeat(3,minmax(0,1fr))",
            gap: 18,
          }}
        >
          {/* Sol kolon – marka açıklaması */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 12,
                  background:
                    "conic-gradient(from 120deg,#38bdf8,#6366f1,#f97316,#22c55e,#38bdf8)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 0 14px rgba(56,189,248,0.7)",
                }}
              >
                <span
                  style={{
                    fontWeight: 800,
                    fontSize: 16,
                    color: "#0f172a",
                  }}
                >
                  M
                </span>
              </div>
              <span
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  letterSpacing: 0.3,
                }}
              >
                Moventra
              </span>
            </div>
            <p
              style={{
                fontSize: 13,
                opacity: 0.75,
                maxWidth: 280,
              }}
            >
              Meet people through your hobbies, in any city. Small groups,
              friendly events, less awkwardness.
            </p>
          </div>

          {/* Orta kolonlar – basit link grupları (şimdilik placeholder) */}
          <div>
            <h3
              style={{
                fontSize: 13,
                fontWeight: 600,
                marginBottom: 8,
              }}
            >
              Discover
            </h3>
            <ul
              style={{
                listStyle: "none",
                padding: 0,
                margin: 0,
                fontSize: 13,
                opacity: 0.85,
                display: "flex",
                flexDirection: "column",
                gap: 4,
              }}
            >
              <li>Events near you</li>
              <li>Popular hobbies</li>
              <li>Remote meetups</li>
            </ul>
          </div>

          <div>
            <h3
              style={{
                fontSize: 13,
                fontWeight: 600,
                marginBottom: 8,
              }}
            >
              For organizers
            </h3>
            <ul
              style={{
                listStyle: "none",
                padding: 0,
                margin: 0,
                fontSize: 13,
                opacity: 0.85,
                display: "flex",
                flexDirection: "column",
                gap: 4,
              }}
            >
              <li>How it works</li>
              <li>Host guidelines</li>
              <li>Safety tips</li>
            </ul>
          </div>

          {/* Sosyal & app alanı – ileride linkler doldurulacak */}
          <div>
            <h3
              style={{
                fontSize: 13,
                fontWeight: 600,
                marginBottom: 8,
              }}
            >
              Connect
            </h3>

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 8,
                marginBottom: 10,
              }}
            >
              {/* Şimdilik sadece simgeler; URL'leri sonra ekleyebilirsin */}
              <button
                type="button"
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 999,
                  border: "1px solid var(--card-border)",
                  backgroundColor: "transparent",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 16,
                  cursor: "pointer",
                }}
                aria-label="Instagram (coming soon)"
              >
                📷
              </button>
              <button
                type="button"
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 999,
                  border: "1px solid var(--card-border)",
                  backgroundColor: "transparent",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 16,
                  cursor: "pointer",
                }}
                aria-label="X / Twitter (coming soon)"
              >
                ✕
              </button>
              <button
                type="button"
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 999,
                  border: "1px solid var(--card-border)",
                  backgroundColor: "transparent",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 16,
                  cursor: "pointer",
                }}
                aria-label="YouTube (coming soon)"
              >
                ▶
              </button>
            </div>

            <p
              style={{
                fontSize: 11,
                opacity: 0.7,
              }}
            >
              App links & social profiles will live here later.
            </p>
          </div>
        </section>

        {/* En alt satır */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 10,
            fontSize: 11,
            opacity: 0.7,
            paddingTop: 4,
          }}
        >
          <span>© {currentYear} Moventra. All rights reserved.</span>
          <div
            style={{
              display: "flex",
              gap: 12,
            }}
          >
            <span>Terms</span>
            <span>Privacy</span>
            <span>Cookies</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
