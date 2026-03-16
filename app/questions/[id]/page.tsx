import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { AppHeader } from '@/components/app-header'
import { QuestionDetail } from './question-detail'
import { ArrowLeft } from 'lucide-react'
import type { Question, Answer } from '@/lib/types'

interface QuestionPageProps {
  params: Promise<{ id: string }>
}

async function getQuestion(id: string, userId?: string) {
  const supabase = await createClient()

  const { data: question, error } = await supabase
    .from('questions')
    .select(`
      *,
      profiles:user_id (id, full_name, avatar_url),
      categories:category_id (id, name, icon, color)
    `)
    .eq('id', id)
    .single()

  if (error) {
    console.error('[QuestionPage] Failed to load question', { id, error })
    throw new Error('Failed to load question')
  }

  if (!question) {
    return null
  }

  // Check if user has upvoted this question
  if (userId) {
    const { data: upvote } = await supabase
      .from('upvotes')
      .select('id')
      .eq('user_id', userId)
      .eq('question_id', id)
      .single()

    return {
      ...question,
      user_has_upvoted: !!upvote,
    } as Question
  }

  return question as Question
}

async function getAnswers(questionId: string, userId?: string) {
  const supabase = await createClient()

  const { data: answers, error } = await supabase
    .from('answers')
    .select(`
      *,
      profiles:user_id (id, full_name, avatar_url)
    `)
    .eq('question_id', questionId)
    .order('is_accepted', { ascending: false })
    .order('upvote_count', { ascending: false })
    .order('created_at', { ascending: true })

  if (error || !answers) {
    return []
  }

  // Check which answers the user has upvoted
  if (userId) {
    const { data: upvotes } = await supabase
      .from('upvotes')
      .select('answer_id')
      .eq('user_id', userId)
      .not('answer_id', 'is', null)

    const upvotedIds = new Set(upvotes?.map((u) => u.answer_id) || [])

    return answers.map((a) => ({
      ...a,
      user_has_upvoted: upvotedIds.has(a.id),
    })) as Answer[]
  }

  return answers as Answer[]
}

async function incrementViewCount(id: string) {
  const supabase = await createClient()
  await supabase.rpc('increment_view_count', { question_id: id }).catch(() => {
    // Silently fail - view count is not critical
  })
}

export default async function QuestionPage({ params }: QuestionPageProps) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [question, answers] = await Promise.all([
    getQuestion(id, user?.id),
    getAnswers(id, user?.id),
  ])

  if (!question) {
    notFound()
  }

  // Increment view count (fire and forget)
  incrementViewCount(id)

  return (
    <div className="min-h-screen bg-background">
      <AppHeader user={user} />

      <main className="mx-auto max-w-4xl px-4 py-6">
        <Link
          href="/home"
          className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to questions
        </Link>

        <QuestionDetail
          question={question}
          answers={answers}
          currentUserId={user?.id}
        />
      </main>
    </div>
  )
}
