import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { AppHeader } from '@/components/app-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getLocale } from '@/lib/locale'

async function getPublishedAnswers() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('answers')
    .select(`
      id,
      content,
      question_id,
      created_at,
      profiles:user_id (id, full_name, avatar_url),
      questions:title
    `)
    .order('created_at', { ascending: false })
    .limit(30)

  return data || []
}

export default async function KnowledgeBasePage() {
  const answers = await getPublishedAnswers()
  const locale = await getLocale()
  const t = locale === 'ar'
    ? {
        label: 'قاعدة المعرفة',
        title: 'الإجابات المنشورة',
        desc: 'ابحث وراجع الشروحات السابقة للتعلم من المحاضرات السابقة.',
        empty: 'لا توجد إجابات منشورة حتى الآن.',
        untitled: 'سؤال بدون عنوان',
        by: 'بواسطة',
        anonymous: 'مجهول',
        view: 'عرض النقاش الكامل',
      }
    : {
        label: 'Knowledge Base',
        title: 'Published Answers',
        desc: 'Search and review past explanations to learn from previous lectures.',
        empty: 'No published answers yet.',
        untitled: 'Untitled Question',
        by: 'By',
        anonymous: 'Anonymous',
        view: 'View full discussion',
      }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader user={null} />
      <main className="mx-auto max-w-5xl px-4 py-8">
        <div className="mb-6">
          <p className="text-sm uppercase tracking-[0.2em] text-primary">{t.label}</p>
          <h1 className="text-3xl font-bold">{t.title}</h1>
          <p className="text-muted-foreground">{t.desc}</p>
        </div>

        <div className="space-y-3">
          {answers.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                {t.empty}
              </CardContent>
            </Card>
          ) : (
            answers.map((answer) => (
              <Card key={answer.id}>
                <CardHeader>
                  <CardTitle>{answer.questions?.title || t.untitled}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{t.by} {typeof answer.profiles === 'object' ? (answer.profiles as any).full_name || t.anonymous : t.anonymous}</p>
                  <p className="mt-2 line-clamp-3">{answer.content}</p>
                  <div className="mt-3 text-xs text-muted-foreground">
                    {new Date(answer.created_at).toLocaleDateString()}
                  </div>
                  <div className="mt-3">
                    <Link href={`/questions/${answer.question_id}`} className="text-primary underline">{t.view}</Link>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>
    </div>
  )
}
