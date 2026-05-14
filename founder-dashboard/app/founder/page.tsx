import { redirect } from 'next/navigation'

/** Legacy path from the main app; keep a short redirect. */
export default function FounderAliasPage() {
  redirect('/dashboard')
}
