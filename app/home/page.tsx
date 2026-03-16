import { Suspense } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { AppHeader } from '@/components/app-header'
import { QuestionCard } from '@/components/question-card'
import { CategorySidebar } from '@/components/category-sidebar'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyContent } from '@/components/ui/empty'
import { Plus, TrendingUp, Clock, CheckCircle2 } from 'lucide-react'
import type { Category, Question } from '@/lib/types'

// تحديث الواجهة لتتوافق مع Next.js 15 (searchParams as Promise)
interface HomePageProps {
  searchParams: Promise<{ category?: string; sort?: string }>
}

async function getQuestions(categoryId?: string, sort?: string, userId?: string) {
  const supabase = await createClient()

  let query = supabase
    .from('questions')
    .select(`
      *,
      profiles:user_id (id, full_name, avatar_url),
      categories:category_id (id, name, slug, color)
    `)

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

  if (error || !questions) {
    return []
  }

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
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name')
  
  if (error) return []
  return data as Category[]
}

function QuestionsSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex gap-4 rounded-xl border border-white/5 bg-card/40 p-5 backdrop-blur-sm">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="flex-1 space-y-3">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
      ))}
    </div>
  )
}

export default async function HomePage(props: HomePageProps) {
  // فك ارتباط الـ searchParams بشكل آمن لـ Next.js 15
  const params = await props.searchParams
  
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  const [questions, categories] = await Promise.all([
    getQuestions(params.category, params.sort, user?.id),
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
          {user && (
            <Link href="/ask">
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
            {/* Sort tabs */}
            <Tabs defaultValue={currentSort} className="w-full">
              <TabsList className="bg-card/50 backdrop-blur-sm border border-white/5 h-12 rounded-xl p-1">
                <TabsTrigger value="newest" asChild className="rounded-lg data-[state=active]:shadow-sm">
                  <Link href={`/home${params.category ? `?category=${params.category}` : ''}`} className="gap-2">
                    <Clock className="h-4 w-4" />
                    Newest
                  </Link>
                </TabsTrigger>
                <TabsTrigger value="trending" asChild className="rounded-lg data-[state=active]:shadow-sm">
                  <Link href={`/home?sort=trending${params.category ? `&category=${params.category}` : ''}`} className="gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Trending
                  </Link>
                </TabsTrigger>
                <TabsTrigger value="resolved" asChild className="rounded-lg data-[state=active]:shadow-sm">
                  <Link href={`/home?sort=resolved${params.category ? `&category=${params.category}` : ''}`} className="gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    Resolved
                  </Link>
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Questions list */}
            <Suspense fallback={<QuestionsSkeleton />}>
              {questions.length === 0 ? (
                <Empty className="border border-white/10 bg-card/40 backdrop-blur-sm rounded-2xl py-12">
                  <EmptyHeader>
                    <EmptyTitle className="text-xl">No questions found</EmptyTitle>
                    <EmptyDescription>
                      {user 
                        ? "Looks quiet here! Be the first to spark a discussion." 
                        : "Sign in to join the conversation and ask questions."
                      }
                    </EmptyDescription>
                  </EmptyHeader>
                  <EmptyContent className="mt-6">
                    {user ? (
                      <Link href="/ask">
                        <Button className="rounded-full shadow-sm">Ask a Question</Button>
                      </Link>
                    ) : (
                      <Link href="/auth/login">
                        <Button className="rounded-full shadow-sm">Sign In to Ask</Button>
                      </Link>
                    )}
                  </EmptyContent>
                </Empty>
              ) : (
                <div className="space-y-4">
                  {questions.map((question) => (
                    <QuestionCard
                      key={question.id}
                      question={question}
                      currentUserId={user?.id}
                    />
                  ))}
                </div>
              )}
            </Suspense>
          </div>

          {/* Sidebar */}
          <aside className="hidden lg:block space-y-6">
            <Suspense fallback={<Skeleton className="h-80 w-full rounded-2xl" />}>
              <div className="sticky top-24">
                <CategorySidebar categories={categories} />
              </div>
            </Suspense>
          </aside>
        </div>
      </main>
    </div>
  )
}