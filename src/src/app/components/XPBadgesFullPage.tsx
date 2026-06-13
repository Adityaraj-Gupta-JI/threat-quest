import { useState, useCallback } from "react";
import confetti from "canvas-confetti";
import {
  Trophy, Zap, Star, Lock, Shield, Flame, Crown,
  Target, Clock, TrendingUp, Award, ChevronRight,
  Sparkles, CheckCircle2, Gift, BarChart3, Activity,
  ArrowUp
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, BarChart, Bar
} from "recharts";

// ── types ──────────────────────────────────────────────────────────────────────

type Rarity = "Common" | "Rare" | "Epic" | "Legendary";
type BadgeCategory = "all" | "earned" | "locked";

interface Badge {
  id: string;
  icon: string;
  name: string;
  desc: string;
  rarity: Rarity;
  earned: boolean;
  earnedDate?: string;
  xpValue: number;
  howTo: string;
}

interface XPEvent {
  action: string;
  xp: number;
  time: string;
  emoji: string;
}

// ── data ──────────────────────────────────────────────────────────────────────

const BADGES: Badge[] = [
  { id: "first-blood",   icon: "🔥", name: "First Blood",      desc: "First threat blocked",           rarity: "Common",    earned: true,  earnedDate: "Jun 01, 2026", xpValue: 50,  howTo: "Block your first detected threat." },
  { id: "guardian",      icon: "🛡️", name: "Guardian",         desc: "7-day login streak",             rarity: "Rare",      earned: true,  earnedDate: "Jun 08, 2026", xpValue: 150, howTo: "Log in for 7 consecutive days." },
  { id: "speedrunner",   icon: "⚡", name: "Speedrunner",      desc: "Scanned 50 URLs",                rarity: "Common",    earned: true,  earnedDate: "Jun 05, 2026", xpValue: 75,  howTo: "Scan 50 URLs using the URL Scanner." },
  { id: "breach-hunter", icon: "🔍", name: "Breach Hunter",    desc: "Found a leaked credential",      rarity: "Rare",      earned: true,  earnedDate: "Jun 10, 2026", xpValue: 200, howTo: "Discover a leaked email with the Leak Checker." },
  { id: "questmaster",   icon: "📜", name: "Quest Master",     desc: "Completed 3 suggestions",        rarity: "Rare",      earned: false, xpValue: 175, howTo: "Complete any 3 recommendations in the Suggestions page." },
  { id: "diamond-def",   icon: "💎", name: "Diamond Defender", desc: "Achieve a score of 90+",         rarity: "Epic",      earned: false, xpValue: 400, howTo: "Raise your security score to 90 or above." },
  { id: "all-seeing",    icon: "👁️", name: "All-Seeing",       desc: "Reach 100% scan coverage",      rarity: "Legendary", earned: false, xpValue: 600, howTo: "Achieve 100% asset scan coverage." },
  { id: "star-player",   icon: "🌟", name: "Star Player",      desc: "Enter the global top 1%",        rarity: "Legendary", earned: false, xpValue: 1000,howTo: "Reach the top 1% on the global leaderboard." },
  { id: "cyber-elite",   icon: "👑", name: "Cyber Elite",      desc: "Reach Level 13",                 rarity: "Epic",      earned: false, xpValue: 500, howTo: "Accumulate enough XP to reach Level 13." },
  { id: "dark-mode",     icon: "🌑", name: "Night Owl",        desc: "Used the app past midnight",     rarity: "Common",    earned: true,  earnedDate: "Jun 12, 2026", xpValue: 30,  howTo: "Access ThreatQuest after midnight." },
  { id: "bug-slayer",    icon: "🐛", name: "Bug Slayer",       desc: "Resolved 5 malware alerts",      rarity: "Rare",      earned: false, xpValue: 250, howTo: "Resolve 5 malware-level alerts in Threat Monitor." },
  { id: "phantom",       icon: "👻", name: "Phantom",          desc: "Blocked a zero-day exploit",     rarity: "Legendary", earned: false, xpValue: 800, howTo: "Have a zero-day class threat auto-blocked." },
];

const LEVEL_MILESTONES = [
  { level: 1,  xp: 0,     title: "Newbie" },
  { level: 5,  xp: 1000,  title: "Apprentice" },
  { level: 8,  xp: 2500,  title: "Defender" },
  { level: 10, xp: 3500,  title: "Sentinel" },
  { level: 12, xp: 4250,  title: "Cyber Guardian" },
  { level: 13, xp: 6250,  title: "Cyber Elite" },
  { level: 15, xp: 9000,  title: "Phantom Rank" },
  { level: 20, xp: 18000, title: "Legend" },
];

const XP_HISTORY: XPEvent[] = [
  { action: "Phishing URL Blocked",   xp: 50,  time: "2 min ago",  emoji: "⚠️" },
  { action: "Badge Earned: Guardian", xp: 150, time: "2h ago",     emoji: "🛡️" },
  { action: "URL Scan Completed",     xp: 10,  time: "3h ago",     emoji: "🔍" },
  { action: "Threat Resolved",        xp: 75,  time: "5h ago",     emoji: "✅" },
  { action: "Leak Check: Hit Found",  xp: 200, time: "1d ago",     emoji: "🔑" },
  { action: "7-Day Streak Bonus",     xp: 100, time: "1d ago",     emoji: "🔥" },
  { action: "Daily Login",            xp: 15,  time: "2d ago",     emoji: "📅" },
  { action: "Suggestion Completed",   xp: 50,  time: "2d ago",     emoji: "✨" },
];

const WEEKLY_XP = [
  { day: "Mon", xp: 95  },
  { day: "Tue", xp: 280 },
  { day: "Wed", xp: 60  },
  { day: "Thu", xp: 325 },
  { day: "Fri", xp: 175 },
  { day: "Sat", xp: 210 },
  { day: "Sun", xp: 65  },
];

// ── config ─────────────────────────────────────────────────────────────────────

const rarityConfig: Record<Rarity, { color: string; bg: string; border: string; glow: string; gradient: string }> = {
  Common:    { color: "var(--tq-t2)", bg: "rgba(139,122,168,0.1)",  border: "rgba(139,122,168,0.25)", glow: "rgba(139,122,168,0.2)",  gradient: "linear-gradient(135deg,#8b7aa8,#6b5a80)" },
  Rare:      { color: "#00e5ff", bg: "rgba(0,229,255,0.1)",    border: "rgba(0,229,255,0.3)",    glow: "rgba(0,229,255,0.3)",    gradient: "linear-gradient(135deg,#00e5ff,#a855f7)" },
  Epic:      { color: "#a855f7", bg: "rgba(168,85,247,0.12)",  border: "rgba(168,85,247,0.35)",  glow: "rgba(168,85,247,0.35)",  gradient: "linear-gradient(135deg,#a855f7,#f472b6)" },
  Legendary: { color: "#ffd166", bg: "rgba(255,209,102,0.12)", border: "rgba(255,209,102,0.4)",  glow: "rgba(255,209,102,0.4)",  gradient: "linear-gradient(135deg,#ffd166,#ff4d6d)" },
};

// ── helpers ────────────────────────────────────────────────────────────────────

function GlassCard({ children, className = "", style = {} }: {
  children: React.ReactNode; className?: string; style?: React.CSSProperties;
}) {
  return (
    <div className={`rounded-2xl ${className}`} style={{
      background: "linear-gradient(135deg,rgba(255,255,255,0.04),rgba(13,1,34,0.65))",
      border: "1px solid rgba(0,229,255,0.12)",
      backdropFilter: "blur(14px)",
      ...style,
    }}>
      {children}
    </div>
  );
}

function CardLabel({ icon: Icon, label, color }: { icon: typeof Trophy; label: string; color: string }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <Icon size={14} style={{ color, filter: `drop-shadow(0 0 5px ${color})` }} />
      <span style={{ fontFamily: "'Orbitron',monospace", fontSize: "11px", color, letterSpacing: "0.1em" }}>{label}</span>
    </div>
  );
}

// ── XP Hero ────────────────────────────────────────────────────────────────────

function XPHero({ xp, sessionXP }: { xp: number; sessionXP: number }) {
  const level = 12;
  const nextLevelXP = 6250;
  const pct = Math.min((xp / nextLevelXP) * 100, 100);
  const remaining = nextLevelXP - xp;

  return (
    <GlassCard className="p-6 mb-5" style={{
      background: "linear-gradient(135deg,rgba(168,85,247,0.08),rgba(0,229,255,0.06),rgba(13,1,34,0.7))",
      border: "1px solid rgba(168,85,247,0.2)",
    }}>
      <div className="flex items-center gap-6 flex-wrap">
        {/* Level badge */}
        <div className="relative shrink-0">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg,#ffd166,#f472b6,#a855f7)", boxShadow: "0 0 30px rgba(255,209,102,0.4),0 0 60px rgba(168,85,247,0.2)" }}>
            <div className="text-center">
              <div style={{ fontFamily: "'Orbitron',monospace", fontWeight: 900, fontSize: "26px", color: "#0d0122", lineHeight: 1 }}>12</div>
              <div style={{ fontSize: "8px", color: "rgba(13,1,34,0.7)", fontFamily: "'JetBrains Mono',monospace", letterSpacing: "0.05em" }}>LEVEL</div>
            </div>
          </div>
          <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center"
            style={{ background: "#ffd166", boxShadow: "0 0 8px #ffd166" }}>
            <Star size={10} style={{ color: "#0d0122", fill: "#0d0122" }} />
          </div>
        </div>

        {/* XP info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1 flex-wrap">
            <span style={{ fontFamily: "'Orbitron',monospace", fontSize: "20px", fontWeight: 800, color: "var(--tq-t1)" }}>Cyber Guardian</span>
            <span className="px-2 py-0.5 rounded-lg" style={{ fontSize: "9px", color: "#ffd166", background: "rgba(255,209,102,0.12)", border: "1px solid rgba(255,209,102,0.25)", fontFamily: "'JetBrains Mono',monospace" }}>Rank #247</span>
            {sessionXP > 0 && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-lg"
                style={{ fontSize: "9px", color: "#06d6a0", background: "rgba(6,214,160,0.1)", border: "1px solid rgba(6,214,160,0.22)", fontFamily: "'JetBrains Mono',monospace" }}>
                <TrendingUp size={9} /> +{sessionXP} XP this session
              </span>
            )}
          </div>

          <div className="flex items-end gap-2 mb-2">
            <span style={{ fontFamily: "'Orbitron',monospace", fontSize: "30px", fontWeight: 900, color: "#ffd166", lineHeight: 1, textShadow: "0 0 20px rgba(255,209,102,0.5)" }}>
              {xp.toLocaleString()}
            </span>
            <span style={{ fontSize: "12px", color: "var(--tq-t2)", marginBottom: "4px" }}>/ {nextLevelXP.toLocaleString()} XP</span>
          </div>

          {/* XP bar */}
          <div className="relative rounded-full overflow-hidden mb-1.5" style={{ height: "10px", background: "rgba(255,255,255,0.07)" }}>
            <div style={{
              width: `${pct}%`, height: "100%",
              background: "linear-gradient(90deg,#ffd166,#f472b6,#a855f7)",
              boxShadow: "0 0 14px rgba(255,209,102,0.5)",
              borderRadius: "5px", transition: "width 0.8s ease",
            }} />
            <div className="absolute inset-0 flex items-center" style={{ paddingLeft: `${Math.min(pct, 90)}%` }}>
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#fff", boxShadow: "0 0 6px rgba(255,255,255,0.8)", transform: "translateX(-50%)" }} />
            </div>
          </div>

          <div className="flex justify-between">
            <span style={{ fontSize: "9px", color: "var(--tq-t3)", fontFamily: "'JetBrains Mono',monospace" }}>
              {remaining.toLocaleString()} XP to Level 13 · Cyber Elite
            </span>
            <span style={{ fontSize: "9px", color: "#a855f7", fontFamily: "'JetBrains Mono',monospace" }}>{Math.round(pct)}%</span>
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-2 gap-2 shrink-0">
          {[
            { label: "Total XP",    value: xp.toLocaleString(), color: "#ffd166", icon: Zap },
            { label: "Badges",      value: `${BADGES.filter(b => b.earned).length}/${BADGES.length}`, color: "#a855f7", icon: Trophy },
            { label: "Best Streak", value: "7 days",            color: "#00e5ff", icon: Flame },
            { label: "Quests Done", value: "14",                color: "#06d6a0", icon: CheckCircle2 },
          ].map(s => (
            <div key={s.label} className="px-3 py-2 rounded-xl text-center" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <s.icon size={11} style={{ color: s.color, margin: "0 auto 2px" }} />
              <div style={{ fontFamily: "'Orbitron',monospace", fontSize: "13px", fontWeight: 700, color: s.color, lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: "8px", color: "var(--tq-t3)", fontFamily: "'JetBrains Mono',monospace", marginTop: "1px" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </GlassCard>
  );
}

// ── Level Roadmap ─────────────────────────────────────────────────────────────

function LevelRoadmap() {
  const currentXP = 4250;
  return (
    <GlassCard className="p-5 mb-5">
      <CardLabel icon={TrendingUp} label="LEVEL ROADMAP" color="#00e5ff" />
      <div className="flex items-center gap-0 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
        {LEVEL_MILESTONES.map((m, i) => {
          const isPast    = currentXP >= m.xp;
          const isCurrent = m.level === 12;
          const isNext    = m.level === 13;
          return (
            <div key={m.level} className="flex items-center">
              <div className="flex flex-col items-center gap-1.5 px-1">
                <div style={{ fontSize: "8px", color: isPast ? "#8b7aa8" : "#6b5a80", fontFamily: "'JetBrains Mono',monospace", whiteSpace: "nowrap" }}>{m.title}</div>
                <div className="w-8 h-8 rounded-full flex items-center justify-center relative"
                  style={{
                    background: isCurrent
                      ? "linear-gradient(135deg,#ffd166,#f472b6)"
                      : isPast ? "rgba(168,85,247,0.3)" : "rgba(255,255,255,0.05)",
                    border: isCurrent ? "none" : isPast ? "1px solid rgba(168,85,247,0.4)" : "1px solid rgba(255,255,255,0.1)",
                    boxShadow: isCurrent ? "0 0 16px rgba(255,209,102,0.5)" : isNext ? "0 0 12px rgba(168,85,247,0.3)" : "none",
                  }}>
                  <span style={{ fontFamily: "'Orbitron',monospace", fontSize: isCurrent ? "11px" : "10px", fontWeight: 700, color: isCurrent ? "#0d0122" : isPast ? "#a855f7" : "#6b5a80" }}>{m.level}</span>
                  {isCurrent && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full flex items-center justify-center" style={{ background: "#06d6a0" }}>
                      <span style={{ fontSize: "6px", color: "#0d0122" }}>✓</span>
                    </div>
                  )}
                </div>
                <div style={{ fontSize: "7px", color: isPast ? "#6b5a80" : "#4a3860", fontFamily: "'JetBrains Mono',monospace", whiteSpace: "nowrap" }}>{m.xp.toLocaleString()} XP</div>
              </div>
              {i < LEVEL_MILESTONES.length - 1 && (
                <div className="w-8 h-0.5 shrink-0" style={{ background: currentXP >= LEVEL_MILESTONES[i + 1].xp ? "rgba(168,85,247,0.5)" : "rgba(255,255,255,0.07)" }} />
              )}
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
}

// ── Badge Card ─────────────────────────────────────────────────────────────────

function BadgeCard({ badge, onClaim }: { badge: Badge; onClaim?: () => void }) {
  const [hovering, setHovering] = useState(false);
  const [flipped, setFlipped] = useState(false);
  const cfg = rarityConfig[badge.rarity];

  return (
    <div
      className="cursor-pointer"
      style={{ perspective: "600px" }}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => { setHovering(false); setFlipped(false); }}
      onClick={() => setFlipped(f => !f)}
    >
      <div style={{ transition: "transform 0.55s ease", transformStyle: "preserve-3d", transform: flipped ? "rotateY(180deg)" : "rotateY(0)" }}>
        {/* Front */}
        <div className="rounded-2xl p-4 flex flex-col items-center gap-2 text-center"
          style={{
            backfaceVisibility: "hidden",
            background: badge.earned
              ? `linear-gradient(135deg,${cfg.bg},rgba(13,1,34,0.7))`
              : "rgba(255,255,255,0.02)",
            border: badge.earned
              ? `1px solid ${cfg.border}`
              : "1px solid rgba(255,255,255,0.06)",
            boxShadow: hovering && badge.earned ? `0 0 24px ${cfg.glow}` : "none",
            opacity: badge.earned ? 1 : 0.45,
            transition: "all 0.25s",
            minHeight: 160,
          }}>
          {/* Earned check */}
          {badge.earned && (
            <div className="absolute top-2 right-2 w-4 h-4 rounded-full flex items-center justify-center"
              style={{ background: "#06d6a0", boxShadow: "0 0 6px #06d6a0" }}>
              <span style={{ fontSize: "7px", color: "#0d0122" }}>✓</span>
            </div>
          )}

          {/* Icon */}
          <div className="text-3xl leading-none"
            style={{ filter: badge.earned ? `drop-shadow(0 0 8px ${cfg.color})` : "grayscale(1) opacity(0.5)" }}>
            {badge.earned ? badge.icon : <Lock size={22} style={{ color: "#3d2060" }} />}
          </div>

          {/* Name */}
          <div style={{ fontSize: "11px", fontWeight: 700, color: badge.earned ? "#e2d9f3" : "#4a3860", lineHeight: 1.2 }}>{badge.name}</div>
          <div style={{ fontSize: "9px", color: badge.earned ? "#8b7aa8" : "#3d2060", lineHeight: 1.3 }}>{badge.desc}</div>

          {/* Rarity */}
          <div className="px-2 py-0.5 rounded-full" style={{ background: badge.earned ? cfg.bg : "rgba(255,255,255,0.03)", border: `1px solid ${badge.earned ? cfg.border : "rgba(255,255,255,0.06)"}` }}>
            <span style={{ fontSize: "8px", fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, color: badge.earned ? cfg.color : "#4a3860", letterSpacing: "0.04em" }}>
              {badge.rarity}
            </span>
          </div>

          {/* XP value */}
          <div className="flex items-center gap-1">
            <Zap size={9} style={{ color: badge.earned ? "#ffd166" : "#3d2060" }} />
            <span style={{ fontSize: "9px", fontFamily: "'JetBrains Mono',monospace", color: badge.earned ? "#ffd166" : "#3d2060" }}>+{badge.xpValue} XP</span>
          </div>

          {badge.earned && badge.earnedDate && (
            <div style={{ fontSize: "8px", color: "var(--tq-t3)", fontFamily: "'JetBrains Mono',monospace" }}>{badge.earnedDate}</div>
          )}
        </div>

        {/* Back (how to earn) */}
        <div className="absolute inset-0 rounded-2xl p-4 flex flex-col items-center justify-center gap-3"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            background: `linear-gradient(135deg,${cfg.bg},rgba(13,1,34,0.85))`,
            border: `1px solid ${cfg.border}`,
          }}>
          <div className="text-xl">{badge.icon}</div>
          <div style={{ fontSize: "10px", fontWeight: 700, color: cfg.color, fontFamily: "'Orbitron',monospace", textAlign: "center" }}>HOW TO EARN</div>
          <p style={{ fontSize: "10px", color: "var(--tq-t2)", textAlign: "center", lineHeight: 1.5 }}>{badge.howTo}</p>
          <div className="flex items-center gap-1 px-2 py-1 rounded-full" style={{ background: "rgba(255,209,102,0.1)", border: "1px solid rgba(255,209,102,0.25)" }}>
            <Zap size={9} style={{ color: "#ffd166" }} />
            <span style={{ fontSize: "9px", fontFamily: "'Orbitron',monospace", color: "#ffd166", fontWeight: 700 }}>+{badge.xpValue} XP</span>
          </div>
          {badge.earned && (
            <div className="flex items-center gap-1">
              <CheckCircle2 size={10} style={{ color: "#06d6a0" }} />
              <span style={{ fontSize: "9px", color: "#06d6a0", fontFamily: "'JetBrains Mono',monospace" }}>Earned {badge.earnedDate}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Badges Section ─────────────────────────────────────────────────────────────

function BadgesSection() {
  const [filter, setFilter] = useState<BadgeCategory>("all");
  const filters: { id: BadgeCategory; label: string; count: number }[] = [
    { id: "all",    label: "All Badges",  count: BADGES.length },
    { id: "earned", label: "Earned",      count: BADGES.filter(b => b.earned).length },
    { id: "locked", label: "Locked",      count: BADGES.filter(b => !b.earned).length },
  ];

  const visible = BADGES.filter(b => {
    if (filter === "earned") return b.earned;
    if (filter === "locked") return !b.earned;
    return true;
  });

  const rarityOrder: Rarity[] = ["Legendary", "Epic", "Rare", "Common"];
  const sorted = [...visible].sort((a, b) => {
    const ra = rarityOrder.indexOf(a.rarity);
    const rb = rarityOrder.indexOf(b.rarity);
    if (ra !== rb) return ra - rb;
    return (b.earned ? 1 : 0) - (a.earned ? 1 : 0);
  });

  return (
    <GlassCard className="p-5 mb-5">
      <div className="flex items-center justify-between mb-4">
        <CardLabel icon={Trophy} label="BADGE COLLECTION" color="#ffd166" />
        <div className="flex gap-1.5">
          {filters.map(f => (
            <button key={f.id} onClick={() => setFilter(f.id)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all"
              style={{ fontSize: "9px", fontFamily: "'JetBrains Mono',monospace", fontWeight: 600,
                background: filter === f.id ? "rgba(255,209,102,0.1)" : "transparent",
                color: filter === f.id ? "#ffd166" : "#6b5a80",
                border: filter === f.id ? "1px solid rgba(255,209,102,0.25)" : "1px solid transparent" }}>
              {f.label}
              <span style={{ fontSize: "8px", padding: "1px 5px", borderRadius: "4px", background: filter === f.id ? "rgba(255,209,102,0.15)" : "rgba(255,255,255,0.05)", color: filter === f.id ? "#ffd166" : "#6b5a80" }}>{f.count}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Rarity legend */}
      <div className="flex gap-3 mb-4 flex-wrap">
        {(["Legendary","Epic","Rare","Common"] as Rarity[]).map(r => (
          <div key={r} className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ background: rarityConfig[r].color }} />
            <span style={{ fontSize: "9px", color: rarityConfig[r].color, fontFamily: "'JetBrains Mono',monospace" }}>{r}</span>
          </div>
        ))}
        <span style={{ fontSize: "9px", color: "var(--tq-t3)", marginLeft: "auto", fontFamily: "'JetBrains Mono',monospace" }}>
          Click a badge to flip ↻
        </span>
      </div>

      <div className="grid grid-cols-6 gap-3">
        {sorted.map(badge => (
          <div key={badge.id} className="relative">
            <BadgeCard badge={badge} />
          </div>
        ))}
      </div>
    </GlassCard>
  );
}

// ── XP Chart ──────────────────────────────────────────────────────────────────

function XPChart() {
  return (
    <GlassCard className="p-5">
      <CardLabel icon={BarChart3} label="WEEKLY XP EARNED" color="#00e5ff" />
      <ResponsiveContainer width="100%" height={160}>
        <BarChart data={WEEKLY_XP} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
          <XAxis dataKey="day" tick={{ fontSize: 9, fill: "#6b5a80", fontFamily: "'JetBrains Mono',monospace" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 9, fill: "#6b5a80", fontFamily: "'JetBrains Mono',monospace" }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{ background: "rgba(20,2,50,0.95)", border: "1px solid #00e5ff22", borderRadius: "10px", fontSize: "10px", color: "var(--tq-t1)", fontFamily: "'JetBrains Mono',monospace" }}
            cursor={{ fill: "rgba(0,229,255,0.05)" }}
          />
          <Bar dataKey="xp" fill="#a855f7" radius={[4, 4, 0, 0]} name="XP Earned"
            style={{ filter: "drop-shadow(0 0 4px rgba(168,85,247,0.5))" }} />
        </BarChart>
      </ResponsiveContainer>
      <div className="flex justify-between mt-3 pt-3" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        {[
          { label: "This Week",  value: `${WEEKLY_XP.reduce((a, b) => a + b.xp, 0)} XP`, color: "#a855f7" },
          { label: "Daily Avg",  value: `${Math.round(WEEKLY_XP.reduce((a, b) => a + b.xp, 0) / 7)} XP`,  color: "#00e5ff" },
          { label: "Best Day",   value: `${Math.max(...WEEKLY_XP.map(d => d.xp))} XP`,  color: "#ffd166" },
        ].map(s => (
          <div key={s.label} className="text-center">
            <div style={{ fontFamily: "'Orbitron',monospace", fontSize: "13px", fontWeight: 700, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: "8px", color: "var(--tq-t3)", fontFamily: "'JetBrains Mono',monospace" }}>{s.label}</div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}

// ── XP Event Log ──────────────────────────────────────────────────────────────

function XPLog() {
  return (
    <GlassCard className="p-5">
      <CardLabel icon={Activity} label="XP HISTORY" color="#f472b6" />
      <div className="flex flex-col gap-0" style={{ maxHeight: 340, overflowY: "auto" }}>
        {XP_HISTORY.map((ev, i) => (
          <div key={i} className="flex items-center gap-3 py-2.5 group"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
            <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-sm"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
              {ev.emoji}
            </div>
            <div className="flex-1 min-w-0">
              <div style={{ fontSize: "11px", color: "var(--tq-t1)", fontWeight: 500 }}>{ev.action}</div>
              <div style={{ fontSize: "9px", color: "var(--tq-t3)", fontFamily: "'JetBrains Mono',monospace" }}>{ev.time}</div>
            </div>
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full shrink-0"
              style={{ background: "rgba(255,209,102,0.08)", border: "1px solid rgba(255,209,102,0.2)" }}>
              <Zap size={9} style={{ color: "#ffd166" }} />
              <span style={{ fontSize: "10px", fontFamily: "'JetBrains Mono',monospace", fontWeight: 600, color: "#ffd166" }}>+{ev.xp}</span>
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}

// ── Next Rewards ──────────────────────────────────────────────────────────────

function NextRewards() {
  const locked = BADGES.filter(b => !b.earned);
  return (
    <GlassCard className="p-5">
      <CardLabel icon={Gift} label="NEXT REWARDS" color="#a855f7" />
      <div className="flex flex-col gap-2">
        {locked.slice(0, 4).map(b => {
          const cfg = rarityConfig[b.rarity];
          return (
            <div key={b.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
              style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}>
                <Lock size={13} style={{ color: cfg.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <div style={{ fontSize: "11px", fontWeight: 600, color: "var(--tq-t1)" }}>{b.name}</div>
                <div style={{ fontSize: "9px", color: "var(--tq-t3)" }}>{b.howTo}</div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span style={{ fontSize: "8px", fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, color: cfg.color }}>{b.rarity}</span>
                <div className="flex items-center gap-1">
                  <Zap size={8} style={{ color: "#ffd166" }} />
                  <span style={{ fontSize: "9px", color: "#ffd166", fontFamily: "'JetBrains Mono',monospace" }}>+{b.xpValue}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
}

// ── Streak Banner ─────────────────────────────────────────────────────────────

function StreakBanner() {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const active = [true, true, true, true, true, true, false];
  return (
    <GlassCard className="p-4 mb-5" style={{ background: "linear-gradient(135deg,rgba(255,77,109,0.06),rgba(255,209,102,0.06),rgba(13,1,34,0.7))", border: "1px solid rgba(255,209,102,0.18)" }}>
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div style={{ fontSize: "28px", filter: "drop-shadow(0 0 10px #ff4d6d)" }}>🔥</div>
          <div>
            <div style={{ fontFamily: "'Orbitron',monospace", fontSize: "14px", fontWeight: 700, color: "#ffd166" }}>6-Day Streak!</div>
            <div style={{ fontSize: "9px", color: "var(--tq-t2)", fontFamily: "'JetBrains Mono',monospace" }}>Log in tomorrow to hit 7 days and earn the Guardian badge</div>
          </div>
        </div>
        <div className="flex gap-2">
          {days.map((d, i) => (
            <div key={d} className="flex flex-col items-center gap-1">
              <div className="w-7 h-7 rounded-full flex items-center justify-center"
                style={{
                  background: active[i] ? "linear-gradient(135deg,#ff4d6d,#ffd166)" : "rgba(255,255,255,0.05)",
                  border: active[i] ? "none" : "1px solid rgba(255,255,255,0.08)",
                  boxShadow: active[i] ? "0 0 10px rgba(255,77,109,0.4)" : "none",
                }}>
                <span style={{ fontSize: active[i] ? "13px" : "10px" }}>{active[i] ? "🔥" : "·"}</span>
              </div>
              <span style={{ fontSize: "7px", color: active[i] ? "#ffd166" : "#6b5a80", fontFamily: "'JetBrains Mono',monospace" }}>{d}</span>
            </div>
          ))}
        </div>
      </div>
    </GlassCard>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────

export function XPBadgesFullPage() {
  const [sessionXP] = useState(0);
  const currentXP = 4250 + sessionXP;

  return (
    <div className="flex-1 overflow-y-auto px-6 py-5">
      {/* Page header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 style={{ fontFamily: "'Orbitron',monospace", fontWeight: 700, fontSize: "16px", color: "var(--tq-t1)", letterSpacing: "0.05em" }}>
              XP &amp; Badges
            </h1>
            <Sparkles size={14} style={{ color: "#ffd166", filter: "drop-shadow(0 0 5px #ffd166)" }} />
          </div>
          <p style={{ fontSize: "10px", color: "var(--tq-t3)", fontFamily: "'JetBrains Mono',monospace" }}>
            Track your progress, collect badges, and level up your cyber skills
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full"
          style={{ background: "rgba(255,209,102,0.08)", border: "1px solid rgba(255,209,102,0.2)" }}>
          <Trophy size={12} style={{ color: "#ffd166" }} />
          <span style={{ fontSize: "10px", color: "#ffd166", fontFamily: "'JetBrains Mono',monospace" }}>Global Rank #247</span>
        </div>
      </div>

      {/* XP Hero */}
      <XPHero xp={currentXP} sessionXP={sessionXP} />

      {/* Streak */}
      <StreakBanner />

      {/* Level Roadmap */}
      <LevelRoadmap />

      {/* Badges */}
      <BadgesSection />

      {/* Bottom row: XP chart + Log + Next rewards */}
      <div className="grid grid-cols-12 gap-4 pb-8">
        <div className="col-span-5">
          <XPChart />
        </div>
        <div className="col-span-4">
          <XPLog />
        </div>
        <div className="col-span-3">
          <NextRewards />
        </div>
      </div>
    </div>
  );
}
