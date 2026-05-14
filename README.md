# Ritual Runway Found Hub

Standing marketing files and reference material for [Ritual Runway](https://github.com/lindseyarlyne/ritual-runway). This repository is intentionally separate from the app codebase.

> **Name note:** If you meant **Fund** Hub (finance positioning), rename the GitHub repository slug to `ritual-runway-fund-hub` and update the title here to match.

## Automated publishing (recommended)

Use **Vercel** as a second project (same account as the main app is fine):

1. Push this repository to GitHub (this folder is the repo root).
2. [Vercel](https://vercel.com) → **Add New…** → **Project** → **Import** this repository.
3. Framework preset: **Other** (static). Root directory: `.` (default).
4. Production branch: `main`. Deploy.

Every push to `main` updates the live site automatically. You get a `*.vercel.app` URL with no custom domain required.

## Rename this repository on GitHub

1. On GitHub: **Settings** → **General** → **Repository name**.
2. Choose a URL-safe name, e.g. `ritual-runway-found-hub` or `ritual-runway-fund-hub`.
3. After renaming, update the **Vercel** project’s connected repo if prompted, and refresh any bookmarks or links.

Local remotes after a rename:

```bash
git remote set-url origin https://github.com/<you>/<new-repo-name>.git
```

## Contents

Add PDFs, images, HTML, or Markdown here. For a simple browsable site, keep an `index.html` at the repo root (or configure Vercel’s “Root Directory” to a subfolder if you prefer).
