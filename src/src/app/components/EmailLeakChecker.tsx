import { useState } from "react";
import { Mail, ShieldCheck, ShieldAlert, Loader2, Database } from "lucide-react";

type LeakStatus = "clean" | "leaked" | null;

export function EmailLeakChecker() {
  const [email, setEmail] = useState("");
  const [checking, setChecking] = useState(false);
  const [status, setStatus] = useState<LeakStatus>(null);
  const [breaches, setBreaches] = useState<{ name: string; date: string; type: string }[]>([]);

  const handleCheck = () => {
    if (!email.trim() || !email.includes("@")) return;
    setChecking(true); setStatus(null);
    setTimeout(() => {
      if (email.toLowerCase().includes("test") || email.toLowerCase().includes("leak")) {
        setStatus("leaked");
        setBreaches([
          { name: "DataBreach2023", date: "Mar 2023", type: "Passwords, Emails" },
          { name: "ForumHack",      date: "Sep 2022", type: "Usernames, IPs" },
        ]);
      } else { setStatus("clean"); setBreaches([]); }
      setChecking(false);
    }, 2000);
  };

  return (
    <div className="rounded-2xl p-5" style={{ background: "linear-gradient(135deg,rgba(168,85,247,0.06),var(--tq-overlay))", border: "1px solid rgba(168,85,247,0.18)", backdropFilter: "blur(10px)" }}>
      <div className="flex items-center gap-2 mb-4">
        <Mail size={14} style={{ color: "var(--tq-purple)" }} />
        <h3 style={{ fontSize: "12px", color: "var(--tq-purple)", fontFamily: "'Orbitron', monospace", letterSpacing: "0.08em" }}>EMAIL LEAK CHECK</h3>
        <span style={{ fontSize: "9px", color: "var(--tq-t3)", fontFamily: "'JetBrains Mono', monospace", marginLeft: "auto" }}>14B+ records indexed</span>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Mail size={12} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "var(--tq-t3)" }} />
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleCheck()}
            placeholder="user@example.com"
            className="w-full pl-8 pr-3 py-2.5 rounded-xl outline-none"
            style={{ background: "var(--tq-card)", border: "1px solid rgba(168,85,247,0.2)", color: "var(--tq-t1)", fontSize: "11px", fontFamily: "'JetBrains Mono', monospace" }} />
        </div>
        <button onClick={handleCheck} disabled={checking || !email.includes("@")}
          className="px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all duration-200"
          style={{ background: email.includes("@") && !checking ? "linear-gradient(135deg,#a855f7,#f472b6)" : "var(--tq-card)", color: email.includes("@") && !checking ? "#ffffff" : "var(--tq-t3)", fontWeight: 600, fontSize: "11px" }}>
          {checking ? <Loader2 size={13} className="animate-spin" /> : <Database size={13} />}
          {checking ? "Checking..." : "Check"}
        </button>
      </div>

      {status === "clean" && (
        <div className="mt-4 p-3 rounded-xl flex items-center gap-3" style={{ background: "rgba(6,214,160,0.08)", border: "1px solid rgba(6,214,160,0.2)" }}>
          <ShieldCheck size={18} style={{ color: "var(--tq-green)" }} />
          <div>
            <div style={{ fontSize: "11px", fontWeight: 600, color: "var(--tq-green)", fontFamily: "'Orbitron', monospace" }}>ALL CLEAR ✨</div>
            <div style={{ fontSize: "10px", color: "var(--tq-t2)" }}>No breaches found. Your email is safe!</div>
          </div>
        </div>
      )}

      {status === "leaked" && (
        <div className="mt-4 p-3 rounded-xl" style={{ background: "rgba(255,77,109,0.08)", border: "1px solid rgba(255,77,109,0.25)" }}>
          <div className="flex items-center gap-2 mb-3">
            <ShieldAlert size={16} style={{ color: "var(--tq-red)" }} />
            <div style={{ fontSize: "11px", fontWeight: 600, color: "var(--tq-red)", fontFamily: "'Orbitron', monospace" }}>
              BREACHES FOUND — {breaches.length}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            {breaches.map((b) => (
              <div key={b.name} className="flex items-center justify-between px-2 py-1.5 rounded-lg"
                style={{ background: "rgba(255,77,109,0.06)", border: "1px solid rgba(255,77,109,0.15)" }}>
                <div>
                  <div style={{ fontSize: "10px", fontWeight: 500, color: "var(--tq-t1)" }}>{b.name}</div>
                  <div style={{ fontSize: "9px", color: "var(--tq-t3)", fontFamily: "'JetBrains Mono', monospace" }}>{b.type}</div>
                </div>
                <span style={{ fontSize: "9px", color: "var(--tq-red)", fontFamily: "'JetBrains Mono', monospace" }}>{b.date}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {!status && (
        <div className="mt-4 grid grid-cols-3 gap-2">
          {[
            { label: "Breaches", value: "847",  color: "var(--tq-red)"    },
            { label: "Pastes",   value: "12K+", color: "var(--tq-gold)"   },
            { label: "DB Size",  value: "14B",  color: "var(--tq-neon)"   },
          ].map((s) => (
            <div key={s.label} className="text-center py-2 rounded-lg" style={{ background: "var(--tq-card)", border: "1px solid var(--tq-card-b)" }}>
              <div style={{ fontSize: "13px", fontFamily: "'Orbitron', monospace", fontWeight: 700, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: "8px", color: "var(--tq-t3)", fontFamily: "'JetBrains Mono', monospace" }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
