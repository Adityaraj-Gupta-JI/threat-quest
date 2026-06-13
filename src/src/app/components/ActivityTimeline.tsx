import { Shield, AlertTriangle, CheckCircle, Search, Mail, Zap, Lock } from "lucide-react";

const events = [
  { icon: AlertTriangle, emoji: "⚠️", title: "Phishing URL Blocked",    desc: "malicious-bank-redirect.ru was auto-blocked",     time: "2 min ago",  color: "var(--tq-red)",    xp: "+50 XP" },
  { icon: CheckCircle,   emoji: "✅", title: "Firewall Rule Updated",    desc: "Port 8443 secured with new policy",               time: "18 min ago", color: "var(--tq-green)",  xp: "+25 XP" },
  { icon: Search,        emoji: "🔍", title: "URL Scan Completed",       desc: "github.com — 98/100 trust score",                 time: "1h ago",     color: "var(--tq-neon)",   xp: "+10 XP" },
  { icon: Zap,           emoji: "⚡", title: "Level Up!",                desc: "Reached Level 12 — Cyber Guardian",               time: "2h ago",     color: "var(--tq-gold)",   xp: "+500 XP" },
  { icon: Mail,          emoji: "📧", title: "Email Leak Detected",      desc: "secondary@email.com found in ForumHack DB",       time: "5h ago",     color: "var(--tq-red)",    xp: "+75 XP" },
  { icon: Lock,          emoji: "🔒", title: "2FA Activated",            desc: "Authenticator app added to account",              time: "1d ago",     color: "var(--tq-green)",  xp: "+100 XP" },
];

export function ActivityTimeline() {
  return (
    <div className="rounded-2xl p-5" style={{ background: "linear-gradient(135deg,var(--tq-card),var(--tq-overlay))", border: "1px solid var(--tq-card-b)", backdropFilter: "blur(10px)" }}>
      <div className="flex items-center gap-2 mb-4">
        <Zap size={14} style={{ color: "var(--tq-neon)", filter: "drop-shadow(0 0 4px var(--tq-neon))" }} />
        <h3 style={{ fontSize: "12px", color: "var(--tq-neon)", fontFamily: "'Orbitron', monospace", letterSpacing: "0.08em" }}>
          ACTIVITY TIMELINE
        </h3>
        <span style={{ fontSize: "9px", color: "var(--tq-t3)", fontFamily: "'JetBrains Mono', monospace", marginLeft: "auto" }}>Last 24h</span>
      </div>

      <div className="relative flex flex-col gap-0">
        <div className="absolute left-4 top-3 bottom-3" style={{ width: "1px", background: "linear-gradient(180deg,rgba(0,229,255,0.3),rgba(168,85,247,0.1))" }} />
        {events.map((ev, i) => (
          <div key={i} className="flex items-start gap-3 py-2.5 relative">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 relative z-10"
              style={{ background: "var(--tq-card)", border: "1px solid var(--tq-card-b)", fontSize: "14px" }}>
              {ev.emoji}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span style={{ fontSize: "11px", fontWeight: 600, color: "var(--tq-t1)" }}>{ev.title}</span>
                <span className="px-1.5 py-0.5 rounded" style={{ fontSize: "8px", fontFamily: "'JetBrains Mono', monospace", fontWeight: 600, color: "var(--tq-gold)", background: "rgba(255,209,102,0.1)", border: "1px solid rgba(255,209,102,0.2)" }}>
                  {ev.xp}
                </span>
              </div>
              <p style={{ fontSize: "10px", color: "var(--tq-t3)", marginTop: "1px", lineHeight: 1.4 }}>{ev.desc}</p>
            </div>
            <span style={{ fontSize: "9px", color: "var(--tq-t3)", fontFamily: "'JetBrains Mono', monospace", flexShrink: 0 }}>{ev.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
