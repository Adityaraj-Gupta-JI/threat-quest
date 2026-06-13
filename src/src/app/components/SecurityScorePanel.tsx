import { RadialBarChart, RadialBar, ResponsiveContainer, PolarAngleAxis } from "recharts";
import { TrendingUp, Shield, Star } from "lucide-react";

const data = [{ name: "score", value: 82 }];

const metrics = [
  { label: "Firewall", value: 95, color: "#06d6a0" },
  { label: "Password", value: 78, color: "#ffd166" },
  { label: "2-Factor", value: 100, color: "#00e5ff" },
  { label: "Patches",  value: 62, color: "#f472b6" },
];

export function SecurityScorePanel() {
  return (
    <div className="rounded-2xl p-5 flex flex-col gap-4"
      style={{ background: "linear-gradient(135deg,rgba(0,229,255,0.06),rgba(168,85,247,0.06))", border: "1px solid var(--tq-card-b)", backdropFilter: "blur(10px)" }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield size={15} style={{ color: "var(--tq-neon)", filter: "drop-shadow(0 0 4px var(--tq-neon))" }} />
          <h3 style={{ fontSize: "12px", color: "var(--tq-neon)", letterSpacing: "0.08em", fontFamily: "'Orbitron', monospace" }}>
            SECURITY SCORE
          </h3>
        </div>
        <div className="flex items-center gap-1 px-2 py-1 rounded-lg"
          style={{ background: "rgba(6,214,160,0.12)", border: "1px solid rgba(6,214,160,0.2)" }}>
          <TrendingUp size={10} style={{ color: "var(--tq-green)" }} />
          <span style={{ fontSize: "9px", color: "var(--tq-green)", fontFamily: "'JetBrains Mono', monospace" }}>+4 pts</span>
        </div>
      </div>

      {/* Radial chart + grade */}
      <div className="flex items-center gap-4">
        <div className="relative" style={{ width: 110, height: 110 }}>
          <ResponsiveContainer width={110} height={110}>
            <RadialBarChart cx="50%" cy="50%" innerRadius="72%" outerRadius="100%" startAngle={90} endAngle={-270} data={data}>
              <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
              <RadialBar background={{ fill: "#ffffff07" }} dataKey="value" cornerRadius={10} fill="#00e5ff" angleAxisId={0} />
            </RadialBarChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span style={{ fontSize: "22px", fontFamily: "'Orbitron', monospace", fontWeight: 800, color: "var(--tq-t1)", lineHeight: 1 }}>82</span>
            <span style={{ fontSize: "9px", color: "var(--tq-t2)", fontFamily: "'JetBrains Mono', monospace" }}>/100</span>
          </div>
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span style={{ fontFamily: "'Orbitron', monospace", fontSize: "16px", fontWeight: 800, background: "linear-gradient(135deg,#a855f7,#00e5ff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>B+</span>
            <span style={{ fontSize: "11px", color: "var(--tq-t2)" }}>Good Standing</span>
          </div>
          <div className="flex gap-1 mb-3">
            {[1,2,3,4,5].map(i => (
              <Star key={i} size={12} style={{ color: i <= 4 ? "#ffd166" : "var(--tq-divider)", fill: i <= 4 ? "#ffd166" : "transparent", filter: i <= 4 ? "drop-shadow(0 0 3px #ffd166)" : "none" }} />
            ))}
          </div>
          <p style={{ fontSize: "10px", color: "var(--tq-t3)", lineHeight: 1.5 }}>
            2 vulnerabilities need attention. Keep it up, Cyber Guardian! ✨
          </p>
        </div>
      </div>

      {/* Metric bars */}
      <div className="flex flex-col gap-2.5">
        {metrics.map((m) => (
          <div key={m.label}>
            <div className="flex justify-between mb-1">
              <span style={{ fontSize: "10px", color: "var(--tq-t2)", fontFamily: "'JetBrains Mono', monospace" }}>{m.label}</span>
              <span style={{ fontSize: "10px", color: m.color, fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 }}>{m.value}%</span>
            </div>
            <div className="rounded-full overflow-hidden" style={{ height: "4px", background: "var(--tq-divider)" }}>
              <div className="h-full rounded-full transition-all duration-700"
                style={{ width: `${m.value}%`, background: m.color, boxShadow: `0 0 6px ${m.color}80` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
