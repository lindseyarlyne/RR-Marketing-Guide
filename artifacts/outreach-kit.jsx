import { useState } from "react";

const channels = [
  {
    id: "betalist",
    name: "BetaList",
    badge: "DO THIS FIRST",
    badgeColor: "#c17f3a",
    time: "~15 min",
    priority: true,
    warning: "Submit before any public launch. BetaList rejects products that have already gone wide. The DoFollow backlink also helps long-term SEO.",
    tip: "Include a short demo GIF or screenshot. Clearly show the problem you solve. Offer early access as the incentive.",
    fields: [
      { label: "PRODUCT NAME", value: "Ritual Runway" },
      { label: "TAGLINE", value: "Your paycheck, planned before it lands." },
      { label: "DESCRIPTION", value: "Ritual Runway is a paycheck budgeting app that helps biweekly earners, freelancers, and variable-income households track recurring bills, plan each pay period, and always know how much runway they have left. Set up once — stay ahead automatically." },
      { label: "CATEGORY", value: "Finance / Personal Finance" },
      { label: "URL", value: "ritualrunway.com" },
    ]
  },
  {
    id: "producthunt",
    name: "Product Hunt",
    badge: "LAUNCH EVENT",
    badgeColor: "#c17f3a",
    time: "~2–3 hrs prep",
    priority: false,
    warning: "Treat PH as a single launch event, not your growth strategy. Tue–Thu launches perform best. Build your hunter network before launch day — cold launches underperform significantly.",
    tip: "Post at 12:01am PT on a Tuesday or Wednesday. Respond to every comment within the first 4 hours. Ask real users to upvote on launch day — not random asks.",
    fields: [
      { label: "TAGLINE", value: "Know your runway before your paycheck lands" },
      { label: "DESCRIPTION", value: "Ritual Runway is the budgeting app built around how you actually get paid — by paycheck, not by month. Track recurring bills, auto-split them across pay periods, and always know exactly how much is left after obligations. Built for nurses, teachers, freelancers, and anyone paid biweekly." },
      { label: "FIRST COMMENT (MAKER)", value: "Hey PH 👋 I built Ritual Runway after years of getting surprised by bills that didn't line up with my paycheck. Most budgeting apps think in months. We think in pay periods — because that's how income actually works. Would love feedback from anyone who's ever overdrafted the week before payday." },
      { label: "BEST TAGS", value: "Personal Finance, Productivity, Budgeting, Fintech, Subscription Management" },
    ]
  },
  {
    id: "indiehackers",
    name: "Indie Hackers",
    badge: "BUILD IN PUBLIC",
    badgeColor: "#5c7a5c",
    time: "~30 min",
    priority: false,
    warning: "IH community responds to transparency and journey sharing — not product pitches. Don't launch here. Share your story here.",
    tip: "Post your origin story, not a feature list. What problem made you build this? What have you learned so far? Engagement comes from vulnerability and specificity.",
    fields: [
      { label: "POST TITLE", value: "I built a budgeting app because every other one thinks in months. I get paid biweekly." },
      { label: "POST BODY (OPENER)", value: "I'm a solo founder. Non-technical. I used Cursor to build Ritual Runway — a paycheck budgeting app for biweekly earners, freelancers, and variable income households.\n\nMost budgeting apps assume you earn money in a smooth monthly flow. Most people don't. They get paid every two weeks, bills hit on random dates, and by the 12th they're doing the math in their head trying to figure out if they can afford groceries before Friday.\n\nRitual Runway fixes that. Here's what I've learned building it..." },
    ]
  },
  {
    id: "reddit",
    name: "Reddit",
    badge: "HIGH VALUE — READ RULES FIRST",
    badgeColor: "#a05050",
    time: "~20 min per sub",
    priority: false,
    warning: "Never post a link in a subreddit before you have at least 10 days of contribution history there. Read each subreddit's rules before posting. Self-promotion without value = instant ban.",
    tip: "Lead with the problem, not the product. Ask for feedback, not signups. In r/personalfinance especially — be helpful first, mention your app at the end if relevant.",
    fields: [
      { label: "PRIMARY SUBREDDITS", value: "r/personalfinance (4.2M) · r/Frugal (2.8M) · r/financialindependence (2.1M) · r/SideProject (200K)" },
      { label: "r/personalfinance POST TITLE", value: "I track my bills by paycheck instead of by month — anyone else do this? Built a small tool that does it automatically" },
      { label: "r/SideProject POST TITLE", value: "Built a paycheck budgeting app as a solo non-technical founder using Cursor — here's what I learned" },
      { label: "r/Frugal POST TITLE", value: "Splitting bills across pay periods instead of months changed how I budget — tool I made for this" },
    ]
  },
  {
    id: "pinterest",
    name: "Pinterest",
    badge: "ACTIVE CHANNEL",
    badgeColor: "#5c7a5c",
    time: "Ongoing",
    priority: false,
    warning: "Pinterest is evergreen — pins from months ago still drive traffic. Consistency beats volume. 3 pins/week outperforms 20 pins in one day.",
    tip: "Your Etsy printables and your app are two separate funnels that converge here. Budget worksheet pins → Etsy. 'Know your runway' messaging pins → app. Run both simultaneously.",
    fields: [
      { label: "BOARD NAMES", value: "Paycheck Budgeting Tips · Bill Tracking System · Biweekly Budget Printables · Ritual Runway" },
      { label: "PIN TEXT FORMULA", value: "[Relatable problem] + [Simple solution] + [CTA]\nEx: 'Always broke before payday? Try splitting bills by paycheck — not by month. Free worksheet below.'" },
      { label: "TOP KEYWORDS", value: "paycheck budget, biweekly budget template, bill tracker printable, pay period planner, budgeting for nurses, budgeting for freelancers" },
    ]
  },
  {
    id: "instagram",
    name: "Instagram",
    badge: "ACTIVE CHANNEL",
    badgeColor: "#5c7a5c",
    time: "Ongoing",
    priority: false,
    warning: "Static posts only. No Reels, no TikTok cross-posts. Focus on carousel education + aesthetic single posts. Consistency is more important than volume.",
    tip: "Carousel posts (5–8 slides) consistently outperform single images for saves and reach in the finance niche. Each slide = one idea. Hook on slide 1, value on 2–7, CTA on last.",
    fields: [
      { label: "CONTENT PILLARS", value: "1. Education: budgeting by paycheck concepts\n2. Relatable: biweekly earner pain points\n3. Product: app features shown in context\n4. Etsy: printable budget worksheets\n5. Founder: behind-the-scenes building" },
      { label: "CAPTION FORMULA", value: "Hook (line 1 visible before 'more') + Value (body) + CTA + 5 hashtags max" },
      { label: "SAMPLE HOOK LINES", value: "Your budget fails because it thinks you get paid monthly.\nYou're not bad at money. Your app just wasn't built for how you actually earn.\nSplit your bills by paycheck — not by month. Here's how." },
      { label: "HASHTAGS", value: "#paycheckbudget #biweeklybudget #billtracker #budgetingapp #personalfinance" },
    ]
  },
  {
    id: "email",
    name: "Personal Network",
    badge: "DO EARLY",
    badgeColor: "#5c6a8a",
    time: "~1 hr",
    priority: false,
    warning: "This is often the most overlooked channel. Your first 20 users almost always come from direct asks — not launch platforms. Do this before or alongside BetaList.",
    tip: "Don't mass email. Send individual short messages. Personalize one line. Ask for one specific thing (try it, share it, or introduce you to someone who fits the audience).",
    fields: [
      { label: "DM / TEXT TEMPLATE", value: "Hey [name] — I launched something I've been building for a while. It's a budgeting app for people paid biweekly who always feel like bills hit at the wrong time. Would mean a lot if you tried it and told me honestly what you think. ritualrunway.com — takes 2 min to set up." },
      { label: "WHO TO CONTACT FIRST", value: "1. Anyone who's complained about budgeting, bills, or paychecks to you\n2. Nurses, teachers, hourly workers, freelancers in your network\n3. Friends who are good with money (they'll give useful feedback)\n4. Anyone who might share it with their audience" },
    ]
  }
];

const interviewScript = [
  { q: "Walk me through what happens on payday. What's the first thing you do?", purpose: "Reveals current behavior and anxiety points" },
  { q: "When do you feel most financially stressed during a pay period? When do you feel most in control?", purpose: "Maps emotional highs and lows" },
  { q: "How do you currently track which bills come out of which paycheck?", purpose: "Uncovers workarounds and pain" },
  { q: "Have you ever overdrafted or come close because of bill timing? What happened?", purpose: "Validates the core problem" },
  { q: "What do you wish you knew about your money the moment your paycheck hits?", purpose: "Surfaces unmet needs and language to use" },
  { q: "What budgeting apps have you tried? Why did you stop using them?", purpose: "Competitive insight + positioning" },
  { q: "If Ritual Runway worked perfectly, what would a normal Tuesday look like for you?", purpose: "Defines the 'after' state in their words" },
];

const surveyQuestions = [
  { q: "How often do you get paid?", type: "Multiple choice", options: "Weekly / Biweekly / Semi-monthly / Monthly / Irregular" },
  { q: "How stressful is managing bills between paychecks? (1–5)", type: "Scale", options: "1 = No stress · 5 = Very stressful" },
  { q: "Which of these sounds most like you?", type: "Multiple choice", options: "I always know exactly what I can spend / I have a rough idea / I'm usually guessing / I avoid checking" },
  { q: "What's the biggest reason your budget falls apart?", type: "Open text", options: "Free response" },
  { q: "Have you tried a budgeting app in the past 12 months?", type: "Yes/No + follow-up", options: "If yes: why did you stop?" },
  { q: "What would make you actually stick with a budgeting app?", type: "Open text", options: "Free response — this is gold" },
  { q: "Would you pay for an app that automatically splits your bills across each paycheck?", type: "Multiple choice", options: "Yes, definitely / Probably / Maybe / No" },
  { q: "What would you pay per month for it?", type: "Multiple choice", options: "Free only / $3–5 / $6–10 / $11–15 / More than $15" },
];

const launchChecklist = [
  { phase: "Before Launch", items: [
    { task: "Submit to BetaList", done: false, note: "Must be before any public launch" },
    { task: "Set up Product Hunt upcoming page", done: false, note: "Start collecting followers early" },
    { task: "Create Indie Hackers account + contribute to 3 threads", done: false, note: "Build presence before you post" },
    { task: "Join r/personalfinance + r/Frugal, contribute for 10+ days", done: false, note: "Required before any link posts" },
    { task: "Draft personal outreach list (20+ names)", done: false, note: "Direct asks = first users" },
    { task: "Set up Pinterest boards", done: false, note: "3 boards minimum before pinning" },
    { task: "Prepare 5 Instagram posts (don't post yet)", done: false, note: "Have content ready before launch day" },
  ]},
  { phase: "Launch Day", items: [
    { task: "Send personal network messages (stagger across the day)", done: false, note: "" },
    { task: "Post on Product Hunt at 12:01am PT (Tue or Wed)", done: false, note: "Respond to every comment" },
    { task: "Post on Indie Hackers (story, not pitch)", done: false, note: "" },
    { task: "Post on r/SideProject", done: false, note: "" },
    { task: "Post first Instagram carousel", done: false, note: "" },
    { task: "Pin first 3 Pinterest pins", done: false, note: "" },
  ]},
  { phase: "Week 1 Post-Launch", items: [
    { task: "Post on r/personalfinance (value-first, not promotional)", done: false, note: "" },
    { task: "Post on r/Frugal", done: false, note: "" },
    { task: "Follow up with personal network anyone who engaged", done: false, note: "" },
    { task: "Post Indie Hackers update: what happened week 1", done: false, note: "" },
    { task: "Publish Etsy worksheet listing (links back to app)", done: false, note: "Cross-channel funnel" },
  ]},
];

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      style={{
        padding: "4px 10px",
        fontSize: "10px",
        letterSpacing: "0.1em",
        background: copied ? "#5c7a5c" : "transparent",
        border: `1px solid ${copied ? "#5c7a5c" : "#c8bfb0"}`,
        borderRadius: "4px",
        cursor: "pointer",
        color: copied ? "#fff" : "#7a6f65",
        fontFamily: "monospace",
        transition: "all 0.2s",
        flexShrink: 0,
      }}
    >
      {copied ? "COPIED" : "COPY"}
    </button>
  );
}

export default function OutreachKit() {
  const [activeTab, setActiveTab] = useState("drafts");
  const [activeChannel, setActiveChannel] = useState("betalist");
  const [checklist, setChecklist] = useState(launchChecklist);

  const channel = channels.find(c => c.id === activeChannel);

  const toggleCheck = (phaseIdx, itemIdx) => {
    setChecklist(prev => prev.map((phase, pi) =>
      pi === phaseIdx ? {
        ...phase,
        items: phase.items.map((item, ii) =>
          ii === itemIdx ? { ...item, done: !item.done } : item
        )
      } : phase
    ));
  };

  const tabs = [
    { id: "drafts", label: "OUTREACH DRAFTS" },
    { id: "interview", label: "INTERVIEW SCRIPT" },
    { id: "survey", label: "SURVEY QUESTIONS" },
    { id: "checklist", label: "LAUNCH CHECKLIST" },
  ];

  return (
    <div style={{
      minHeight: "100vh",
      background: "#f5f0ea",
      fontFamily: "'Georgia', serif",
      color: "#2c2520",
    }}>
      {/* Header */}
      <div style={{
        background: "#1e1a16",
        padding: "28px 24px 24px",
        color: "#f5f0ea",
      }}>
        <div style={{ fontSize: "10px", letterSpacing: "0.3em", color: "#8a7f75", marginBottom: "6px", fontFamily: "monospace" }}>
          RITUAL RUNWAY / BETA PROGRAM
        </div>
        <h1 style={{ margin: "0 0 6px", fontSize: "clamp(24px, 5vw, 34px)", fontWeight: "400", letterSpacing: "-0.01em" }}>
          Outreach{" "}
          <span style={{ color: "#8a7f75", fontStyle: "italic" }}>Kit</span>
        </h1>
        <p style={{ margin: "0 0 20px", color: "#8a7f75", fontSize: "13px", fontFamily: "monospace" }}>
          Every draft message, interview script, survey question, and launch step — updated May 2026.
        </p>
        {/* Tabs */}
        <div style={{ display: "flex", gap: "0", overflowX: "auto", scrollbarWidth: "none", borderBottom: "1px solid #3a3530" }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: "10px 16px",
                background: "transparent",
                border: "none",
                borderBottom: activeTab === tab.id ? "2px solid #f5f0ea" : "2px solid transparent",
                color: activeTab === tab.id ? "#f5f0ea" : "#5a5550",
                fontSize: "10px",
                letterSpacing: "0.12em",
                cursor: "pointer",
                fontFamily: "monospace",
                whiteSpace: "nowrap",
                transition: "color 0.15s",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Outreach Drafts Tab */}
      {activeTab === "drafts" && (
        <div style={{ display: "flex", minHeight: "calc(100vh - 160px)" }}>
          {/* Channel Sidebar */}
          <div style={{
            width: "160px",
            flexShrink: 0,
            background: "#ede8e2",
            borderRight: "1px solid #d8d0c8",
            padding: "12px 0",
          }}>
            {channels.map(ch => (
              <button
                key={ch.id}
                onClick={() => setActiveChannel(ch.id)}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  textAlign: "left",
                  background: activeChannel === ch.id ? "#f5f0ea" : "transparent",
                  border: "none",
                  borderLeft: activeChannel === ch.id ? "3px solid #c17f3a" : "3px solid transparent",
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
              >
                <div style={{ fontSize: "12px", fontWeight: activeChannel === ch.id ? "600" : "400", color: "#2c2520", fontFamily: "monospace" }}>
                  {ch.name}
                </div>
                {ch.priority && (
                  <div style={{ fontSize: "9px", color: "#c17f3a", marginTop: "2px", letterSpacing: "0.08em", fontFamily: "monospace" }}>
                    FIRST
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* Channel Detail */}
          <div style={{ flex: 1, padding: "24px", overflowY: "auto" }}>
            {channel && (
              <>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "8px", marginBottom: "16px" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                      <h2 style={{ margin: 0, fontSize: "22px", fontWeight: "400" }}>{channel.name}</h2>
                      <span style={{
                        fontSize: "9px",
                        padding: "3px 8px",
                        background: `${channel.badgeColor}22`,
                        color: channel.badgeColor,
                        border: `1px solid ${channel.badgeColor}55`,
                        borderRadius: "3px",
                        letterSpacing: "0.1em",
                        fontFamily: "monospace",
                      }}>{channel.badge}</span>
                    </div>
                    <div style={{ fontSize: "11px", color: "#7a6f65", marginTop: "4px", fontFamily: "monospace" }}>
                      Time: {channel.time}
                    </div>
                  </div>
                </div>

                {/* Warning */}
                <div style={{
                  background: "#fff8f0",
                  border: "1px solid #e8d5b8",
                  borderLeft: "3px solid #c17f3a",
                  borderRadius: "0 6px 6px 0",
                  padding: "12px 14px",
                  marginBottom: "16px",
                  fontSize: "12px",
                  color: "#5a4535",
                  lineHeight: "1.6",
                  fontFamily: "monospace",
                }}>
                  {channel.warning}
                </div>

                {/* Tip */}
                <div style={{
                  background: "#f0f5f0",
                  border: "1px solid #c8d8c8",
                  borderLeft: "3px solid #5c7a5c",
                  borderRadius: "0 6px 6px 0",
                  padding: "12px 14px",
                  marginBottom: "20px",
                  fontSize: "12px",
                  color: "#354535",
                  lineHeight: "1.6",
                  fontFamily: "monospace",
                }}>
                  <strong>✦ Tip:</strong> {channel.tip}
                </div>

                {/* Fields */}
                {channel.fields.map((field, i) => (
                  <div key={i} style={{ marginBottom: "16px", background: "#fff", border: "1px solid #ddd8d0", borderRadius: "8px", padding: "14px 16px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                      <span style={{ fontSize: "10px", letterSpacing: "0.15em", color: "#8a7f75", fontFamily: "monospace" }}>{field.label}</span>
                      <CopyButton text={field.value} />
                    </div>
                    <div style={{ fontSize: "13px", color: "#2c2520", lineHeight: "1.6", whiteSpace: "pre-wrap", fontFamily: "monospace" }}>
                      {field.value}
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      )}

      {/* Interview Script Tab */}
      {activeTab === "interview" && (
        <div style={{ padding: "24px", maxWidth: "700px" }}>
          <h2 style={{ margin: "0 0 6px", fontWeight: "400", fontSize: "20px" }}>User Interview Script</h2>
          <p style={{ margin: "0 0 24px", color: "#7a6f65", fontSize: "13px", fontFamily: "monospace" }}>
            Run 20–30 min per person. Record with permission. Don't read these verbatim — have a conversation.
          </p>
          {interviewScript.map((item, i) => (
            <div key={i} style={{ marginBottom: "14px", background: "#fff", border: "1px solid #ddd8d0", borderRadius: "8px", padding: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                    <span style={{ fontSize: "11px", color: "#c17f3a", fontFamily: "monospace", flexShrink: 0, marginTop: "2px" }}>Q{i + 1}</span>
                    <div>
                      <div style={{ fontSize: "14px", color: "#2c2520", lineHeight: "1.5", marginBottom: "6px" }}>{item.q}</div>
                      <div style={{ fontSize: "11px", color: "#8a7f75", fontFamily: "monospace" }}>→ {item.purpose}</div>
                    </div>
                  </div>
                </div>
                <CopyButton text={item.q} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Survey Tab */}
      {activeTab === "survey" && (
        <div style={{ padding: "24px", maxWidth: "700px" }}>
          <h2 style={{ margin: "0 0 6px", fontWeight: "400", fontSize: "20px" }}>Beta Survey Questions</h2>
          <p style={{ margin: "0 0 24px", color: "#7a6f65", fontSize: "13px", fontFamily: "monospace" }}>
            Keep surveys under 8 questions. Longer = lower completion. Use Typeform or Google Forms.
          </p>
          {surveyQuestions.map((item, i) => (
            <div key={i} style={{ marginBottom: "14px", background: "#fff", border: "1px solid #ddd8d0", borderRadius: "8px", padding: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                    <span style={{ fontSize: "11px", color: "#c17f3a", fontFamily: "monospace", flexShrink: 0, marginTop: "2px" }}>Q{i + 1}</span>
                    <div>
                      <div style={{ fontSize: "14px", color: "#2c2520", lineHeight: "1.5", marginBottom: "4px" }}>{item.q}</div>
                      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                        <span style={{ fontSize: "10px", padding: "2px 7px", background: "#f0e8e0", color: "#7a5535", borderRadius: "3px", fontFamily: "monospace" }}>{item.type}</span>
                        <span style={{ fontSize: "11px", color: "#8a7f75", fontFamily: "monospace" }}>{item.options}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <CopyButton text={item.q} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Launch Checklist Tab */}
      {activeTab === "checklist" && (
        <div style={{ padding: "24px", maxWidth: "600px" }}>
          <h2 style={{ margin: "0 0 6px", fontWeight: "400", fontSize: "20px" }}>Launch Checklist</h2>
          <p style={{ margin: "0 0 24px", color: "#7a6f65", fontSize: "13px", fontFamily: "monospace" }}>
            Execute in order. BetaList must go before anything public.
          </p>
          {checklist.map((phase, pi) => (
            <div key={pi} style={{ marginBottom: "24px" }}>
              <div style={{ fontSize: "10px", letterSpacing: "0.2em", color: "#c17f3a", fontFamily: "monospace", marginBottom: "10px" }}>
                {phase.phase.toUpperCase()}
              </div>
              {phase.items.map((item, ii) => (
                <div
                  key={ii}
                  onClick={() => toggleCheck(pi, ii)}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "12px",
                    padding: "12px 14px",
                    marginBottom: "6px",
                    background: item.done ? "#f0f5f0" : "#fff",
                    border: `1px solid ${item.done ? "#c8d8c8" : "#ddd8d0"}`,
                    borderRadius: "8px",
                    cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                >
                  <div style={{
                    width: "18px",
                    height: "18px",
                    border: `2px solid ${item.done ? "#5c7a5c" : "#b8b0a8"}`,
                    borderRadius: "4px",
                    background: item.done ? "#5c7a5c" : "transparent",
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginTop: "1px",
                    transition: "all 0.15s",
                  }}>
                    {item.done && <span style={{ color: "#fff", fontSize: "11px" }}>✓</span>}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontSize: "13px",
                      color: item.done ? "#7a9a7a" : "#2c2520",
                      textDecoration: item.done ? "line-through" : "none",
                      fontFamily: "monospace",
                    }}>{item.task}</div>
                    {item.note && (
                      <div style={{ fontSize: "11px", color: "#8a7f75", marginTop: "2px", fontFamily: "monospace" }}>{item.note}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      <div style={{ textAlign: "center", padding: "24px", color: "#b8b0a8", fontSize: "10px", fontFamily: "monospace", letterSpacing: "0.12em" }}>
        RITUAL RUNWAY · OUTREACH KIT · UPDATED MAY 2026
      </div>
    </div>
  );
}
