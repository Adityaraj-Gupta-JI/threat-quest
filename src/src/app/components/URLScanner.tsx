import { useState, useRef, useCallback, useEffect } from "react";
import {
  Search, Upload, FileText, Globe, Shield, ShieldAlert, ShieldCheck,
  ShieldX, AlertTriangle, CheckCircle2, XCircle, Clock, Copy,
  ChevronDown, ChevronRight, Loader2, Link2, Server, Lock,
  Calendar, Database, Wifi, Hash, RefreshCw, X, Plus,
  BarChart3, Eye, Zap, FileSearch, Layers, Radio
} from "lucide-react";

// ── types ──────────────────────────────────────────────────────────────────────

type ScanMode = "single" | "bulk" | "csv" | "api";
type ScanStatus = "idle" | "queued" | "scanning" | "done" | "error";
type TrustLevel = "safe" | "suspicious" | "malicious" | "unknown";

interface ScanResult {
  id: string;
  originalUrl: string;
  normalizedUrl: string;
  canonical: string;
  trustLevel: TrustLevel;
  trustScore: number;
  categories: string[];
  submittedAt: string;
  scannedAt: string;
  isDuplicate: boolean;
  trackingParamsRemoved: string[];
  whois: {
    registrar: string;
    created: string;
    expires: string;
    domainAge: string;
    country: string;
  };
  dns: {
    aRecord: string;
    mxRecord: string;
    nameservers: string[];
    ttl: string;
  };
  ssl: {
    valid: boolean;
    issuer: string;
    expires: string;
    daysLeft: number;
    grade: string;
  };
  threats: { type: string; detail: string; severity: "critical" | "high" | "medium" | "low" }[];
}

// ── mock generator ─────────────────────────────────────────────────────────────

const randomIp = () => `${randInt(10, 250)}.${randInt(0, 255)}.${randInt(0, 255)}.${randInt(1, 254)}`;
const randInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

function buildMockResult(url: string, id: string): ScanResult {
  const isBad = /phish|malware|hack|evil|badsite|trojan/i.test(url);
  const isSus = /free-download|click-here|bit\.ly|short\.cc|redirect/i.test(url);

  let trustScore = isBad ? randInt(2, 22) : isSus ? randInt(35, 60) : randInt(72, 99);
  let trustLevel: TrustLevel = isBad ? "malicious" : isSus ? "suspicious" : "safe";

  const tracking: string[] = [];
  if (url.includes("utm_")) tracking.push("utm_source", "utm_medium", "utm_campaign");
  if (url.includes("fbclid")) tracking.push("fbclid");
  if (url.includes("gclid")) tracking.push("gclid");

  const domain = (() => {
    try { return new URL(url.startsWith("http") ? url : "https://" + url).hostname; }
    catch { return url; }
  })();

  const sslDays = randInt(10, 380);
  const sslGrade = sslDays > 60 ? "A+" : sslDays > 20 ? "B" : "F";

  return {
    id,
    originalUrl: url,
    normalizedUrl: url.startsWith("http") ? url.toLowerCase() : `https://${url.toLowerCase()}`,
    canonical: `https://${domain}/`,
    trustLevel,
    trustScore,
    categories: isBad
      ? ["Phishing", "Malware Distribution"]
      : isSus ? ["Suspicious Redirect", "Shortened URL"]
      : ["Web Application", "SaaS"],
    submittedAt: new Date().toISOString(),
    scannedAt: new Date(Date.now() + 2200).toISOString(),
    isDuplicate: Math.random() < 0.15,
    trackingParamsRemoved: tracking,
    whois: {
      registrar: isBad ? "AnonDomain Ltd." : "GoDaddy, Inc.",
      created: isBad ? "2024-11-03" : "2018-04-12",
      expires: "2026-04-12",
      domainAge: isBad ? "7 months" : "6 years 2 months",
      country: isBad ? "RU" : "US",
    },
    dns: {
      aRecord: randomIp(),
      mxRecord: isBad ? "N/A" : `mail.${domain}`,
      nameservers: isBad
        ? ["ns1.cheaphost.xyz", "ns2.cheaphost.xyz"]
        : ["ns1.cloudflare.com", "ns2.cloudflare.com"],
      ttl: "300s",
    },
    ssl: {
      valid: !isBad,
      issuer: isBad ? "Self-signed" : "Let's Encrypt Authority X3",
      expires: new Date(Date.now() + sslDays * 864e5).toISOString().split("T")[0],
      daysLeft: sslDays,
      grade: sslGrade,
    },
    threats: isBad
      ? [
          { type: "Phishing Kit Detected", detail: "HTML form harvesting credentials — matches known phishing template #TK-449", severity: "critical" },
          { type: "Malicious Script", detail: "Obfuscated JS with eval() redirect chain identified", severity: "high" },
        ]
      : isSus
      ? [{ type: "Suspicious Redirect", detail: "Chain of 3+ redirects detected before landing page", severity: "medium" }]
      : [],
  };
}

// ── helpers ────────────────────────────────────────────────────────────────────

const trustConfig: Record<TrustLevel, { color: string; bg: string; border: string; icon: typeof ShieldCheck; label: string; glow: string }> = {
  safe:       { color: "#06d6a0", bg: "#06d6a012", border: "#06d6a030", icon: ShieldCheck, label: "SAFE",       glow: "rgba(6,214,160,0.2)" },
  suspicious: { color: "#ffd166", bg: "#ffd16612", border: "#ffd16630", icon: ShieldAlert, label: "SUSPICIOUS", glow: "rgba(255,209,102,0.2)" },
  malicious:  { color: "#ff4d6d", bg: "#ff4d6d12", border: "#ff4d6d30", icon: ShieldX,    label: "MALICIOUS",  glow: "rgba(255,77,109,0.25)" },
  unknown:    { color: "var(--tq-t2)", bg: "#8b7aa812", border: "#8b7aa830", icon: Shield,      label: "UNKNOWN",    glow: "rgba(139,122,168,0.15)" },
};

const severityColor = { critical: "#ff4d6d", high: "#ffd166", medium: "#00e5ff", low: "#06d6a0" } as const;

function GlassCard({ children, className = "", style = {} }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  return (
    <div className={`rounded-2xl ${className}`} style={{ background: "linear-gradient(135deg,var(--tq-card),var(--tq-overlay))", border: "1px solid var(--tq-card-b)", backdropFilter: "blur(12px)", ...style }}>
      {children}
    </div>
  );
}

function CardLabel({ icon: Icon, label, color }: { icon: typeof Search; label: string; color: string }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <Icon size={13} style={{ color, filter: `drop-shadow(0 0 4px ${color})` }} />
      <span style={{ fontSize: "11px", fontFamily: "'Orbitron', monospace", color, letterSpacing: "0.1em" }}>{label}</span>
    </div>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
      style={{ color: copied ? "#06d6a0" : "#6b5a80", transition: "color 0.2s" }}
    >
      {copied ? <CheckCircle2 size={11} /> : <Copy size={11} />}
    </button>
  );
}

// ── Score Ring ─────────────────────────────────────────────────────────────────

function ScoreRing({ score, color }: { score: number; color: string }) {
  const r = 30, circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  return (
    <svg width={76} height={76} viewBox="0 0 76 76">
      <circle cx={38} cy={38} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={7} />
      <circle cx={38} cy={38} r={r} fill="none" stroke={color} strokeWidth={7}
        strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
        transform="rotate(-90 38 38)" style={{ filter: `drop-shadow(0 0 6px ${color})`, transition: "stroke-dashoffset 0.8s ease" }} />
      <text x={38} y={43} textAnchor="middle" fill={color} fontSize={14} fontFamily="'Orbitron',monospace" fontWeight={800}>{score}</text>
    </svg>
  );
}

// ── Scan Input Panel ──────────────────────────────────────────────────────────

function ScanInput({ onScan }: { onScan: (urls: string[]) => void }) {
  const [mode, setMode] = useState<ScanMode>("single");
  const [singleUrl, setSingleUrl] = useState("");
  const [bulkText, setBulkText] = useState("");
  const [dragging, setDragging] = useState(false);
  const [csvName, setCsvName] = useState<string | null>(null);
  const [apiEndpoint, setApiEndpoint] = useState("https://api.yourapp.com/submit-url");
  const fileRef = useRef<HTMLInputElement>(null);

  const modes: { id: ScanMode; label: string; icon: typeof Search }[] = [
    { id: "single", label: "Single URL", icon: Search },
    { id: "bulk",   label: "Bulk Input", icon: Layers },
    { id: "csv",    label: "CSV Import", icon: FileText },
    { id: "api",    label: "API / Extension", icon: Radio },
  ];

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file?.name.endsWith(".csv")) { setCsvName(file.name); setMode("csv"); }
    else if (file?.name.endsWith(".txt")) {
      const reader = new FileReader();
      reader.onload = (ev) => { setBulkText(ev.target?.result as string ?? ""); setMode("bulk"); };
      reader.readAsText(file);
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) { setCsvName(file.name); }
  };

  const submit = () => {
    if (mode === "single" && singleUrl.trim()) { onScan([singleUrl.trim()]); setSingleUrl(""); }
    else if (mode === "bulk" && bulkText.trim()) {
      const urls = bulkText.split(/\n|,/).map(u => u.trim()).filter(Boolean);
      onScan(urls); setBulkText("");
    } else if (mode === "csv" && csvName) { onScan(["https://github.com", "https://malware-test.phish", "https://bit.ly/3xR9mQ2"]); setCsvName(null); }
  };

  return (
    <GlassCard className="p-5">
      <CardLabel icon={FileSearch} label="URL SUBMISSION" color="#00e5ff" />

      {/* Mode tabs */}
      <div className="flex gap-1.5 mb-4 p-1 rounded-xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
        {modes.map((m) => {
          const active = mode === m.id;
          return (
            <button key={m.id} onClick={() => setMode(m.id)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg transition-all duration-200"
              style={{ background: active ? "rgba(0,229,255,0.1)" : "transparent", border: active ? "1px solid #00e5ff25" : "1px solid transparent", color: active ? "#00e5ff" : "#6b5a80" }}
            >
              <m.icon size={11} />
              <span style={{ fontSize: "10px", fontFamily: "'JetBrains Mono', monospace", fontWeight: active ? 600 : 400 }}>{m.label}</span>
            </button>
          );
        })}
      </div>

      {/* Drag-and-drop zone — always visible */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className="mb-4 rounded-xl flex flex-col items-center justify-center gap-2 transition-all duration-200 cursor-pointer"
        style={{
          height: 70,
          border: `2px dashed ${dragging ? "#00e5ff" : "rgba(0,229,255,0.2)"}`,
          background: dragging ? "rgba(0,229,255,0.06)" : "rgba(255,255,255,0.02)",
          boxShadow: dragging ? "0 0 20px rgba(0,229,255,0.12)" : "none",
        }}
        onClick={() => fileRef.current?.click()}
      >
        <Upload size={16} style={{ color: dragging ? "#00e5ff" : "#6b5a80" }} />
        <span style={{ fontSize: "10px", color: dragging ? "#00e5ff" : "#6b5a80", fontFamily: "'JetBrains Mono', monospace" }}>
          {dragging ? "Drop to import" : "Drag & drop .csv or .txt · or click to browse"}
        </span>
        <input ref={fileRef} type="file" accept=".csv,.txt" className="hidden" onChange={handleFileChange} />
      </div>

      {/* Mode-specific input */}
      {mode === "single" && (
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Link2 size={12} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "var(--tq-t3)" }} />
            <input
              value={singleUrl}
              onChange={(e) => setSingleUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submit()}
              placeholder="https://example.com/page?utm_source=email"
              className="w-full pl-8 pr-3 py-2.5 rounded-xl outline-none"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid #00e5ff1a", color: "var(--tq-t1)", fontSize: "11px", fontFamily: "'JetBrains Mono', monospace" }}
            />
          </div>
          <button onClick={submit} disabled={!singleUrl.trim()}
            className="px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-all"
            style={{ background: singleUrl.trim() ? "linear-gradient(135deg,#00e5ff,#a855f7)" : "rgba(255,255,255,0.05)", color: singleUrl.trim() ? "#0d0122" : "#6b5a80", fontWeight: 600, fontSize: "11px", boxShadow: singleUrl.trim() ? "0 0 16px rgba(0,229,255,0.25)" : "none" }}>
            <Search size={13} /> Scan
          </button>
        </div>
      )}

      {mode === "bulk" && (
        <div>
          <textarea
            value={bulkText}
            onChange={(e) => setBulkText(e.target.value)}
            placeholder={"https://example.com\nhttps://another.com\nhttps://third.org"}
            rows={5}
            className="w-full px-3 py-2.5 rounded-xl outline-none resize-none"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid #00e5ff1a", color: "var(--tq-t1)", fontSize: "11px", fontFamily: "'JetBrains Mono', monospace", lineHeight: 1.7 }}
          />
          <div className="flex items-center justify-between mt-2">
            <span style={{ fontSize: "9px", color: "var(--tq-t3)", fontFamily: "'JetBrains Mono', monospace" }}>
              {bulkText ? `${bulkText.split("\n").filter(Boolean).length} URLs detected` : "One URL per line, or comma-separated"}
            </span>
            <button onClick={submit} disabled={!bulkText.trim()}
              className="px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all"
              style={{ background: bulkText.trim() ? "linear-gradient(135deg,#00e5ff,#a855f7)" : "rgba(255,255,255,0.05)", color: bulkText.trim() ? "#0d0122" : "#6b5a80", fontWeight: 600, fontSize: "11px" }}>
              <Layers size={12} /> Scan All
            </button>
          </div>
        </div>
      )}

      {mode === "csv" && (
        <div className="flex flex-col gap-3">
          {csvName ? (
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl" style={{ background: "rgba(0,229,255,0.06)", border: "1px solid #00e5ff25" }}>
              <FileText size={14} style={{ color: "#00e5ff" }} />
              <span style={{ fontSize: "11px", color: "var(--tq-t1)", flex: 1, fontFamily: "'JetBrains Mono', monospace" }}>{csvName}</span>
              <button onClick={() => setCsvName(null)}><X size={12} style={{ color: "var(--tq-t3)" }} /></button>
            </div>
          ) : (
            <button onClick={() => fileRef.current?.click()}
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px dashed #00e5ff25", color: "var(--tq-t2)", fontSize: "11px" }}>
              <Upload size={13} /> Select CSV file
            </button>
          )}
          <div className="flex items-center gap-2">
            <span style={{ fontSize: "9px", color: "var(--tq-t3)", fontFamily: "'JetBrains Mono', monospace" }}>Expected columns:</span>
            {["url", "label", "priority"].map(c => (
              <span key={c} className="px-1.5 py-0.5 rounded" style={{ fontSize: "8px", color: "#00e5ff", background: "rgba(0,229,255,0.08)", fontFamily: "'JetBrains Mono', monospace" }}>{c}</span>
            ))}
          </div>
          <button onClick={submit} disabled={!csvName}
            className="px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all self-end"
            style={{ background: csvName ? "linear-gradient(135deg,#00e5ff,#a855f7)" : "rgba(255,255,255,0.05)", color: csvName ? "#0d0122" : "#6b5a80", fontWeight: 600, fontSize: "11px" }}>
            <FileText size={12} /> Import &amp; Scan
          </button>
        </div>
      )}

      {mode === "api" && (
        <div className="flex flex-col gap-3">
          <div className="p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <div style={{ fontSize: "9px", color: "var(--tq-t3)", fontFamily: "'JetBrains Mono', monospace", marginBottom: "6px", letterSpacing: "0.08em" }}>API ENDPOINT</div>
            <div className="flex items-center gap-2">
              <code style={{ fontSize: "10px", color: "#00e5ff", fontFamily: "'JetBrains Mono', monospace", flex: 1, wordBreak: "break-all" }}>{apiEndpoint}</code>
              <CopyButton text={apiEndpoint} />
            </div>
          </div>
          <div className="p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <div style={{ fontSize: "9px", color: "var(--tq-t3)", fontFamily: "'JetBrains Mono', monospace", marginBottom: "6px", letterSpacing: "0.08em" }}>EXAMPLE REQUEST</div>
            <pre style={{ fontSize: "9px", color: "#a855f7", fontFamily: "'JetBrains Mono', monospace", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
{`POST /submit-url
Authorization: Bearer YOUR_API_KEY

{
  "url": "https://example.com",
  "priority": "high",
  "tags": ["email-campaign"]
}`}
            </pre>
          </div>
          <div className="flex gap-2 flex-wrap">
            {["Chrome Extension", "Firefox Add-on", "Safari Extension"].map(ext => (
              <span key={ext} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg cursor-pointer transition-all"
                style={{ background: "rgba(168,85,247,0.08)", border: "1px solid rgba(168,85,247,0.2)", fontSize: "10px", color: "#a855f7" }}>
                <Globe size={10} /> {ext}
              </span>
            ))}
          </div>
        </div>
      )}
    </GlassCard>
  );
}

// ── Scan Queue ─────────────────────────────────────────────────────────────────

function ScanQueue({ items, onSelect, selectedId }: { items: { id: string; url: string; status: ScanStatus; progress: number }[]; onSelect: (id: string) => void; selectedId: string | null }) {
  if (items.length === 0) return null;

  const statusIcon: Record<ScanStatus, { icon: typeof Loader2; color: string }> = {
    idle:     { icon: Clock,        color: "var(--tq-t3)" },
    queued:   { icon: Clock,        color: "var(--tq-t2)" },
    scanning: { icon: Loader2,      color: "#00e5ff" },
    done:     { icon: CheckCircle2, color: "#06d6a0" },
    error:    { icon: XCircle,      color: "#ff4d6d" },
  };

  return (
    <GlassCard className="p-4">
      <CardLabel icon={Layers} label="SCAN QUEUE" color="#a855f7" />
      <div className="flex flex-col gap-1.5" style={{ maxHeight: 200, overflowY: "auto" }}>
        {items.map((item) => {
          const st = statusIcon[item.status];
          const Ic = st.icon;
          const isSelected = item.id === selectedId;
          return (
            <div key={item.id}
              onClick={() => item.status === "done" && onSelect(item.id)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all duration-200"
              style={{ background: isSelected ? "rgba(0,229,255,0.06)" : "rgba(255,255,255,0.02)", border: isSelected ? "1px solid #00e5ff25" : "1px solid rgba(255,255,255,0.04)", cursor: item.status === "done" ? "pointer" : "default" }}
            >
              <Ic size={12} style={{ color: st.color, flexShrink: 0 }} className={item.status === "scanning" ? "animate-spin" : ""} />
              <span style={{ fontSize: "10px", color: "var(--tq-t2)", fontFamily: "'JetBrains Mono', monospace", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.url}</span>
              {item.status === "scanning" && (
                <div className="w-14 rounded-full overflow-hidden" style={{ height: 3, background: "rgba(255,255,255,0.07)" }}>
                  <div style={{ width: `${item.progress}%`, height: "100%", background: "#00e5ff", transition: "width 0.3s", boxShadow: "0 0 4px #00e5ff" }} />
                </div>
              )}
              <span style={{ fontSize: "8px", fontFamily: "'JetBrains Mono', monospace", color: st.color, fontWeight: 600, textTransform: "uppercase" }}>{item.status}</span>
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
}

// ── Result Detail ──────────────────────────────────────────────────────────────

function ResultDetail({ result }: { result: ScanResult }) {
  const [tab, setTab] = useState<"overview" | "whois" | "dns" | "ssl" | "threats">("overview");
  const cfg = trustConfig[result.trustLevel];
  const TrustIcon = cfg.icon;

  const tabs: { id: typeof tab; label: string; icon: typeof Eye }[] = [
    { id: "overview", label: "Overview", icon: Eye },
    { id: "whois",    label: "WHOIS",    icon: Globe },
    { id: "dns",      label: "DNS",      icon: Server },
    { id: "ssl",      label: "SSL",      icon: Lock },
    { id: "threats",  label: `Threats${result.threats.length ? ` (${result.threats.length})` : ""}`, icon: ShieldAlert },
  ];

  return (
    <GlassCard className="p-5 flex flex-col gap-4" style={{ border: `1px solid ${cfg.border}` }}>
      {/* Trust header */}
      <div className="flex items-start gap-4">
        <ScoreRing score={result.trustScore} color={cfg.color} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full" style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}>
              <TrustIcon size={12} style={{ color: cfg.color }} />
              <span style={{ fontSize: "10px", fontFamily: "'Orbitron', monospace", color: cfg.color, letterSpacing: "0.08em" }}>{cfg.label}</span>
            </div>
            {result.isDuplicate && (
              <span className="px-2 py-0.5 rounded-full" style={{ fontSize: "8px", fontFamily: "'JetBrains Mono', monospace", color: "#ffd166", background: "rgba(255,209,102,0.1)", border: "1px solid rgba(255,209,102,0.2)" }}>
                DUPLICATE DETECTED
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 mb-1">
            <span style={{ fontSize: "11px", color: "var(--tq-t2)", fontFamily: "'JetBrains Mono', monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 340 }}>{result.originalUrl}</span>
            <CopyButton text={result.originalUrl} />
          </div>
          <div className="flex gap-1 flex-wrap">
            {result.categories.map(c => (
              <span key={c} className="px-1.5 py-0.5 rounded" style={{ fontSize: "8px", color: "var(--tq-t2)", background: "rgba(255,255,255,0.05)", fontFamily: "'JetBrains Mono', monospace" }}>{c}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Normalized / Canonical */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "NORMALIZED URL",  value: result.normalizedUrl, icon: Link2 },
          { label: "CANONICAL URL",   value: result.canonical,     icon: Globe },
        ].map(row => (
          <div key={row.label} className="p-2.5 rounded-xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="flex items-center gap-1 mb-1">
              <row.icon size={9} style={{ color: "var(--tq-t3)" }} />
              <span style={{ fontSize: "8px", color: "var(--tq-t3)", fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.08em" }}>{row.label}</span>
            </div>
            <div className="flex items-center gap-1">
              <span style={{ fontSize: "9px", color: "#00e5ff", fontFamily: "'JetBrains Mono', monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>{row.value}</span>
              <CopyButton text={row.value} />
            </div>
          </div>
        ))}
      </div>

      {/* Tracking params removed */}
      {result.trackingParamsRemoved.length > 0 && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: "rgba(168,85,247,0.07)", border: "1px solid rgba(168,85,247,0.18)" }}>
          <Hash size={11} style={{ color: "#a855f7" }} />
          <span style={{ fontSize: "10px", color: "#a855f7", fontFamily: "'JetBrains Mono', monospace" }}>Tracking params removed:</span>
          <div className="flex gap-1 flex-wrap">
            {result.trackingParamsRemoved.map(p => (
              <span key={p} className="px-1.5 py-0.5 rounded" style={{ fontSize: "8px", color: "var(--tq-t2)", background: "rgba(255,255,255,0.06)", fontFamily: "'JetBrains Mono', monospace" }}>?{p}</span>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
        {tabs.map(t => {
          const active = tab === t.id;
          return (
            <button key={t.id} onClick={() => setTab(t.id)}
              className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg transition-all"
              style={{ background: active ? "rgba(0,229,255,0.1)" : "transparent", border: active ? "1px solid #00e5ff25" : "1px solid transparent", color: active ? "#00e5ff" : "#6b5a80" }}>
              <t.icon size={10} />
              <span style={{ fontSize: "9px", fontFamily: "'JetBrains Mono', monospace", fontWeight: active ? 600 : 400 }}>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div>
        {tab === "overview" && (
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: "Submitted",    value: new Date(result.submittedAt).toLocaleTimeString(),  icon: Clock },
              { label: "Scanned",      value: new Date(result.scannedAt).toLocaleTimeString(),    icon: Zap },
              { label: "Domain Age",   value: result.whois.domainAge,                             icon: Calendar },
              { label: "Country",      value: result.whois.country,                               icon: Globe },
              { label: "SSL Grade",    value: result.ssl.grade,                                   icon: Lock },
              { label: "Trust Score",  value: `${result.trustScore}/100`,                         icon: Shield },
            ].map(row => (
              <div key={row.label} className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                <row.icon size={11} style={{ color: "var(--tq-t3)", flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: "8px", color: "var(--tq-t3)", fontFamily: "'JetBrains Mono', monospace" }}>{row.label}</div>
                  <div style={{ fontSize: "11px", color: "var(--tq-t1)", fontWeight: 500 }}>{row.value}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "whois" && (
          <div className="flex flex-col gap-2">
            {[
              { label: "Registrar",    value: result.whois.registrar },
              { label: "Created",      value: result.whois.created },
              { label: "Expires",      value: result.whois.expires },
              { label: "Domain Age",   value: result.whois.domainAge },
              { label: "Country",      value: result.whois.country },
            ].map(row => (
              <div key={row.label} className="flex items-center justify-between px-3 py-2 rounded-lg" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                <span style={{ fontSize: "10px", color: "var(--tq-t3)", fontFamily: "'JetBrains Mono', monospace" }}>{row.label}</span>
                <span style={{ fontSize: "10px", color: "var(--tq-t1)", fontFamily: "'JetBrains Mono', monospace", fontWeight: 500 }}>{row.value}</span>
              </div>
            ))}
          </div>
        )}

        {tab === "dns" && (
          <div className="flex flex-col gap-2">
            {[
              { label: "A Record",      value: result.dns.aRecord },
              { label: "MX Record",     value: result.dns.mxRecord },
              { label: "TTL",           value: result.dns.ttl },
              { label: "Nameservers",   value: result.dns.nameservers.join(", ") },
            ].map(row => (
              <div key={row.label} className="flex items-start justify-between px-3 py-2 rounded-lg" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                <span style={{ fontSize: "10px", color: "var(--tq-t3)", fontFamily: "'JetBrains Mono', monospace", flexShrink: 0, marginRight: "12px" }}>{row.label}</span>
                <span style={{ fontSize: "10px", color: "#00e5ff", fontFamily: "'JetBrains Mono', monospace", textAlign: "right", wordBreak: "break-all" }}>{row.value}</span>
              </div>
            ))}
          </div>
        )}

        {tab === "ssl" && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: result.ssl.valid ? "rgba(6,214,160,0.07)" : "rgba(255,77,109,0.07)", border: `1px solid ${result.ssl.valid ? "rgba(6,214,160,0.2)" : "rgba(255,77,109,0.2)"}` }}>
              {result.ssl.valid ? <ShieldCheck size={16} style={{ color: "#06d6a0" }} /> : <ShieldX size={16} style={{ color: "#ff4d6d" }} />}
              <div>
                <div style={{ fontSize: "11px", fontWeight: 600, color: result.ssl.valid ? "#06d6a0" : "#ff4d6d", fontFamily: "'Orbitron', monospace" }}>
                  {result.ssl.valid ? "CERTIFICATE VALID" : "INVALID CERTIFICATE"}
                </div>
                <div style={{ fontSize: "9px", color: "var(--tq-t2)" }}>Grade: <strong style={{ color: result.ssl.grade === "A+" ? "#06d6a0" : result.ssl.grade === "B" ? "#ffd166" : "#ff4d6d" }}>{result.ssl.grade}</strong> · {result.ssl.daysLeft} days remaining</div>
              </div>
            </div>
            {[
              { label: "Issuer",   value: result.ssl.issuer },
              { label: "Expires",  value: result.ssl.expires },
              { label: "Days Left",value: `${result.ssl.daysLeft} days` },
            ].map(row => (
              <div key={row.label} className="flex justify-between px-3 py-2 rounded-lg" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                <span style={{ fontSize: "10px", color: "var(--tq-t3)", fontFamily: "'JetBrains Mono', monospace" }}>{row.label}</span>
                <span style={{ fontSize: "10px", color: "var(--tq-t1)", fontFamily: "'JetBrains Mono', monospace" }}>{row.value}</span>
              </div>
            ))}
          </div>
        )}

        {tab === "threats" && (
          <div>
            {result.threats.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-6 gap-2">
                <ShieldCheck size={28} style={{ color: "#06d6a0", filter: "drop-shadow(0 0 8px #06d6a0)" }} />
                <span style={{ fontSize: "11px", color: "#06d6a0", fontFamily: "'Orbitron', monospace" }}>NO THREATS FOUND</span>
                <span style={{ fontSize: "9px", color: "var(--tq-t3)" }}>This URL appears clean ✨</span>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {result.threats.map((t, i) => (
                  <div key={i} className="p-3 rounded-xl" style={{ background: `${severityColor[t.severity]}10`, border: `1px solid ${severityColor[t.severity]}30` }}>
                    <div className="flex items-center gap-2 mb-1">
                      <AlertTriangle size={11} style={{ color: severityColor[t.severity] }} />
                      <span style={{ fontSize: "10px", fontWeight: 600, color: severityColor[t.severity] }}>{t.type}</span>
                      <span className="ml-auto px-1.5 py-0.5 rounded" style={{ fontSize: "7px", fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, color: severityColor[t.severity], background: `${severityColor[t.severity]}18`, border: `1px solid ${severityColor[t.severity]}30`, textTransform: "uppercase" }}>{t.severity}</span>
                    </div>
                    <p style={{ fontSize: "9px", color: "var(--tq-t2)", lineHeight: 1.5 }}>{t.detail}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </GlassCard>
  );
}

// ── History strip ─────────────────────────────────────────────────────────────

function HistoryStrip({ results, onSelect }: { results: ScanResult[]; onSelect: (r: ScanResult) => void }) {
  if (results.length === 0) return null;
  return (
    <GlassCard className="p-4">
      <CardLabel icon={Clock} label="SCAN HISTORY" color="#8b7aa8" />
      <div className="flex flex-col gap-1.5" style={{ maxHeight: 220, overflowY: "auto" }}>
        {results.map((r) => {
          const cfg = trustConfig[r.trustLevel];
          const Ic = cfg.icon;
          return (
            <div key={r.id} onClick={() => onSelect(r)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl cursor-pointer transition-all duration-200"
              style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(0,229,255,0.04)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.02)"; }}
            >
              <Ic size={12} style={{ color: cfg.color, flexShrink: 0 }} />
              <span style={{ fontSize: "10px", color: "var(--tq-t2)", fontFamily: "'JetBrains Mono', monospace", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.originalUrl}</span>
              <span style={{ fontSize: "9px", fontFamily: "'JetBrains Mono', monospace", fontWeight: 600, color: cfg.color }}>{cfg.label}</span>
              <span style={{ fontSize: "9px", color: "var(--tq-t3)", fontFamily: "'JetBrains Mono', monospace" }}>{r.trustScore}/100</span>
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
}

// ── Stats strip ───────────────────────────────────────────────────────────────

function StatsStrip({ results }: { results: ScanResult[] }) {
  const safe = results.filter(r => r.trustLevel === "safe").length;
  const mal  = results.filter(r => r.trustLevel === "malicious").length;
  const sus  = results.filter(r => r.trustLevel === "suspicious").length;
  const dupCount = results.filter(r => r.isDuplicate).length;

  const stats = [
    { label: "Total Scanned", value: results.length, color: "var(--tq-t1)", icon: BarChart3 },
    { label: "Safe",          value: safe,            color: "#06d6a0", icon: ShieldCheck },
    { label: "Malicious",     value: mal,             color: "#ff4d6d", icon: ShieldX },
    { label: "Suspicious",    value: sus,             color: "#ffd166", icon: ShieldAlert },
    { label: "Duplicates",    value: dupCount,        color: "#a855f7", icon: Database },
  ];

  return (
    <div className="grid grid-cols-5 gap-3">
      {stats.map(s => (
        <GlassCard key={s.label} className="p-3 text-center" style={{ border: `1px solid ${s.color}18` }}>
          <s.icon size={14} style={{ color: s.color, margin: "0 auto 4px", filter: `drop-shadow(0 0 4px ${s.color})` }} />
          <div style={{ fontFamily: "'Orbitron', monospace", fontSize: "18px", fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</div>
          <div style={{ fontSize: "8px", color: "var(--tq-t3)", fontFamily: "'JetBrains Mono', monospace", marginTop: "3px" }}>{s.label}</div>
        </GlassCard>
      ))}
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────

let idCounter = 0;

export function URLScannerPage() {
  const [queue, setQueue] = useState<{ id: string; url: string; status: ScanStatus; progress: number }[]>([]);
  const [results, setResults] = useState<ScanResult[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selectedResult = results.find(r => r.id === selectedId) ?? results[results.length - 1] ?? null;

  const handleScan = useCallback((urls: string[]) => {
    const newItems = urls.map(url => ({ id: `scan-${++idCounter}`, url, status: "queued" as ScanStatus, progress: 0 }));
    setQueue(prev => [...newItems, ...prev]);

    newItems.forEach((item, idx) => {
      const delay = idx * 400;
      setTimeout(() => {
        setQueue(prev => prev.map(q => q.id === item.id ? { ...q, status: "scanning" } : q));
        let progress = 0;
        const interval = setInterval(() => {
          progress = Math.min(progress + randInt(12, 25), 95);
          setQueue(prev => prev.map(q => q.id === item.id ? { ...q, progress } : q));
        }, 160);
        setTimeout(() => {
          clearInterval(interval);
          const result = buildMockResult(item.url, item.id);
          setQueue(prev => prev.map(q => q.id === item.id ? { ...q, status: "done", progress: 100 } : q));
          setResults(prev => [result, ...prev]);
          setSelectedId(item.id);
        }, delay + 2000);
      }, delay);
    });
  }, []);

  return (
    <div className="flex-1 overflow-y-auto px-6 py-5">
      {/* Page header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 style={{ fontSize: "16px", fontFamily: "'Orbitron', monospace", fontWeight: 700, color: "var(--tq-t1)", letterSpacing: "0.05em" }}>
              URL Scanner
            </h1>
            <span style={{ fontSize: "10px", color: "#a855f7", fontFamily: "'JetBrains Mono', monospace", background: "rgba(168,85,247,0.1)", border: "1px solid rgba(168,85,247,0.2)", padding: "2px 8px", borderRadius: "20px" }}>
              ✦ Pro
            </span>
          </div>
          <p style={{ fontSize: "10px", color: "var(--tq-t3)", fontFamily: "'JetBrains Mono', monospace" }}>
            Deep URL analysis · WHOIS · DNS · SSL · Threat Intelligence
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full" style={{ background: "rgba(6,214,160,0.08)", border: "1px solid rgba(6,214,160,0.2)" }}>
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#06d6a0", boxShadow: "0 0 6px #06d6a0" }} />
            <span style={{ fontSize: "9px", color: "#06d6a0", fontFamily: "'JetBrains Mono', monospace" }}>ENGINE ONLINE</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-4">
        <StatsStrip results={results} />
      </div>

      {/* Main layout */}
      <div className="grid grid-cols-12 gap-4 mb-4">
        {/* Left column: input + queue + history */}
        <div className="col-span-5 flex flex-col gap-4">
          <ScanInput onScan={handleScan} />
          <ScanQueue items={queue} onSelect={setSelectedId} selectedId={selectedId} />
          <HistoryStrip results={results} onSelect={(r) => setSelectedId(r.id)} />
        </div>

        {/* Right column: result detail */}
        <div className="col-span-7">
          {selectedResult ? (
            <ResultDetail result={selectedResult} />
          ) : (
            <GlassCard className="p-8 flex flex-col items-center justify-center gap-4" style={{ minHeight: 400 }}>
              <div style={{ width: 64, height: 64, borderRadius: "20px", background: "rgba(0,229,255,0.07)", border: "1px solid rgba(0,229,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Search size={26} style={{ color: "#00e5ff", filter: "drop-shadow(0 0 8px #00e5ff)" }} />
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontFamily: "'Orbitron', monospace", fontSize: "14px", color: "var(--tq-t1)", marginBottom: "6px" }}>Ready to Scan</div>
                <p style={{ fontSize: "10px", color: "var(--tq-t3)", lineHeight: 1.6, maxWidth: 280 }}>
                  Submit a URL using the panel on the left. Results will appear here with full WHOIS, DNS, SSL, and threat analysis.
                </p>
              </div>
              <div className="flex gap-3 flex-wrap justify-center">
                {["Single URL", "Bulk Upload", "CSV Import", "API"].map(f => (
                  <span key={f} className="px-2.5 py-1.5 rounded-lg" style={{ fontSize: "9px", color: "var(--tq-t2)", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", fontFamily: "'JetBrains Mono', monospace" }}>
                    ✦ {f}
                  </span>
                ))}
              </div>
            </GlassCard>
          )}
        </div>
      </div>

      <div className="pb-6" />
    </div>
  );
}
