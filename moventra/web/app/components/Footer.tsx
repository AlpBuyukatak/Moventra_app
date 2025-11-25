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
              // 🎨 Yeni gradient (indigo → soft blue → mint)
              "linear-gradient(135deg, rgba(79,70,229,0.9), rgba(147,197,253,0.9), rgba(167,243,208,0.85))",
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

        {/* Mini stats + city quick-switch */}
        <section
          style={{
            borderRadius: 999,
            padding: "0.7rem 1.3rem",
            backgroundColor: "rgba(15,23,42,0.04)",
            border: "1px solid rgba(15,23,42,0.07)",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 10,
            fontSize: 12,
          }}
        >
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 10,
              opacity: 0.9,
            }}
          >
            <span>
              <strong>12</strong> cities
            </span>
            <span style={{ opacity: 0.6 }}>·</span>
            <span>
              <strong>58</strong> hobbies
            </span>
            <span style={{ opacity: 0.6 }}>·</span>
            <span>
              <strong>143</strong> events this week
            </span>
          </div>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 8,
              alignItems: "center",
              opacity: 0.9,
            }}
          >
            <span style={{ opacity: 0.8 }}>Currently exploring:</span>
            <span
              style={{
                fontWeight: 600,
              }}
            >
              Berlin, Germany
            </span>
            <span style={{ opacity: 0.6 }}>·</span>
            <Link
              href="/events"
              style={{
                fontSize: 12,
                textDecoration: "underline",
                textUnderlineOffset: 3,
                opacity: 0.9,
              }}
            >
              Change city
            </Link>
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
            <p
              style={{
                fontSize: 11,
                opacity: 0.8,
                maxWidth: 260,
              }}
            >
              Built with care for small, real-world communities – not noisy,
              anonymous crowds.
            </p>
          </div>

          {/* Orta kolonlar – basit link grupları */}
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
            <p
              style={{
                fontSize: 11,
                opacity: 0.75,
                marginTop: 8,
                maxWidth: 220,
              }}
            >
              Moventra is designed around small, safe, friendly groups and clear
              community standards.
            </p>
          </div>

          {/* Sosyal & app alanı + newsletter */}
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
                marginBottom: 10,
              }}
            >
              App links & social profiles will live here later. iOS and Android
              apps are on the roadmap.
            </p>

            {/* Newsletter / early access (şimdilik pasif) */}
            <div
              style={{
                marginTop: 6,
                padding: "0.6rem 0.7rem",
                borderRadius: 999,
                border: "1px dashed var(--card-border)",
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontSize: 11,
                opacity: 0.9,
              }}
            >
              <input
                disabled
                placeholder="Your email (coming soon)"
                style={{
                  flex: 1,
                  border: "none",
                  outline: "none",
                  backgroundColor: "transparent",
                  fontSize: 11,
                  opacity: 0.8,
                }}
              />
              <button
                type="button"
                disabled
                style={{
                  borderRadius: 999,
                  border: "none",
                  padding: "0.25rem 0.7rem",
                  fontSize: 11,
                  fontWeight: 600,
                  backgroundColor: "rgba(15,23,42,0.08)",
                  cursor: "not-allowed",
                }}
              >
                Get updates
              </button>
            </div>
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
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 6,
              alignItems: "center",
            }}
          >
            <span>© {currentYear} Moventra. All rights reserved.</span>
            <span style={{ opacity: 0.6 }}>·</span>
            <span>Built with ❤️ for hobby-based communities.</span>
          </div>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 12,
              alignItems: "center",
            }}
          >
            <span>Terms</span>
            <span>Privacy</span>
            <span>Cookies</span>
            <span
              style={{
                width: 1,
                height: 14,
                backgroundColor: "rgba(148,163,184,0.6)",
              }}
            />
            <span>
              Language:{" "}
              <span style={{ fontWeight: 600 }}>EN</span>
              <span style={{ opacity: 0.6 }}> · </span>
              <span style={{ opacity: 0.8 }}>TR</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
