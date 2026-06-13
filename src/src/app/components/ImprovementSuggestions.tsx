import { Lightbulb, CheckCircle2, Circle } from "lucide-react";
import { useState } from "react";

const suggestions = [
  { emoji: "🔑", title: "Enable passkeys",           desc: "Replace passwords with phishing-resistant passkeys",    xp: "+200 XP", color: "#ff4d6d", done: false },
  { emoji: "📱", title: "Add backup 2FA codes",       desc: "Generate and store recovery codes securely",            xp: "+150 XP", color: "#ffd166", done: false },
  { emoji: "🔍", title: "Run full system scan",       desc: "Deep scan all connected devices and services",          xp: "+100 XP", color: "#00e5ff", done: false },
  { emoji: "📧", title: "Secure recovery email",      desc: "Add a dedicated security-only recovery email",          xp: "+75 XP",  color: "#a855f7", done: true  },
  { emoji: "🌐", title: "Enable DNS-over-HTTPS",      desc: "Encrypt DNS queries to prevent snooping",               xp: "+50 XP",  color: "#06d6a0", done: false },
];

const impactColor: Record<string, string> = { HIGH: "#ff4d6d", MED: "#ffd166", LOW: "#06d6a0" };
const impactLabels = ["HIGH","HIGH","MED","MED","LOW"];

export function ImprovementSuggestions() {
  const [completed, setCompleted] = useState<Record<number, boolean>>({ 3: true });
  const toggle = (i: number) => setCompleted((prev) => ({ ...prev, [i]: !prev[i] }));

  return (
    <div className="rounded-2xl p-5" style={{ background: "linear-gradient(135deg,rgba(168,85,247,0.05),var(--tq-overlay))", border: "1px solid rgba(168,85,247,0.15)", backdropFilter: "blur(10px)" }}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Lightbulb size={14} style={{ color: "var(--tq-pink)", filter: "drop-shadow(0 0 4px var(--tq-pink))" }} />
          <h3 style={{ fontSize: "12px", color: "var(--tq-pink)", fontFamily: "'Orbitron', monospace", letterSpacing: "0.08em" }}>
            IMPROVEMENT QUESTS
          </h3>
        </div>
        <span style={{ fontSize: "9px", color: "var(--tq-t3)", fontFamily: "'JetBrains Mono', monospace" }}>1/5 complete</span>
      </div>

      <div className="flex flex-col gap-2">
        {suggestions.map((s, i) => {
          const isDone = completed[i];
          const imp = impactLabels[i];
          return (
            <div key={i}
              className="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200"
              style={{ background: isDone ? "rgba(6,214,160,0.06)" : "var(--tq-card)", border: isDone ? "1px solid rgba(6,214,160,0.2)" : "1px solid var(--tq-card-b)", opacity: isDone ? 0.6 : 1 }}
              onClick={() => toggle(i)}
            >
              <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: `${s.color}15`, border: `1px solid ${s.color}25`, fontSize: "15px" }}>
                {s.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span style={{ fontSize: "11px", fontWeight: 600, color: isDone ? "var(--tq-t3)" : "var(--tq-t1)", textDecoration: isDone ? "line-through" : "none" }}>{s.title}</span>
                  <span className="px-1.5 py-0.5 rounded" style={{ fontSize: "7px", fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, color: impactColor[imp], background: `${impactColor[imp]}15`, border: `1px solid ${impactColor[imp]}30` }}>{imp}</span>
                </div>
                <p style={{ fontSize: "9px", color: "var(--tq-t3)", marginTop: "1px" }}>{s.desc}</p>
              </div>
              <div className="flex items-center gap-2">
                <span style={{ fontSize: "9px", fontFamily: "'JetBrains Mono', monospace", color: "var(--tq-gold)", fontWeight: 600 }}>{s.xp}</span>
                {isDone
                  ? <CheckCircle2 size={14} style={{ color: "var(--tq-green)" }} />
                  : <Circle size={14} style={{ color: "var(--tq-t3)" }} />}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 p-3 rounded-xl flex items-center justify-between"
        style={{ background: "linear-gradient(135deg,rgba(244,114,182,0.08),rgba(168,85,247,0.08))", border: "1px solid rgba(244,114,182,0.15)" }}>
        <div>
          <div style={{ fontSize: "10px", fontWeight: 600, color: "var(--tq-pink)" }}>Complete all quests!</div>
          <div style={{ fontSize: "9px", color: "var(--tq-t3)" }}>Earn the 💎 Diamond Defender badge</div>
        </div>
        <div style={{ fontSize: "13px", fontFamily: "'Orbitron', monospace", fontWeight: 800, color: "var(--tq-pink)" }}>575 XP</div>
      </div>
    </div>
  );
}
