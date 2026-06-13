import { useState, useEffect, useRef, useCallback } from "react";
import confetti from "canvas-confetti";
import {
  Lightbulb, Shield, Smartphone, Wifi, CheckCircle2,
  ChevronDown, ChevronRight, Clock, Zap, Star, Trophy,
  AlertTriangle, Info, ArrowRight, Loader2, Sparkles,
  Lock, Key, RefreshCw, Globe, Filter, TrendingUp,
  ShieldCheck
} from "lucide-react";

// ── types ──────────────────────────────────────────────────────────────────────

type Priority = "critical" | "high" | "medium" | "low";
type Category = "account" | "device" | "network";
type CardState = "idle" | "fixing" | "claiming" | "done";
type FilterTab = "all" | "priority" | "account" | "device" | "completed";

interface Suggestion {
  id: number;
  title: string;
  description: string;
  why: string;
  xpReward: number;
  priority: Priority;
  category: Category;
  timeToComplete: string;
  icon: string;
  fixSteps: string[];
}

// ── data ──────────────────────────────────────────────────────────────────────

const SUGGESTIONS: Suggestion[] = [
  {
    id: 1,
    title: "Enable Two-Factor Authentication",
    description: "Add an extra layer of protection by linking a mobile authenticator app.",
    why: "2FA blocks 99.9% of automated attacks. Even if your password is stolen, attackers can't access your account without your physical device.",
    xpReward: 50,
    priority: "high",
    category: "account",
    timeToComplete: "2 mins",
    icon: "🔐",
    fixSteps: ["Download Google Authenticator or Authy", "Go to Account → Security → 2FA", "Scan the QR code with your app", "Enter the 6-digit code to verify"],
  },
  {
    id: 2,
    title: "Apply Critical System Patches",
    description: "2 critical vulnerabilities detected. Update your local operating components immediately.",
    why: "Unpatched systems are the #1 entry point for ransomware. Critical patches fix actively-exploited CVEs that attackers scan for in real time.",
    xpReward: 40,
    priority: "critical",
    category: "device",
    timeToComplete: "5 mins",
    icon: "🛡️",
    fixSteps: ["Open System Settings → Software Update", "Review the 2 flagged security patches", "Install updates and restart if required"],
  },
  {
    id: 3,
    title: "Replace Reused Passwords",
    description: "Our scanner found duplicate passwords across 3 linked profiles — a single breach exposes all of them.",
    why: "Credential stuffing attacks reuse breached password/email combos across thousands of sites. Unique passwords per account prevent cascade failures.",
    xpReward: 30,
    priority: "high",
    category: "account",
    timeToComplete: "3 mins",
    icon: "🔑",
    fixSteps: ["Open your password manager (or use ours)", "Filter accounts flagged as 'reused'", "Generate unique passwords for each", "Save and verify login works"],
  },
  {
    id: 4,
    title: "Audit Authorized OAuth Apps",
    description: "Review third-party platforms that have access to your primary email profile.",
    why: "Rogue OAuth apps can silently read emails, exfiltrate contacts, or impersonate you. Periodic audits remove stale or malicious app permissions.",
    xpReward: 20,
    priority: "medium",
    category: "account",
    timeToComplete: "4 mins",
    icon: "🔍",
    fixSteps: ["Visit Google or Microsoft account security settings", "Navigate to Third-party apps & services", "Revoke access for unrecognized apps", "Keep only apps you actively use"],
  },
  {
    id: 5,
    title: "Configure Encrypted DNS (DoH)",
    description: "Secure your local routing requests against DNS spoofing and ISP-level surveillance.",
    why: "Plain DNS queries are visible to your ISP and can be hijacked by man-in-the-middle attackers. DNS-over-HTTPS encrypts every query, preventing snooping and poisoning.",
    xpReward: 25,
    priority: "low",
    category: "network",
    timeToComplete: "1 min",
    icon: "🌐",
    fixSteps: ["Open Network Settings on your device", "Navigate to DNS configuration", "Enter Cloudflare (1.1.1.1) or NextDNS", "Enable DNS-over-HTTPS toggle"],
  },
];

// ── config maps ────────────────────────────────────────────────────────────────

const priorityConfig: Record<Priority, { color: string; bg: string; border: string; label: string; pulse?: boolean }> = {
  critical: { color: "#ff4d6d", bg: "rgba(255,77,109,0.12)",  border: "rgba(255,77,109,0.3)",  label: "CRITICAL",    pulse: true },
  high:     { color: "#ffd166", bg: "rgba(255,209,102,0.1)",  border: "rgba(255,209,102,0.3)", label: "HIGH PRIORITY" },
  medium:   { color: "#00e5ff", bg: "rgba(0,229,255,0.08)",   border: "rgba(0,229,255,0.25)",  label: "RECOMMENDED" },
  low:      { color: "#06d6a0", bg: "rgba(6,214,160,0.08)",   border: "rgba(6,214,160,0.25)",  label: "GOOD HYGIENE" },
};

const categoryIcon: Record<Category, typeof Shield> = {
  account: Key,
  device:  Shield,
  network: Wifi,
};

// ── helpers ────────────────────────────────────────────────────────────────────

function GlassCard({ children, className = "", style = {}, onClick }: {
  children: React.ReactNode; className?: string; style?: React.CSSProperties; onClick?: () => void;
}) {
  return (
    <div onClick={onClick} className={`rounded-2xl transition-all duration-300 ${className}`}
      style={{ background: "linear-gradient(135deg,var(--tq-card),var(--tq-overlay))", border: "1px solid var(--tq-card-b)", backdropFilter: "blur(14px)", ...style }}>
      {children}
    </div>
  );
}

// ── XP Float animation ─────────────────────────────────────────────────────────

function XPFloat({ xp, onDone }: { xp: number; onDone: () => void }) {
  useEffect(() => { const t = setTimeout(onDone, 1600); return () => clearTimeout(t); }, [onDone]);
  return (
    <div className="pointer-events-none fixed z-50" style={{
      top: "30%", left: "50%", transform: "translateX(-50%)",
      animation: "xpFloat 1.6s ease-out forwards",
    }}>
      <style>{`@keyframes xpFloat{0%{opacity:1;transform:translateX(-50%) translateY(0) scale(0.6)}40%{opacity:1;transform:translateX(-50%) translateY(-28px) scale(1.15)}100%{opacity:0;transform:translateX(-50%) translateY(-60px) scale(1)}}`}</style>
      <div className="flex items-center gap-2 px-5 py-3 rounded-2xl" style={{
        background: "linear-gradient(135deg,#ffd166,#f472b6)",
        boxShadow: "0 0 40px rgba(255,209,102,0.6), 0 0 80px rgba(244,114,182,0.3)",
      }}>
        <Zap size={16} style={{ color: "#0d0122" }} />
        <span style={{ fontFamily: "'Orbitron',monospace", fontWeight: 800, fontSize: "18px", color: "#0d0122" }}>+{xp} XP</span>
        <Sparkles size={14} style={{ color: "#0d0122" }} />
      </div>
    </div>
  );
}

// ── Steps Modal ────────────────────────────────────────────────────────────────

function StepsModal({ suggestion, onComplete, onClose }: {
  suggestion: Suggestion; onComplete: () => void; onClose: () => void;
}) {
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const cfg = priorityConfig[suggestion.priority];

  const advance = () => {
    if (step < suggestion.fixSteps.length - 1) setStep(s => s + 1);
    else { setDone(true); setTimeout(onComplete, 800); }
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(6px)" }} onClick={onClose}>
      <GlassCard className="p-6 w-full max-w-md mx-4" style={{ border: `1px solid ${cfg.border}` }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-start gap-3 mb-5">
          <div className="text-2xl">{suggestion.icon}</div>
          <div>
            <div style={{ fontFamily: "'Orbitron',monospace", fontSize: "13px", fontWeight: 700, color: "var(--tq-t1)" }}>{suggestion.title}</div>
            <div style={{ fontSize: "9px", color: "var(--tq-t3)", fontFamily: "'JetBrains Mono',monospace", marginTop: "2px" }}>{suggestion.fixSteps.length} steps · {suggestion.timeToComplete}</div>
          </div>
          <button onClick={onClose} className="ml-auto" style={{ color: "var(--tq-t3)", fontSize: "18px", lineHeight: 1 }}>×</button>
        </div>

        {/* Progress bar */}
        <div className="mb-5 rounded-full overflow-hidden" style={{ height: "4px", background: "rgba(255,255,255,0.07)" }}>
          <div style={{ width: `${((step + 1) / suggestion.fixSteps.length) * 100}%`, height: "100%", background: cfg.color, boxShadow: `0 0 8px ${cfg.color}`, transition: "width 0.4s ease", borderRadius: "2px" }} />
        </div>

        {/* Steps */}
        <div className="flex flex-col gap-2 mb-5">
          {suggestion.fixSteps.map((s, i) => {
            const isActive = i === step;
            const isPast   = i < step;
            const isDoneAll = done;
            return (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl transition-all duration-300"
                style={{ background: isActive ? `${cfg.bg}` : "rgba(255,255,255,0.02)", border: isActive ? `1px solid ${cfg.border}` : "1px solid rgba(255,255,255,0.05)", opacity: i > step && !done ? 0.4 : 1 }}>
                <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                  style={{ background: (isPast || isDoneAll) ? "#06d6a0" : isActive ? cfg.color : "rgba(255,255,255,0.07)", transition: "background 0.3s" }}>
                  {(isPast || isDoneAll) ? <CheckCircle2 size={11} style={{ color: "#0d0122" }} /> : <span style={{ fontSize: "9px", color: (isActive ? cfg.color : "#6b5a80"), fontWeight: 700, fontFamily: "'JetBrains Mono',monospace" }}>{i + 1}</span>}
                </div>
                <span style={{ fontSize: "11px", color: (isPast || isDoneAll) ? "#8b7aa8" : isActive ? "#e2d9f3" : "#6b5a80", lineHeight: 1.5, textDecoration: (isPast && !isDoneAll) ? "line-through" : "none" }}>{s}</span>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        {!done ? (
          <button onClick={advance} className="w-full py-3 rounded-xl flex items-center justify-center gap-2 transition-all"
            style={{ background: `linear-gradient(135deg,${cfg.color},${cfg.color}bb)`, color: "#0d0122", fontWeight: 700, fontSize: "12px", fontFamily: "'Orbitron',monospace", boxShadow: `0 0 20px ${cfg.color}50`, letterSpacing: "0.05em" }}>
            {step < suggestion.fixSteps.length - 1 ? <><ChevronRight size={14} /> Next Step</> : <><CheckCircle2 size={14} /> Complete &amp; Claim XP</>}
          </button>
        ) : (
          <div className="flex flex-col items-center gap-2 py-2">
            <CheckCircle2 size={32} style={{ color: "#06d6a0", filter: "drop-shadow(0 0 10px #06d6a0)" }} />
            <span style={{ fontFamily: "'Orbitron',monospace", fontSize: "12px", color: "#06d6a0", letterSpacing: "0.06em" }}>COMPLETE!</span>
          </div>
        )}
      </GlassCard>
    </div>
  );
}

// ── Suggestion Card ────────────────────────────────────────────────────────────

function SuggestionCard({ suggestion, onComplete, isCompleted }: {
  suggestion: Suggestion; onComplete: (id: number, xp: number) => void; isCompleted: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const [cardState, setCardState] = useState<CardState>(isCompleted ? "done" : "idle");
  const [showModal, setShowModal] = useState(false);
  const [hovering, setHovering] = useState(false);

  const cfg = priorityConfig[suggestion.priority];
  const CatIcon = categoryIcon[suggestion.category];

  const handleFixNow = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCardState("fixing");
    setShowModal(true);
  };

  const handleModalComplete = () => {
    setShowModal(false);
    setCardState("claiming");
    setTimeout(() => {
      setCardState("done");
      onComplete(suggestion.id, suggestion.xpReward);
    }, 600);
  };

  return (
    <>
      {showModal && <StepsModal suggestion={suggestion} onComplete={handleModalComplete} onClose={() => { setShowModal(false); setCardState("idle"); }} />}

      <div
        className="rounded-2xl transition-all duration-300 cursor-pointer"
        style={{
          background: isCompleted
            ? "linear-gradient(135deg,rgba(6,214,160,0.05),rgba(13,1,34,0.6))"
            : hovering
            ? `linear-gradient(135deg,${cfg.bg},rgba(13,1,34,0.65))`
            : "linear-gradient(135deg,rgba(255,255,255,0.04),rgba(13,1,34,0.6))",
          border: hovering
            ? `1px solid ${cfg.color}50`
            : isCompleted
            ? "1px solid rgba(6,214,160,0.2)"
            : "1px solid rgba(0,229,255,0.12)",
          boxShadow: hovering ? `0 0 24px ${cfg.color}18` : "none",
          backdropFilter: "blur(14px)",
          opacity: isCompleted ? 0.65 : 1,
        }}
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
        onClick={() => !isCompleted && setExpanded(e => !e)}
      >
        <div className="p-4">
          {/* Top row */}
          <div className="flex items-start gap-3">
            {/* Icon */}
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-xl"
              style={{ background: isCompleted ? "rgba(6,214,160,0.1)" : cfg.bg, border: `1px solid ${isCompleted ? "rgba(6,214,160,0.25)" : cfg.border}` }}>
              {isCompleted ? "✅" : suggestion.icon}
            </div>

            {/* Main content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                {/* Priority badge */}
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full"
                  style={{ fontSize: "8px", fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, color: isCompleted ? "#06d6a0" : cfg.color, background: isCompleted ? "rgba(6,214,160,0.1)" : cfg.bg, border: `1px solid ${isCompleted ? "rgba(6,214,160,0.25)" : cfg.border}`, letterSpacing: "0.08em" }}>
                  {cfg.pulse && !isCompleted && (
                    <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: cfg.color, boxShadow: `0 0 4px ${cfg.color}`, animation: "pulse 1s infinite" }} />
                  )}
                  {isCompleted ? "COMPLETED" : cfg.label}
                </span>

                {/* Category */}
                <span className="flex items-center gap-1" style={{ fontSize: "9px", color: "var(--tq-t3)", fontFamily: "'JetBrains Mono',monospace" }}>
                  <CatIcon size={9} />
                  {suggestion.category === "account" ? "Account Security" : suggestion.category === "device" ? "Device & System" : "Network"}
                </span>
              </div>

              <h4 style={{ fontSize: "13px", fontWeight: 600, color: isCompleted ? "#6b5a80" : "#e2d9f3", textDecoration: isCompleted ? "line-through" : "none", lineHeight: 1.3 }}>
                {suggestion.title}
              </h4>
              <p style={{ fontSize: "10px", color: "var(--tq-t2)", marginTop: "3px", lineHeight: 1.5 }}>{suggestion.description}</p>
            </div>

            {/* Right: XP + expand + CTA */}
            <div className="flex flex-col items-end gap-2 shrink-0">
              {/* XP badge */}
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-full"
                style={{ background: "rgba(255,209,102,0.1)", border: "1px solid rgba(255,209,102,0.25)" }}>
                <Zap size={10} style={{ color: "#ffd166" }} />
                <span style={{ fontSize: "10px", fontFamily: "'Orbitron',monospace", fontWeight: 700, color: "#ffd166" }}>+{suggestion.xpReward} XP</span>
              </div>

              {/* Time */}
              <div className="flex items-center gap-1">
                <Clock size={9} style={{ color: "var(--tq-t3)" }} />
                <span style={{ fontSize: "9px", color: "var(--tq-t3)", fontFamily: "'JetBrains Mono',monospace" }}>{suggestion.timeToComplete}</span>
              </div>

              {/* Expand indicator */}
              {!isCompleted && (
                <ChevronDown size={13} style={{ color: "var(--tq-t3)", transform: expanded ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.25s" }} />
              )}
            </div>
          </div>

          {/* Expanded panel */}
          {expanded && !isCompleted && (
            <div className="mt-4 pt-4" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
              {/* Why it matters */}
              <div className="flex items-start gap-2 p-3 rounded-xl mb-3"
                style={{ background: "rgba(0,229,255,0.05)", border: "1px solid rgba(0,229,255,0.12)" }}>
                <Info size={13} style={{ color: "#00e5ff", flexShrink: 0, marginTop: "1px" }} />
                <div>
                  <div style={{ fontSize: "9px", color: "#00e5ff", fontFamily: "'JetBrains Mono',monospace", letterSpacing: "0.08em", marginBottom: "4px" }}>WHY IT MATTERS</div>
                  <p style={{ fontSize: "10px", color: "var(--tq-t2)", lineHeight: 1.6 }}>{suggestion.why}</p>
                </div>
              </div>

              {/* Fix steps preview */}
              <div className="flex flex-col gap-1.5 mb-4">
                <div style={{ fontSize: "9px", color: "var(--tq-t3)", fontFamily: "'JetBrains Mono',monospace", letterSpacing: "0.08em", marginBottom: "4px" }}>STEPS TO COMPLETE</div>
                {suggestion.fixSteps.map((s, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full flex items-center justify-center shrink-0"
                      style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)" }}>
                      <span style={{ fontSize: "8px", color: "var(--tq-t2)", fontFamily: "'JetBrains Mono',monospace" }}>{i + 1}</span>
                    </div>
                    <span style={{ fontSize: "10px", color: "var(--tq-t2)" }}>{s}</span>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <button
                onClick={handleFixNow}
                disabled={cardState === "fixing" || cardState === "claiming"}
                className="w-full py-3 rounded-xl flex items-center justify-center gap-2 transition-all duration-200"
                style={{
                  background: cardState === "idle"
                    ? `linear-gradient(135deg,${cfg.color},${cfg.color === "#ff4d6d" ? "#a855f7" : cfg.color === "#ffd166" ? "#f472b6" : "#00e5ff"})`
                    : cardState === "claiming" ? "linear-gradient(135deg,#06d6a0,#00e5ff)"
                    : "rgba(255,255,255,0.06)",
                  color: cardState === "idle" || cardState === "claiming" ? "#0d0122" : "#6b5a80",
                  fontWeight: 700, fontSize: "12px", fontFamily: "'Orbitron',monospace",
                  letterSpacing: "0.06em",
                  boxShadow: cardState === "idle" ? `0 0 20px ${cfg.color}40` : cardState === "claiming" ? "0 0 20px rgba(6,214,160,0.4)" : "none",
                  cursor: cardState !== "idle" ? "not-allowed" : "pointer",
                }}
              >
                {cardState === "idle" && <><ArrowRight size={14} /> Fix Now</>}
                {cardState === "fixing" && <><Loader2 size={14} className="animate-spin" /> Opening Guide...</>}
                {cardState === "claiming" && <><Zap size={14} /> Claiming XP...</>}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ── Header Banner ─────────────────────────────────────────────────────────────

function HeaderBanner({ totalXP, completedCount, total }: { totalXP: number; completedCount: number; total: number }) {
  const baseXP = 4250;
  const xp = baseXP + totalXP;
  const nextLevel = 6250;
  const pct = Math.min((xp / nextLevel) * 100, 100);

  return (
    <GlassCard className="p-6 mb-5" style={{ background: "linear-gradient(135deg,rgba(0,229,255,0.06),rgba(168,85,247,0.06),rgba(13,1,34,0.7))", border: "1px solid rgba(0,229,255,0.18)" }}>
      <div className="flex items-start justify-between gap-4 flex-wrap">
        {/* Left: title */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Lightbulb size={16} style={{ color: "#f472b6", filter: "drop-shadow(0 0 6px #f472b6)" }} />
            <h1 style={{ fontFamily: "'Orbitron',monospace", fontWeight: 700, fontSize: "16px", color: "var(--tq-t1)", letterSpacing: "0.05em" }}>
              Security Recommendations
            </h1>
          </div>
          <p style={{ fontSize: "11px", color: "var(--tq-t2)", lineHeight: 1.5 }}>
            Complete security tasks to harden your defenses and earn XP to level up.
          </p>
          <div className="flex items-center gap-3 mt-3 flex-wrap">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full" style={{ background: "rgba(6,214,160,0.1)", border: "1px solid rgba(6,214,160,0.22)" }}>
              <CheckCircle2 size={11} style={{ color: "#06d6a0" }} />
              <span style={{ fontSize: "10px", color: "#06d6a0", fontFamily: "'JetBrains Mono',monospace" }}>{completedCount}/{total} completed</span>
            </div>
            {totalXP > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full" style={{ background: "rgba(255,209,102,0.1)", border: "1px solid rgba(255,209,102,0.22)", animation: "pulse 2s 1" }}>
                <Zap size={11} style={{ color: "#ffd166" }} />
                <span style={{ fontSize: "10px", color: "#ffd166", fontFamily: "'JetBrains Mono',monospace", fontWeight: 600 }}>+{totalXP} XP earned this session</span>
              </div>
            )}
          </div>
        </div>

        {/* Right: score + XP */}
        <div className="flex gap-4">
          {/* Security score */}
          <div className="flex flex-col items-center p-4 rounded-2xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(0,229,255,0.12)", minWidth: 90 }}>
            <ShieldCheck size={14} style={{ color: "#00e5ff", marginBottom: "4px" }} />
            <div style={{ fontFamily: "'Orbitron',monospace", fontSize: "22px", fontWeight: 800, background: "linear-gradient(135deg,#a855f7,#00e5ff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", lineHeight: 1 }}>82</div>
            <div style={{ fontSize: "8px", color: "var(--tq-t2)", fontFamily: "'JetBrains Mono',monospace", marginTop: "2px" }}>SCORE /100</div>
            <div style={{ fontSize: "10px", fontWeight: 700, color: "#a855f7", marginTop: "3px" }}>B+</div>
          </div>

          {/* XP meter */}
          <div className="flex flex-col p-4 rounded-2xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,209,102,0.15)", minWidth: 140 }}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <span style={{ fontSize: "14px" }}>⚡</span>
                <span style={{ fontSize: "10px", fontWeight: 600, color: "var(--tq-t1)" }}>Level 12</span>
              </div>
              <span style={{ fontSize: "8px", color: "#a855f7", fontFamily: "'JetBrains Mono',monospace" }}>→ Lv.13</span>
            </div>
            <div className="rounded-full overflow-hidden mb-1.5" style={{ height: "6px", background: "rgba(255,255,255,0.07)" }}>
              <div style={{ width: `${pct}%`, height: "100%", background: "linear-gradient(90deg,#ffd166,#f472b6,#a855f7)", boxShadow: "0 0 10px rgba(255,209,102,0.5)", borderRadius: "3px", transition: "width 0.8s ease" }} />
            </div>
            <div style={{ fontSize: "9px", color: "var(--tq-t3)", fontFamily: "'JetBrains Mono',monospace" }}>
              {xp.toLocaleString()} / {nextLevel.toLocaleString()} XP
            </div>
            <div style={{ fontSize: "8px", color: "var(--tq-t2)", marginTop: "2px" }}>
              {(nextLevel - xp).toLocaleString()} XP to Cyber Elite
            </div>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}

// ── Filter Tabs ────────────────────────────────────────────────────────────────

function FilterBar({ active, onChange, completedCount }: { active: FilterTab; onChange: (t: FilterTab) => void; completedCount: number }) {
  const tabs: { id: FilterTab; label: string; icon: typeof Filter; count?: number; color: string }[] = [
    { id: "all",       label: "All Suggestions",      icon: Lightbulb, count: 5,             color: "var(--tq-t1)" },
    { id: "priority",  label: "High Priority",         icon: AlertTriangle, count: 2,         color: "#ff4d6d" },
    { id: "account",   label: "Account Security",      icon: Key,       count: 3,             color: "#00e5ff" },
    { id: "device",    label: "Device & Network",      icon: Wifi,      count: 2,             color: "#a855f7" },
    { id: "completed", label: "Completed",             icon: CheckCircle2, count: completedCount, color: "#06d6a0" },
  ];

  return (
    <div className="flex gap-2 mb-5 flex-wrap">
      {tabs.map((t) => {
        const isActive = active === t.id;
        return (
          <button key={t.id} onClick={() => onChange(t.id)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all duration-200"
            style={{
              background: isActive ? `${t.color}14` : "rgba(255,255,255,0.03)",
              border: isActive ? `1px solid ${t.color}40` : "1px solid rgba(255,255,255,0.07)",
              color: isActive ? t.color : "#6b5a80",
              boxShadow: isActive ? `0 0 16px ${t.color}18` : "none",
            }}>
            <t.icon size={11} style={{ color: isActive ? t.color : "#6b5a80" }} />
            <span style={{ fontSize: "11px", fontWeight: isActive ? 600 : 400, fontFamily: "'JetBrains Mono',monospace" }}>{t.label}</span>
            {t.count !== undefined && (
              <span className="px-1.5 py-0.5 rounded-md" style={{ fontSize: "9px", fontWeight: 700, color: isActive ? t.color : "#6b5a80", background: isActive ? `${t.color}20` : "rgba(255,255,255,0.06)", fontFamily: "'JetBrains Mono',monospace" }}>
                {t.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

// ── Progress summary ─────────────────────────────────────────────────────────

function ProgressSummary({ completed, total, xpEarned }: { completed: number; total: number; xpEarned: number }) {
  const maxXP = SUGGESTIONS.reduce((a, s) => a + s.xpReward, 0);
  const pct = total > 0 ? (completed / total) * 100 : 0;

  return (
    <GlassCard className="p-4 mb-5 flex items-center gap-5">
      {/* Ring */}
      <svg width={56} height={56} viewBox="0 0 56 56" className="shrink-0">
        <circle cx={28} cy={28} r={22} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={5} />
        <circle cx={28} cy={28} r={22} fill="none" stroke="#a855f7" strokeWidth={5} strokeLinecap="round"
          strokeDasharray={2 * Math.PI * 22} strokeDashoffset={2 * Math.PI * 22 * (1 - pct / 100)}
          transform="rotate(-90 28 28)" style={{ transition: "stroke-dashoffset 0.8s ease", filter: "drop-shadow(0 0 5px #a855f7)" }} />
        <text x={28} y={33} textAnchor="middle" fill="#e2d9f3" fontSize={11} fontFamily="'Orbitron',monospace" fontWeight={800}>{Math.round(pct)}%</text>
      </svg>
      <div className="flex-1">
        <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--tq-t1)", marginBottom: "6px" }}>
          {completed === total && total > 0 ? "🎉 All quests complete!" : `${completed} of ${total} quests completed`}
        </div>
        <div className="rounded-full overflow-hidden" style={{ height: "5px", background: "rgba(255,255,255,0.07)", marginBottom: "6px" }}>
          <div style={{ width: `${pct}%`, height: "100%", background: "linear-gradient(90deg,#a855f7,#00e5ff)", borderRadius: "3px", boxShadow: "0 0 8px rgba(168,85,247,0.5)", transition: "width 0.8s ease" }} />
        </div>
        <div style={{ fontSize: "9px", color: "var(--tq-t3)", fontFamily: "'JetBrains Mono',monospace" }}>
          {xpEarned} / {maxXP} XP earned · {total - completed} quest{total - completed !== 1 ? "s" : ""} remaining
        </div>
      </div>
      {completed === total && total > 0 && (
        <div className="text-2xl shrink-0" style={{ filter: "drop-shadow(0 0 12px #ffd166)" }}>🏆</div>
      )}
    </GlassCard>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────

function EmptyState({ tab }: { tab: FilterTab }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4">
      {tab === "completed" ? (
        <>
          <div style={{ fontSize: "48px" }}>🎯</div>
          <div style={{ fontFamily: "'Orbitron',monospace", fontSize: "13px", color: "var(--tq-t2)" }}>No quests completed yet</div>
          <p style={{ fontSize: "10px", color: "var(--tq-t3)", textAlign: "center", maxWidth: 260 }}>Complete security recommendations to see them here and earn XP rewards.</p>
        </>
      ) : (
        <>
          <ShieldCheck size={40} style={{ color: "#06d6a0", filter: "drop-shadow(0 0 10px #06d6a0)" }} />
          <div style={{ fontFamily: "'Orbitron',monospace", fontSize: "13px", color: "#06d6a0" }}>All clear! ✨</div>
          <p style={{ fontSize: "10px", color: "var(--tq-t3)", textAlign: "center", maxWidth: 260 }}>No pending suggestions in this category. Keep up the great work!</p>
        </>
      )}
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────

export function SuggestionsPage() {
  const [activeFilter, setActiveFilter] = useState<FilterTab>("all");
  const [completedIds, setCompletedIds] = useState<Set<number>>(new Set());
  const [totalXP, setTotalXP] = useState(0);
  const [floatXP, setFloatXP] = useState<{ id: number; xp: number } | null>(null);

  const fireConfetti = () => {
    confetti({ particleCount: 80, spread: 70, origin: { y: 0.55 }, colors: ["#00e5ff", "#a855f7", "#f472b6", "#ffd166", "#06d6a0"] });
    setTimeout(() => confetti({ particleCount: 40, spread: 50, origin: { y: 0.5, x: 0.3 }, colors: ["#00e5ff", "#ffd166"] }), 200);
    setTimeout(() => confetti({ particleCount: 40, spread: 50, origin: { y: 0.5, x: 0.7 }, colors: ["#f472b6", "#a855f7"] }), 350);
  };

  const handleComplete = useCallback((id: number, xp: number) => {
    setCompletedIds(prev => new Set([...prev, id]));
    setTotalXP(prev => prev + xp);
    setFloatXP({ id, xp });
    fireConfetti();
  }, []);

  const visibleSuggestions = SUGGESTIONS.filter((s) => {
    const isDone = completedIds.has(s.id);
    switch (activeFilter) {
      case "all":       return !isDone;
      case "priority":  return !isDone && (s.priority === "critical" || s.priority === "high");
      case "account":   return !isDone && s.category === "account";
      case "device":    return !isDone && (s.category === "device" || s.category === "network");
      case "completed": return isDone;
    }
  });

  const completedSuggestions = SUGGESTIONS.filter(s => completedIds.has(s.id));
  const pendingCount = SUGGESTIONS.length - completedIds.size;

  return (
    <div className="flex-1 overflow-y-auto px-6 py-5">
      {/* XP float pop-up */}
      {floatXP && (
        <XPFloat xp={floatXP.xp} onDone={() => setFloatXP(null)} />
      )}

      {/* Header */}
      <HeaderBanner totalXP={totalXP} completedCount={completedIds.size} total={SUGGESTIONS.length} />

      {/* Progress summary */}
      <ProgressSummary completed={completedIds.size} total={SUGGESTIONS.length} xpEarned={totalXP} />

      {/* Filter tabs */}
      <FilterBar active={activeFilter} onChange={setActiveFilter} completedCount={completedIds.size} />

      {/* Cards */}
      {visibleSuggestions.length === 0 ? (
        <EmptyState tab={activeFilter} />
      ) : (
        <div className="flex flex-col gap-3 pb-8">
          {visibleSuggestions.map((s) => (
            <SuggestionCard
              key={s.id}
              suggestion={s}
              onComplete={handleComplete}
              isCompleted={completedIds.has(s.id)}
            />
          ))}
        </div>
      )}

      {/* Completed section (shown inline when viewing All) */}
      {activeFilter === "all" && completedSuggestions.length > 0 && (
        <div className="mt-2 pb-8">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 size={12} style={{ color: "#06d6a0" }} />
            <span style={{ fontSize: "10px", color: "#06d6a0", fontFamily: "'JetBrains Mono',monospace", letterSpacing: "0.08em" }}>COMPLETED</span>
            <div style={{ flex: 1, height: 1, background: "rgba(6,214,160,0.15)" }} />
          </div>
          <div className="flex flex-col gap-2">
            {completedSuggestions.map(s => (
              <SuggestionCard key={s.id} suggestion={s} onComplete={handleComplete} isCompleted />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
