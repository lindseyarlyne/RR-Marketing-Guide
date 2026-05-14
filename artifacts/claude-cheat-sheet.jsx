import { useState } from "react";

const sections = [
  {
    id: "surfaces",
    emoji: "🖥️",
    title: "Where to Use Claude",
    color: "#c084fc",
    items: [
      {
        name: "Claude.ai (Web)",
        badge: "All plans",
        desc: "Full-featured chat at claude.ai. Start here for everything — projects, memory, artifacts, deep research, file uploads, voice.",
        tip: "Pin important conversations inside Projects to give Claude persistent context across sessions.",
        link: "https://claude.ai"
      },
      {
        name: "Claude Desktop App",
        badge: "All plans",
        desc: "macOS & Windows app. Lives in your dock for instant access. Syncs memory, projects, and preferences across all devices. Enables local file + desktop extensions.",
        tip: "Use Quick Entry (keyboard shortcut) to fire off a prompt from anywhere on your system without opening a full window.",
        link: "https://claude.com/download"
      },
      {
        name: "Claude Mobile App",
        badge: "All plans",
        desc: "iOS & Android. Connects to device apps like Maps, iMessage, and Photos. Conversations sync with web and desktop.",
        tip: "Share a task from your phone and let Cowork (on desktop) execute it — great for kicking off work on the go.",
        link: "https://claude.com/download"
      },
    ]
  },
  {
    id: "chrome",
    emoji: "🌐",
    title: "Claude in Chrome (Beta)",
    color: "#f472b6",
    items: [
      {
        name: "What it does",
        badge: "Paid plans",
        desc: "Browses, clicks, fills forms, and navigates pages autonomously inside Chrome and Edge. Reads the current page without you copy-pasting anything.",
        tip: "Install from the Chrome Web Store, pin it, then enable it per conversation from the Connectors dropdown.",
        link: "https://claude.com/chrome"
      },
      {
        name: "Record Workflows",
        badge: "Power feature",
        desc: "Click record, perform your steps once, and Claude learns the workflow as a reusable shortcut — great for repetitive web tasks.",
        tip: "Schedule saved shortcuts to run on a recurring basis (daily, weekly, monthly) via the clock icon.",
      },
      {
        name: "Multi-Tab Mode",
        badge: "Power feature",
        desc: "Drag tabs into Claude's tab group and it can view and interact with all of them simultaneously — no more manual tab-switching to compile info.",
        tip: "Claude has built-in knowledge of Slack, Gmail, Google Calendar, Google Docs, and GitHub navigation.",
      },
      {
        name: "Safety Rules",
        badge: "⚠️ Important",
        desc: "Avoid financial transactions, password managers, or sensitive personal data. Start only on trusted, familiar sites.",
        tip: "Use 'Ask before acting' mode so Claude creates a plan for your approval before executing anything.",
      },
    ]
  },
  {
    id: "cowork",
    emoji: "🤝",
    title: "Claude Cowork",
    color: "#34d399",
    items: [
      {
        name: "What it is",
        badge: "Desktop only",
        desc: "A desktop tool for non-developers to automate file and task management. Assign tasks, Claude completes them in the background.",
        tip: "Pair with Claude in Chrome: Chrome does web research, Cowork produces the final output file (Excel, PowerPoint, reports).",
        link: "https://claude.com/download"
      },
      {
        name: "Phone-to-Desktop",
        badge: "Mobile + Desktop",
        desc: "Share a task from your mobile app and Cowork picks it up on your desktop automatically.",
        tip: "Desktop app must be running for Cowork to complete background tasks.",
      },
    ]
  },
  {
    id: "claudecode",
    emoji: "💻",
    title: "Claude Code",
    color: "#60a5fa",
    items: [
      {
        name: "CLI Tool",
        badge: "Developers",
        desc: "Command-line agent for agentic coding. Run from your terminal. Reads your codebase, writes, edits, tests, and debugs code end-to-end.",
        tip: "Run /chrome to enable browser integration so Claude can build in terminal and test visually in Chrome in the same workflow.",
        link: "https://docs.claude.com/en/docs/claude-code/overview"
      },
      {
        name: "VS Code Integration",
        badge: "Developers",
        desc: "Claude Code works inside VS Code for inline suggestions and full agentic coding without leaving your editor.",
        tip: "Use /chrome --default to auto-connect the browser every session and skip the manual step.",
      },
      {
        name: "Remote Control (Mobile)",
        badge: "Developers",
        desc: "Use the Claude mobile app's Remote Control feature to send commands to Claude Code CLI running on your desktop.",
        tip: "Great for kicking off builds or checking CI status from your phone.",
      },
    ]
  },
  {
    id: "claude-excel-pptx",
    emoji: "📊",
    title: "Claude in Excel & PowerPoint",
    color: "#fb923c",
    items: [
      {
        name: "Claude in Excel",
        badge: "Beta",
        desc: "A spreadsheet agent that works inside Excel. Build models, clean data, and generate formulas through conversation.",
        tip: "Great for financial models — pair with Cowork's research layer to populate data automatically.",
      },
      {
        name: "Claude in PowerPoint",
        badge: "Beta",
        desc: "A slides agent inside PowerPoint. Create and edit presentation decks conversationally.",
        tip: "Use Claude.ai's deep research first to gather content, then bring it into PowerPoint via this agent.",
      },
    ]
  },
  {
    id: "connectors",
    emoji: "🔌",
    title: "MCP Connectors & Integrations",
    color: "#a78bfa",
    items: [
      {
        name: "Built-in Connectors",
        badge: "Web + Mobile",
        desc: "Google Drive, Slack, Gmail, Google Calendar, and GitHub work as connectors out of the box on web, desktop, and mobile.",
        tip: "Enable connectors per conversation from the toolbar — they give Claude real-time context from your actual accounts.",
      },
      {
        name: "App Integrations (New)",
        badge: "2025+",
        desc: "Direct integrations with Uber, Spotify, Instacart, Booking.com, TaskRabbit and more — book rides, order food, or hire services from within chat.",
        tip: "Claude suggests relevant apps based on your conversation context. Anthropic confirmed these are ad-free and won't train Claude.",
      },
      {
        name: "Notion, Canva, Semrush",
        badge: "MCP Apps",
        desc: "Third-party MCP servers let Claude directly read and write to Notion pages, generate Canva designs, and pull Semrush SEO data.",
        tip: "Connect MCP apps via Settings → Connectors. Each app requires opt-in — Claude will suggest relevant ones contextually.",
      },
    ]
  },
  {
    id: "prompting",
    emoji: "⚡",
    title: "Power Prompting Tips",
    color: "#facc15",
    items: [
      {
        name: "Use Projects",
        badge: "Essential",
        desc: "Projects give Claude persistent context across conversations. Add a system prompt describing your role, tone, goals, and any recurring context.",
        tip: "For Ritual Runway: create a dedicated project with your tech stack, brand voice, and recurring constraints pre-loaded.",
      },
      {
        name: "Be Specific & Structured",
        badge: "Universal",
        desc: "Clear instructions beat vague ones every time. Tell Claude the format you want, the length, the audience, and any constraints upfront.",
        tip: "Use XML-style tags (<context>, <task>, <format>) to separate parts of complex prompts — Claude reads them extremely well.",
      },
      {
        name: "Upload Files for Context",
        badge: "Universal",
        desc: "PDFs, images, CSVs, code files — Claude can read all of them. Uploading actual files beats describing them every time.",
        tip: "For design decisions, upload screenshots or mockups. Claude interprets visuals accurately alongside text instructions.",
      },
      {
        name: "Deep Research Mode",
        badge: "Paid plans",
        desc: "For complex research tasks, enable Deep Research. Claude runs multiple searches, reads full pages, and produces a comprehensive sourced report.",
        tip: "Best for competitive analysis, market research, technical deep-dives, and summarizing large topic areas.",
      },
      {
        name: "Artifacts",
        badge: "Universal",
        desc: "Ask Claude to produce React components, HTML pages, SVGs, Markdown docs, and Mermaid diagrams as interactive rendered artifacts.",
        tip: "Add 'put this in an artifact' to any request for visual, interactive, or downloadable output.",
      },
      {
        name: "Memory",
        badge: "Paid plans",
        desc: "Claude builds memories from your conversations over time. You can also explicitly say 'remember that...' and Claude will store it.",
        tip: "Review and edit your memories in Settings → Memory to keep context accurate as your situation changes.",
      },
    ]
  },
];

export default function ClaudeCheatSheet() {
  const [activeSection, setActiveSection] = useState("surfaces");
  const [expandedItem, setExpandedItem] = useState(null);

  const current = sections.find(s => s.id === activeSection);

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0a0a0f",
      fontFamily: "'Georgia', 'Times New Roman', serif",
      color: "#e2e0f0",
      padding: "0",
    }}>
      {/* Header */}
      <div style={{
        background: "linear-gradient(135deg, #0f0820 0%, #150d2e 50%, #0a0a1a 100%)",
        borderBottom: "1px solid rgba(192,132,252,0.2)",
        padding: "32px 24px 24px",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
          background: "radial-gradient(ellipse at 50% 0%, rgba(192,132,252,0.12) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />
        <div style={{
          fontSize: "11px",
          letterSpacing: "0.25em",
          textTransform: "uppercase",
          color: "#c084fc",
          marginBottom: "8px",
          fontFamily: "monospace",
        }}>
          Anthropic · May 2026
        </div>
        <h1 style={{
          fontSize: "clamp(26px, 5vw, 38px)",
          fontWeight: "400",
          margin: "0 0 8px",
          letterSpacing: "-0.02em",
          background: "linear-gradient(135deg, #e2e0f0 30%, #c084fc 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}>
          Claude · Master Cheat Sheet
        </h1>
        <p style={{ margin: 0, color: "#9b98b8", fontSize: "14px", fontFamily: "monospace" }}>
          Every surface, extension, and power feature — all in one place
        </p>
      </div>

      {/* Nav Pills */}
      <div style={{
        display: "flex",
        overflowX: "auto",
        gap: "8px",
        padding: "16px",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        scrollbarWidth: "none",
        WebkitScrollbar: { display: "none" },
        background: "#0d0d18",
      }}>
        {sections.map(s => (
          <button
            key={s.id}
            onClick={() => { setActiveSection(s.id); setExpandedItem(null); }}
            style={{
              flexShrink: 0,
              padding: "7px 14px",
              borderRadius: "20px",
              border: activeSection === s.id
                ? `1px solid ${s.color}`
                : "1px solid rgba(255,255,255,0.1)",
              background: activeSection === s.id
                ? `${s.color}22`
                : "transparent",
              color: activeSection === s.id ? s.color : "#9b98b8",
              fontSize: "12px",
              cursor: "pointer",
              fontFamily: "monospace",
              letterSpacing: "0.05em",
              transition: "all 0.2s",
              whiteSpace: "nowrap",
            }}
          >
            {s.emoji} {s.title}
          </button>
        ))}
      </div>

      {/* Section Content */}
      <div style={{ padding: "20px 16px", maxWidth: "700px", margin: "0 auto" }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          marginBottom: "20px",
        }}>
          <span style={{ fontSize: "24px" }}>{current.emoji}</span>
          <h2 style={{
            margin: 0,
            fontSize: "18px",
            fontWeight: "400",
            color: current.color,
            letterSpacing: "0.02em",
          }}>{current.title}</h2>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {current.items.map((item, i) => {
            const key = `${current.id}-${i}`;
            const isOpen = expandedItem === key;
            return (
              <div
                key={key}
                onClick={() => setExpandedItem(isOpen ? null : key)}
                style={{
                  background: isOpen ? `${current.color}0d` : "#111120",
                  border: isOpen
                    ? `1px solid ${current.color}55`
                    : "1px solid rgba(255,255,255,0.07)",
                  borderRadius: "12px",
                  padding: "14px 16px",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", marginBottom: "4px" }}>
                      <span style={{
                        fontSize: "14px",
                        fontWeight: "600",
                        color: isOpen ? current.color : "#e2e0f0",
                        fontFamily: "monospace",
                        transition: "color 0.2s",
                      }}>{item.name}</span>
                      <span style={{
                        fontSize: "10px",
                        padding: "2px 7px",
                        borderRadius: "10px",
                        background: `${current.color}22`,
                        color: current.color,
                        letterSpacing: "0.08em",
                        fontFamily: "monospace",
                        border: `1px solid ${current.color}33`,
                      }}>{item.badge}</span>
                    </div>
                    <p style={{
                      margin: 0,
                      fontSize: "13px",
                      color: "#9b98b8",
                      lineHeight: "1.5",
                      fontFamily: "monospace",
                    }}>{item.desc}</p>
                  </div>
                  <span style={{
                    color: current.color,
                    fontSize: "16px",
                    flexShrink: 0,
                    marginTop: "2px",
                    transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                    transition: "transform 0.2s",
                    opacity: 0.7,
                  }}>▾</span>
                </div>

                {isOpen && (
                  <div style={{
                    marginTop: "12px",
                    paddingTop: "12px",
                    borderTop: `1px solid ${current.color}22`,
                  }}>
                    <div style={{
                      background: `${current.color}11`,
                      borderLeft: `3px solid ${current.color}`,
                      borderRadius: "0 6px 6px 0",
                      padding: "10px 12px",
                      fontSize: "12px",
                      color: "#c8c5e0",
                      fontFamily: "monospace",
                      lineHeight: "1.6",
                    }}>
                      <span style={{ color: current.color, fontWeight: "bold" }}>✦ Pro tip: </span>
                      {item.tip}
                    </div>
                    {item.link && (
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={e => e.stopPropagation()}
                        style={{
                          display: "inline-block",
                          marginTop: "10px",
                          fontSize: "11px",
                          color: current.color,
                          fontFamily: "monospace",
                          textDecoration: "none",
                          letterSpacing: "0.05em",
                          opacity: 0.8,
                        }}
                      >
                        → {item.link.replace("https://", "")}
                      </a>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div style={{
        textAlign: "center",
        padding: "24px 16px 32px",
        color: "#4a4862",
        fontSize: "11px",
        fontFamily: "monospace",
        letterSpacing: "0.1em",
      }}>
        TAP ANY CARD TO EXPAND · CLAUDE.AI · ANTHROPIC 2026
      </div>
    </div>
  );
}
