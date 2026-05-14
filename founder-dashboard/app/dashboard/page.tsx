import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { isFounderUser } from '@/lib/founder-tasks'
import { FounderModule } from '@/components/pages/founder-module'

export const dynamic = 'force-dynamic'

export default async function FounderDashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || !isFounderUser(user.email)) {
    redirect('/auth/login?next=%2Fdashboard')
  }

  return (
    <div className="min-h-screen bg-background">
      <FounderModule />
    </div>
  )
}
