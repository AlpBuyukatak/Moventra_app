"use client";

type AvatarCanvasProps = {
  hairColor: string;
  shirtColor: string;
  pantsColor: string;
  skinColor: string;
  hatColor?: string;
  hasHat?: boolean;
  backgroundPreset?: "night" | "sunset" | "flowers" | "forest";
};

function getBackgroundStyle(preset: AvatarCanvasProps["backgroundPreset"]) {
  switch (preset) {
    case "sunset":
      return {
        background:
          "radial-gradient(circle at top, #fed7aa, #fb7185 35%, #0f172a 80%)",
        emoji: "🌅",
      };
    case "flowers":
      return {
        background:
          "radial-gradient(circle at top left, #f9a8d4, #22c55e 40%, #0f172a 85%)",
        emoji: "🌸🦋",
      };
    case "forest":
      return {
        background:
          "radial-gradient(circle at top, #4ade80, #166534 45%, #020617 85%)",
        emoji: "🌲🍃",
      };
    case "night":
    default:
      return {
        background:
          "radial-gradient(circle at top, #38bdf8, #0f172a 50%, #020617 90%)",
        emoji: "✨",
      };
  }
}

export default function AvatarCanvas({
  hairColor,
  shirtColor,
  pantsColor,
  skinColor,
  hatColor = "#ef4444",
  hasHat = false,
  backgroundPreset = "night",
}: AvatarCanvasProps) {
  const bg = getBackgroundStyle(backgroundPreset);

  return (
    <div
      style={{
        width: 220,
        height: 220,
        borderRadius: 24,
        padding: 12,
        position: "relative",
        background: bg.background,
        boxShadow: "0 20px 40px rgba(15,23,42,0.9)",
        border: "1px solid rgba(148,163,184,0.5)",
        overflow: "hidden",
      }}
    >
      {/* köşede emoji */}
      <div
        style={{
          position: "absolute",
          top: 8,
          right: 10,
          fontSize: 18,
          opacity: 0.9,
        }}
      >
        {bg.emoji}
      </div>

      {/* avatar ground */}
      <div
        style={{
          position: "absolute",
          bottom: 18,
          left: "50%",
          transform: "translateX(-50%)",
          width: "120%",
          height: 40,
          borderRadius: "999px",
          background:
            "radial-gradient(circle at top, rgba(15,23,42,0.8), transparent)",
          opacity: 0.7,
        }}
      />

      {/* avatar container */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          pointerEvents: "none",
        }}
      >
        {/* gövde + kafa basit 2D cartoon */}
        <div
          style={{
            position: "relative",
            width: 120,
            height: 150,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          {/* kafa */}
          <div
            style={{
              width: 70,
              height: 70,
              borderRadius: "999px",
              backgroundColor: skinColor,
              boxShadow: "0 6px 12px rgba(0,0,0,0.35)",
              position: "relative",
            }}
          >
            {/* saç */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: "999px 999px 40px 40px",
                backgroundColor: hairColor,
                clipPath: "ellipse(60% 60% at 50% 25%)",
              }}
            />
            {/* gözler */}
            <div
              style={{
                position: "absolute",
                top: 34,
                left: 15,
                right: 15,
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "999px",
                  backgroundColor: "#020617",
                }}
              />
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "999px",
                  backgroundColor: "#020617",
                }}
              />
            </div>
            {/* ağız */}
            <div
              style={{
                position: "absolute",
                bottom: 14,
                left: "50%",
                width: 28,
                height: 12,
                borderRadius: "0 0 999px 999px",
                borderBottom: "2px solid rgba(15,23,42,0.9)",
                transform: "translateX(-50%)",
              }}
            />
            {/* şapka */}
            {hasHat && (
              <>
                <div
                  style={{
                    position: "absolute",
                    top: -6,
                    left: 8,
                    right: 8,
                    height: 20,
                    borderRadius: "999px 999px 10px 10px",
                    backgroundColor: hatColor,
                    boxShadow: "0 3px 6px rgba(0,0,0,0.3)",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    top: 10,
                    left: -5,
                    right: -5,
                    height: 8,
                    borderRadius: 999,
                    backgroundColor: hatColor,
                    opacity: 0.9,
                  }}
                />
              </>
            )}
          </div>

          {/* gövde */}
          <div
            style={{
              marginTop: 12,
              width: 80,
              height: 70,
              borderRadius: 24,
              backgroundColor: shirtColor,
              boxShadow: "0 8px 18px rgba(0,0,0,0.5)",
              position: "relative",
            }}
          >
            {/* yakalar */}
            <div
              style={{
                position: "absolute",
                top: 8,
                left: 14,
                right: 14,
                height: 18,
                background:
                  "linear-gradient(135deg, rgba(255,255,255,0.18), transparent)",
                clipPath:
                  "polygon(0 0, 50% 70%, 100% 0, 100% 100%, 0 100%)",
                opacity: 0.9,
              }}
            />
          </div>

          {/* pantolon */}
          <div
            style={{
              marginTop: -2,
              display: "flex",
              gap: 6,
            }}
          >
            <div
              style={{
                width: 26,
                height: 40,
                borderRadius: 12,
                backgroundColor: pantsColor,
                boxShadow: "0 6px 12px rgba(0,0,0,0.6)",
              }}
            />
            <div
              style={{
                width: 26,
                height: 40,
                borderRadius: 12,
                backgroundColor: pantsColor,
                boxShadow: "0 6px 12px rgba(0,0,0,0.6)",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
