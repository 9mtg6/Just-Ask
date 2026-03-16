import { createClient } from '@/lib/supabase/server'
import { AppHeader } from '@/components/app-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

async function getAdminStats() {
  const supabase = await createClient()

  const [profilesRes, questionsRes, answersRes] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact' }),
    supabase.from('questions').select('*', { count: 'exact' }),
    supabase.from('answers').select('*', { count: 'exact' }),
  ])

  return {
    users: profilesRes.count ?? 0,
    questions: questionsRes.count ?? 0,
    answers: answersRes.count ?? 0,
  }
}

export default async function AdminDashboardPage() {
  const stats = await getAdminStats()

  return (
    <div className="min-h-screen bg-background">
      <AppHeader user={null} />
      <main className="mx-auto max-w-4xl px-4 py-8">
        <div className="mb-6">
          <p className="text-sm uppercase tracking-[0.2em] text-primary">Admin Panel</p>
          <h1 className="text-3xl font-bold">Platform Overview</h1>
          <p className="text-muted-foreground">Monitor the student community and content health.</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Total Students</CardTitle>
            </CardHeader>
            <CardContent className="text-3xl font-bold">{stats.users}</CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Questions</CardTitle>
            </CardHeader>
            <CardContent className="text-3xl font-bold">{stats.questions}</CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Answers</CardTitle>
            </CardHeader>
            <CardContent className="text-3xl font-bold">{stats.answers}</CardContent>
          </Card>
        </div>

        <div className="mt-6 rounded-lg border bg-card p-4">
          <h2 className="font-semibold">Important</h2>
          <p className="text-muted-foreground">You can add admin tools here for user audits and content moderation.</p>
        </div>
      </main>
    </div>
  )
}
