import { useTheme } from "./ThemeContext";
import { Shield, Github, Sparkles, Code2, Music, Eye, Zap } from "lucide-react";

const team = [
  {
    name: "Hanika",
    title: "The Code Sorcerer",
    emoji: "🧙‍♀️",
    role: "Full-Stack Architect",
    desc: "Conjures elegant systems from thin air. Turns caffeine and logic into production-ready features that just work — every time.",
    color: "#a855f7",
    glow: "rgba(168,85,247,0.25)",
    border: "rgba(168,85,247,0.3)",
    bg: "rgba(168,85,247,0.07)",
    icon: Code2,
    spell: "Specialises in UI/UX sorcery & backend enchantments",
  },
  {
    name: "Adityaraj Gupta",
    title: "The Firewall Bard",
    emoji: "🎸",
    role: "Security Engineer",
    desc: "Sings code into compliance. Composes firewalls like symphonies — every rule a note, every policy a verse protecting the realm.",
    color: "#00e5ff",
    glow: "rgba(0,229,255,0.25)",
    border: "rgba(0,229,255,0.3)",
    bg: "rgba(0,229,255,0.06)",
    icon: Music,
    spell: "Masters network defence & threat intelligence",
  },
  {
    name: "Tarang Gupta",
    title: "The Shadow Hunter",
    emoji: "🕵️",
    role: "Penetration Tester",
    desc: "Moves unseen through the darkest corners of cyberspace. Finds vulnerabilities before they find you — no shadow goes unsearched.",
    color: "#f472b6",
    glow: "rgba(244,114,182,0.25)",
    border: "rgba(244,114,182,0.3)",
    bg: "rgba(244,114,182,0.06)",
    icon: Eye,
    spell: "Expert in red-teaming & zero-day discovery",
  },
  {
    name: "Anirudh G",
    title: "The Exploit Whisperer",
    emoji: "⚡",
    role: "Vulnerability Researcher",
    desc: "Listens to what exploits have to say. Translates the language of broken code into bulletproof patches and hardened defences.",
    color: "#ffd166",
    glow: "rgba(255,209,102,0.25)",
    border: "rgba(255,209,102,0.3)",
    bg: "rgba(255,209,102,0.06)",
    icon: Zap,
    spell: "Fluent in CVE analysis & responsible disclosure",
  },
];

function TeamCard({ member, isDark }: { member: typeof team[0]; isDark: boolean }) {
  const cardBg = isDark
    ? `linear-gradient(135deg,${member.bg},rgba(13,1,34,0.65))`
    : `linear-gradient(135deg,rgba(255,248,240,0.85),rgba(235,215,185,0.7))`;
  const textPrimary = isDark ? "#e2d9f3" : "#2C1206";
  const textSecond  = isDark ? "#8b7aa8"  : "#8B5E3C";
  const textDim     = isDark ? "#6b5a80"  : "#A07850";
  const pillBg      = isDark ? member.bg  : `rgba(${member.color === "#a855f7" ? "123,58,16" : member.color === "#00e5ff" ? "0,100,120" : member.color === "#f472b6" ? "140,40,80" : "120,80,10"},0.1)`;

  return (
    <div
      className="rounded-2xl p-6 relative overflow-hidden group transition-all duration-300 cursor-default"
      style={{
        background: cardBg,
        border: `1px solid ${isDark ? member.border : "rgba(100,55,15,0.2)"}`,
        backdropFilter: "blur(16px)",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = `0 0 40px ${member.glow}`;
        (e.currentTarget as HTMLElement).style.borderColor = member.border;
        (e.currentTarget as HTMLElement).style.transform = "translateY(-3px)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = "none";
        (e.currentTarget as HTMLElement).style.borderColor = isDark ? member.border : "rgba(100,55,15,0.2)";
        (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
      }}
    >
      {/* Background glow blob */}
      <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full opacity-20 transition-opacity duration-300 group-hover:opacity-40"
        style={{ background: member.color, filter: "blur(28px)", pointerEvents: "none" }} />

      {/* Decorative corner accent */}
      <div className="absolute top-0 right-0 w-24 h-24 opacity-5"
        style={{ background: `radial-gradient(circle at top right,${member.color},transparent)`, pointerEvents: "none" }} />

      {/* Header row */}
      <div className="flex items-start gap-4 mb-5 relative">
        {/* Avatar */}
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shrink-0 relative"
          style={{
            background: isDark
              ? `linear-gradient(135deg,${member.bg},rgba(255,255,255,0.03))`
              : `linear-gradient(135deg,rgba(255,248,240,0.9),rgba(235,215,185,0.8))`,
            border: `2px solid ${member.border}`,
            boxShadow: `0 0 20px ${member.glow}`,
          }}>
          {member.emoji}
          {/* Pulse ring */}
          <div className="absolute inset-0 rounded-2xl"
            style={{ border: `1px solid ${member.color}30`, animation: "pulse 3s infinite" }} />
        </div>

        <div className="flex-1 min-w-0">
          {/* Title badge */}
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full mb-2"
            style={{ background: isDark ? member.bg : "rgba(123,58,16,0.1)", border: `1px solid ${isDark ? member.border : "rgba(123,58,16,0.2)"}` }}>
            <member.icon size={10} style={{ color: isDark ? member.color : "#7B3A10" }} />
            <span style={{
              fontSize: "9px", fontFamily: "'Orbitron',monospace", fontWeight: 700,
              letterSpacing: "0.07em", color: isDark ? member.color : "#7B3A10",
            }}>
              {member.title}
            </span>
          </div>

          <h3 style={{ fontSize: "15px", fontWeight: 700, color: textPrimary, lineHeight: 1.2, fontFamily: "'Orbitron',monospace" }}>
            {member.name}
          </h3>
          <p style={{ fontSize: "10px", color: textSecond, fontFamily: "'JetBrains Mono',monospace", marginTop: "2px" }}>
            {member.role}
          </p>
        </div>
      </div>

      {/* Description */}
      <p style={{ fontSize: "11px", color: textSecond, lineHeight: 1.7, marginBottom: "16px" }}>
        {member.desc}
      </p>

      {/* Speciality tag */}
      <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
        style={{ background: isDark ? "rgba(255,255,255,0.03)" : "rgba(100,55,15,0.06)", border: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(100,55,15,0.1)"}` }}>
        <Sparkles size={10} style={{ color: isDark ? member.color : "#A0522D", flexShrink: 0 }} />
        <span style={{ fontSize: "9px", color: textDim, fontFamily: "'JetBrains Mono',monospace", lineHeight: 1.4 }}>
          {member.spell}
        </span>
      </div>
    </div>
  );
}

export function AboutUsPage() {
  const { isDark } = useTheme();

  const textPrimary = isDark ? "#e2d9f3"  : "#2C1206";
  const textMuted   = isDark ? "#8b7aa8"  : "#8B5E3C";
  const textDim     = isDark ? "#6b5a80"  : "#A07850";
  const accentCol   = isDark ? "#00e5ff"  : "#7B3A10";
  const cardBg      = isDark
    ? "linear-gradient(135deg,rgba(0,229,255,0.05),rgba(168,85,247,0.05),rgba(13,1,34,0.7))"
    : "linear-gradient(135deg,rgba(255,248,240,0.9),rgba(235,215,185,0.7))";
  const cardBorder  = isDark ? "rgba(0,229,255,0.15)" : "rgba(100,55,15,0.2)";

  return (
    <div className="flex-1 overflow-y-auto px-6 py-5">
      {/* Header banner */}
      <div className="rounded-2xl p-7 mb-6 relative overflow-hidden"
        style={{ background: cardBg, border: `1px solid ${cardBorder}`, backdropFilter: "blur(14px)" }}>
        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10 pointer-events-none"
          style={{ background: isDark ? "#a855f7" : "#C4895A", filter: "blur(60px)", transform: "translate(30%,-30%)" }} />
        <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full opacity-10 pointer-events-none"
          style={{ background: isDark ? "#00e5ff" : "#7B3A10", filter: "blur(50px)", transform: "translate(-20%,30%)" }} />

        {/* Shield icon */}
        <div className="relative flex items-start gap-5">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0"
            style={{
              background: isDark
                ? "linear-gradient(135deg,rgba(0,229,255,0.15),rgba(168,85,247,0.15))"
                : "linear-gradient(135deg,rgba(123,58,16,0.15),rgba(196,137,90,0.15))",
              border: `2px solid ${cardBorder}`,
              boxShadow: isDark ? "0 0 24px rgba(0,229,255,0.2)" : "0 0 24px rgba(123,58,16,0.15)",
            }}>
            <Shield size={28} style={{ color: accentCol, filter: `drop-shadow(0 0 8px ${accentCol})` }} />
          </div>

          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 style={{ fontFamily: "'Orbitron',monospace", fontWeight: 800, fontSize: "20px", color: textPrimary, letterSpacing: "0.04em" }}>
                Meet the Squad
              </h1>
              <span style={{ fontSize: "20px" }}>✨</span>
            </div>
            <p style={{ fontSize: "12px", color: textMuted, lineHeight: 1.7, maxWidth: 540 }}>
              ThreatQuest was forged in late-night sessions, cold brew, and a shared obsession with making cybersecurity feel less like homework and more like an adventure.
              We're four hackers-at-heart who turned a hackathon idea into a mission.
            </p>
            <div className="flex items-center gap-4 mt-4 flex-wrap">
              {[
                { label: "Built at Hackathon 2025", icon: "🏆" },
                { label: "4 Developers", icon: "👥" },
                { label: "72hrs of hacking", icon: "⏱️" },
                { label: "∞ cups of coffee", icon: "☕" },
              ].map(t => (
                <div key={t.label} className="flex items-center gap-1.5"
                  style={{ fontSize: "10px", color: textDim, fontFamily: "'JetBrains Mono',monospace" }}>
                  <span>{t.icon}</span> {t.label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Team grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {team.map((member) => (
          <TeamCard key={member.name} member={member} isDark={isDark} />
        ))}
      </div>

      {/* Mission strip */}
      <div className="rounded-2xl p-5 mb-6 flex items-center gap-5"
        style={{ background: isDark ? "linear-gradient(135deg,rgba(0,229,255,0.05),rgba(168,85,247,0.05),rgba(13,1,34,0.6))" : "linear-gradient(135deg,rgba(255,248,240,0.85),rgba(235,215,185,0.6))", border: `1px solid ${cardBorder}`, backdropFilter: "blur(12px)" }}>
        <div className="text-4xl shrink-0">🛡️</div>
        <div>
          <div style={{ fontFamily: "'Orbitron',monospace", fontSize: "12px", fontWeight: 700, color: accentCol, letterSpacing: "0.06em", marginBottom: "6px" }}>
            OUR MISSION
          </div>
          <p style={{ fontSize: "11px", color: textMuted, lineHeight: 1.7 }}>
            Cybersecurity shouldn't be intimidating. ThreatQuest gamifies your digital safety — turning every scan, every fix, and every hardened defence into XP, badges, and levels.
            Because the best security habit is one you actually keep.
          </p>
        </div>
      </div>

      {/* Motto */}
      <div className="rounded-2xl p-5 text-center mb-8"
        style={{ background: isDark ? "rgba(255,255,255,0.02)" : "rgba(255,248,240,0.6)", border: `1px solid ${isDark ? "rgba(255,255,255,0.05)" : "rgba(100,55,15,0.12)"}` }}>
        <div style={{
          fontFamily: "'Orbitron',monospace", fontSize: "15px", fontWeight: 800,
          letterSpacing: "0.1em",
          background: isDark
            ? "linear-gradient(90deg,#00e5ff,#a855f7,#f472b6)"
            : "linear-gradient(90deg,#7B3A10,#C4895A,#A0522D)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}>
          Level up. Lock down. Stay legendary.
        </div>
        <p style={{ fontSize: "10px", color: textDim, fontFamily: "'JetBrains Mono',monospace", marginTop: "6px" }}>
          — The ThreatQuest Team
        </p>
      </div>
    </div>
  );
}
