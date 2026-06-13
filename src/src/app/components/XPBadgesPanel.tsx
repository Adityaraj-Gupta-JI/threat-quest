import { Trophy, Zap } from "lucide-react";

const badges = [
  { icon: "🔥", name: "First Blood",   desc: "First threat blocked", earned: true,  rarity: "Common",    color: "#ff4d6d" },
  { icon: "🛡️", name: "Guardian",      desc: "7-day streak",         earned: true,  rarity: "Rare",      color: "#00e5ff" },
  { icon: "💎", name: "Diamond Def.",  desc: "Score 90+",            earned: false, rarity: "Epic",      color: "#a855f7" },
  { icon: "⚡", name: "Speedrunner",   desc: "Scan 50 URLs",         earned: true,  rarity: "Common",    color: "#ffd166" },
  { icon: "👁️", name: "All-Seeing",   desc: "100% coverage",        earned: false, rarity: "Legendary", color: "#f472b6" },
  { icon: "🌟", name: "Star Player",   desc: "Top 1% rank",          earned: false, rarity: "Legendary", color: "#06d6a0" },
];

const rarityColor: Record<string, string> = {
  Common:    "var(--tq-t2)",
  Rare:      "var(--tq-neon)",
  Epic:      "var(--tq-purple)",
  Legendary: "var(--tq-gold)",
};

export function XPBadgesPanel() {
  return (
    <div className="rounded-2xl p-5"
      style={{ background: "linear-gradient(135deg,rgba(255,209,102,0.04),rgba(168,85,247,0.06))", border: "1px solid rgba(255,209,102,0.15)", backdropFilter: "blur(10px)" }}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Trophy size={14} style={{ color: "var(--tq-gold)", filter: "drop-shadow(0 0 4px var(--tq-gold))" }} />
          <h3 style={{ fontSize: "12px", color: "var(--tq-gold)", fontFamily: "'Orbitron', monospace", letterSpacing: "0.08em" }}>XP &amp; BADGES</h3>
        </div>
        <span className="px-2 py-1 rounded-lg" style={{ fontSize: "9px", fontFamily: "'Orbitron', monospace", color: "var(--tq-gold)", background: "rgba(255,209,102,0.1)", border: "1px solid rgba(255,209,102,0.2)" }}>
          RANK #247
        </span>
      </div>

      {/* XP bar */}
      <div className="p-3 rounded-xl mb-4" style={{ background: "var(--tq-card)", border: "1px solid var(--tq-card-b)" }}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg,#ffd166,#f472b6)", boxShadow: "0 0 10px rgba(255,209,102,0.3)" }}>
              <span style={{ fontSize: "14px" }}>⚡</span>
            </div>
            <div>
              <div style={{ fontSize: "10px", color: "var(--tq-t1)", fontWeight: 600 }}>Level 12</div>
              <div style={{ fontSize: "8px", color: "var(--tq-t2)", fontFamily: "'JetBrains Mono', monospace" }}>Cyber Guardian</div>
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "14px", fontFamily: "'Orbitron', monospace", fontWeight: 800, color: "var(--tq-gold)" }}>4,250</div>
            <div style={{ fontSize: "8px", color: "var(--tq-t3)", fontFamily: "'JetBrains Mono', monospace" }}>/ 6,250 XP</div>
          </div>
        </div>
        <div className="rounded-full overflow-hidden" style={{ height: "6px", background: "var(--tq-divider)" }}>
          <div className="h-full rounded-full" style={{ width: "68%", background: "linear-gradient(90deg,#ffd166,#f472b6,#a855f7)", boxShadow: "0 0 10px rgba(255,209,102,0.4)" }} />
        </div>
        <div className="flex justify-between mt-1.5">
          <span style={{ fontSize: "8px", color: "var(--tq-t3)", fontFamily: "'JetBrains Mono', monospace" }}>2,000 XP to next level</span>
          <span style={{ fontSize: "8px", color: "var(--tq-purple)", fontFamily: "'JetBrains Mono', monospace" }}>Level 13 → Cyber Elite</span>
        </div>
      </div>

      <p style={{ fontSize: "9px", color: "var(--tq-t3)", fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.08em", marginBottom: "10px" }}>
        BADGE COLLECTION — 3/6
      </p>
      <div className="grid grid-cols-3 gap-2">
        {badges.map((b) => (
          <div key={b.name}
            className="relative flex flex-col items-center p-2.5 rounded-xl transition-all duration-200 cursor-pointer"
            style={{ background: b.earned ? `linear-gradient(135deg,${b.color}15,var(--tq-card))` : "var(--tq-card)", border: b.earned ? `1px solid ${b.color}35` : "1px solid var(--tq-card-b)", opacity: b.earned ? 1 : 0.45 }}>
            {b.earned && (
              <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full flex items-center justify-center"
                style={{ background: "var(--tq-green)", boxShadow: "0 0 6px var(--tq-green)" }}>
                <span style={{ fontSize: "6px", color: "#0d0122" }}>✓</span>
              </div>
            )}
            <span style={{ fontSize: "18px", lineHeight: 1, filter: b.earned ? `drop-shadow(0 0 6px ${b.color})` : "grayscale(1)" }}>{b.icon}</span>
            <span style={{ fontSize: "8px", fontWeight: 600, color: b.earned ? "var(--tq-t1)" : "var(--tq-t3)", marginTop: "4px", textAlign: "center", lineHeight: 1.2 }}>{b.name}</span>
            <span style={{ fontSize: "7px", fontFamily: "'JetBrains Mono', monospace", color: rarityColor[b.rarity], marginTop: "2px" }}>{b.rarity}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
