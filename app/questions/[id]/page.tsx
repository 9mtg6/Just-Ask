import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { AppHeader } from '@/components/app-header'
import { QuestionDetail } from './question-detail'
import { ArrowLeft } from 'lucide-react'
import type { Question, Answer } from '@/lib/types'

function isMissingColumnError(error: any) {
  const msg = String(error?.message || '')
  // Postgres undefined_column is 42703; Supabase sometimes only provides message.
  return error?.code === '42703' || msg.toLowerCase().includes('column') || msg.toLowerCase().includes('does not exist')
}

async function getQuestion(id: string, userId?: string) {
  const supabase = await createClient()

  // Try "new" schema first, then fall back to older schemas if needed.
  let question: any | null = null
  let error: any | null = null

  ;({ data: question, error } = await supabase
    .from('questions')
    .select(
      `
      *,
      profiles:user_id (id, full_name, avatar_url),
      categories:category_id (id, name, slug, color)
    `
    )
    .eq('id', id)
    .maybeSingle())

  if (error && isMissingColumnError(error)) {
    ;({ data: question, error } = await supabase
      .from('questions')
      .select(
        `
        *,
        profiles:user_id (id, display_name, avatar_url),
        categories:category_id (id, name, icon, color)
      `
      )
      .eq('id', id)
      .maybeSingle())
  }

  if (error && isMissingColumnError(error)) {
    ;({ data: question, error } = await supabase.from('questions').select('*').eq('id', id).maybeSingle())
  }

  if (error) {
    console.error('[QuestionPage] Failed to load question', { id, error })
    return null
  }

  if (!question) return null

  // Check if user has upvoted this question
  if (userId) {
    // Compatibility: some schemas use question_upvotes, others use upvotes.
    let upvote: any | null = null
    let upvoteErr: any | null = null

    ;({ data: upvote, error: upvoteErr } = await supabase
      .from('question_upvotes')
      .select('id')
      .eq('user_id', userId)
      .eq('question_id', id)
      .maybeSingle())

    if (upvoteErr) {
      ;({ data: upvote, error: upvoteErr } = await supabase
        .from('upvotes')
        .select('id')
        .eq('user_id', userId)
        .eq('question_id', id)
        .maybeSingle())
    }

    return {
      ...question,
      user_has_upvoted: !!upvote,
    } as Question
  }

  return question as Question
}

async function getAnswers(questionId: string, userId?: string) {
  const supabase = await createClient()

  let answers: any[] | null = null
  let error: any | null = null

  ;({ data: answers, error } = await supabase
    .from('answers')
    .select(
      `
      *,
      profiles:user_id (id, full_name, avatar_url)
    `
    )
    .eq('question_id', questionId)
    .order('is_accepted', { ascending: false })
    .order('upvotes_count', { ascending: false })
    .order('created_at', { ascending: true }))

  if (error && isMissingColumnError(error)) {
    ;({ data: answers, error } = await supabase
      .from('answers')
      .select(
        `
        *,
        profiles:user_id (id, display_name, avatar_url)
      `
      )
      .eq('question_id', questionId)
      .order('is_accepted', { ascending: false })
      .order('upvote_count', { ascending: false })
      .order('created_at', { ascending: true }))
  }

  if (error || !answers) {
    return []
  }

  // Check which answers the user has upvoted
  if (userId) {
    let upvotes: any[] | null = null
    let upvotesErr: any | null = null

    ;({ data: upvotes, error: upvotesErr } = await supabase
      .from('answer_upvotes')
      .select('answer_id')
      .eq('user_id', userId))

    if (upvotesErr) {
      ;({ data: upvotes, error: upvotesErr } = await supabase
        .from('upvotes')
        .select('answer_id')
        .eq('user_id', userId)
        .not('answer_id', 'is', null))
    }

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
  // Schema in scripts uses "views_count". Best-effort update; avoid breaking page load.
  await supabase
    .from('questions')
    .update({ views_count: (1 as unknown) as number })
    .eq('id', id)
    .select('id')
    .maybeSingle()
    .catch(() => {})
}

export default async function QuestionPage({ params }: { params: { id: string } }) {
  const { id } = params
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
