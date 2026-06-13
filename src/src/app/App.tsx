import { useState } from "react";
import { ThemeProvider, useTheme } from "./components/ThemeContext";
import { AboutUsPage } from "./components/AboutUsPage";
import bgImage from "../imports/AdobeExpressPhotos_700b73e2ff004334b2124177d77c456f_CopyEdited.jpg";
import { Sidebar } from "./components/Sidebar";
import { TopBar } from "./components/TopBar";
import { SecurityScorePanel } from "./components/SecurityScorePanel";
import { ThreatSummaryCards } from "./components/ThreatSummaryCards";
import { URLScanWidget } from "./components/URLScanWidget";
import { EmailLeakChecker } from "./components/EmailLeakChecker";
import { XPBadgesPanel } from "./components/XPBadgesPanel";
import { ActivityTimeline } from "./components/ActivityTimeline";
import { ImprovementSuggestions } from "./components/ImprovementSuggestions";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Sparkles, TrendingUp } from "lucide-react";
import { ThreatMonitor } from "./components/ThreatMonitor";
import { URLScannerPage } from "./components/URLScanner";
import { SuggestionsPage } from "./components/SuggestionsPage";
import { XPBadgesFullPage } from "./components/XPBadgesFullPage";
import { ActivityLog } from "./components/ActivityLog";
import { EmailLeakPage } from "./components/EmailLeakPage";

{/* MARKER-MAKE-KIT-INVOKED */}

const threatData = [
  { day: "Mon", threats: 2, blocked: 2 },
  { day: "Tue", threats: 5, blocked: 4 },
  { day: "Wed", threats: 3, blocked: 3 },
  { day: "Thu", threats: 8, blocked: 7 },
  { day: "Fri", threats: 4, blocked: 4 },
  { day: "Sat", threats: 6, blocked: 5 },
  { day: "Sun", threats: 3, blocked: 3 },
];

function ThreatChart() {
  return (
    <div
      className="rounded-2xl p-5"
      style={{
        background: "linear-gradient(135deg, rgba(0,229,255,0.04), rgba(13,1,34,0.7))",
        border: "1px solid rgba(0,229,255,0.12)",
        backdropFilter: "blur(10px)",
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <TrendingUp size={14} style={{ color: "#00e5ff", filter: "drop-shadow(0 0 4px #00e5ff)" }} />
          <h3 style={{ fontSize: "12px", color: "#00e5ff", fontFamily: "'Orbitron', monospace", letterSpacing: "0.08em" }}>
            THREAT ACTIVITY
          </h3>
        </div>
        <div className="flex gap-3">
          <span className="flex items-center gap-1" style={{ fontSize: "9px", color: "#8b7aa8", fontFamily: "'JetBrains Mono', monospace" }}>
            <span className="inline-block w-2 h-2 rounded-full" style={{ background: "#ff4d6d" }} /> Detected
          </span>
          <span className="flex items-center gap-1" style={{ fontSize: "9px", color: "#8b7aa8", fontFamily: "'JetBrains Mono', monospace" }}>
            <span className="inline-block w-2 h-2 rounded-full" style={{ background: "#00e5ff" }} /> Blocked
          </span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={140}>
        <AreaChart data={threatData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
          <XAxis
            dataKey="day"
            tick={{ fontSize: 9, fill: "#6b5a80", fontFamily: "'JetBrains Mono', monospace" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 9, fill: "#6b5a80", fontFamily: "'JetBrains Mono', monospace" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              background: "rgba(20,2,50,0.95)",
              border: "1px solid #00e5ff33",
              borderRadius: "10px",
              fontSize: "10px",
              color: "#e2d9f3",
              fontFamily: "'JetBrains Mono', monospace",
            }}
            cursor={{ stroke: "#00e5ff26", strokeWidth: 1 }}
          />
          <Area type="monotone" dataKey="threats" stroke="#ff4d6d" strokeWidth={2} fill="#ff4d6d" fillOpacity={0.12} dot={false} />
          <Area type="monotone" dataKey="blocked" stroke="#00e5ff" strokeWidth={2} fill="#00e5ff" fillOpacity={0.1} dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// ── Nav wrapper — adds a "View full page →" link to any dashboard section ──
function NavSection({
  children, label, to, onNavigate, isDark,
}: {
  children: React.ReactNode; label: string; to: string;
  onNavigate: (s: string) => void; isDark: boolean;
}) {
  const accentCol = isDark ? "#00e5ff"        : "#00607A";
  const btnBg     = isDark ? "rgba(0,229,255,0.08)" : "rgba(0,96,122,0.08)";
  const btnBdr    = isDark ? "rgba(0,229,255,0.2)"  : "rgba(0,96,122,0.2)";
  return (
    <div className="relative group/ns">
      {children}
      <button
        onClick={() => onNavigate(to)}
        className="absolute top-3.5 right-3.5 flex items-center gap-1 px-2.5 py-1 rounded-lg opacity-0 group-hover/ns:opacity-100 transition-all duration-200 z-10"
        style={{ background: btnBg, border: `1px solid ${btnBdr}`, fontSize: "9px", color: accentCol, fontFamily: "'JetBrains Mono',monospace", fontWeight: 600, letterSpacing: "0.04em", backdropFilter: "blur(8px)" }}
      >
        {label} →
      </button>
    </div>
  );
}

// ── Dashboard page ─────────────────────────────────────────────────────────────
function DashboardPage({ onNavigate, isDark }: { onNavigate: (s: string) => void; isDark: boolean }) {
  const t1     = "var(--tq-t1)";
  const t2     = "var(--tq-t2)";
  const t3     = "var(--tq-t3)";
  const pink   = "var(--tq-pink)";
  const neon   = "var(--tq-neon)";
  const purple = "var(--tq-purple)";
  const gold   = "var(--tq-gold)";

  return (
    <main className="flex-1 overflow-y-auto px-6 py-5">
      {/* ── Hero header ── */}
      <div className="mb-6">
        {/* Motivational quote */}
        <div className="mb-3">
          <div
            style={{
              fontFamily: "'Orbitron', monospace",
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              background: isDark
                ? "linear-gradient(90deg, #00e5ff, #a855f7, #f472b6)"
                : "linear-gradient(90deg, #00607A, #5C1F8A, #8B1830)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              display: "inline-block",
              marginBottom: "6px",
            }}
          >
            ✦ &nbsp;Level up.&nbsp; Lock down.&nbsp; Stay legendary.&nbsp; ✦
          </div>
          <div
            style={{
              height: "1px",
              width: "100%",
              background: isDark
                ? "linear-gradient(90deg, rgba(0,229,255,0.35), rgba(168,85,247,0.15), transparent)"
                : "linear-gradient(90deg, rgba(0,96,122,0.3), rgba(92,31,138,0.12), transparent)",
            }}
          />
        </div>

        {/* Heading row */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 style={{ fontSize: "16px", fontFamily: "'Orbitron', monospace", fontWeight: 700, color: t1, letterSpacing: "0.05em" }}>
                Security Dashboard
              </h1>
              <Sparkles size={14} style={{ color: pink, filter: isDark ? "drop-shadow(0 0 4px #f472b6)" : "none" }} />
            </div>
            <p style={{ fontSize: "10px", color: t3, fontFamily: "'JetBrains Mono', monospace" }}>
              Welcome back, CyberKitten_99 ✨ — Saturday, June 13, 2026
            </p>
          </div>
        </div>
      </div>

      {/* Threat Summary Cards */}
      <NavSection label="Threat Monitor" to="threats" onNavigate={onNavigate} isDark={isDark}>
        <ThreatSummaryCards />
      </NavSection>

      {/* Row 2: Score + Chart */}
      <div className="grid grid-cols-12 gap-4 mt-4">
        <div className="col-span-4">
          <SecurityScorePanel />
        </div>
        <div className="col-span-8 flex flex-col gap-4">
          <NavSection label="Threat Monitor" to="threats" onNavigate={onNavigate} isDark={isDark}>
            <ThreatChart />
          </NavSection>
          <div className="grid grid-cols-2 gap-4">
            <NavSection label="URL Scanner" to="url-scan" onNavigate={onNavigate} isDark={isDark}>
              <URLScanWidget />
            </NavSection>
            <NavSection label="Email Leak" to="email-leak" onNavigate={onNavigate} isDark={isDark}>
              <EmailLeakChecker />
            </NavSection>
          </div>
        </div>
      </div>

      {/* Row 3: XP + Timeline + Suggestions */}
      <div className="grid grid-cols-12 gap-4 mt-4 pb-6">
        <div className="col-span-4">
          <NavSection label="XP & Badges" to="badges" onNavigate={onNavigate} isDark={isDark}>
            <XPBadgesPanel />
          </NavSection>
        </div>
        <div className="col-span-4">
          <NavSection label="Activity Log" to="activity" onNavigate={onNavigate} isDark={isDark}>
            <ActivityTimeline />
          </NavSection>
        </div>
        <div className="col-span-4">
          <NavSection label="Suggestions" to="suggestions" onNavigate={onNavigate} isDark={isDark}>
            <ImprovementSuggestions />
          </NavSection>
        </div>
      </div>
    </main>
  );
}

function AppInner() {
  const [activeSection, setActiveSection] = useState("dashboard");
  const { isDark } = useTheme();

  const pageBg   = isDark ? "#0d0122" : "#F5E6D0";
  const overlayBg = isDark
    ? "radial-gradient(ellipse at 20% 50%, rgba(32,1,66,0.9) 0%, rgba(13,1,34,0.97) 60%, rgba(0,229,255,0.02) 100%)"
    : "radial-gradient(ellipse at 20% 50%, rgba(245,220,190,0.92) 0%, rgba(255,248,240,0.97) 70%, rgba(200,160,100,0.05) 100%)";
  const gridLine = isDark ? "rgba(0,229,255,0.03)" : "rgba(100,55,15,0.04)";

  return (
    <div className="size-full flex overflow-hidden relative" style={{ fontFamily: "'Inter', sans-serif", background: pageBg, transition: "background 0.4s ease" }}>
      {/* Background image with overlay */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <img
          src={bgImage}
          alt="Cybersecurity background"
          className="w-full h-full object-cover"
          style={{ opacity: isDark ? 0.12 : 0.05, transition: "opacity 0.4s ease" }}
        />
        <div className="absolute inset-0" style={{ background: overlayBg, transition: "background 0.4s ease" }} />
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(${gridLine} 1px, transparent 1px), linear-gradient(90deg, ${gridLine} 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }} />
      </div>

      {/* Sidebar */}
      <Sidebar activeSection={activeSection} onNavigate={setActiveSection} />

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden relative z-10">
        <TopBar />

        {/* Page router */}
        {activeSection === "threats" ? (
          <ThreatMonitor />
        ) : activeSection === "url-scan" ? (
          <URLScannerPage />
        ) : activeSection === "suggestions" ? (
          <SuggestionsPage />
        ) : activeSection === "badges" ? (
          <XPBadgesFullPage />
        ) : activeSection === "activity" ? (
          <ActivityLog />
        ) : activeSection === "email-leak" ? (
          <EmailLeakPage />
        ) : activeSection === "about" ? (
          <AboutUsPage />
        ) : (
          <DashboardPage onNavigate={setActiveSection} isDark={isDark} />
        )}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppInner />
    </ThemeProvider>
  );
}
