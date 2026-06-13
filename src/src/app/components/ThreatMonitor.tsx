import { useState } from "react";
import {
  AlertTriangle, ShieldAlert, ShieldCheck, ShieldX, Eye,
  Bug, Link2, KeyRound, Zap, TrendingUp, TrendingDown,
  RefreshCw, Filter, ChevronDown, Clock, CheckCircle2,
  Search, AlertCircle, Sword, Target, Activity, Lock,
  Wifi, BarChart3, ArrowUpRight, Sparkles
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, BarChart, Bar, LineChart, Line, Legend
} from "recharts";

// ── data ──────────────────────────────────────────────────────────────────────

const weeklyData = [
  { day: "Mon", threats: 12, blocked: 11, score: 78 },
  { day: "Tue", threats: 19, blocked: 17, score: 75 },
  { day: "Wed", threats: 8,  blocked: 8,  score: 80 },
  { day: "Thu", threats: 24, blocked: 21, score: 72 },
  { day: "Fri", threats: 15, blocked: 14, score: 76 },
  { day: "Sat", threats: 9,  blocked: 9,  score: 81 },
  { day: "Sun", threats: 11, blocked: 10, score: 82 },
];

const categoryData = [
  { name: "Phishing",    count: 34, color: "#ff4d6d" },
  { name: "Susp. URLs",  count: 21, color: "#ffd166" },
  { name: "Cred. Leaks", count: 12, color: "#a855f7" },
  { name: "Malware",     count: 8,  color: "#f472b6" },
];

type FeedStatus = "Blocked" | "Investigating" | "Resolved";

const feedThreats: {
  id: number; type: string; source: string; time: string;
  status: FeedStatus; severity: "Critical" | "High" | "Medium" | "Low";
  emoji: string; detail: string;
}[] = [
  { id: 1, type: "Phishing", source: "fake-bank-login.ru", time: "2 min ago", status: "Blocked", severity: "Critical", emoji: "🎣", detail: "Credential harvesting page mimicking Chase Bank" },
  { id: 2, type: "Malware", source: "cdn.free-software.io", time: "11 min ago", status: "Investigating", severity: "High", emoji: "🐛", detail: "Trojan dropper detected in download stream" },
  { id: 3, type: "Cred. Leak", source: "darkweb-paste #4412", time: "34 min ago", status: "Investigating", severity: "High", emoji: "🔑", detail: "Email + hash found in recent breach dump" },
  { id: 4, type: "Susp. URL", source: "bit.ly/3xR9mQ2", time: "1h ago", status: "Blocked", severity: "Medium", emoji: "🔗", detail: "Redirect chain leads to known exploit kit" },
  { id: 5, type: "Phishing", source: "paypa1-secure.net", time: "2h ago", status: "Resolved", severity: "High", emoji: "🎣", detail: "Homoglyph domain impersonating PayPal" },
  { id: 6, type: "Malware", source: "update-flash-now.com", time: "3h ago", status: "Resolved", severity: "Medium", emoji: "🐛", detail: "Drive-by download attempt via iframe injection" },
  { id: 7, type: "Susp. URL", source: "192.168.42.7:8080", time: "5h ago", status: "Blocked", severity: "Low", emoji: "🔗", detail: "Internal IP scanning on non-standard port" },
];

const actions = [
  { emoji: "🔐", title: "Enable Passkey Auth",    desc: "Replace passwords with phishing-resistant passkeys", xp: "+200 XP", color: "#ff4d6d", done: false },
  { emoji: "🔑", title: "Change Exposed Passwords", desc: "3 passwords found in breach databases need rotation",  xp: "+150 XP", color: "#ffd166", done: false },
  { emoji: "👁️", title: "Review Suspicious Activity", desc: "4 unreviewed events from the past 24 hours",          xp: "+100 XP", color: "#00e5ff", done: true },
  { emoji: "🛡️", title: "Run Full Security Scan",   desc: "Last scan was 3 days ago — schedule a deep scan",      xp: "+125 XP", color: "#a855f7", done: false },
];

const severityConfig = {
  Critical: { color: "#ff4d6d", bg: "#ff4d6d18", border: "#ff4d6d35", glow: "rgba(255,77,109,0.25)" },
  High:     { color: "#ffd166", bg: "#ffd16618", border: "#ffd16635", glow: "rgba(255,209,102,0.2)" },
  Medium:   { color: "#00e5ff", bg: "#00e5ff12", border: "#00e5ff30", glow: "rgba(0,229,255,0.15)" },
  Low:      { color: "#06d6a0", bg: "#06d6a012", border: "#06d6a030", glow: "rgba(6,214,160,0.15)" },
};

const statusConfig: Record<FeedStatus, { color: string; bg: string; label: string; icon: typeof CheckCircle2 }> = {
  Blocked:       { color: "#ff4d6d", bg: "#ff4d6d18", label: "Blocked",       icon: ShieldX },
  Investigating: { color: "#ffd166", bg: "#ffd16618", label: "Investigating", icon: Eye },
  Resolved:      { color: "#06d6a0", bg: "#06d6a018", label: "Resolved",      icon: CheckCircle2 },
};

// ── sub-components ─────────────────────────────────────────────────────────────

function GlassCard({ children, className = "", style = {} }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  return (
    <div
      className={`rounded-2xl ${className}`}
      style={{
        background: "linear-gradient(135deg, var(--tq-card), var(--tq-overlay))",
        border: "1px solid var(--tq-card-b)",
        backdropFilter: "blur(12px)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function SectionLabel({ icon: Icon, label, color }: { icon: typeof Activity; label: string; color: string }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <Icon size={14} style={{ color, filter: `drop-shadow(0 0 4px ${color})` }} />
      <h3 style={{ fontSize: "11px", fontFamily: "'Orbitron', monospace", color, letterSpacing: "0.1em" }}>{label}</h3>
    </div>
  );
}

function ThreatOverview() {
  const stats = [
    { label: "Total Detected",  value: "98",  sub: "All time",      color: "var(--tq-t1)", icon: "📊", trend: null },
    { label: "Active Threats",  value: "3",   sub: "+2 since 6h",   color: "#ff4d6d", icon: "⚠️", trend: "up" },
    { label: "Blocked",         value: "89",  sub: "91% block rate", color: "#06d6a0", icon: "🛡️", trend: "up" },
    { label: "Investigating",   value: "6",   sub: "2 high priority",color: "#ffd166", icon: "🔍", trend: null },
  ];

  return (
    <div className="grid grid-cols-4 gap-3">
      {stats.map((s) => (
        <GlassCard key={s.label} className="p-4 relative overflow-hidden group cursor-default" style={{ border: `1px solid ${s.color}22` }}>
          <div className="absolute -top-6 -right-6 w-16 h-16 rounded-full opacity-20" style={{ background: s.color, filter: "blur(18px)" }} />
          <div className="flex items-start justify-between mb-2">
            <span style={{ fontSize: "18px" }}>{s.icon}</span>
            {s.trend === "up" && <ArrowUpRight size={12} style={{ color: s.color, opacity: 0.7 }} />}
          </div>
          <div style={{ fontFamily: "'Orbitron', monospace", fontSize: "26px", fontWeight: 800, color: s.color, lineHeight: 1, textShadow: `0 0 20px ${s.color}60` }}>
            {s.value}
          </div>
          <div style={{ fontSize: "11px", fontWeight: 600, color: "var(--tq-t1)", marginTop: "4px" }}>{s.label}</div>
          <div style={{ fontSize: "9px", color: "var(--tq-t3)", fontFamily: "'JetBrains Mono', monospace", marginTop: "2px" }}>{s.sub}</div>
        </GlassCard>
      ))}
    </div>
  );
}

function RiskLevelBar() {
  const level = 62; // percentage
  const color = level > 70 ? "#ff4d6d" : level > 45 ? "#ffd166" : "#06d6a0";
  const label = level > 70 ? "HIGH" : level > 45 ? "MEDIUM" : "LOW";

  return (
    <GlassCard className="p-4 flex items-center gap-4" style={{ border: `1px solid ${color}30` }}>
      <div className="flex items-center gap-2">
        <Wifi size={14} style={{ color }} />
        <span style={{ fontSize: "10px", fontFamily: "'Orbitron', monospace", color, letterSpacing: "0.08em" }}>RISK LEVEL</span>
      </div>
      <div className="flex-1 relative" style={{ height: "8px", background: "rgba(255,255,255,0.07)", borderRadius: "4px", overflow: "hidden" }}>
        <div style={{ width: `${level}%`, height: "100%", background: `linear-gradient(90deg, #06d6a0, ${color})`, borderRadius: "4px", boxShadow: `0 0 8px ${color}80` }} />
      </div>
      <div className="flex items-center gap-2">
        <span style={{ fontFamily: "'Orbitron', monospace", fontSize: "13px", fontWeight: 700, color }}>{label}</span>
        <span style={{ fontSize: "9px", color: "var(--tq-t2)", fontFamily: "'JetBrains Mono', monospace" }}>{level}/100</span>
      </div>
    </GlassCard>
  );
}

function ThreatFeed() {
  const [filter, setFilter] = useState<FeedStatus | "All">("All");
  const filters: (FeedStatus | "All")[] = ["All", "Blocked", "Investigating", "Resolved"];

  const visible = filter === "All" ? feedThreats : feedThreats.filter((t) => t.status === filter);

  return (
    <GlassCard className="p-5 flex flex-col" style={{ minHeight: 0 }}>
      <div className="flex items-center justify-between mb-4">
        <SectionLabel icon={Activity} label="THREAT ACTIVITY FEED" color="#00e5ff" />
        <div className="flex items-center gap-1.5">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="px-2.5 py-1 rounded-lg transition-all duration-150"
              style={{
                fontSize: "9px",
                fontFamily: "'JetBrains Mono', monospace",
                fontWeight: 600,
                background: filter === f ? "rgba(0,229,255,0.12)" : "transparent",
                color: filter === f ? "#00e5ff" : "#6b5a80",
                border: filter === f ? "1px solid #00e5ff30" : "1px solid transparent",
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2 overflow-y-auto" style={{ maxHeight: 340 }}>
        {visible.map((t) => {
          const sev = severityConfig[t.severity];
          const stat = statusConfig[t.status];
          const StatIcon = stat.icon;
          return (
            <div
              key={t.id}
              className="flex items-start gap-3 p-3 rounded-xl transition-all duration-200 cursor-pointer group"
              style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(0,229,255,0.04)"; (e.currentTarget as HTMLElement).style.borderColor = "#00e5ff1a"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.02)"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.05)"; }}
            >
              {/* Severity dot + emoji */}
              <div className="flex flex-col items-center gap-1 shrink-0 pt-0.5">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: sev.bg, border: `1px solid ${sev.border}`, fontSize: "14px" }}>
                  {t.emoji}
                </div>
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: sev.color, boxShadow: `0 0 4px ${sev.color}` }} />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span style={{ fontSize: "11px", fontWeight: 600, color: "var(--tq-t1)" }}>{t.type}</span>
                  <span style={{ fontSize: "10px", color: "var(--tq-t3)", fontFamily: "'JetBrains Mono', monospace" }}>·</span>
                  <span style={{ fontSize: "10px", color: "var(--tq-t2)", fontFamily: "'JetBrains Mono', monospace" }}>{t.source}</span>
                </div>
                <p style={{ fontSize: "10px", color: "var(--tq-t3)", marginTop: "2px", lineHeight: 1.4 }}>{t.detail}</p>
              </div>

              {/* Right meta */}
              <div className="flex flex-col items-end gap-1.5 shrink-0">
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-md" style={{ background: stat.bg }}>
                  <StatIcon size={9} style={{ color: stat.color }} />
                  <span style={{ fontSize: "9px", fontFamily: "'JetBrains Mono', monospace", color: stat.color, fontWeight: 600 }}>{stat.label}</span>
                </div>
                <div className="flex items-center gap-1 px-1.5 py-0.5 rounded" style={{ background: sev.bg, border: `1px solid ${sev.border}` }}>
                  <span style={{ fontSize: "8px", fontFamily: "'JetBrains Mono', monospace", color: sev.color, fontWeight: 700 }}>{t.severity}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock size={8} style={{ color: "var(--tq-t3)" }} />
                  <span style={{ fontSize: "8px", color: "var(--tq-t3)", fontFamily: "'JetBrains Mono', monospace" }}>{t.time}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
}

function ThreatCategories() {
  const cats = [
    { emoji: "🎣", label: "Phishing Attempts",  count: 34, change: "+5",  color: "#ff4d6d", desc: "Social engineering & credential harvesting" },
    { emoji: "🔗", label: "Suspicious URLs",    count: 21, change: "+2",  color: "#ffd166", desc: "Malicious links & redirect chains" },
    { emoji: "🔑", label: "Credential Leaks",   count: 12, change: "−1",  color: "#a855f7", desc: "Compromised accounts & breach data" },
    { emoji: "🐛", label: "Malware Warnings",   count: 8,  change: "0",   color: "#f472b6", desc: "Trojans, ransomware & exploit kits" },
  ];

  return (
    <GlassCard className="p-5">
      <SectionLabel icon={Target} label="THREAT CATEGORIES" color="#f472b6" />
      <div className="grid grid-cols-2 gap-3">
        {cats.map((c) => (
          <div
            key={c.label}
            className="p-3 rounded-xl relative overflow-hidden group cursor-pointer transition-all duration-200"
            style={{ background: `${c.color}0c`, border: `1px solid ${c.color}28` }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = `${c.color}50`; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = `${c.color}28`; }}
          >
            <div className="absolute -bottom-4 -right-4 w-12 h-12 rounded-full opacity-20" style={{ background: c.color, filter: "blur(12px)" }} />
            <div className="flex items-center justify-between mb-2">
              <span style={{ fontSize: "18px" }}>{c.emoji}</span>
              <span style={{ fontSize: "10px", fontFamily: "'JetBrains Mono', monospace", color: c.change.startsWith("+") ? "#ff4d6d" : c.change === "0" ? "#6b5a80" : "#06d6a0" }}>
                {c.change} this week
              </span>
            </div>
            <div style={{ fontFamily: "'Orbitron', monospace", fontSize: "20px", fontWeight: 800, color: c.color, lineHeight: 1 }}>{c.count}</div>
            <div style={{ fontSize: "11px", fontWeight: 600, color: "var(--tq-t1)", marginTop: "3px" }}>{c.label}</div>
            <div style={{ fontSize: "9px", color: "var(--tq-t3)", marginTop: "2px", lineHeight: 1.3 }}>{c.desc}</div>
            {/* bar */}
            <div className="mt-3 rounded-full overflow-hidden" style={{ height: "3px", background: "rgba(255,255,255,0.07)" }}>
              <div style={{ width: `${(c.count / 34) * 100}%`, height: "100%", background: c.color, boxShadow: `0 0 6px ${c.color}80`, borderRadius: "2px" }} />
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}

function SeverityPanel() {
  const sevs: { key: keyof typeof severityConfig; count: number; desc: string }[] = [
    { key: "Critical", count: 2,  desc: "Immediate action required" },
    { key: "High",     count: 7,  desc: "Address within 24h" },
    { key: "Medium",   count: 14, desc: "Monitor & schedule fix" },
    { key: "Low",      count: 26, desc: "Informational only" },
  ];
  const total = sevs.reduce((a, b) => a + b.count, 0);

  return (
    <GlassCard className="p-5">
      <SectionLabel icon={ShieldAlert} label="SEVERITY BREAKDOWN" color="#ffd166" />
      <div className="flex flex-col gap-3">
        {sevs.map((s) => {
          const cfg = severityConfig[s.key];
          const pct = Math.round((s.count / total) * 100);
          return (
            <div key={s.key}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: cfg.color, boxShadow: `0 0 5px ${cfg.color}` }} />
                  <span style={{ fontSize: "11px", fontWeight: 600, color: "var(--tq-t1)", fontFamily: "'Orbitron', monospace", letterSpacing: "0.04em" }}>{s.key}</span>
                  <span style={{ fontSize: "9px", color: "var(--tq-t3)" }}>{s.desc}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span style={{ fontSize: "12px", fontFamily: "'Orbitron', monospace", fontWeight: 700, color: cfg.color }}>{s.count}</span>
                  <span style={{ fontSize: "9px", color: "var(--tq-t3)", fontFamily: "'JetBrains Mono', monospace" }}>{pct}%</span>
                </div>
              </div>
              <div className="rounded-full overflow-hidden" style={{ height: "5px", background: "rgba(255,255,255,0.06)" }}>
                <div style={{ width: `${pct}%`, height: "100%", background: cfg.color, boxShadow: `0 0 8px ${cfg.color}70`, borderRadius: "3px", transition: "width 0.6s ease" }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend chips */}
      <div className="flex gap-2 flex-wrap mt-4 pt-3" style={{ borderTop: "1px solid #00e5ff0f" }}>
        {sevs.map((s) => (
          <div key={s.key} className="flex items-center gap-1 px-2 py-1 rounded-lg" style={{ background: severityConfig[s.key].bg, border: `1px solid ${severityConfig[s.key].border}` }}>
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: severityConfig[s.key].color }} />
            <span style={{ fontSize: "9px", color: severityConfig[s.key].color, fontFamily: "'JetBrains Mono', monospace" }}>{s.key}: {s.count}</span>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}

function SecurityTrends() {
  const [view, setView] = useState<"threats" | "score">("threats");

  return (
    <GlassCard className="p-5">
      <div className="flex items-center justify-between mb-4">
        <SectionLabel icon={TrendingUp} label="SECURITY TRENDS" color="#00e5ff" />
        <div className="flex gap-1.5">
          {(["threats", "score"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className="px-2.5 py-1 rounded-lg transition-all"
              style={{
                fontSize: "9px", fontFamily: "'JetBrains Mono', monospace", fontWeight: 600,
                background: view === v ? "rgba(0,229,255,0.12)" : "transparent",
                color: view === v ? "#00e5ff" : "#6b5a80",
                border: view === v ? "1px solid #00e5ff30" : "1px solid transparent",
              }}
            >
              {v === "threats" ? "Threats" : "Score"}
            </button>
          ))}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={160}>
        {view === "threats" ? (
          <AreaChart data={weeklyData} margin={{ top: 4, right: 4, left: -22, bottom: 0 }}>
            <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
            <XAxis dataKey="day" tick={{ fontSize: 9, fill: "#6b5a80", fontFamily: "'JetBrains Mono', monospace" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 9, fill: "#6b5a80", fontFamily: "'JetBrains Mono', monospace" }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ background: "rgba(20,2,50,0.95)", border: "1px solid #00e5ff22", borderRadius: "10px", fontSize: "10px", color: "var(--tq-t1)", fontFamily: "'JetBrains Mono', monospace" }} cursor={{ stroke: "#00e5ff20" }} />
            <Area type="monotone" dataKey="threats" stroke="#ff4d6d" strokeWidth={2} fill="#ff4d6d" fillOpacity={0.1} dot={false} name="Detected" />
            <Area type="monotone" dataKey="blocked" stroke="#00e5ff" strokeWidth={2} fill="#00e5ff" fillOpacity={0.08} dot={false} name="Blocked" />
          </AreaChart>
        ) : (
          <LineChart data={weeklyData} margin={{ top: 4, right: 4, left: -22, bottom: 0 }}>
            <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
            <XAxis dataKey="day" tick={{ fontSize: 9, fill: "#6b5a80", fontFamily: "'JetBrains Mono', monospace" }} axisLine={false} tickLine={false} />
            <YAxis domain={[65, 90]} tick={{ fontSize: 9, fill: "#6b5a80", fontFamily: "'JetBrains Mono', monospace" }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ background: "rgba(20,2,50,0.95)", border: "1px solid #a855f722", borderRadius: "10px", fontSize: "10px", color: "var(--tq-t1)", fontFamily: "'JetBrains Mono', monospace" }} cursor={{ stroke: "#a855f720" }} />
            <Line type="monotone" dataKey="score" stroke="#a855f7" strokeWidth={2} dot={{ fill: "#a855f7", r: 3, strokeWidth: 0 }} name="Security Score" />
          </LineChart>
        )}
      </ResponsiveContainer>

      {/* Progress stats */}
      <div className="grid grid-cols-3 gap-2 mt-4 pt-3" style={{ borderTop: "1px solid #00e5ff0f" }}>
        {[
          { label: "Avg Threats/Day", value: "14", color: "#ff4d6d" },
          { label: "Block Rate",      value: "91%", color: "#06d6a0" },
          { label: "Score Δ (7d)",    value: "+4",  color: "#a855f7" },
        ].map((s) => (
          <div key={s.label} className="text-center py-2 rounded-xl" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
            <div style={{ fontFamily: "'Orbitron', monospace", fontSize: "15px", fontWeight: 700, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: "8px", color: "var(--tq-t3)", fontFamily: "'JetBrains Mono', monospace", lineHeight: 1.3 }}>{s.label}</div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}

function RecommendedActions() {
  const [done, setDone] = useState<Record<number, boolean>>({ 2: true });

  return (
    <GlassCard className="p-5" style={{ border: "1px solid #f472b616" }}>
      <SectionLabel icon={Sparkles} label="RECOMMENDED ACTIONS" color="#f472b6" />
      <div className="flex flex-col gap-2">
        {actions.map((a, i) => {
          const isDone = done[i];
          return (
            <div
              key={i}
              className="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200"
              style={{ background: isDone ? "rgba(6,214,160,0.05)" : "rgba(255,255,255,0.02)", border: isDone ? "1px solid #06d6a020" : "1px solid rgba(255,255,255,0.05)", opacity: isDone ? 0.55 : 1 }}
              onClick={() => setDone((p) => ({ ...p, [i]: !p[i] }))}
            >
              <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-base" style={{ background: `${a.color}12`, border: `1px solid ${a.color}25` }}>
                {a.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <div style={{ fontSize: "11px", fontWeight: 600, color: isDone ? "#6b5a80" : "#e2d9f3", textDecoration: isDone ? "line-through" : "none" }}>{a.title}</div>
                <div style={{ fontSize: "9px", color: "var(--tq-t3)", marginTop: "1px" }}>{a.desc}</div>
              </div>
              <div className="flex items-center gap-2">
                <span style={{ fontSize: "9px", fontFamily: "'JetBrains Mono', monospace", color: "#ffd166", fontWeight: 600 }}>{a.xp}</span>
                <div className="w-4 h-4 rounded-full border flex items-center justify-center" style={{ borderColor: isDone ? "#06d6a0" : "#3d2060", background: isDone ? "#06d6a0" : "transparent" }}>
                  {isDone && <span style={{ fontSize: "8px", color: "#0d0122" }}>✓</span>}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
}

// ── main export ───────────────────────────────────────────────────────────────

export function ThreatMonitor() {
  return (
    <div className="flex-1 overflow-y-auto px-6 py-5">
      {/* Page header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 style={{ fontSize: "16px", fontFamily: "'Orbitron', monospace", fontWeight: 700, color: "var(--tq-t1)", letterSpacing: "0.05em" }}>
              Threat Monitor
            </h1>
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full" style={{ background: "rgba(255,77,109,0.12)", border: "1px solid rgba(255,77,109,0.25)" }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#ff4d6d", boxShadow: "0 0 6px #ff4d6d", animation: "pulse 2s infinite", display: "inline-block" }} />
              <span style={{ fontSize: "9px", color: "#ff4d6d", fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 }}>LIVE</span>
            </span>
          </div>
          <p style={{ fontSize: "10px", color: "var(--tq-t3)", fontFamily: "'JetBrains Mono', monospace" }}>
            Real-time threat intelligence · Last updated: just now
          </p>
        </div>
        <button
          className="flex items-center gap-2 px-3 py-2 rounded-xl transition-all"
          style={{ background: "rgba(0,229,255,0.07)", border: "1px solid #00e5ff25", color: "#00e5ff", fontSize: "11px" }}
        >
          <RefreshCw size={12} />
          Refresh
        </button>
      </div>

      {/* Risk level bar */}
      <div className="mb-4">
        <RiskLevelBar />
      </div>

      {/* Overview stats */}
      <div className="mb-4">
        <ThreatOverview />
      </div>

      {/* Main grid: Feed (left, wide) + Categories + Severity (right) */}
      <div className="grid grid-cols-12 gap-4 mb-4">
        <div className="col-span-7">
          <ThreatFeed />
        </div>
        <div className="col-span-5 flex flex-col gap-4">
          <ThreatCategories />
          <SeverityPanel />
        </div>
      </div>

      {/* Bottom: Trends + Actions */}
      <div className="grid grid-cols-12 gap-4 pb-6">
        <div className="col-span-7">
          <SecurityTrends />
        </div>
        <div className="col-span-5">
          <RecommendedActions />
        </div>
      </div>
    </div>
  );
}
