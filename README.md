# Ritual Runway Founder Hub

Standing marketing files and reference material for [Ritual Runway](https://github.com/lindseyarlyne/ritual-runway). This repository is intentionally separate from the app codebase.

## Automated publishing (recommended)

Use **Vercel** as a second project (same account as the main app is fine):

1. Push this repository to GitHub (this folder is the repo root).
2. [Vercel](https://vercel.com) → **Add New…** → **Project** → **Import** this repository.
3. Framework preset: **Other** (static). Root directory: `.` (default).
4. Production branch: `main`. Deploy.

Every push to `main` updates the live site automatically. You get a `*.vercel.app` URL with no custom domain required.

## Rename this repository on GitHub

1. On GitHub: **Settings** → **General** → **Repository name**.
2. Choose a URL-safe name, e.g. `ritual-runway-founder-hub`.
3. After renaming, update the **Vercel** project’s connected repo if prompted, and refresh any bookmarks or links.

Local remotes after a rename:

```bash
git remote set-url origin https://github.com/<you>/<new-repo-name>.git
```

## Repository layout

```
.
├── index.html
├── canva-cheat-sheet.html
├── ritual-runway-design-system-2.zip
├── rr-design-docs/          ← design system HTML + logo exports
├── artifacts/
│   ├── outreach-kit.jsx     ← beta outreach, interview script, survey, checklist
│   └── claude-cheat-sheet.jsx
└── founder-docs/
    ├── project-system-prompt.md
    ├── claude-workflow-guide.md
    ├── claude-desktop-plugins.md
    ├── etsy-product-spec.md
    └── file-organization.md
```

## Contents

| Path | Description |
|------|-------------|
| `canva-cheat-sheet.html` | Brand reference for Canva: palette, typography, components. Served at `/canva-cheat-sheet.html` when deployed. |
| `ritual-runway-design-system-2.zip` | Archived design system export (HTML docs + `logo-exports/`). `/ritual-runway-design-system-2.zip` when deployed. |
| `rr-design-docs/` | Extracted design system: static HTML references and PNG logo exports. |
| `artifacts/` | Interactive React components—open in Claude as artifacts or run locally. |
| `founder-docs/` | Markdown references for Claude Projects and day-to-day founder workflows. |

## Artifacts

Interactive React components. Open in Claude.ai as artifacts or run locally.

- **Outreach Kit** (`artifacts/outreach-kit.jsx`) — Beta outreach, interview script, survey, and launch checklist. Updated May 2026.
- **Claude Cheat Sheet** (`artifacts/claude-cheat-sheet.jsx`) — Claude surfaces, extensions, and power features with pro tips.

> Role Guide, Content Hub, Expert Prompts, and Git Cheat Sheet are pending rebuild; they will be added here when complete.

## Founder docs

Plain Markdown. Reference in-repo, add to a Claude Project, or open from the deployed site.

| File | Purpose |
|------|---------|
| `founder-docs/project-system-prompt.md` | Paste into Claude Project system prompt field |
| `founder-docs/claude-workflow-guide.md` | One conversation = one task; plugins and roles |
| `founder-docs/claude-desktop-plugins.md` | Which desktop plugins to use and when |
| `founder-docs/etsy-product-spec.md` | Paycheck Budget Worksheet build spec for Canva + Etsy |
| `founder-docs/file-organization.md` | Where files live across iCloud, Notion, GitHub, Claude |

---

*Ritual Runway — Solo Founder OS · Last updated May 2026*
