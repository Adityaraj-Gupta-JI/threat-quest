import { useState } from "react";
import { Wifi, Sun, Moon } from "lucide-react";
import { useTheme } from "./ThemeContext";

export function TopBar() {
  const { isDark, toggle } = useTheme();
  const [quoteHovered, setQuoteHovered] = useState(false);

  // Theme-aware colors
  const bg        = isDark ? "rgba(13,1,34,0.75)"       : "rgba(235,215,185,0.85)";
  const border    = isDark ? "rgba(0,229,255,0.1)"       : "rgba(100,55,15,0.18)";
  const accentCol = isDark ? "#00e5ff"                   : "#7B3A10";
  const mutedCol  = isDark ? "#6b5a80"                   : "#8B5E3C";
  const riskBg    = isDark ? "rgba(255,209,102,0.08)"    : "rgba(180,100,20,0.1)";
  const riskBdr   = isDark ? "rgba(255,209,102,0.2)"     : "rgba(180,100,20,0.25)";
  const riskCol   = isDark ? "#ffd166"                   : "#A0522D";
  const safeBg    = isDark ? "rgba(6,214,160,0.08)"      : "rgba(80,140,80,0.1)";
  const safeBdr   = isDark ? "rgba(6,214,160,0.2)"       : "rgba(80,140,80,0.25)";
  const safeCol   = isDark ? "#06d6a0"                   : "#2E7D32";
  const toggleBg  = isDark ? "rgba(255,255,255,0.06)"    : "rgba(100,55,15,0.1)";
  const toggleBdr = isDark ? "rgba(0,229,255,0.15)"      : "rgba(100,55,15,0.2)";
  const cardText  = isDark ? "#e2d9f3"                   : "#2C1206";

  return (
    <header
      className="flex items-center gap-4 px-6 h-14 shrink-0 relative"
      style={{
        background: bg,
        borderBottom: `1px solid ${border}`,
        backdropFilter: "blur(20px)",
        transition: "background 0.4s ease, border-color 0.4s ease",
      }}
    >
      {/* Floating quote — left side */}
      <div
        className="relative cursor-default select-none"
        onMouseEnter={() => setQuoteHovered(true)}
        onMouseLeave={() => setQuoteHovered(false)}
      >
        {/* Static glyph */}
        <span
          style={{
            fontFamily: "'Orbitron', monospace",
            fontSize: "10px",
            fontWeight: 600,
            letterSpacing: "0.06em",
            color: accentCol,
            opacity: quoteHovered ? 0 : 0.55,
            transition: "opacity 0.25s ease",
            whiteSpace: "nowrap",
            textShadow: isDark ? `0 0 12px ${accentCol}80` : "none",
          }}
        >
          ✦ ThreatQuest
        </span>

        {/* Floating full quote on hover */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: 0,
            transform: quoteHovered
              ? "translateY(-50%) translateY(-2px)"
              : "translateY(-50%) translateY(6px)",
            opacity: quoteHovered ? 1 : 0,
            pointerEvents: "none",
            transition: "opacity 0.3s ease, transform 0.35s cubic-bezier(0.34,1.56,0.64,1)",
            whiteSpace: "nowrap",
            zIndex: 50,
          }}
        >
          <div
            className="px-4 py-2 rounded-xl flex items-center gap-2"
            style={{
              background: isDark
                ? "linear-gradient(135deg,rgba(0,229,255,0.12),rgba(168,85,247,0.12))"
                : "linear-gradient(135deg,rgba(123,58,16,0.12),rgba(196,137,90,0.15))",
              border: `1px solid ${isDark ? "rgba(0,229,255,0.25)" : "rgba(123,58,16,0.25)"}`,
              backdropFilter: "blur(16px)",
              boxShadow: isDark
                ? "0 8px 32px rgba(0,229,255,0.12), 0 0 0 1px rgba(0,229,255,0.08)"
                : "0 8px 32px rgba(100,55,15,0.12)",
            }}
          >
            <span style={{ fontSize: "14px", lineHeight: 1 }}>✦</span>
            <span
              style={{
                fontFamily: "'Orbitron', monospace",
                fontSize: "11px",
                fontWeight: 700,
                letterSpacing: "0.07em",
                background: isDark
                  ? "linear-gradient(90deg,#00e5ff,#a855f7,#f472b6)"
                  : "linear-gradient(90deg,#7B3A10,#C4895A,#A0522D)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Level up. Lock down. Stay legendary.
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1" />

      {/* Status pill */}
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
        style={{ background: safeBg, border: `1px solid ${safeBdr}` }}>
        <div className="w-1.5 h-1.5 rounded-full"
          style={{ background: safeCol, boxShadow: `0 0 6px ${safeCol}` }} />
        <span style={{ fontSize: "10px", color: safeCol, fontFamily: "'JetBrains Mono', monospace", fontWeight: 500 }}>
          PROTECTED
        </span>
      </div>

      {/* Threat level */}
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
        style={{ background: riskBg, border: `1px solid ${riskBdr}` }}>
        <Wifi size={11} style={{ color: riskCol }} />
        <span style={{ fontSize: "10px", color: riskCol, fontFamily: "'JetBrains Mono', monospace" }}>
          MEDIUM RISK
        </span>
      </div>

      {/* Theme toggle */}
      <button
        onClick={toggle}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all duration-300 group"
        style={{
          background: toggleBg,
          border: `1px solid ${toggleBdr}`,
          cursor: "pointer",
        }}
        title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      >
        <div className="relative w-8 h-4 rounded-full transition-all duration-300"
          style={{
            background: isDark
              ? "linear-gradient(90deg,#a855f7,#00e5ff)"
              : "linear-gradient(90deg,#C4895A,#7B3A10)",
            boxShadow: isDark ? "0 0 8px rgba(0,229,255,0.4)" : "0 0 8px rgba(123,58,16,0.3)",
          }}>
          <div className="absolute top-0.5 w-3 h-3 rounded-full transition-all duration-300"
            style={{
              background: isDark ? "#0d0122" : "#FFF8F0",
              left: isDark ? "2px" : "calc(100% - 14px)",
              boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
            }} />
        </div>
        <div className="flex items-center gap-1">
          {isDark
            ? <Moon size={11} style={{ color: "#a855f7" }} />
            : <Sun  size={11} style={{ color: "#C4895A" }} />
          }
          <span style={{ fontSize: "9px", fontFamily: "'JetBrains Mono',monospace", color: isDark ? "#8b7aa8" : "#8B5E3C", fontWeight: 500 }}>
            {isDark ? "DARK" : "LIGHT"}
          </span>
        </div>
      </button>
    </header>
  );
}
