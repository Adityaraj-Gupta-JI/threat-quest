import { AlertTriangle, Bug, Eye, ArrowUpRight, TrendingDown } from "lucide-react";

const threats = [
  {
    icon: AlertTriangle, emoji: "⚠️", title: "Active Threats",
    value: "3",   sub: "+2 since yesterday", color: "#ff4d6d",
    glow: "rgba(255,77,109,0.2)", border: "rgba(255,77,109,0.25)",
    trend: "up",  detail: "2 High · 1 Medium",
  },
  {
    icon: Bug,          emoji: "🐛", title: "Vulnerabilities",
    value: "7",   sub: "2 critical patches needed", color: "#ffd166",
    glow: "rgba(255,209,102,0.2)", border: "rgba(255,209,102,0.25)",
    trend: "down", detail: "2 Critical · 5 Low",
  },
  {
    icon: Eye,          emoji: "👁️", title: "Scan Coverage",
    value: "94%", sub: "Last scan 2h ago", color: "#00e5ff",
    glow: "rgba(0,229,255,0.2)", border: "rgba(0,229,255,0.25)",
    trend: "up",  detail: "847 assets scanned",
  },
];

export function ThreatSummaryCards() {
  return (
    <div className="grid grid-cols-3 gap-4">
      {threats.map((t) => (
        <div
          key={t.title}
          className="rounded-2xl p-4 relative overflow-hidden group cursor-pointer transition-all duration-300"
          style={{
            background: `linear-gradient(135deg, ${t.glow}, var(--tq-overlay))`,
            border: `1px solid ${t.border}`,
            backdropFilter: "blur(10px)",
          }}
        >
          <div className="absolute -top-4 -right-4 w-16 h-16 rounded-full opacity-30 transition-opacity duration-300 group-hover:opacity-50"
            style={{ background: t.color, filter: "blur(20px)" }} />

          <div className="flex items-start justify-between mb-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base"
              style={{ background: t.glow, border: `1px solid ${t.border}` }}>
              {t.emoji}
            </div>
            <div className="flex items-center gap-1">
              {t.trend === "up"
                ? <ArrowUpRight size={12} style={{ color: t.color }} />
                : <TrendingDown size={12} style={{ color: "var(--tq-green)" }} />}
            </div>
          </div>

          <div style={{ fontFamily: "'Orbitron', monospace", fontSize: "22px", fontWeight: 800, color: t.color, lineHeight: 1, textShadow: `0 0 20px ${t.color}80` }}>
            {t.value}
          </div>
          <div style={{ fontSize: "11px", fontWeight: 600, color: "var(--tq-t1)", marginTop: "4px" }}>{t.title}</div>
          <div style={{ fontSize: "9px", color: "var(--tq-t2)", fontFamily: "'JetBrains Mono', monospace", marginTop: "2px" }}>{t.detail}</div>

          <div className="mt-2 pt-2" style={{ borderTop: `1px solid ${t.border}` }}>
            <span style={{ fontSize: "9px", color: "var(--tq-t3)", fontFamily: "'JetBrains Mono', monospace" }}>{t.sub}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
