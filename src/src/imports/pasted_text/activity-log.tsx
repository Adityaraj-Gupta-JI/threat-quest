You are an expert Frontend Developer and UI/UX Engineer. Your task is to build a comprehensive, responsive, and pixel-perfect "Activity Log" history page (Route: `/dashboard/activity-log`) for the cybersecurity gamified app "ThreatQuest," integrating seamlessly into the UI framework established in image_c42a9c.jpg.

### 1. Visual & UI Context (Based on image_c42a9c.jpg)
- Theme: Deep Cyberpunk / Sci-Fi Dark Mode.
- Color Palette: 
  - Backgrounds: Semi-transparent dark violet panels, deep indigo grids, and dark navy primary shells.
  - Accent Colorways: Glowing neon-cyan (`#00f0ff`) for safe states/navigation items, neon pink/red for alerts/blocked threats, vibrant purple for badge achievements, and amber for warnings.
- Layout Integration: Retain the sticky left sidebar navigation system (highlighting the "Activity Log" tab, which sits right above the Suggestions item). The layout must match the design language of the active dashboard visible in image_c42a9c.jpg.

### 2. Layout Structure & Core Sections
The Activity Log page expands on "Component E: Activity Timeline" from the product wireframe documentation. It must be structured into the following sections:

#### A. Log Header & Analytics Summary
- Title: "Activity Log" or "Security Audit Trail".
- Subtitle: "A chronological record of system scans, detected anomalies, and defensive achievements."
- Mini Analytics Strip: Render a 3-card micro-metric strip displaying cumulative metrics to summarize the log:
  - Total Scans Executed (e.g., "1,248")
  - Total Threats Deflected (e.g., "42")
  - Total XP Harvested (e.g., "+3,450 XP")

#### B. Filter, Search, & Export Toolbar
- Universal Log Search: An inline search input box to quickly filter logs by target domain, email string, or action type (e.g., search placeholder: "Filter logs by URL, email, or event type...").
- Category Filter Pills: Interactive multi-select filter tokens:
  - [All Activities]
  - [Scans 🔍]
  - [Breach Leaks 🔑]
  - [Threat Alerts 🚨]
  - [Badges & Levels 🏆]
- Action Button: A clean "Export Log (CSV)" or "Clear History" utility button styled with a subtle neon border.

#### C. Chronological Audit Timeline (The Core Component)
Render an elegant, highly scannable vertical timeline feed grouped by timestamp. Each log line item must feature:
1. Timestamp Indicator: Distinctly displaying the exact time (e.g., "12:04 PM") and relative date markers ("Today", "Yesterday", "June 11").
2. Activity Type Icon: Wrapped inside a stylized circular badge indicating the event type:
   - Scan event: A radar or magnifying glass icon glowing in neon cyan.
   - Leak event: A broken key or database breach icon glowing in amber.
   - Threat event: A biohazard or shield alert icon glowing in pulsing neon pink.
   - Badge event: A shimmering trophy icon glowing in neon purple.
3. Event Description: Clear string rendering (e.g., "Scanned URL: google.com", "Checked email exposure: alex@email.com", "Auto-protection blocked 2 phishing threats").
4. Verdict / Status Tag: Bold color-coded inline status chip (e.g., "[SAFE]", "[NO LEAKS FOUND]", "[CRITICAL EXPOSURE]", "[UNLOCKED]").
5. Gamification Reward Tag: High-contrast accent label showing the immediate XP payout resulting from that behavior (e.g., `+15 XP`, `+20 XP`, `+50 XP`).

### 3. Mock Data Structure to Populate
Render the log dynamically utilizing the following JSON schema:
[
  { "id": 101, "time": "12:04 PM", "date": "Today", "type": "scan", "target": "google.com", "result": "safe", "xp": 15, "details": "SSL valid. Domain reputation pristine." },
  { "id": 102, "time": "11:52 AM", "date": "Today", "type": "leak_check", "target": "alex@email.com", "result": "clean", "xp": 20, "details": "Cross-referenced across 47 dark web breach databases." },
  { "id": 103, "time": "11:30 AM", "date": "Today", "type": "badge", "target": "First Scan Badge", "result": "unlocked", "xp": 50, "details": "Achievement unlocked for running your inaugural domain verification search." },
  { "id": 104, "time": "10:15 AM", "date": "Today", "type": "alert", "target": "Malicious Redirect Script", "result": "blocked", "xp": 0, "details": "Auto-protection intercepted and dropped 2 aggressive phishing payload routing handshakes." },
  { "id": 105, "time": "04:30 PM", "date": "Yesterday", "type": "leak_check", "target": "alex@email.com", "result": "exposed", "xp": 25, "details": "Credentials leaked in 'Company XYZ' 2023 breach. Password hash compromised." }
]

### 4. Interactions & Component States
- Expandable Log Details: Clicking on any timeline row should expand downward (Accordion behavior) to expose the raw data attributes, specific risk breakdown components, or remediation links for alerts.
- Empty State: Provide a clean "No Activity Yet" skeleton structure if filters return zero results, accompanied by a CTA button saying "Run a New Scan".
- Loading State: Use a skeleton shimmer animation effect mapped out across the entire timeline rows during initial loads or category switching.
- Pagination / Infinite Scroll: Provide a "Load More Entries" terminal trigger at the bottom of the timeline loop.