import { useState } from "react";
import { Search, CheckCircle2, XCircle, AlertCircle, Loader2, Globe } from "lucide-react";

type ScanResult = "safe" | "danger" | "warning" | null;

const mockResults: Record<string, { status: ScanResult; detail: string; score: number }> = {
  default: { status: "safe",    detail: "No threats detected. Domain is clean ✨", score: 98 },
  bad:     { status: "danger",  detail: "Phishing site detected! Do not visit.",    score: 4  },
  warn:    { status: "warning", detail: "Suspicious redirect chain found.",         score: 52 },
};

export function URLScanWidget() {
  const [url, setUrl] = useState("");
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<{ status: ScanResult; detail: string; score: number } | null>(null);

  const handleScan = () => {
    if (!url.trim()) return;
    setScanning(true); setResult(null);
    setTimeout(() => {
      const lower = url.toLowerCase();
      if (lower.includes("malware") || lower.includes("phish")) setResult(mockResults.bad);
      else if (lower.includes("warn") || lower.includes("sus"))  setResult(mockResults.warn);
      else setResult(mockResults.default);
      setScanning(false);
    }, 1800);
  };

  const statusConfig = {
    safe:    { icon: CheckCircle2, color: "var(--tq-green)", label: "SAFE"    },
    danger:  { icon: XCircle,      color: "var(--tq-red)",   label: "DANGER"  },
    warning: { icon: AlertCircle,  color: "var(--tq-gold)",  label: "WARNING" },
  };

  return (
    <div className="rounded-2xl p-5" style={{ background: "linear-gradient(135deg,rgba(0,229,255,0.04),var(--tq-overlay))", border: "1px solid var(--tq-card-b)", backdropFilter: "blur(10px)" }}>
      <div className="flex items-center gap-2 mb-4">
        <Globe size={14} style={{ color: "var(--tq-neon)" }} />
        <h3 style={{ fontSize: "12px", color: "var(--tq-neon)", fontFamily: "'Orbitron', monospace", letterSpacing: "0.08em" }}>URL SCANNER</h3>
        <span style={{ fontSize: "9px", color: "var(--tq-t3)", fontFamily: "'JetBrains Mono', monospace", marginLeft: "auto" }}>Powered by ThreatDB v4</span>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "var(--tq-t3)" }} />
          <input value={url} onChange={(e) => setUrl(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleScan()}
            placeholder="https://example.com"
            className="w-full pl-8 pr-3 py-2.5 rounded-xl outline-none"
            style={{ background: "var(--tq-card)", border: "1px solid var(--tq-card-b)", color: "var(--tq-t1)", fontSize: "11px", fontFamily: "'JetBrains Mono', monospace" }} />
        </div>
        <button onClick={handleScan} disabled={scanning || !url.trim()}
          className="px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all duration-200"
          style={{ background: url.trim() && !scanning ? "linear-gradient(135deg,#00e5ff,#a855f7)" : "var(--tq-card)", color: url.trim() && !scanning ? "#0d0122" : "var(--tq-t3)", fontWeight: 600, fontSize: "11px" }}>
          {scanning ? <Loader2 size={13} className="animate-spin" /> : <Search size={13} />}
          {scanning ? "Scanning..." : "Scan"}
        </button>
      </div>

      {result && result.status && (() => {
        const cfg = statusConfig[result.status as NonNullable<ScanResult>];
        const Ic = cfg.icon;
        return (
          <div className="mt-4 p-3 rounded-xl flex items-start gap-3" style={{ background: "var(--tq-card)", border: `1px solid var(--tq-card-b)` }}>
            <Ic size={16} style={{ color: cfg.color, flexShrink: 0, marginTop: 1 }} />
            <div className="flex-1">
              <div style={{ fontSize: "10px", fontFamily: "'Orbitron', monospace", fontWeight: 700, color: cfg.color, letterSpacing: "0.08em", marginBottom: "2px" }}>{cfg.label}</div>
              <p style={{ fontSize: "10px", color: "var(--tq-t2)" }}>{result.detail}</p>
            </div>
          </div>
        );
      })()}

      <div className="mt-4">
        <p style={{ fontSize: "9px", color: "var(--tq-t3)", fontFamily: "'JetBrains Mono', monospace", marginBottom: "8px", letterSpacing: "0.08em" }}>RECENT SCANS</p>
        {[
          { url: "github.com",          status: "safe",    time: "5m ago"  },
          { url: "suspicious-dl.net",   status: "danger",  time: "12m ago" },
          { url: "cdn.analytics-js.io", status: "warning", time: "1h ago"  },
        ].map((item) => {
          const cfg = statusConfig[item.status as NonNullable<ScanResult>];
          return (
            <div key={item.url} className="flex items-center gap-2 py-1.5" style={{ borderBottom: "1px solid var(--tq-divider)" }}>
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: cfg.color, flexShrink: 0 }} />
              <span style={{ fontSize: "10px", color: "var(--tq-t2)", fontFamily: "'JetBrains Mono', monospace", flex: 1 }}>{item.url}</span>
              <span style={{ fontSize: "9px", color: "var(--tq-t3)", fontFamily: "'JetBrains Mono', monospace" }}>{item.time}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
