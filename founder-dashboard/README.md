# Founder OS (Next.js)

Internal founder dashboard (tasks, metrics, content, outreach) for Ritual Runway. Uses the **same Supabase project** as ritualrunway.com; sign-in is on **this app’s domain** (cookies are not shared with the main product).

## Run locally

```bash
cd founder-dashboard
cp .env.example .env.local
# fill Supabase URL, anon key, and service role key
pnpm install
pnpm dev
```

The repo includes `pnpm-workspace.yaml` with `allowBuilds` for `sharp` (a Next.js transitive dependency) so `pnpm install` works under pnpm v11’s dependency build policy. Do not remove that file unless you replace it with an equivalent `pnpm approve-builds` configuration.

Open [http://localhost:3001](http://localhost:3001) (port 3001 so it can run beside the main app on 3000).

## Deploy

Add the same env vars as production Ritual Runway (public URL + anon key + service role). In the Supabase dashboard, add this site’s URL to **Authentication → URL configuration** (Site URL and Redirect URLs) so OAuth/email redirects work if you use them later.

## Supabase redirect URLs

Include:

- `http://localhost:3001/auth/callback`
- Your production origin + `/auth/callback`
