import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AppHeader } from '@/components/app-header'
import { ProfileContent } from './profile-content'
import type { Question, Profile } from '@/lib/types'

async function getProfile(userId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  return data as Profile | null
}

async function getUserQuestions(userId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('questions')
    .select(`
      *,
      profiles:user_id (id, full_name, avatar_url),
      categories:category_id (id, name, slug, color)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  return (data || []) as Question[]
}

async function getUserStats(userId: string) {
  const supabase = await createClient()
  
  const [questionsResult, answersResult, upvotesReceived] = await Promise.all([
    supabase.from('questions').select('id', { count: 'exact', head: true }).eq('user_id', userId),
    supabase.from('answers').select('id', { count: 'exact', head: true }).eq('user_id', userId),
    supabase.from('questions').select('upvotes_count').eq('user_id', userId),
  ])

  const totalUpvotes = upvotesReceived.data?.reduce((sum, q) => sum + (q as any).upvotes_count, 0) || 0

  return {
    questions: questionsResult.count || 0,
    answers: answersResult.count || 0,
    upvotes: totalUpvotes,
  }
}

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const [profile, questions, stats] = await Promise.all([
    getProfile(user.id),
    getUserQuestions(user.id),
    getUserStats(user.id),
  ])

  return (
    <div className="min-h-screen bg-background">
      <AppHeader user={user} />

      <main className="mx-auto max-w-4xl px-4 py-6">
        <ProfileContent
          user={user}
          profile={profile}
          questions={questions}
          stats={stats}
        />
      </main>
    </div>
  )
}
