import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
      <p className="font-mono text-[10px] tracking-widest uppercase text-muted-foreground mb-2">Internal</p>
      <h1 className="font-serif text-3xl italic text-foreground mb-2">
        <span className="text-primary">Ritual</span> Runway
      </h1>
      <p className="text-sm text-muted-foreground font-light max-w-sm mb-8">
        Founder OS (tasks, metrics, outreach) lives here. Sign in with your founder Ritual Runway account.
      </p>
      <Link
        href="/auth/login"
        className="inline-flex items-center justify-center rounded-full bg-primary px-8 py-3 text-xs font-mono-accent uppercase tracking-widest text-primary-foreground hover:opacity-90 transition-opacity"
      >
        Sign in
      </Link>
    </div>
  )
}
