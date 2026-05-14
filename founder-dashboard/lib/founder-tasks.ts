/** Allowed Supabase auth email for `/tasks`. Everyone else is redirected to `/dashboard`. */
export const FOUNDER_TASKS_EMAIL = "heydarlin@ritualrunway.com"

export function isFounderUser(email: string | null | undefined): boolean {
  if (!email) return false
  return email.toLowerCase() === FOUNDER_TASKS_EMAIL.toLowerCase()
}
