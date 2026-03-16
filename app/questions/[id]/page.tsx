import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { AppHeader } from '@/components/app-header'
import { QuestionDetail } from './question-detail'
import { ArrowLeft } from 'lucide-react'
import type { Question, Answer } from '@/lib/types'

// إجبار Next.js على جلب البيانات في الوقت الفعلي وعدم استخدام الكاش
export const dynamic = 'force-dynamic'
export const revalidate = 0

async function getQuestion(id: string, userId?: string) {
  const supabase = await createClient()

  // جلب السؤال من قاعدة البيانات
  const { data: qRow, error: qErr } = await supabase
    .from('questions')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (qErr || !qRow) {
    console.error('[QuestionPage] Failed to load question row or not found', { id, qErr })
    return null
  }

  // جلب البيانات المرتبطة (الناشر والقسم)
  const [profileRes, categoryRes] = await Promise.all([
    qRow.user_id
      ? supabase.from('profiles').select('id, full_name, avatar_url').eq('id', qRow.user_id).maybeSingle()
      : Promise.resolve({ data: null, error: null } as any),
    qRow.category_id
      ? supabase.from('categories').select('id, name, slug, color').eq('id', qRow.category_id).maybeSingle()
      : Promise.resolve({ data: null, error: null } as any),
  ])

  let question: Question = {
    ...qRow,
    profiles: profileRes?.data ?? undefined,
    categories: categoryRes?.data ?? undefined,
  } as Question

  // التحقق من الإعجابات إذا كان المستخدم مسجلاً
  if (userId) {
    let { data: upvote } = await supabase
      .from('question_upvotes')
      .select('id')
      .eq('user_id', userId)
      .eq('question_id', id)
      .maybeSingle()

    if (!upvote) {
      const { data: fallbackUpvote } = await supabase
        .from('upvotes')
        .select('id')
        .eq('user_id', userId)
        .eq('question_id', id)
        .maybeSingle()
      upvote = fallbackUpvote
    }

    question.user_has_upvoted = !!upvote
  }

  return question
}

async function getAnswers(questionId: string, userId?: string) {
  const supabase = await createClient()

  const { data: aRows, error: aErr } = await supabase
    .from('answers')
    .select('*')
    .eq('question_id', questionId)
    .order('is_accepted', { ascending: false })
    .order('created_at', { ascending: true })

  if (aErr || !aRows) return []

  const userIds = Array.from(new Set(aRows.map((a: any) => a.user_id).filter(Boolean)))
  const profilesById = new Map<string, any>()
  
  if (userIds.length > 0) {
    const { data: profiles } = await supabase.from('profiles').select('id, full_name, avatar_url').in('id', userIds)
    for (const p of profiles || []) profilesById.set(p.id, p)
  }

  let answersBase = aRows.map((a: any) => ({
    ...a,
    profiles: a.user_id ? profilesById.get(a.user_id) : undefined,
  }))

  if (userId) {
    let { data: upvotes } = await supabase
      .from('answer_upvotes')
      .select('answer_id')
      .eq('user_id', userId)

    if (!upvotes) {
      const { data: fallbackUpvotes } = await supabase
        .from('upvotes')
        .select('answer_id')
        .eq('user_id', userId)
        .not('answer_id', 'is', null)
      upvotes = fallbackUpvotes
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
  await supabase
    .from('questions')
    .update({ views_count: (1 as unknown) as number })
    .eq('id', id)
    .catch(() => {})
}

// بناء الواجهة لتتوافق مع Next.js 15 (params عبارة عن Promise)
export default async function QuestionPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params
  const id = params.id

  if (!id) notFound()

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [question, answers] = await Promise.all([
    getQuestion(id, user?.id),
    getAnswers(id, user?.id),
  ])

  // إذا لم يتم العثور على السؤال، نعرض صفحة 404
  if (!question) {
    notFound()
  }

  // تحديث المشاهدات بشكل خفي
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