import { Suspense } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { AppHeader } from '@/components/app-header'
import { QuestionCard } from '@/components/question-card'
import { CategorySidebar } from '@/components/category-sidebar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyContent } from '@/components/ui/empty'
import { Plus, TrendingUp, Clock, CheckCircle2, Search } from 'lucide-react'
import type { Category, Question } from '@/lib/types'

interface HomePageProps {
  // أضفنا q للبحث
  searchParams: Promise<{ category?: string; sort?: string; q?: string }>
}

async function getQuestions(categoryId?: string, sort?: string, searchQuery?: string, userId?: string) {
  const supabase = await createClient()

  let query = supabase
    .from('questions')
    .select(`
      *,
      profiles:user_id (id, full_name, avatar_url),
      categories:category_id (id, name, slug, color)
    `)

  // تطبيق فلتر البحث لو موجود
  if (searchQuery) {
    // بيفحث في العنوان أو المحتوى (تأكد أن أسماء الأعمدة مطابقة لقاعدة بياناتك title أو content)
    query = query.ilike('title', `%${searchQuery}%`)
  }

  if (categoryId) {
    query = query.eq('category_id', categoryId)
  }

  if (sort === 'trending') {
    query = query.order('upvotes_count', { ascending: false })
  } else if (sort === 'resolved') {
    query = query.eq('is_resolved', true).order('created_at', { ascending: false })
  } else {
    query = query.order('created_at', { ascending: false })
  }

  const { data: questions, error } = await query.limit(50)

  if (error || !questions) return []

  if (userId) {
    const { data: upvotes } = await supabase
      .from('question_upvotes')
      .select('question_id')
      .eq('user_id', userId)
      .not('question_id', 'is', null)

    const upvotedIds = new Set(upvotes?.map((u) => u.question_id) || [])

    return questions.map((q) => ({
      ...q,
      user_has_upvoted: upvotedIds.has(q.id),
    })) as Question[]
  }

  return questions as Question[]
}

async function getCategories() {
  const supabase = await createClient()
  const { data, error } = await supabase.from('categories').select('*').order('name')
  if (error) return []
  return data as Category[]
}

export default async function HomePage(props: HomePageProps) {
  const params = await props.searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  const [questions, categories] = await Promise.all([
    getQuestions(params.category, params.sort, params.q, user?.id),
    getCategories(),
  ])

  const currentSort = params.sort || 'newest'

  return (
    <div className="min-h-screen bg-background relative">
      <AppHeader user={user} />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-card/40 p-6 rounded-2xl border border-white/10 backdrop-blur-md shadow-sm">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Community Questions</h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Browse, learn, and answer questions from your peers.
            </p>
          </div>
          
          {/* نموذج البحث */}
          <form action="/home" method="GET" className="relative flex-1 max-w-md mx-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              type="text" 
              name="q" 
              defaultValue={params.q || ''} 
              placeholder="Search questions by title..." 
              className="pl-9 rounded-full bg-background/50 border-white/10 focus:border-primary/50"
            />
            {params.category && <input type="hidden" name="category" value={params.category} />}
            {params.sort && <input type="hidden" name="sort" value={params.sort} />}
          </form>

          {user && (
            <Link href="/ask" className="shrink-0">
              <Button className="gap-2 shadow-lg hover:-translate-y-0.5 transition-transform rounded-full px-6">
                <Plus className="h-4 w-4" />
                Ask Question
              </Button>
            </Link>
          )}
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
          {/* Main content */}
          <div className="space-y-6">
            <Tabs defaultValue={currentSort} className="w-full">
              <TabsList className="bg-card/50 backdrop-blur-sm border border-white/5 h-12 rounded-xl p-1">
                <TabsTrigger value="newest" asChild className="rounded-lg data-[state=active]:shadow-sm">
                  <Link href={`/home?sort=newest${params.category ? `&category=${params.category}` : ''}${params.q ? `&q=${params.q}` : ''}`} className="gap-2">
                    <Clock className="h-4 w-4" /> Newest
                  </Link>
                </TabsTrigger>
                <TabsTrigger value="trending" asChild className="rounded-lg data-[state=active]:shadow-sm">
                  <Link href={`/home?sort=trending${params.category ? `&category=${params.category}` : ''}${params.q ? `&q=${params.q}` : ''}`} className="gap-2">
                    <TrendingUp className="h-4 w-4" /> Trending
                  </Link>
                </TabsTrigger>
                <TabsTrigger value="resolved" asChild className="rounded-lg data-[state=active]:shadow-sm">
                  <Link href={`/home?sort=resolved${params.category ? `&category=${params.category}` : ''}${params.q ? `&q=${params.q}` : ''}`} className="gap-2">
                    <CheckCircle2 className="h-4 w-4" /> Resolved
                  </Link>
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {/* عرض الأسئلة */}
            {questions.length === 0 ? (
               <div className="text-center py-12 text-muted-foreground border border-white/10 rounded-2xl bg-card/40">
                 No questions found matching your criteria. Try adjusting your search.
               </div>
            ) : (
              <div className="space-y-4">
                {questions.map((question) => (
                  <QuestionCard key={question.id} question={question} currentUserId={user?.id} />
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="hidden lg:block space-y-6">
            <div className="sticky top-24">
              <CategorySidebar categories={categories} />
            </div>
          </aside>
        </div>
      </main>
    </div>
  )
}