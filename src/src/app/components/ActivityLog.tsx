import { useState, useMemo, useRef, useEffect } from "react";
import {
  Search, Download, Trash2, ShieldAlert, Trophy, KeyRound,
  ScanLine, Clock, ChevronDown, ChevronRight, Zap,
  ShieldCheck, ShieldX, Unlock, AlertTriangle, Globe,
  Mail, Star, Filter, RefreshCw, BarChart3, Activity,
  ExternalLink, Copy, CheckCircle2, Database
} from "lucide-react";

// ── types ──────────────────────────────────────────────────────────────────────

type EventType  = "scan" | "leak_check" | "alert" | "badge";
type ResultType = "safe" | "clean" | "unlocked" | "blocked" | "exposed" | "warning";
type FilterCat  = "all" | "scan" | "leak_check" | "alert" | "badge";

interface LogEntry {
  id: number;
  time: string;
  date: string;
  type: EventType;
  target: string;
  result: ResultType;
  xp: number;
  details: string;
  extraData?: Record<string, string>;
}

// ── full log data ──────────────────────────────────────────────────────────────

const ALL_LOGS: LogEntry[] = [
  { id: 101, time: "12:04 PM", date: "Today",     type: "scan",       target: "google.com",                  result: "safe",     xp: 15, details: "SSL valid. Domain reputation pristine. No blacklist hits across 87 threat intelligence feeds.", extraData: { "Trust Score": "99/100", "SSL Grade": "A+", "Domain Age": "26 years", "Registrar": "MarkMonitor Inc.", "Nameservers": "ns1.google.com" } },
  { id: 102, time: "11:52 AM", date: "Today",     type: "leak_check", target: "alex@email.com",              result: "clean",    xp: 20, details: "Cross-referenced across 47 dark web breach databases. No exposure detected in any known data dump.", extraData: { "Databases Checked": "47", "Last Indexed": "Today, 11:50 AM", "Paste Sites": "0 hits", "Hash Cracking": "Not detected" } },
  { id: 103, time: "11:30 AM", date: "Today",     type: "badge",      target: "First Scan Badge",             result: "unlocked", xp: 50, details: "Achievement unlocked for running your inaugural domain verification search. Welcome to ThreatQuest!", extraData: { "Badge Tier": "Common", "XP Awarded": "+50 XP", "Category": "Milestones", "Progress Toward": "Scan Master (4/10 scans)" } },
  { id: 104, time: "10:15 AM", date: "Today",     type: "alert",      target: "Malicious Redirect Script",    result: "blocked",  xp: 0,  details: "Auto-protection intercepted 2 phishing payload routing handshakes targeting credential endpoints.", extraData: { "Threat Type": "Phishing Kit", "Origin IP": "185.234.218.7", "CVE Reference": "CVE-2024-3912", "Action Taken": "Connection dropped & logged" } },
  { id: 105, time: "4:30 PM",  date: "Yesterday", type: "leak_check", target: "alex@email.com",              result: "exposed",  xp: 25, details: "Credentials leaked in 'Company XYZ' 2023 breach. Email + password hash exposed.", extraData: { "Breach Name": "CompanyXYZ_2023", "Data Exposed": "Email, Password hash", "Breach Date": "Sep 14, 2023", "Recommended Action": "Change password immediately" } },
  { id: 106, time: "2:15 PM",  date: "Yesterday", type: "scan",       target: "bit.ly/3xR9mQ2",              result: "warning",  xp: 10, details: "Shortened URL resolves through 3-hop redirect chain to an uncategorized domain registered 11 days ago.", extraData: { "Trust Score": "41/100", "Redirects": "3 hops", "Final Destination": "cdn-update-flash.xyz", "Domain Age": "11 days" } },
  { id: 107, time: "1:00 PM",  date: "Yesterday", type: "badge",      target: "Guardian Badge",               result: "unlocked", xp: 100, details: "7-day protection streak achieved. Your defenses remained active for an entire week without interruption.", extraData: { "Badge Tier": "Rare", "XP Awarded": "+100 XP", "Streak Days": "7 days", "Next Badge": "Iron Wall (14 days)" } },
  { id: 108, time: "9:44 AM",  date: "Yesterday", type: "alert",      target: "fake-bank-login.ru",           result: "blocked",  xp: 0,  details: "Credential harvesting page detected mimicking Chase Bank. Auto-blocked before DNS resolution.", extraData: { "Threat Type": "Brand Spoofing", "Confidence": "99.7%", "Template Match": "TK-449", "Action": "DNS block applied" } },
  { id: 109, time: "3:22 PM",  date: "Jun 11",    type: "scan",       target: "github.com",                  result: "safe",     xp: 15, details: "Clean scan. GitHub passes all 87 threat intelligence checks. SSL A+ rated by Qualys SSL Labs.", extraData: { "Trust Score": "100/100", "SSL Grade": "A+", "Domain Age": "17 years", "CDN": "Fastly" } },
  { id: 110, time: "11:05 AM", date: "Jun 11",    type: "leak_check", target: "secondary@email.com",         result: "exposed",  xp: 25, details: "Found in 'ForumHack 2022' breach. Username + IP address exposed in public paste.", extraData: { "Breach Name": "ForumHack_2022", "Data Exposed": "Username, IP address", "Breach Date": "Nov 3, 2022", "Paste URL": "pastebin.com/Xk7r…" } },
  { id: 111, time: "8:30 AM",  date: "Jun 11",    type: "scan",       target: "paypa1-secure.net",            result: "blocked",  xp: 30, details: "Homoglyph domain impersonating PayPal. Immediate block applied. Reported to PhishTank.", extraData: { "Trust Score": "2/100", "Threat Class": "Homoglyph Phishing", "Reported To": "PhishTank, Google SafeBrowsing", "SSL": "Self-signed (invalid)" } },
  { id: 112, time: "6:00 PM",  date: "Jun 10",    type: "badge",      target: "Speed Demon Badge",            result: "unlocked", xp: 75, details: "Scanned 10 URLs in under 60 seconds. Rapid fire threat intelligence is your specialty.", extraData: { "Badge Tier": "Uncommon", "XP Awarded": "+75 XP", "Time Record": "48 seconds", "Category": "Speed" } },
];

// ── config ─────────────────────────────────────────────────────────────────────

const typeConfig: Record<EventType, { icon: typeof ScanLine; color: string; bg: string; border: string; label: string }> = {
  scan:       { icon: ScanLine,    color: "#00e5ff", bg: "rgba(0,229,255,0.12)",   border: "rgba(0,229,255,0.3)",   label: "URL Scan" },
  leak_check: { icon: KeyRound,    color: "#ffd166", bg: "rgba(255,209,102,0.12)", border: "rgba(255,209,102,0.3)", label: "Leak Check" },
  alert:      { icon: ShieldAlert, color: "#ff4d6d", bg: "rgba(255,77,109,0.12)",  border: "rgba(255,77,109,0.3)",  label: "Threat Alert" },
  badge:      { icon: Trophy,      color: "#a855f7", bg: "rgba(168,85,247,0.12)",  border: "rgba(168,85,247,0.3)",  label: "Achievement" },
};

const resultConfig: Record<ResultType, { color: string; bg: string; border: string; label: string; icon: typeof CheckCircle2 }> = {
  safe:     { color: "#06d6a0", bg: "rgba(6,214,160,0.1)",   border: "rgba(6,214,160,0.25)",   label: "SAFE",      icon: ShieldCheck },
  clean:    { color: "#06d6a0", bg: "rgba(6,214,160,0.1)",   border: "rgba(6,214,160,0.25)",   label: "CLEAN",     icon: ShieldCheck },
  unlocked: { color: "#a855f7", bg: "rgba(168,85,247,0.1)",  border: "rgba(168,85,247,0.25)",  label: "UNLOCKED",  icon: Unlock },
  blocked:  { color: "#ff4d6d", bg: "rgba(255,77,109,0.1)",  border: "rgba(255,77,109,0.25)",  label: "BLOCKED",   icon: ShieldX },
  exposed:  { color: "#ff4d6d", bg: "rgba(255,77,109,0.1)",  border: "rgba(255,77,109,0.25)",  label: "EXPOSED",   icon: AlertTriangle },
  warning:  { color: "#ffd166", bg: "rgba(255,209,102,0.1)", border: "rgba(255,209,102,0.25)", label: "WARNING",   icon: AlertTriangle },
};

const filterConfig: { id: FilterCat; label: string; emoji: string; color: string }[] = [
  { id: "all",        label: "All Activities",  emoji: "⚡", color: "var(--tq-t1)" },
  { id: "scan",       label: "Scans",           emoji: "🔍", color: "#00e5ff" },
  { id: "leak_check", label: "Breach Checks",   emoji: "🔑", color: "#ffd166" },
  { id: "alert",      label: "Threat Alerts",   emoji: "🚨", color: "#ff4d6d" },
  { id: "badge",      label: "Badges & Levels", emoji: "🏆", color: "#a855f7" },
];

// ── helpers ────────────────────────────────────────────────────────────────────

function GlassCard({ children, className = "", style = {} }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  return (
    <div className={`rounded-2xl ${className}`} style={{ background: "linear-gradient(135deg,rgba(255,255,255,0.04),rgba(13,1,34,0.65))", border: "1px solid rgba(0,229,255,0.12)", backdropFilter: "blur(14px)", ...style }}>
      {children}
    </div>
  );
}

// ── Skeleton shimmer ──────────────────────────────────────────────────────────

function SkeletonRow() {
  return (
    <div className="flex items-start gap-3 px-5 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
      <div className="w-9 h-9 rounded-xl shrink-0" style={{ background: "rgba(255,255,255,0.06)", animation: "pulse 1.5s ease-in-out infinite" }} />
      <div className="flex-1 flex flex-col gap-2 pt-0.5">
        <div className="flex gap-2">
          <div style={{ width: "60px", height: "10px", borderRadius: "4px", background: "rgba(255,255,255,0.06)", animation: "pulse 1.5s ease-in-out infinite" }} />
          <div style={{ width: "120px", height: "10px", borderRadius: "4px", background: "rgba(255,255,255,0.04)", animation: "pulse 1.5s ease-in-out infinite 0.1s" }} />
        </div>
        <div style={{ width: "240px", height: "10px", borderRadius: "4px", background: "rgba(255,255,255,0.04)", animation: "pulse 1.5s ease-in-out infinite 0.2s" }} />
      </div>
      <div style={{ width: "48px", height: "20px", borderRadius: "8px", background: "rgba(255,255,255,0.05)", animation: "pulse 1.5s ease-in-out infinite 0.3s" }} />
    </div>
  );
}

// ── Log row ───────────────────────────────────────────────────────────────────

function LogRow({ entry, isLast }: { entry: LogEntry; isLast: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const tc = typeConfig[entry.type];
  const rc = resultConfig[entry.result];
  const TypeIcon = tc.icon;
  const ResultIcon = rc.icon;

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(`[${entry.time}] ${entry.type.toUpperCase()} — ${entry.target}: ${entry.result.toUpperCase()}. ${entry.details}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div>
      {/* Main row */}
      <div
        className="flex items-start gap-3 px-5 py-4 cursor-pointer group transition-all duration-200"
        style={{ borderBottom: expanded ? "none" : (!isLast ? "1px solid rgba(255,255,255,0.04)" : "none"), background: expanded ? "rgba(0,229,255,0.025)" : "transparent" }}
        onClick={() => setExpanded(e => !e)}
        onMouseEnter={(e) => { if (!expanded) (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.02)"; }}
        onMouseLeave={(e) => { if (!expanded) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
      >
        {/* Type icon */}
        <div className="relative shrink-0">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: tc.bg, border: `1px solid ${tc.border}`, boxShadow: expanded ? `0 0 12px ${tc.color}30` : "none" }}>
            <TypeIcon size={16} style={{ color: tc.color, filter: expanded ? `drop-shadow(0 0 4px ${tc.color})` : "none" }} />
          </div>
          {/* Pulse for alerts */}
          {entry.type === "alert" && entry.result === "blocked" && (
            <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full"
              style={{ background: "#ff4d6d", boxShadow: "0 0 6px #ff4d6d", animation: "pulse 2s infinite" }} />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span style={{ fontSize: "9px", color: tc.color, fontFamily: "'JetBrains Mono',monospace", fontWeight: 600, letterSpacing: "0.06em" }}>{tc.label}</span>
            <span style={{ fontSize: "9px", color: "var(--tq-t3)" }}>·</span>
            <span style={{ fontSize: "10px", color: "var(--tq-t2)", fontFamily: "'JetBrains Mono',monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 220 }}>{entry.target}</span>
          </div>
          <p style={{ fontSize: "11px", color: "#c4b8d8", lineHeight: 1.5, marginBottom: "2px" }}>{entry.details}</p>
        </div>

        {/* Right: result + XP + time + expand */}
        <div className="flex flex-col items-end gap-1.5 shrink-0 ml-2">
          {/* Result badge */}
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full"
            style={{ background: rc.bg, border: `1px solid ${rc.border}` }}>
            <ResultIcon size={9} style={{ color: rc.color }} />
            <span style={{ fontSize: "8px", fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, color: rc.color, letterSpacing: "0.06em" }}>{rc.label}</span>
          </div>

          {/* XP */}
          {entry.xp > 0 && (
            <div className="flex items-center gap-1">
              <Zap size={9} style={{ color: "#ffd166" }} />
              <span style={{ fontSize: "9px", fontFamily: "'JetBrains Mono',monospace", fontWeight: 600, color: "#ffd166" }}>+{entry.xp} XP</span>
            </div>
          )}

          {/* Time */}
          <div className="flex items-center gap-1">
            <Clock size={8} style={{ color: "var(--tq-t3)" }} />
            <span style={{ fontSize: "8px", color: "var(--tq-t3)", fontFamily: "'JetBrains Mono',monospace" }}>{entry.time}</span>
          </div>

          {/* Expand chevron */}
          <ChevronDown size={12} style={{ color: "var(--tq-t3)", transform: expanded ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.25s" }} />
        </div>
      </div>

      {/* Expanded panel */}
      {expanded && (
        <div className="mx-5 mb-3 rounded-xl overflow-hidden"
          style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${tc.border}`, borderTop: `2px solid ${tc.color}` }}>
          <div className="flex items-center justify-between px-4 py-2.5" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
            <span style={{ fontSize: "9px", color: tc.color, fontFamily: "'JetBrains Mono',monospace", letterSpacing: "0.1em", fontWeight: 600 }}>
              RAW EVENT DATA
            </span>
            <div className="flex items-center gap-2">
              <button onClick={handleCopy} className="flex items-center gap-1 transition-all" style={{ color: copied ? "#06d6a0" : "#6b5a80" }}>
                {copied ? <CheckCircle2 size={10} /> : <Copy size={10} />}
                <span style={{ fontSize: "8px", fontFamily: "'JetBrains Mono',monospace" }}>{copied ? "Copied" : "Copy"}</span>
              </button>
            </div>
          </div>
          {entry.extraData && (
            <div className="grid grid-cols-2 gap-px" style={{ background: "rgba(255,255,255,0.03)" }}>
              {Object.entries(entry.extraData).map(([k, v]) => (
                <div key={k} className="flex flex-col px-4 py-2.5" style={{ background: "rgba(13,1,34,0.4)" }}>
                  <span style={{ fontSize: "8px", color: "var(--tq-t3)", fontFamily: "'JetBrains Mono',monospace", letterSpacing: "0.06em", marginBottom: "2px" }}>{k.toUpperCase()}</span>
                  <span style={{ fontSize: "10px", color: "var(--tq-t1)", fontFamily: "'JetBrains Mono',monospace", wordBreak: "break-all" }}>{v}</span>
                </div>
              ))}
            </div>
          )}
          {/* Remediation hint for exposed/blocked */}
          {(entry.result === "exposed" || entry.result === "blocked" || entry.result === "warning") && (
            <div className="flex items-start gap-2 px-4 py-3" style={{ borderTop: "1px solid rgba(255,255,255,0.05)", background: `${rc.bg}` }}>
              <AlertTriangle size={12} style={{ color: rc.color, flexShrink: 0, marginTop: "1px" }} />
              <div>
                <span style={{ fontSize: "9px", fontWeight: 600, color: rc.color, fontFamily: "'JetBrains Mono',monospace", display: "block", marginBottom: "2px" }}>RECOMMENDED ACTION</span>
                <span style={{ fontSize: "10px", color: "var(--tq-t2)" }}>
                  {entry.result === "exposed" ? "Change this password immediately and enable 2FA on the affected account." : entry.result === "blocked" ? "No action required — threat was neutralized automatically." : "Avoid visiting this URL and report it if received via email."}
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Date group ────────────────────────────────────────────────────────────────

function DateGroup({ date, entries }: { date: string; entries: LogEntry[] }) {
  return (
    <div>
      {/* Date marker */}
      <div className="flex items-center gap-3 px-5 py-2">
        <span style={{ fontSize: "9px", color: "var(--tq-t3)", fontFamily: "'JetBrains Mono',monospace", letterSpacing: "0.1em", whiteSpace: "nowrap" }}>{date.toUpperCase()}</span>
        <div style={{ flex: 1, height: "1px", background: "linear-gradient(90deg,rgba(0,229,255,0.15),transparent)" }} />
        <span style={{ fontSize: "8px", color: "var(--tq-t3)", fontFamily: "'JetBrains Mono',monospace" }}>{entries.length} event{entries.length !== 1 ? "s" : ""}</span>
      </div>
      {/* Entries */}
      <div>
        {entries.map((e, i) => (
          <LogRow key={e.id} entry={e} isLast={i === entries.length - 1} />
        ))}
      </div>
    </div>
  );
}

// ── Stats strip ───────────────────────────────────────────────────────────────

function StatsStrip() {
  const stats = [
    { icon: BarChart3,  label: "Total Scans",      value: "1,248", color: "#00e5ff", sub: "+12 today" },
    { icon: ShieldX,    label: "Threats Deflected", value: "42",    color: "#ff4d6d", sub: "91% block rate" },
    { icon: Zap,        label: "XP Harvested",      value: "3,450", color: "#ffd166", sub: "From 86 events", prefix: "+" },
    { icon: Trophy,     label: "Badges Earned",     value: "8",     color: "#a855f7", sub: "3 this week" },
  ];

  return (
    <div className="grid grid-cols-4 gap-3 mb-5">
      {stats.map((s) => (
        <GlassCard key={s.label} className="p-4" style={{ border: `1px solid ${s.color}20` }}>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${s.color}12`, border: `1px solid ${s.color}25` }}>
              <s.icon size={13} style={{ color: s.color }} />
            </div>
            <span style={{ fontSize: "9px", color: "var(--tq-t3)", fontFamily: "'JetBrains Mono',monospace" }}>{s.label}</span>
          </div>
          <div style={{ fontFamily: "'Orbitron',monospace", fontSize: "20px", fontWeight: 800, color: s.color, lineHeight: 1, textShadow: `0 0 16px ${s.color}50` }}>
            {s.prefix}{s.value}
          </div>
          <div style={{ fontSize: "8px", color: "var(--tq-t3)", fontFamily: "'JetBrains Mono',monospace", marginTop: "4px" }}>{s.sub}</div>
        </GlassCard>
      ))}
    </div>
  );
}

// ── Toolbar ───────────────────────────────────────────────────────────────────

function Toolbar({
  search, onSearch, activeFilter, onFilter, onExport, onClear, total
}: {
  search: string; onSearch: (v: string) => void;
  activeFilter: FilterCat; onFilter: (f: FilterCat) => void;
  onExport: () => void; onClear: () => void; total: number;
}) {
  return (
    <div className="flex flex-col gap-3 mb-4">
      {/* Search + actions */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "var(--tq-t3)" }} />
          <input
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Filter logs by URL, email, or event type…"
            className="w-full pl-9 pr-4 py-2.5 rounded-xl outline-none transition-all"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(0,229,255,0.12)", color: "var(--tq-t1)", fontSize: "11px", fontFamily: "'JetBrains Mono',monospace" }}
            onFocus={e => { (e.target as HTMLInputElement).style.borderColor = "rgba(0,229,255,0.35)"; (e.target as HTMLInputElement).style.boxShadow = "0 0 14px rgba(0,229,255,0.1)"; }}
            onBlur={e => { (e.target as HTMLInputElement).style.borderColor = "rgba(0,229,255,0.12)"; (e.target as HTMLInputElement).style.boxShadow = "none"; }}
          />
          {search && (
            <button onClick={() => onSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "var(--tq-t3)" }}>
              <span style={{ fontSize: "14px", lineHeight: 1 }}>×</span>
            </button>
          )}
        </div>
        <button onClick={onExport}
          className="flex items-center gap-2 px-3 py-2.5 rounded-xl transition-all"
          style={{ background: "rgba(0,229,255,0.06)", border: "1px solid rgba(0,229,255,0.2)", color: "#00e5ff", fontSize: "11px", fontFamily: "'JetBrains Mono',monospace", whiteSpace: "nowrap" }}>
          <Download size={12} /> Export CSV
        </button>
        <button onClick={onClear}
          className="flex items-center gap-2 px-3 py-2.5 rounded-xl transition-all"
          style={{ background: "rgba(255,77,109,0.06)", border: "1px solid rgba(255,77,109,0.2)", color: "#ff4d6d", fontSize: "11px", fontFamily: "'JetBrains Mono',monospace", whiteSpace: "nowrap" }}>
          <Trash2 size={12} /> Clear
        </button>
      </div>

      {/* Filter pills */}
      <div className="flex items-center gap-2 flex-wrap">
        <Filter size={11} style={{ color: "var(--tq-t3)" }} />
        {filterConfig.map(f => {
          const active = activeFilter === f.id;
          return (
            <button key={f.id} onClick={() => onFilter(f.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all duration-200"
              style={{ background: active ? `${f.color}12` : "rgba(255,255,255,0.03)", border: active ? `1px solid ${f.color}35` : "1px solid rgba(255,255,255,0.07)", color: active ? f.color : "#6b5a80", boxShadow: active ? `0 0 12px ${f.color}15` : "none" }}>
              <span style={{ fontSize: "11px" }}>{f.emoji}</span>
              <span style={{ fontSize: "10px", fontWeight: active ? 600 : 400, fontFamily: "'JetBrains Mono',monospace" }}>{f.label}</span>
            </button>
          );
        })}
        {total > 0 && (
          <span style={{ fontSize: "9px", color: "var(--tq-t3)", fontFamily: "'JetBrains Mono',monospace", marginLeft: "auto" }}>
            {total} result{total !== 1 ? "s" : ""}
          </span>
        )}
      </div>
    </div>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────

function EmptyState({ hasSearch }: { hasSearch: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: "rgba(0,229,255,0.07)", border: "1px solid rgba(0,229,255,0.15)" }}>
        <Activity size={28} style={{ color: "#00e5ff", filter: "drop-shadow(0 0 8px #00e5ff)" }} />
      </div>
      <div>
        <div style={{ fontFamily: "'Orbitron',monospace", fontSize: "13px", color: "var(--tq-t2)", textAlign: "center", marginBottom: "6px" }}>
          {hasSearch ? "No matching events" : "No activity yet"}
        </div>
        <p style={{ fontSize: "10px", color: "var(--tq-t3)", textAlign: "center", maxWidth: 280, lineHeight: 1.6 }}>
          {hasSearch ? "Try a different search term or clear your filters." : "Your security events will appear here as you scan URLs, check for leaks, and earn badges."}
        </p>
      </div>
      {!hasSearch && (
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all"
          style={{ background: "linear-gradient(135deg,#00e5ff,#a855f7)", color: "#0d0122", fontWeight: 700, fontSize: "12px", boxShadow: "0 0 20px rgba(0,229,255,0.3)" }}>
          <ScanLine size={13} /> Run a New Scan
        </button>
      )}
    </div>
  );
}

// ── Load more ────────────────────────────────────────────────────────────────

function LoadMoreButton({ onClick, loading }: { onClick: () => void; loading: boolean }) {
  return (
    <div className="flex justify-center py-6">
      <button onClick={onClick} disabled={loading}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all"
        style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(0,229,255,0.15)", color: loading ? "#6b5a80" : "#00e5ff", fontSize: "11px", fontFamily: "'JetBrains Mono',monospace" }}>
        {loading ? <RefreshCw size={12} className="animate-spin" /> : <ChevronDown size={12} />}
        {loading ? "Loading…" : "Load More Entries"}
      </button>
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────

const PAGE_SIZE = 6;

export function ActivityLog() {
  const [search, setSearch]           = useState("");
  const [filter, setFilter]           = useState<FilterCat>("all");
  const [loading, setLoading]         = useState(true);
  const [page, setPage]               = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [logs, setLogs]               = useState<LogEntry[]>([]);
  const [cleared, setCleared]         = useState(false);

  // Simulate initial load
  useEffect(() => {
    const t = setTimeout(() => { setLogs(ALL_LOGS); setLoading(false); }, 900);
    return () => clearTimeout(t);
  }, []);

  const filtered = useMemo(() => {
    return logs.filter(e => {
      const matchesFilter = filter === "all" || e.type === filter;
      const q = search.toLowerCase();
      const matchesSearch = !q || e.target.toLowerCase().includes(q) || e.type.includes(q) || e.details.toLowerCase().includes(q) || e.result.includes(q);
      return matchesFilter && matchesSearch;
    });
  }, [logs, filter, search]);

  // Group by date
  const grouped = useMemo(() => {
    const map = new Map<string, LogEntry[]>();
    filtered.slice(0, page * PAGE_SIZE).forEach(e => {
      if (!map.has(e.date)) map.set(e.date, []);
      map.get(e.date)!.push(e);
    });
    return Array.from(map.entries());
  }, [filtered, page]);

  const handleLoadMore = () => {
    setLoadingMore(true);
    setTimeout(() => { setPage(p => p + 1); setLoadingMore(false); }, 700);
  };

  const handleExport = () => {
    const rows = [["ID","Time","Date","Type","Target","Result","XP","Details"], ...filtered.map(e => [e.id, e.time, e.date, e.type, e.target, e.result, e.xp, e.details])];
    const csv = rows.map(r => r.map(c => `"${c}"`).join(",")).join("\n");
    const a = document.createElement("a"); a.href = "data:text/csv;charset=utf-8," + encodeURIComponent(csv); a.download = "threatquest-activity-log.csv"; a.click();
  };

  const handleClear = () => { setLogs([]); setCleared(true); };

  const hasMore = page * PAGE_SIZE < filtered.length;
  const totalXPInView = filtered.reduce((a, e) => a + e.xp, 0);

  return (
    <div className="flex-1 overflow-y-auto px-6 py-5">
      {/* Page header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Activity size={16} style={{ color: "#00e5ff", filter: "drop-shadow(0 0 6px #00e5ff)" }} />
            <h1 style={{ fontFamily: "'Orbitron',monospace", fontWeight: 700, fontSize: "16px", color: "var(--tq-t1)", letterSpacing: "0.05em" }}>
              Activity Log
            </h1>
          </div>
          <p style={{ fontSize: "10px", color: "var(--tq-t3)", fontFamily: "'JetBrains Mono',monospace" }}>
            Chronological record of scans, detected anomalies, and defensive achievements
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full" style={{ background: "rgba(0,229,255,0.07)", border: "1px solid rgba(0,229,255,0.18)" }}>
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#00e5ff", boxShadow: "0 0 6px #00e5ff", animation: "pulse 2s infinite" }} />
            <span style={{ fontSize: "9px", color: "#00e5ff", fontFamily: "'JetBrains Mono',monospace" }}>LIVE AUDIT</span>
          </div>
        </div>
      </div>

      {/* Stats strip */}
      <StatsStrip />

      {/* Toolbar */}
      <Toolbar
        search={search} onSearch={s => { setSearch(s); setPage(1); }}
        activeFilter={filter} onFilter={f => { setFilter(f); setPage(1); }}
        onExport={handleExport} onClear={handleClear}
        total={filtered.length}
      />

      {/* Timeline feed */}
      <GlassCard style={{ overflow: "hidden" }}>
        {/* Timeline header */}
        <div className="flex items-center justify-between px-5 py-3" style={{ borderBottom: "1px solid rgba(0,229,255,0.08)" }}>
          <div className="flex items-center gap-2">
            <Clock size={12} style={{ color: "#00e5ff" }} />
            <span style={{ fontSize: "10px", fontFamily: "'Orbitron',monospace", color: "#00e5ff", letterSpacing: "0.08em" }}>SECURITY AUDIT TRAIL</span>
          </div>
          {!loading && filtered.length > 0 && (
            <div className="flex items-center gap-3">
              <span style={{ fontSize: "9px", color: "var(--tq-t3)", fontFamily: "'JetBrains Mono',monospace" }}>
                Showing {Math.min(page * PAGE_SIZE, filtered.length)}/{filtered.length} events
              </span>
              {totalXPInView > 0 && (
                <div className="flex items-center gap-1">
                  <Zap size={10} style={{ color: "#ffd166" }} />
                  <span style={{ fontSize: "9px", color: "#ffd166", fontFamily: "'JetBrains Mono',monospace", fontWeight: 600 }}>+{totalXPInView} XP total</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Content */}
        {loading ? (
          <div>
            {Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)}
          </div>
        ) : grouped.length === 0 ? (
          <EmptyState hasSearch={!!search || filter !== "all"} />
        ) : (
          <div>
            {grouped.map(([date, entries], gi) => (
              <div key={date} style={{ borderBottom: gi < grouped.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
                <DateGroup date={date} entries={entries} />
              </div>
            ))}

            {/* Load more */}
            {hasMore && <LoadMoreButton onClick={handleLoadMore} loading={loadingMore} />}

            {/* End marker */}
            {!hasMore && filtered.length > 0 && (
              <div className="flex items-center gap-3 px-5 py-4">
                <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.05)" }} />
                <span style={{ fontSize: "8px", color: "var(--tq-t3)", fontFamily: "'JetBrains Mono',monospace", letterSpacing: "0.08em" }}>END OF LOG · {filtered.length} EVENTS</span>
                <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.05)" }} />
              </div>
            )}
          </div>
        )}
      </GlassCard>

      <div className="pb-8" />
    </div>
  );
}
