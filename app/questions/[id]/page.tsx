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

  // IMPORTANT: Avoid relying on PostgREST relationship/joins.
  // Some Supabase projects don't have FK relationships exposed, which causes selects with "profiles:user_id(...)"
  // to fail and the page to show 404 even though the row exists.
  const { data: qRow, error: qErr } = await supabase.from('questions').select('*').eq('id', id).maybeSingle()

  if (qErr) {
    console.error('[QuestionPage] Failed to load question row', { id, qErr })
    return null
  }
  if (!qRow) return null

  // Fetch related data best-effort (never break the page).
  const [profileRes, categoryRes] = await Promise.all([
    qRow.user_id
      ? supabase.from('profiles').select('id, full_name, avatar_url').eq('id', qRow.user_id).maybeSingle()
      : Promise.resolve({ data: null, error: null } as any),
    qRow.category_id
      ? supabase.from('categories').select('id, name, slug, color').eq('id', qRow.category_id).maybeSingle()
      : Promise.resolve({ data: null, error: null } as any),
  ])

  const question = {
    ...qRow,
    profiles: profileRes?.data ?? undefined,
    categories: categoryRes?.data ?? undefined,
  } as Question

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

  // Like questions: avoid relationship joins; fetch answers then profiles separately.
  const { data: aRows, error: aErr } = await supabase
    .from('answers')
    .select('*')
    .eq('question_id', questionId)
    .order('is_accepted', { ascending: false })
    .order('created_at', { ascending: true })

  if (aErr || !aRows) {
    return []
  }

  // Attach profiles best-effort
  const userIds = Array.from(new Set(aRows.map((a: any) => a.user_id).filter(Boolean)))
  const profilesById = new Map<string, any>()
  if (userIds.length) {
    const { data: profiles } = await supabase.from('profiles').select('id, full_name, avatar_url').in('id', userIds)
    for (const p of profiles || []) profilesById.set(p.id, p)
  }

  const answersBase = aRows.map((a: any) => ({
    ...a,
    profiles: a.user_id ? profilesById.get(a.user_id) : undefined,
  }))

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

    return answersBase.map((a: any) => ({
      ...a,
      user_has_upvoted: upvotedIds.has(a.id),
    })) as Answer[]
  }

  return answersBase as Answer[]
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
