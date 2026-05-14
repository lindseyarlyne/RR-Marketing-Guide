RITUAL RUNWAY — Logo Asset Export
Generated: May 2026
Source: 1024×1024 master files (dark + light variants)

─────────────────────────────────────────────
FILE MANIFEST — WHERE EACH FILE GOES IN GITHUB
─────────────────────────────────────────────

PUBLIC/ FOLDER  (public/)
─────────────────────────────────────────────
favicon-32-dark.png      →  public/favicon-32-dark.png       (32×32   browser favicon, dark bg)
favicon-32-light.png     →  public/favicon-32-light.png      (32×32   browser favicon, light bg)
icon-dark.png            →  public/icon-dark.png             (256×256  app header monogram — dark)
icon-light.png           →  public/icon-light.png            (256×256  app header monogram — light/landing hero)
icon-192.png             →  public/icon-192.png              (192×192  PWA manifest icon)
icon-512.png             →  public/icon-512.png              (512×512  PWA splash / maskable icon)
apple-touch-icon.png     →  public/apple-touch-icon.png      (180×180  iOS Safari bookmark — light)
apple-touch-icon-dark.png→  public/apple-touch-icon-dark.png (180×180  iOS Safari bookmark — dark)
icon-1080.png            →  public/icon-1080.png             (1080×1080 OG / social share image)
rr-logo-dark.png         →  public/rr-logo-dark.png          (1024×1024 master — dark bg)
rr-logo-light.png        →  public/rr-logo-light.png         (1024×1024 master — light bg)

APP/ FOLDER  (app/)
─────────────────────────────────────────────
apple-touch-icon.png     →  app/apple-icon.png               (180×180  Next.js auto-detected apple icon)
icon-192.png             →  app/icon.png                     (192×192  Next.js auto-detected browser tab icon)

─────────────────────────────────────────────
KEEP FROM EXISTING REPO (do not delete)
─────────────────────────────────────────────
favicon.ico              — keep existing (ICO format, binary — hard to regenerate)
favicon.svg              — keep existing (adaptive SVG with prefers-color-scheme)
manifest.json            — keep existing (just update icon paths if they changed)

─────────────────────────────────────────────
DELETE FROM EXISTING REPO
─────────────────────────────────────────────
apple-icon.jpg           — remove (JPG not appropriate for app icon)
icon-192.jpg             — remove (JPG not appropriate)
icon-512.jpg             — remove (JPG not appropriate)
icon-32.png              — remove (replaced by favicon-32-dark/light)
icon-dark-32x32.png      — remove (replaced by favicon-32-dark.png)
icon-light-32x32.png     — remove (replaced by favicon-32-light.png)
rr-logo.png              — remove (duplicate of rr-logo-light.png)
placeholder-logo.png     — remove if not used in code
placeholder-logo.svg     — remove if not used in code

─────────────────────────────────────────────
CURSOR PROMPT ASSET PATHS (already correct)
─────────────────────────────────────────────
Cursor Prompt 1 references:
  /icon-dark.png    →  public/icon-dark.png   ✓
  /icon-light.png   →  public/icon-light.png  ✓
These match the files in this export — no changes needed to the prompts.
