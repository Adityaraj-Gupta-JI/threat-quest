import { useState } from "react";
import {
  Shield, Home, Activity, Search, Mail, Trophy, Clock,
  Lightbulb, ChevronRight, Zap, LogOut, Users
} from "lucide-react";
import { useTheme } from "./ThemeContext";

const navItems = [
  { icon: Home,      label: "Dashboard",     id: "dashboard",  badge: null },
  { icon: Activity,  label: "Threat Monitor",id: "threats",    badge: "3" },
  { icon: Search,    label: "URL Scanner",   id: "url-scan",   badge: null },
  { icon: Mail,      label: "Email Leak",    id: "email-leak", badge: "!" },
  { icon: Trophy,    label: "XP & Badges",   id: "badges",     badge: null },
  { icon: Clock,     label: "Activity Log",  id: "activity",   badge: null },
  { icon: Lightbulb, label: "Suggestions",   id: "suggestions",badge: "5" },
];

interface SidebarProps {
  activeSection: string;
  onNavigate: (id: string) => void;
}

export function Sidebar({ activeSection, onNavigate }: SidebarProps) {
  const { isDark } = useTheme();

  // theme-aware tokens
  const sidebarBg     = isDark
    ? "linear-gradient(180deg,rgba(20,2,50,0.97) 0%,rgba(13,1,34,0.95) 100%)"
    : "linear-gradient(180deg,rgba(235,215,185,0.98) 0%,rgba(245,230,208,0.96) 100%)";
  const borderCol     = isDark ? "rgba(0,229,255,0.12)"  : "rgba(100,55,15,0.18)";
  const accentCol     = isDark ? "#00e5ff"               : "#7B3A10";
  const accentGlow    = isDark ? "rgba(0,229,255,0.2)"   : "rgba(123,58,16,0.15)";
  const accentBorder  = isDark ? "rgba(0,229,255,0.4)"   : "rgba(123,58,16,0.4)";
  const textMuted     = isDark ? "#8b7aa8"               : "#8B5E3C";
  const textDim       = isDark ? "#6b5a80"               : "#A07850";
  const activeCardBg  = isDark
    ? "linear-gradient(135deg,rgba(0,229,255,0.12),rgba(168,85,247,0.08))"
    : "linear-gradient(135deg,rgba(123,58,16,0.12),rgba(196,137,90,0.08))";
  const activeCardBdr = isDark ? "rgba(0,229,255,0.25)"  : "rgba(123,58,16,0.3)";
  const activeTextCol = isDark ? "#e2d9f3"               : "#2C1206";
  const barDivider    = isDark ? "rgba(0,229,255,0.08)"  : "rgba(100,55,15,0.12)";
  const playerCardBg  = isDark
    ? "linear-gradient(135deg,rgba(168,85,247,0.12),rgba(0,229,255,0.06))"
    : "linear-gradient(135deg,rgba(196,137,90,0.18),rgba(123,58,16,0.1))";
  const playerCardBdr = isDark ? "rgba(168,85,247,0.2)"  : "rgba(123,58,16,0.25)";
  const xpGradient    = isDark
    ? "linear-gradient(90deg,#a855f7,#00e5ff)"
    : "linear-gradient(90deg,#C4895A,#7B3A10)";
  const xpGlow        = isDark ? "rgba(0,229,255,0.5)"   : "rgba(123,58,16,0.35)";
  const xpNextCol     = isDark ? "#a855f7"               : "#A0522D";
  const xpBarTrack    = isDark ? "rgba(255,255,255,0.1)" : "rgba(100,55,15,0.12)";
  const badgeBg       = (isBang: boolean) => isDark
    ? (isBang ? "rgba(255,77,109,0.2)"  : "rgba(0,229,255,0.12)")
    : (isBang ? "rgba(180,30,30,0.15)"  : "rgba(123,58,16,0.12)");
  const badgeColor    = (isBang: boolean) => isDark
    ? (isBang ? "#ff4d6d" : "#00e5ff")
    : (isBang ? "#C0392B" : "#7B3A10");
  const badgeBorder   = (isBang: boolean) => isDark
    ? (isBang ? "rgba(255,77,109,0.3)"  : "rgba(0,229,255,0.2)")
    : (isBang ? "rgba(180,30,30,0.25)"  : "rgba(123,58,16,0.25)");
  const avatarGrad    = isDark
    ? "linear-gradient(135deg,#f472b6,#a855f7)"
    : "linear-gradient(135deg,#C4895A,#7B3A10)";
  const avatarGlow    = isDark ? "rgba(244,114,182,0.4)" : "rgba(123,58,16,0.3)";
  const xpTagCol      = isDark ? "#ffd166"               : "#A0522D";
  const logoVersionCol = isDark ? "#8b7aa8"              : "#8B5E3C";

  return (
    <aside
      className="flex flex-col w-60 h-full shrink-0 relative z-20"
      style={{
        background: sidebarBg,
        borderRight: `1px solid ${borderCol}`,
        backdropFilter: "blur(20px)",
        transition: "background 0.4s ease",
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b" style={{ borderColor: borderCol }}>
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          style={{
            background: `linear-gradient(135deg,${accentGlow},${accentGlow})`,
            border: `1px solid ${accentBorder}`,
            boxShadow: `0 0 16px ${accentGlow}`,
          }}
        >
          <Shield size={18} style={{ color: accentCol }} />
        </div>
        <div>
          <div style={{
            fontFamily: "'Orbitron',monospace", fontWeight: 700, fontSize: "13px",
            color: accentCol, letterSpacing: "0.05em",
            textShadow: isDark ? "0 0 10px rgba(0,229,255,0.6)" : "none",
          }}>
            ThreatQuest
          </div>
          <div style={{ fontSize: "10px", color: logoVersionCol, fontFamily: "'JetBrains Mono',monospace" }}>
            v2.4.1 · ONLINE
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1 overflow-y-auto">
        <div style={{ fontSize: "9px", color: textMuted, letterSpacing: "0.12em", paddingLeft: "12px", paddingBottom: "6px", fontFamily: "'JetBrains Mono',monospace" }}>
          MAIN MENU
        </div>

        {navItems.map((item) => {
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl w-full text-left transition-all duration-200 group relative"
              style={{
                background: isActive ? activeCardBg : "transparent",
                border: isActive ? `1px solid ${activeCardBdr}` : "1px solid transparent",
                color: isActive ? accentCol : textMuted,
              }}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full"
                  style={{ background: accentCol, boxShadow: `0 0 8px ${accentCol}` }} />
              )}
              <item.icon size={15} style={{
                color: isActive ? accentCol : textDim,
                filter: isActive ? `drop-shadow(0 0 4px ${accentCol})` : "none",
                transition: "all 0.2s",
              }} />
              <span style={{ fontSize: "12.5px", fontWeight: isActive ? 600 : 400, flex: 1, color: isActive ? activeTextCol : textMuted }}>
                {item.label}
              </span>
              {item.badge && (
                <span className="px-1.5 py-0.5 rounded-md" style={{
                  fontSize: "9px", fontFamily: "'JetBrains Mono',monospace",
                  background: badgeBg(item.badge === "!"),
                  color: badgeColor(item.badge === "!"),
                  border: `1px solid ${badgeBorder(item.badge === "!")}`,
                }}>
                  {item.badge}
                </span>
              )}
              {isActive && <ChevronRight size={12} style={{ color: accentCol, opacity: 0.6 }} />}
            </button>
          );
        })}

        <div style={{ height: 1, background: barDivider, margin: "8px 0" }} />

        <div style={{ fontSize: "9px", color: textMuted, letterSpacing: "0.12em", paddingLeft: "12px", paddingBottom: "6px", fontFamily: "'JetBrains Mono',monospace" }}>
          SYSTEM
        </div>

        {/* About Us */}
        <button
          onClick={() => onNavigate("about")}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl w-full text-left transition-all duration-200 relative"
          style={{
            background: activeSection === "about" ? activeCardBg : "transparent",
            border: activeSection === "about" ? `1px solid ${activeCardBdr}` : "1px solid transparent",
            color: activeSection === "about" ? accentCol : textMuted,
          }}
        >
          {activeSection === "about" && (
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full"
              style={{ background: accentCol, boxShadow: `0 0 8px ${accentCol}` }} />
          )}
          <Users size={15} style={{
            color: activeSection === "about" ? accentCol : textDim,
            filter: activeSection === "about" ? `drop-shadow(0 0 4px ${accentCol})` : "none",
          }} />
          <span style={{ fontSize: "12.5px", fontWeight: activeSection === "about" ? 600 : 400, color: activeSection === "about" ? activeTextCol : textMuted }}>
            About Us
          </span>
          {activeSection === "about" && <ChevronRight size={12} style={{ color: accentCol, opacity: 0.6 }} />}
        </button>
      </nav>

      {/* Player Card */}
      <div className="mx-3 mb-4 p-3 rounded-xl" style={{ background: playerCardBg, border: `1px solid ${playerCardBdr}` }}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm"
            style={{ background: avatarGrad, boxShadow: `0 0 10px ${avatarGlow}` }}>
            🎮
          </div>
          <div className="flex-1 min-w-0">
            <div style={{ fontSize: "11px", fontWeight: 600, color: isDark ? "#e2d9f3" : "#2C1206" }}>CyberKitten_99</div>
            <div className="flex items-center gap-1">
              <Zap size={9} style={{ color: xpTagCol }} />
              <span style={{ fontSize: "9px", color: xpTagCol, fontFamily: "'JetBrains Mono',monospace" }}>
                Lv.12 · 4,250 XP
              </span>
            </div>
          </div>
          <button style={{ color: textDim }}>
            <LogOut size={13} />
          </button>
        </div>
        <div className="mt-2 rounded-full overflow-hidden" style={{ height: "3px", background: xpBarTrack }}>
          <div className="h-full rounded-full" style={{ width: "68%", background: xpGradient, boxShadow: `0 0 6px ${xpGlow}` }} />
        </div>
        <div className="flex justify-between mt-1">
          <span style={{ fontSize: "8px", color: textDim, fontFamily: "'JetBrains Mono',monospace" }}>4,250 / 6,250 XP</span>
          <span style={{ fontSize: "8px", color: xpNextCol, fontFamily: "'JetBrains Mono',monospace" }}>Lv.13 →</span>
        </div>
      </div>
    </aside>
  );
}
