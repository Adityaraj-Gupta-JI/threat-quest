import { useState, useRef, useCallback } from "react";
import {
  Mail, Search, ShieldAlert, ShieldCheck, ShieldX, AlertTriangle,
  CheckCircle2, XCircle, Loader2, Eye, EyeOff, Copy, Clock,
  Database, Globe, Users, Building2, Cloud, BookOpen,
  Key, Hash, RefreshCw, Upload, X, Layers, Lock,
  BarChart3, TrendingUp, Zap, AlertCircle, Info,
  ChevronDown, ChevronRight, Ban, Wifi, AtSign, Star
} from "lucide-react";
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip } from "recharts";

// ── types ──────────────────────────────────────────────────────────────────────

type LeakStatus = "idle" | "checking" | "clean" | "leaked" | "invalid" | "temp";

interface BreachRecord {
  name: string;
  date: string;
  type: "social" | "corporate" | "cloud" | "forum";
  exposed: string[];
  count: string;
  severity: "critical" | "high" | "medium" | "low";
  hasPlaintext: boolean;
  hasHashed: boolean;
}

interface PasswordInsight {
  pattern: string;
  reuseCount: number;
  strength: "weak" | "medium" | "strong";
  isPlaintext: boolean;
  hint: string;
}

interface LeakResult {
  email: string;
  status: LeakStatus;
  isTemp: boolean;
  isFake: boolean;
  isInvalid: boolean;
  breachCount: number;
  breaches: BreachRecord[];
  passwordInsights: PasswordInsight[];
  riskScore: number;
  firstSeen: string;
  lastSeen: string;
  exposedCount: string;
}

type ScanTab = "single" | "bulk";
type ResultTab = "overview" | "breaches" | "passwords" | "analysis";

// ── mock data builders ────────────────────────────────────────────────────────

const SOCIAL_BREACHES: BreachRecord[] = [
  { name: "LinkedInDump2024", date: "2024-06", type: "social", exposed: ["Emails", "Hashed Passwords", "Job Titles", "Connections"], count: "700M", severity: "critical", hasPlaintext: false, hasHashed: true },
  { name: "TwitterLeak2023", date: "2023-01", type: "social", exposed: ["Emails", "Phone Numbers", "Usernames"], count: "220M", severity: "high", hasPlaintext: false, hasHashed: false },
  { name: "FacebookScrape", date: "2021-04", type: "social", exposed: ["Emails", "Phone Numbers", "Birthdates", "Locations"], count: "533M", severity: "high", hasPlaintext: false, hasHashed: false },
];

const CORP_BREACHES: BreachRecord[] = [
  { name: "Adobe2013", date: "2013-10", type: "corporate", exposed: ["Emails", "Encrypted Passwords", "Hints"], count: "153M", severity: "critical", hasPlaintext: false, hasHashed: true },
  { name: "Dropbox2012", date: "2012-07", type: "corporate", exposed: ["Emails", "Hashed Passwords"], count: "69M", severity: "high", hasPlaintext: false, hasHashed: true },
];

const CLOUD_BREACHES: BreachRecord[] = [
  { name: "LastPassVault2022", date: "2022-12", type: "cloud", exposed: ["Encrypted Vaults", "Emails", "Metadata"], count: "25M", severity: "critical", hasPlaintext: false, hasHashed: true },
  { name: "HerokuToken2022", date: "2022-04", type: "cloud", exposed: ["OAuth Tokens", "Emails"], count: "500K", severity: "medium", hasPlaintext: false, hasHashed: false },
];

const FORUM_BREACHES: BreachRecord[] = [
  { name: "RaidForums2021", date: "2021-02", type: "forum", exposed: ["Emails", "Plain-text Passwords", "IPs"], count: "478K", severity: "critical", hasPlaintext: true, hasHashed: false },
  { name: "GameForumDump2023", date: "2023-09", type: "forum", exposed: ["Usernames", "Emails", "MD5 Hashes"], count: "2.1M", severity: "high", hasPlaintext: false, hasHashed: true },
];

const REUSE_PATTERNS: PasswordInsight[] = [
  { pattern: "base_word + year", reuseCount: 4, strength: "weak", isPlaintext: true, hint: "e.g. sunshine2019 — found in plain-text across 4 sites" },
  { pattern: "common prefix + !!", reuseCount: 2, strength: "medium", isPlaintext: false, hint: "Hashed variant matched across 2 breaches via hash correlation" },
  { pattern: "name + number", reuseCount: 3, strength: "weak", isPlaintext: true, hint: "e.g. john123 — exposed in plain-text in forum dump" },
];

function buildResult(email: string): LeakResult {
  const lower = email.toLowerCase();
  const isBad = lower.includes("test") || lower.includes("leak") || lower.includes("breach") || lower.includes("hack");
  const isTemp = /mailinator|tempmail|guerrilla|10min|throwaway|yopmail|trashmail/.test(lower);
  const isFake = /fakeemail|notreal|noreply|fake@/.test(lower);
  const isInvalid = !email.includes("@") || email.split("@")[1]?.split(".").length < 2;

  if (isInvalid) return { email, status: "invalid", isTemp: false, isFake: false, isInvalid: true, breachCount: 0, breaches: [], passwordInsights: [], riskScore: 0, firstSeen: "", lastSeen: "", exposedCount: "0" };
  if (isTemp) return { email, status: "temp", isTemp: true, isFake: false, isInvalid: false, breachCount: 0, breaches: [], passwordInsights: [], riskScore: 15, firstSeen: "", lastSeen: "", exposedCount: "0" };

  if (!isBad) return { email, status: "clean", isTemp: false, isFake: false, isInvalid: false, breachCount: 0, breaches: [], passwordInsights: [], riskScore: 8, firstSeen: "", lastSeen: "", exposedCount: "0" };

  const selected = [
    ...SOCIAL_BREACHES.slice(0, 2),
    ...CORP_BREACHES.slice(0, 1),
    ...CLOUD_BREACHES.slice(0, 1),
    ...FORUM_BREACHES.slice(0, 2),
  ];

  return {
    email,
    status: "leaked",
    isTemp: false,
    isFake,
    isInvalid: false,
    breachCount: selected.length,
    breaches: selected,
    passwordInsights: REUSE_PATTERNS,
    riskScore: 84,
    firstSeen: "2013-10-04",
    lastSeen: "2024-06-11",
    exposedCount: "1.7B+",
  };
}

// ── ui helpers ────────────────────────────────────────────────────────────────

function Glass({ children, className = "", style = {} }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  return (
    <div className={`rounded-2xl ${className}`} style={{ background: "linear-gradient(135deg,rgba(255,255,255,0.045),rgba(13,1,34,0.65))", border: "1px solid rgba(0,229,255,0.13)", backdropFilter: "blur(14px)", ...style }}>
      {children}
    </div>
  );
}

function Label({ icon: Icon, text, color }: { icon: typeof Mail; text: string; color: string }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <Icon size={13} style={{ color, filter: `drop-shadow(0 0 4px ${color})` }} />
      <span style={{ fontFamily: "'Orbitron',monospace", fontSize: "11px", color, letterSpacing: "0.1em" }}>{text}</span>
    </div>
  );
}

function CopyBtn({ text }: { text: string }) {
  const [ok, setOk] = useState(false);
  return (
    <button onClick={() => { navigator.clipboard.writeText(text); setOk(true); setTimeout(() => setOk(false), 1400); }} style={{ color: ok ? "#06d6a0" : "#6b5a80", transition: "color 0.2s" }}>
      {ok ? <CheckCircle2 size={11} /> : <Copy size={11} />}
    </button>
  );
}

const breachTypeConfig = {
  social:    { color: "#f472b6", icon: Users,     label: "Social Media" },
  corporate: { color: "#ffd166", icon: Building2, label: "Corporate" },
  cloud:     { color: "#00e5ff", icon: Cloud,     label: "Cloud Service" },
  forum:     { color: "#a855f7", icon: BookOpen,  label: "Forum Dump" },
};

const severityColor = { critical: "#ff4d6d", high: "#ffd166", medium: "#00e5ff", low: "#06d6a0" } as const;
const strengthColor = { weak: "#ff4d6d", medium: "#ffd166", strong: "#06d6a0" } as const;

// ── radar chart data builder ──────────────────────────────────────────────────

function buildRadar(result: LeakResult) {
  return [
    { subject: "Social",    value: result.breaches.filter(b => b.type === "social").length * 25 },
    { subject: "Corporate", value: result.breaches.filter(b => b.type === "corporate").length * 30 },
    { subject: "Cloud",     value: result.breaches.filter(b => b.type === "cloud").length * 35 },
    { subject: "Forum",     value: result.breaches.filter(b => b.type === "forum").length * 40 },
    { subject: "Plaintext", value: result.breaches.filter(b => b.hasPlaintext).length * 50 },
    { subject: "Reuse",     value: result.passwordInsights.length * 20 },
  ];
}

// ── Category breakdown cards ──────────────────────────────────────────────────

function CategoryBreakdown({ result }: { result: LeakResult }) {
  const cats = [
    { key: "social",    icon: Users,     label: "Social Media",     desc: "Facebook, LinkedIn, Twitter leaks", color: "#f472b6", count: result.breaches.filter(b => b.type === "social").length },
    { key: "corporate", icon: Building2, label: "Corporate Breach", desc: "Adobe, Dropbox, major companies",   color: "#ffd166", count: result.breaches.filter(b => b.type === "corporate").length },
    { key: "cloud",     icon: Cloud,     label: "Cloud Service",    desc: "SaaS, storage & vault leaks",       color: "#00e5ff", count: result.breaches.filter(b => b.type === "cloud").length },
    { key: "forum",     icon: BookOpen,  label: "Forum Dumps",      desc: "Dark web & hacker forum DBs",       color: "#a855f7", count: result.breaches.filter(b => b.type === "forum").length },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 mb-4">
      {cats.map(c => (
        <div key={c.key} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: `${c.color}0c`, border: `1px solid ${c.color}25` }}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${c.color}14`, border: `1px solid ${c.color}30` }}>
            <c.icon size={15} style={{ color: c.color }} />
          </div>
          <div className="flex-1 min-w-0">
            <div style={{ fontSize: "11px", fontWeight: 600, color: "var(--tq-t1)" }}>{c.label}</div>
            <div style={{ fontSize: "9px", color: "var(--tq-t3)" }}>{c.desc}</div>
          </div>
          <div style={{ fontFamily: "'Orbitron',monospace", fontSize: "18px", fontWeight: 800, color: c.color, textShadow: `0 0 12px ${c.color}60` }}>
            {c.count}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Breach cards list ─────────────────────────────────────────────────────────

function BreachList({ breaches }: { breaches: BreachRecord[] }) {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-2">
      {breaches.map((b) => {
        const tc = breachTypeConfig[b.type];
        const sc = severityColor[b.severity];
        const isOpen = expanded === b.name;
        return (
          <div key={b.name} className="rounded-xl overflow-hidden transition-all duration-200"
            style={{ background: `${sc}08`, border: `1px solid ${sc}28` }}>
            <button className="w-full flex items-center gap-3 p-3 text-left" onClick={() => setExpanded(isOpen ? null : b.name)}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${tc.color}14`, border: `1px solid ${tc.color}28` }}>
                <tc.icon size={13} style={{ color: tc.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span style={{ fontSize: "11px", fontWeight: 600, color: "var(--tq-t1)" }}>{b.name}</span>
                  <span style={{ fontSize: "8px", fontFamily: "'JetBrains Mono',monospace", color: tc.color, background: `${tc.color}14`, border: `1px solid ${tc.color}25`, padding: "1px 6px", borderRadius: "4px" }}>{tc.label}</span>
                  {b.hasPlaintext && (
                    <span style={{ fontSize: "8px", fontFamily: "'JetBrains Mono',monospace", color: "#ff4d6d", background: "rgba(255,77,109,0.1)", border: "1px solid rgba(255,77,109,0.25)", padding: "1px 6px", borderRadius: "4px" }}>PLAINTEXT</span>
                  )}
                </div>
                <div style={{ fontSize: "9px", color: "var(--tq-t3)", fontFamily: "'JetBrains Mono',monospace", marginTop: "2px" }}>{b.date} · {b.count} records affected</div>
              </div>
              <div className="flex items-center gap-2">
                <span style={{ fontSize: "8px", fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, color: sc, background: `${sc}14`, border: `1px solid ${sc}28`, padding: "2px 6px", borderRadius: "4px", textTransform: "uppercase" }}>{b.severity}</span>
                <ChevronDown size={12} style={{ color: "var(--tq-t3)", transform: isOpen ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s" }} />
              </div>
            </button>

            {isOpen && (
              <div className="px-3 pb-3 pt-1" style={{ borderTop: `1px solid ${sc}18` }}>
                <div style={{ fontSize: "9px", color: "var(--tq-t3)", fontFamily: "'JetBrains Mono',monospace", letterSpacing: "0.08em", marginBottom: "8px" }}>EXPOSED DATA TYPES</div>
                <div className="flex gap-1.5 flex-wrap mb-3">
                  {b.exposed.map(e => (
                    <span key={e} style={{ fontSize: "9px", color: "var(--tq-t1)", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", padding: "3px 8px", borderRadius: "6px", fontFamily: "'JetBrains Mono',monospace" }}>{e}</span>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center gap-2 p-2 rounded-lg" style={{ background: "rgba(255,255,255,0.03)" }}>
                    <Key size={10} style={{ color: b.hasPlaintext ? "#ff4d6d" : "#6b5a80" }} />
                    <span style={{ fontSize: "9px", color: b.hasPlaintext ? "#ff4d6d" : "#6b5a80", fontFamily: "'JetBrains Mono',monospace" }}>
                      Plain-text pwd: {b.hasPlaintext ? "YES ⚠️" : "No"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-lg" style={{ background: "rgba(255,255,255,0.03)" }}>
                    <Hash size={10} style={{ color: b.hasHashed ? "#ffd166" : "#6b5a80" }} />
                    <span style={{ fontSize: "9px", color: b.hasHashed ? "#ffd166" : "#6b5a80", fontFamily: "'JetBrains Mono',monospace" }}>
                      Hashed pwd: {b.hasHashed ? "YES" : "No"}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Password insights ─────────────────────────────────────────────────────────

function PasswordInsights({ insights }: { insights: PasswordInsight[] }) {
  const [reveal, setReveal] = useState(false);

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div style={{ fontSize: "9px", color: "var(--tq-t3)", fontFamily: "'JetBrains Mono',monospace", letterSpacing: "0.08em" }}>REUSE PATTERN ANALYSIS</div>
        <button onClick={() => setReveal(r => !r)} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg"
          style={{ fontSize: "9px", color: "var(--tq-t2)", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", fontFamily: "'JetBrains Mono',monospace" }}>
          {reveal ? <EyeOff size={10} /> : <Eye size={10} />} {reveal ? "Hide" : "Reveal"} hints
        </button>
      </div>

      <div className="flex flex-col gap-2 mb-4">
        {insights.map((p, i) => (
          <div key={i} className="p-3 rounded-xl" style={{ background: `${strengthColor[p.strength]}08`, border: `1px solid ${strengthColor[p.strength]}22` }}>
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span style={{ fontSize: "10px", fontWeight: 600, color: "var(--tq-t1)", fontFamily: "'JetBrains Mono',monospace" }}>{p.pattern}</span>
                {p.isPlaintext && (
                  <span style={{ fontSize: "7px", fontFamily: "'JetBrains Mono',monospace", color: "#ff4d6d", background: "rgba(255,77,109,0.1)", border: "1px solid rgba(255,77,109,0.2)", padding: "1px 5px", borderRadius: "3px" }}>EXPOSED PLAIN</span>
                )}
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <RefreshCw size={9} style={{ color: strengthColor[p.strength] }} />
                <span style={{ fontSize: "9px", fontFamily: "'JetBrains Mono',monospace", color: strengthColor[p.strength], fontWeight: 600 }}>×{p.reuseCount} sites</span>
              </div>
            </div>
            {reveal && (
              <p style={{ fontSize: "9px", color: "var(--tq-t2)", lineHeight: 1.5, fontFamily: "'JetBrains Mono',monospace", borderTop: `1px solid ${strengthColor[p.strength]}15`, paddingTop: "6px", marginTop: "4px" }}>
                {p.hint}
              </p>
            )}
            <div className="mt-2 rounded-full overflow-hidden" style={{ height: "3px", background: "rgba(255,255,255,0.07)" }}>
              <div style={{ width: p.strength === "weak" ? "30%" : p.strength === "medium" ? "60%" : "90%", height: "100%", background: strengthColor[p.strength], borderRadius: "2px", boxShadow: `0 0 5px ${strengthColor[p.strength]}` }} />
            </div>
          </div>
        ))}
      </div>

      {/* Hash + plain stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 rounded-xl flex items-center gap-3" style={{ background: "rgba(255,77,109,0.07)", border: "1px solid rgba(255,77,109,0.2)" }}>
          <Key size={16} style={{ color: "#ff4d6d" }} />
          <div>
            <div style={{ fontFamily: "'Orbitron',monospace", fontSize: "15px", fontWeight: 800, color: "#ff4d6d" }}>2</div>
            <div style={{ fontSize: "9px", color: "var(--tq-t2)" }}>Plain-text passwords found</div>
          </div>
        </div>
        <div className="p-3 rounded-xl flex items-center gap-3" style={{ background: "rgba(255,209,102,0.07)", border: "1px solid rgba(255,209,102,0.2)" }}>
          <Hash size={16} style={{ color: "#ffd166" }} />
          <div>
            <div style={{ fontFamily: "'Orbitron',monospace", fontSize: "15px", fontWeight: 800, color: "#ffd166" }}>4</div>
            <div style={{ fontSize: "9px", color: "var(--tq-t2)" }}>Hashed passwords cracked</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Risk score ring ───────────────────────────────────────────────────────────

function RiskRing({ score }: { score: number }) {
  const color = score >= 70 ? "#ff4d6d" : score >= 40 ? "#ffd166" : "#06d6a0";
  const r = 34, circ = 2 * Math.PI * r;
  return (
    <svg width={84} height={84} viewBox="0 0 84 84">
      <circle cx={42} cy={42} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={7} />
      <circle cx={42} cy={42} r={r} fill="none" stroke={color} strokeWidth={7} strokeLinecap="round"
        strokeDasharray={circ} strokeDashoffset={circ * (1 - score / 100)}
        transform="rotate(-90 42 42)" style={{ filter: `drop-shadow(0 0 8px ${color})`, transition: "stroke-dashoffset 1s ease" }} />
      <text x={42} y={38} textAnchor="middle" fill={color} fontSize={15} fontFamily="'Orbitron',monospace" fontWeight={800}>{score}</text>
      <text x={42} y={52} textAnchor="middle" fill="#6b5a80" fontSize={8} fontFamily="'JetBrains Mono',monospace">/100</text>
    </svg>
  );
}

// ── Input panel ───────────────────────────────────────────────────────────────

function InputPanel({ onCheck }: { onCheck: (emails: string[]) => void }) {
  const [tab, setTab] = useState<ScanTab>("single");
  const [single, setSingle] = useState("");
  const [bulk, setBulk] = useState("");
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const submit = () => {
    if (tab === "single" && single.trim()) { onCheck([single.trim()]); setSingle(""); }
    else if (tab === "bulk" && bulk.trim()) {
      onCheck(bulk.split(/\n|,|;/).map(e => e.trim()).filter(Boolean));
      setBulk("");
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = ev => { setBulk(ev.target?.result as string ?? ""); setTab("bulk"); };
      reader.readAsText(file);
    }
  };

  return (
    <Glass className="p-5">
      <Label icon={Mail} text="EMAIL LEAK CHECKER" color="#a855f7" />

      {/* Tabs */}
      <div className="flex gap-1 mb-4 p-1 rounded-xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
        {([["single", Mail, "Single Email"], ["bulk", Layers, "Bulk Check"]] as const).map(([id, Icon, label]) => (
          <button key={id} onClick={() => setTab(id)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg transition-all"
            style={{ background: tab === id ? "rgba(168,85,247,0.1)" : "transparent", border: tab === id ? "1px solid rgba(168,85,247,0.25)" : "1px solid transparent", color: tab === id ? "#a855f7" : "#6b5a80" }}>
            <Icon size={11} />
            <span style={{ fontSize: "10px", fontFamily: "'JetBrains Mono',monospace", fontWeight: tab === id ? 600 : 400 }}>{label}</span>
          </button>
        ))}
      </div>

      {/* Drop zone */}
      <div onDragOver={e => { e.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={handleDrop}
        onClick={() => fileRef.current?.click()}
        className="mb-4 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all"
        style={{ height: 52, border: `2px dashed ${dragging ? "#a855f7" : "rgba(168,85,247,0.2)"}`, background: dragging ? "rgba(168,85,247,0.07)" : "rgba(255,255,255,0.02)" }}>
        <Upload size={13} style={{ color: dragging ? "#a855f7" : "#6b5a80" }} />
        <span style={{ fontSize: "10px", color: dragging ? "#a855f7" : "#6b5a80", fontFamily: "'JetBrains Mono',monospace" }}>
          {dragging ? "Drop to import" : "Drag & drop .txt / .csv"}
        </span>
        <input ref={fileRef} type="file" accept=".txt,.csv" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) { const r = new FileReader(); r.onload = ev => { setBulk(ev.target?.result as string ?? ""); setTab("bulk"); }; r.readAsText(f); } }} />
      </div>

      {tab === "single" ? (
        <div className="flex gap-2">
          <div className="relative flex-1">
            <AtSign size={12} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "var(--tq-t3)" }} />
            <input value={single} onChange={e => setSingle(e.target.value)} onKeyDown={e => e.key === "Enter" && submit()}
              placeholder="user@example.com"
              className="w-full pl-8 pr-3 py-2.5 rounded-xl outline-none"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(168,85,247,0.2)", color: "var(--tq-t1)", fontSize: "12px", fontFamily: "'JetBrains Mono',monospace" }} />
          </div>
          <button onClick={submit} disabled={!single.trim()}
            className="px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-all"
            style={{ background: single.trim() ? "linear-gradient(135deg,#a855f7,#f472b6)" : "rgba(255,255,255,0.05)", color: single.trim() ? "#fff" : "#6b5a80", fontWeight: 700, fontSize: "11px", boxShadow: single.trim() ? "0 0 16px rgba(168,85,247,0.35)" : "none" }}>
            <Search size={13} /> Check
          </button>
        </div>
      ) : (
        <div>
          <textarea value={bulk} onChange={e => setBulk(e.target.value)} rows={5}
            placeholder={"alice@company.com\nbob@gmail.com\ncarol@org.io"}
            className="w-full px-3 py-2.5 rounded-xl outline-none resize-none"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(168,85,247,0.18)", color: "var(--tq-t1)", fontSize: "11px", fontFamily: "'JetBrains Mono',monospace", lineHeight: 1.7 }} />
          <div className="flex items-center justify-between mt-2">
            <span style={{ fontSize: "9px", color: "var(--tq-t3)", fontFamily: "'JetBrains Mono',monospace" }}>
              {bulk ? `${bulk.split(/\n|,|;/).filter(Boolean).length} addresses` : "One per line, comma, or semicolon separated"}
            </span>
            <button onClick={submit} disabled={!bulk.trim()}
              className="px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all"
              style={{ background: bulk.trim() ? "linear-gradient(135deg,#a855f7,#f472b6)" : "rgba(255,255,255,0.05)", color: bulk.trim() ? "#fff" : "#6b5a80", fontWeight: 700, fontSize: "11px", boxShadow: bulk.trim() ? "0 0 16px rgba(168,85,247,0.3)" : "none" }}>
              <Layers size={12} /> Check All
            </button>
          </div>
        </div>
      )}

      {/* What we detect */}
      <div className="mt-4 pt-4" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <div style={{ fontSize: "9px", color: "var(--tq-t3)", fontFamily: "'JetBrains Mono',monospace", letterSpacing: "0.08em", marginBottom: "8px" }}>WE DETECT</div>
        <div className="grid grid-cols-2 gap-1.5">
          {[
            [Ban,       "Invalid emails",        "#ff4d6d"],
            [Clock,     "Temporary addresses",   "#ffd166"],
            [Globe,     "Fake domains",          "#8b7aa8"],
            [Users,     "Social media breaches", "#f472b6"],
            [Building2, "Corporate breaches",    "#ffd166"],
            [Cloud,     "Cloud service leaks",   "#00e5ff"],
            [BookOpen,  "Forum database dumps",  "#a855f7"],
            [Key,       "Plain-text passwords",  "#ff4d6d"],
            [Hash,      "Hashed passwords",      "#ffd166"],
            [RefreshCw, "Password reuse",        "#f472b6"],
          ].map(([Icon, label, color]) => (
            <div key={label as string} className="flex items-center gap-1.5">
              <Icon size={9} style={{ color: color as string, flexShrink: 0 }} />
              <span style={{ fontSize: "9px", color: "var(--tq-t2)", fontFamily: "'JetBrains Mono',monospace" }}>{label as string}</span>
            </div>
          ))}
        </div>
      </div>
    </Glass>
  );
}

// ── History list ───────────────────────────────────────────────────────────────

function HistoryList({ results, selected, onSelect }: { results: LeakResult[]; selected: string | null; onSelect: (e: string) => void }) {
  if (!results.length) return null;

  const icon = (r: LeakResult) => r.status === "clean" ? ShieldCheck : r.status === "invalid" ? XCircle : r.status === "temp" ? Clock : ShieldX;
  const color = (r: LeakResult) => r.status === "clean" ? "#06d6a0" : r.status === "invalid" ? "#8b7aa8" : r.status === "temp" ? "#ffd166" : "#ff4d6d";

  return (
    <Glass className="p-4">
      <Label icon={Clock} text="CHECK HISTORY" color="#8b7aa8" />
      <div className="flex flex-col gap-1.5" style={{ maxHeight: 220, overflowY: "auto" }}>
        {results.map(r => {
          const Ic = icon(r);
          const c = color(r);
          return (
            <div key={r.email} onClick={() => onSelect(r.email)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl cursor-pointer transition-all"
              style={{ background: selected === r.email ? "rgba(168,85,247,0.07)" : "rgba(255,255,255,0.02)", border: selected === r.email ? "1px solid rgba(168,85,247,0.25)" : "1px solid rgba(255,255,255,0.05)" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(168,85,247,0.05)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = selected === r.email ? "rgba(168,85,247,0.07)" : "rgba(255,255,255,0.02)"; }}>
              <Ic size={12} style={{ color: c, flexShrink: 0 }} />
              <span style={{ fontSize: "10px", color: "var(--tq-t2)", fontFamily: "'JetBrains Mono',monospace", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.email}</span>
              {r.breachCount > 0 && <span style={{ fontSize: "9px", fontFamily: "'JetBrains Mono',monospace", color: "#ff4d6d", fontWeight: 600 }}>{r.breachCount} breaches</span>}
              <span style={{ fontSize: "9px", color: c, fontFamily: "'JetBrains Mono',monospace", fontWeight: 600, textTransform: "uppercase" }}>{r.status}</span>
            </div>
          );
        })}
      </div>
    </Glass>
  );
}

// ── Result detail ─────────────────────────────────────────────────────────────

function ResultDetail({ result }: { result: LeakResult }) {
  const [tab, setTab] = useState<ResultTab>("overview");

  // Special states
  if (result.status === "invalid") {
    return (
      <Glass className="p-8 flex flex-col items-center justify-center gap-4" style={{ minHeight: 400, border: "1px solid rgba(139,122,168,0.2)" }}>
        <XCircle size={40} style={{ color: "var(--tq-t2)", filter: "drop-shadow(0 0 8px #8b7aa880)" }} />
        <div style={{ fontFamily: "'Orbitron',monospace", fontSize: "13px", color: "var(--tq-t2)" }}>INVALID EMAIL FORMAT</div>
        <p style={{ fontSize: "10px", color: "var(--tq-t3)", textAlign: "center", maxWidth: 260 }}>"{result.email}" doesn't match a valid email pattern. Check for missing "@" or a valid domain.</p>
        <div className="grid grid-cols-2 gap-3 w-full max-w-xs">
          {[["Missing @", "no-at-sign.com"], ["No TLD", "user@domain"], ["Invalid chars", "user name@x.com"], ["Empty domain", "user@"]].map(([t, ex]) => (
            <div key={t} className="p-2 rounded-lg text-center" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <div style={{ fontSize: "10px", color: "var(--tq-t2)", fontWeight: 600 }}>{t}</div>
              <div style={{ fontSize: "8px", color: "var(--tq-t3)", fontFamily: "'JetBrains Mono',monospace" }}>{ex}</div>
            </div>
          ))}
        </div>
      </Glass>
    );
  }

  if (result.status === "temp") {
    return (
      <Glass className="p-8 flex flex-col items-center justify-center gap-4" style={{ minHeight: 400, border: "1px solid rgba(255,209,102,0.2)" }}>
        <Clock size={40} style={{ color: "#ffd166", filter: "drop-shadow(0 0 8px #ffd16680)" }} />
        <div style={{ fontFamily: "'Orbitron',monospace", fontSize: "13px", color: "#ffd166" }}>TEMPORARY EMAIL DETECTED</div>
        <p style={{ fontSize: "10px", color: "var(--tq-t2)", textAlign: "center", maxWidth: 280 }}>"{result.email}" is from a known disposable email provider. These addresses are often used to bypass registration walls and may be flagged by services.</p>
        <div className="px-4 py-3 rounded-xl w-full max-w-xs" style={{ background: "rgba(255,209,102,0.07)", border: "1px solid rgba(255,209,102,0.2)" }}>
          <div style={{ fontSize: "9px", color: "var(--tq-t3)", fontFamily: "'JetBrains Mono',monospace", marginBottom: "6px" }}>KNOWN TEMP PROVIDERS</div>
          {["mailinator.com", "guerrillamail.com", "10minutemail.com", "yopmail.com", "trashmail.com"].map(p => (
            <div key={p} style={{ fontSize: "9px", color: "#ffd166", fontFamily: "'JetBrains Mono',monospace" }}>· {p}</div>
          ))}
        </div>
      </Glass>
    );
  }

  if (result.status === "clean") {
    return (
      <Glass className="p-8 flex flex-col items-center justify-center gap-4" style={{ minHeight: 400, border: "1px solid rgba(6,214,160,0.2)" }}>
        <ShieldCheck size={48} style={{ color: "#06d6a0", filter: "drop-shadow(0 0 16px #06d6a080)" }} />
        <div style={{ fontFamily: "'Orbitron',monospace", fontSize: "15px", color: "#06d6a0", letterSpacing: "0.06em" }}>ALL CLEAR ✨</div>
        <p style={{ fontSize: "11px", color: "var(--tq-t2)", textAlign: "center", maxWidth: 300, lineHeight: 1.6 }}>
          <strong style={{ color: "var(--tq-t1)" }}>{result.email}</strong> was not found in any of our 14B+ indexed breach records.
        </p>
        <div className="grid grid-cols-3 gap-3 w-full max-w-sm">
          {[["14B+", "Records scanned", "#06d6a0"], ["847", "Breaches checked", "#00e5ff"], ["0", "Exposures found", "#06d6a0"]].map(([v, l, c]) => (
            <div key={l} className="text-center p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <div style={{ fontFamily: "'Orbitron',monospace", fontSize: "14px", fontWeight: 800, color: c }}>{v}</div>
              <div style={{ fontSize: "8px", color: "var(--tq-t3)", fontFamily: "'JetBrains Mono',monospace" }}>{l}</div>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-full" style={{ background: "rgba(6,214,160,0.08)", border: "1px solid rgba(6,214,160,0.2)" }}>
          <Star size={12} style={{ color: "#ffd166", fill: "#ffd166" }} />
          <span style={{ fontSize: "10px", color: "#06d6a0", fontFamily: "'JetBrains Mono',monospace" }}>+25 XP awarded for clean check</span>
        </div>
      </Glass>
    );
  }

  // LEAKED result
  const tabs: { id: ResultTab; label: string; icon: typeof Eye }[] = [
    { id: "overview",  label: "Overview",  icon: Eye },
    { id: "breaches",  label: `Breaches (${result.breachCount})`, icon: Database },
    { id: "passwords", label: "Passwords", icon: Key },
    { id: "analysis",  label: "Risk Map",  icon: BarChart3 },
  ];

  const radarData = buildRadar(result);

  return (
    <Glass className="p-5" style={{ border: "1px solid rgba(255,77,109,0.2)" }}>
      {/* Alert banner */}
      <div className="flex items-center gap-3 p-3 rounded-xl mb-5" style={{ background: "rgba(255,77,109,0.1)", border: "1px solid rgba(255,77,109,0.25)" }}>
        <ShieldX size={20} style={{ color: "#ff4d6d", filter: "drop-shadow(0 0 8px #ff4d6d)", flexShrink: 0 }} />
        <div className="flex-1">
          <div style={{ fontFamily: "'Orbitron',monospace", fontSize: "11px", fontWeight: 700, color: "#ff4d6d", letterSpacing: "0.06em" }}>
            BREACHED — {result.breachCount} SOURCES CONFIRMED
          </div>
          <div style={{ fontSize: "9px", color: "var(--tq-t2)", fontFamily: "'JetBrains Mono',monospace", marginTop: "2px" }}>
            First seen: {result.firstSeen} · Last seen: {result.lastSeen} · ~{result.exposedCount} records in scope
          </div>
        </div>
        <RiskRing score={result.riskScore} />
      </div>

      {/* Email + copy */}
      <div className="flex items-center gap-2 mb-4 px-3 py-2 rounded-xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
        <AtSign size={11} style={{ color: "var(--tq-t3)" }} />
        <span style={{ fontSize: "11px", color: "var(--tq-t1)", fontFamily: "'JetBrains Mono',monospace", flex: 1 }}>{result.email}</span>
        <CopyBtn text={result.email} />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 mb-4 rounded-xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
        {tabs.map(t => {
          const active = tab === t.id;
          return (
            <button key={t.id} onClick={() => setTab(t.id)}
              className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg transition-all"
              style={{ background: active ? "rgba(255,77,109,0.1)" : "transparent", border: active ? "1px solid rgba(255,77,109,0.25)" : "1px solid transparent", color: active ? "#ff4d6d" : "#6b5a80" }}>
              <t.icon size={10} />
              <span style={{ fontSize: "9px", fontFamily: "'JetBrains Mono',monospace", fontWeight: active ? 600 : 400 }}>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      {tab === "overview" && (
        <div>
          {/* Flags */}
          <div className="flex gap-2 flex-wrap mb-4">
            {result.isFake && (
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-full" style={{ background: "rgba(139,122,168,0.12)", border: "1px solid rgba(139,122,168,0.25)", fontSize: "9px", color: "var(--tq-t2)", fontFamily: "'JetBrains Mono',monospace" }}>
                <Globe size={9} /> Suspicious domain
              </span>
            )}
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-full" style={{ background: "rgba(255,77,109,0.1)", border: "1px solid rgba(255,77,109,0.25)", fontSize: "9px", color: "#ff4d6d", fontFamily: "'JetBrains Mono',monospace" }}>
              <Key size={9} /> Plain-text pwd exposed
            </span>
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-full" style={{ background: "rgba(255,209,102,0.1)", border: "1px solid rgba(255,209,102,0.25)", fontSize: "9px", color: "#ffd166", fontFamily: "'JetBrains Mono',monospace" }}>
              <RefreshCw size={9} /> Password reuse detected
            </span>
          </div>
          <CategoryBreakdown result={result} />
          {/* Quick actions */}
          <div className="grid grid-cols-2 gap-2 mt-2">
            {[
              ["🔑 Change passwords now",  "#ff4d6d"],
              ["🔐 Enable 2FA everywhere", "#a855f7"],
              ["📧 Use unique emails",     "#00e5ff"],
              ["🛡️ Enable breach alerts",  "#06d6a0"],
            ].map(([label, color]) => (
              <button key={label} className="flex items-center gap-2 px-3 py-2 rounded-xl text-left transition-all"
                style={{ background: `${color}0c`, border: `1px solid ${color}25`, fontSize: "10px", color: color as string }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = `${color}50`; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = `${color}25`; }}>
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      {tab === "breaches" && <BreachList breaches={result.breaches} />}

      {tab === "passwords" && <PasswordInsights insights={result.passwordInsights} />}

      {tab === "analysis" && (
        <div>
          <div style={{ fontSize: "9px", color: "var(--tq-t3)", fontFamily: "'JetBrains Mono',monospace", letterSpacing: "0.08em", marginBottom: "12px" }}>EXPOSURE RISK MAP</div>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={radarData} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
              <PolarGrid stroke="rgba(255,255,255,0.07)" />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 9, fill: "#8b7aa8", fontFamily: "'JetBrains Mono',monospace" }} />
              <Radar name="Risk" dataKey="value" stroke="#ff4d6d" fill="#ff4d6d" fillOpacity={0.15} strokeWidth={2} />
              <Tooltip contentStyle={{ background: "rgba(20,2,50,0.95)", border: "1px solid rgba(255,77,109,0.2)", borderRadius: "10px", fontSize: "10px", color: "var(--tq-t1)", fontFamily: "'JetBrains Mono',monospace" }} />
            </RadarChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-3 gap-2 mt-3">
            {[
              { label: "Risk Score",    value: `${result.riskScore}/100`, color: "#ff4d6d" },
              { label: "Breach Sources", value: result.breachCount,       color: "#ffd166" },
              { label: "Data Points",   value: "12+",                     color: "#a855f7" },
            ].map(s => (
              <div key={s.label} className="text-center p-2.5 rounded-xl" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <div style={{ fontFamily: "'Orbitron',monospace", fontSize: "15px", fontWeight: 800, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: "8px", color: "var(--tq-t3)", fontFamily: "'JetBrains Mono',monospace" }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Glass>
  );
}

// ── Stats strip ───────────────────────────────────────────────────────────────

function StatsStrip({ results }: { results: LeakResult[] }) {
  const leaked  = results.filter(r => r.status === "leaked").length;
  const clean   = results.filter(r => r.status === "clean").length;
  const temp    = results.filter(r => r.status === "temp").length;
  const invalid = results.filter(r => r.status === "invalid").length;
  const totalBreaches = results.reduce((a, r) => a + r.breachCount, 0);

  return (
    <div className="grid grid-cols-5 gap-3 mb-4">
      {[
        { label: "Checked",       value: results.length, color: "var(--tq-t1)", icon: Mail },
        { label: "Leaked",        value: leaked,         color: "#ff4d6d", icon: ShieldX },
        { label: "Clean",         value: clean,          color: "#06d6a0", icon: ShieldCheck },
        { label: "Temp / Fake",   value: temp,           color: "#ffd166", icon: Clock },
        { label: "Total Breaches",value: totalBreaches,  color: "#a855f7", icon: Database },
      ].map(s => (
        <Glass key={s.label} className="p-3 text-center" style={{ border: `1px solid ${s.color}18` }}>
          <s.icon size={13} style={{ color: s.color, margin: "0 auto 4px", filter: `drop-shadow(0 0 4px ${s.color})` }} />
          <div style={{ fontFamily: "'Orbitron',monospace", fontSize: "18px", fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</div>
          <div style={{ fontSize: "8px", color: "var(--tq-t3)", fontFamily: "'JetBrains Mono',monospace", marginTop: "3px" }}>{s.label}</div>
        </Glass>
      ))}
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────

export function EmailLeakPage() {
  const [results, setResults] = useState<LeakResult[]>([]);
  const [checking, setChecking] = useState<string[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null);
  const [queue, setQueue] = useState<{ email: string; progress: number }[]>([]);

  const selectedResult = results.find(r => r.email === selectedEmail) ?? results[0] ?? null;

  const handleCheck = useCallback((emails: string[]) => {
    const unique = emails.filter(e => !results.find(r => r.email === e));
    if (!unique.length) return;

    setChecking(unique);
    setQueue(unique.map(e => ({ email: e, progress: 0 })));

    unique.forEach((email, idx) => {
      const delay = idx * 500;
      let progress = 0;
      const interval = setInterval(() => {
        progress = Math.min(progress + Math.floor(Math.random() * 20 + 10), 92);
        setQueue(prev => prev.map(q => q.email === email ? { ...q, progress } : q));
      }, 180);

      setTimeout(() => {
        clearInterval(interval);
        const result = buildResult(email);
        setQueue(prev => prev.filter(q => q.email !== email));
        setResults(prev => [result, ...prev]);
        setSelectedEmail(email);
        setChecking(prev => prev.filter(e => e !== email));
      }, delay + 2200);
    });
  }, [results]);

  return (
    <div className="flex-1 overflow-y-auto px-6 py-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 style={{ fontFamily: "'Orbitron',monospace", fontWeight: 700, fontSize: "16px", color: "var(--tq-t1)", letterSpacing: "0.05em" }}>
              Email Leak Checker
            </h1>
            <span style={{ fontSize: "9px", color: "#ff4d6d", background: "rgba(255,77,109,0.12)", border: "1px solid rgba(255,77,109,0.25)", padding: "2px 8px", borderRadius: "20px", fontFamily: "'JetBrains Mono',monospace", fontWeight: 600 }}>
              14B+ RECORDS
            </span>
          </div>
          <p style={{ fontSize: "10px", color: "var(--tq-t3)", fontFamily: "'JetBrains Mono',monospace" }}>
            Check email addresses across breaches, leaks, plain-text dumps & reuse patterns
          </p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full" style={{ background: "rgba(168,85,247,0.08)", border: "1px solid rgba(168,85,247,0.2)" }}>
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#a855f7", boxShadow: "0 0 6px #a855f7", animation: "pulse 2s infinite" }} />
          <span style={{ fontSize: "9px", color: "#a855f7", fontFamily: "'JetBrains Mono',monospace" }}>DB SYNCED</span>
        </div>
      </div>

      {/* Stats strip */}
      <StatsStrip results={results} />

      {/* Active scan queue */}
      {queue.length > 0 && (
        <Glass className="p-4 mb-4">
          <div style={{ fontSize: "9px", color: "#a855f7", fontFamily: "'JetBrains Mono',monospace", letterSpacing: "0.08em", marginBottom: "10px" }}>SCANNING IN PROGRESS</div>
          <div className="flex flex-col gap-2">
            {queue.map(q => (
              <div key={q.email} className="flex items-center gap-3">
                <Loader2 size={11} style={{ color: "#a855f7" }} className="animate-spin shrink-0" />
                <span style={{ fontSize: "10px", color: "var(--tq-t2)", fontFamily: "'JetBrains Mono',monospace", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{q.email}</span>
                <div className="w-24 rounded-full overflow-hidden" style={{ height: 4, background: "rgba(255,255,255,0.07)" }}>
                  <div style={{ width: `${q.progress}%`, height: "100%", background: "linear-gradient(90deg,#a855f7,#f472b6)", borderRadius: "2px", transition: "width 0.3s", boxShadow: "0 0 6px rgba(168,85,247,0.6)" }} />
                </div>
                <span style={{ fontSize: "9px", color: "var(--tq-t3)", fontFamily: "'JetBrains Mono',monospace", width: 28, textAlign: "right" }}>{q.progress}%</span>
              </div>
            ))}
          </div>
        </Glass>
      )}

      {/* Main layout */}
      <div className="grid grid-cols-12 gap-4 mb-6">
        {/* Left: input + history */}
        <div className="col-span-4 flex flex-col gap-4">
          <InputPanel onCheck={handleCheck} />
          <HistoryList results={results} selected={selectedEmail} onSelect={setSelectedEmail} />
        </div>

        {/* Right: result detail */}
        <div className="col-span-8">
          {selectedResult ? (
            <ResultDetail result={selectedResult} />
          ) : (
            <Glass className="p-10 flex flex-col items-center justify-center gap-4" style={{ minHeight: 440 }}>
              <div style={{ width: 64, height: 64, borderRadius: "20px", background: "rgba(168,85,247,0.08)", border: "1px solid rgba(168,85,247,0.18)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Mail size={26} style={{ color: "#a855f7", filter: "drop-shadow(0 0 8px #a855f7)" }} />
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontFamily: "'Orbitron',monospace", fontSize: "14px", color: "var(--tq-t1)", marginBottom: "8px" }}>Ready to Check</div>
                <p style={{ fontSize: "10px", color: "var(--tq-t3)", lineHeight: 1.7, maxWidth: 300 }}>
                  Enter an email address to scan across 14B+ indexed records covering social media breaches, corporate leaks, cloud service dumps, forum databases, plain-text and hashed passwords, and reuse patterns.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2 w-full max-w-xs">
                {[
                  ["🎭 Social Breaches",  "#f472b6"],
                  ["🏢 Corporate Leaks",  "#ffd166"],
                  ["☁️ Cloud Services",   "#00e5ff"],
                  ["💬 Forum Dumps",      "#a855f7"],
                  ["🔑 Plaintext PWDs",   "#ff4d6d"],
                  ["#️⃣ Hashed PWDs",      "#ffd166"],
                ].map(([label, color]) => (
                  <div key={label} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg"
                    style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", fontSize: "9px", color: color as string, fontFamily: "'JetBrains Mono',monospace" }}>
                    {label}
                  </div>
                ))}
              </div>
              <div style={{ fontSize: "9px", color: "var(--tq-t3)", fontFamily: "'JetBrains Mono',monospace" }}>
                Try: <span style={{ color: "#a855f7", cursor: "pointer" }} onClick={() => handleCheck(["test.leak@example.com"])}>test.leak@example.com</span> to see a breach result
              </div>
            </Glass>
          )}
        </div>
      </div>
    </div>
  );
}
