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

interface HomePageProps {
  searchParams: { category?: string; sort?: string }
}

async function getQuestions(categoryId?: string, sort?: string, userId?: string) {
  const supabase = await createClient()
  console.log("[v0] Fetching questions with categoryId:", categoryId, "sort:", sort, "userId:", userId)

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

  // Sort options
  if (sort === 'trending') {
    query = query.order('upvotes_count', { ascending: false })
  } else if (sort === 'resolved') {
    query = query.eq('is_resolved', true).order('created_at', { ascending: false })
  } else {
    // Default: newest
    query = query.order('created_at', { ascending: false })
  }

  const { data: questions, error } = await query.limit(50)
  
  console.log("[v0] Questions query result - data:", questions?.length, "error:", error)

  if (error || !questions) {
    console.log("[v0] Error or no questions:", error)
    return []
  }

  // If user is logged in, check which questions they've upvoted
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
  
  console.log("[v0] Categories query result - data:", data?.length, "error:", error)
  
  return (data || []) as Category[]
}

function QuestionsSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex gap-4 rounded-lg border p-4">
          <Skeleton className="h-16 w-12" />
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

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  const [questions, categories] = await Promise.all([
    getQuestions(params.category, params.sort, user?.id),
    getCategories(),
  ])

  const currentSort = params.sort || 'newest'

  return (
    <div className="min-h-screen bg-background">
      <AppHeader user={user} />

      <main className="mx-auto max-w-6xl px-4 py-6">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Questions</h1>
            <p className="text-muted-foreground">
              Browse and answer questions from the community
            </p>
          </div>
          {user && (
            <Link href="/ask">
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Ask Question
              </Button>
            </Link>
          )}
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
          {/* Main content */}
          <div className="space-y-4">
            {/* Sort tabs */}
            <Tabs defaultValue={currentSort}>
              <TabsList>
                <TabsTrigger value="newest" asChild>
                  <Link href={`/home${params.category ? `?category=${params.category}` : ''}`} className="gap-2">
                    <Clock className="h-4 w-4" />
                    Newest
                  </Link>
                </TabsTrigger>
                <TabsTrigger value="trending" asChild>
                  <Link href={`/home?sort=trending${params.category ? `&category=${params.category}` : ''}`} className="gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Trending
                  </Link>
                </TabsTrigger>
                <TabsTrigger value="resolved" asChild>
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
                <Empty className="border">
                  <EmptyHeader>
                    <EmptyTitle>No questions yet</EmptyTitle>
                    <EmptyDescription>
                      {user 
                        ? "Be the first to ask a question!" 
                        : "Sign in to ask the first question"
                      }
                    </EmptyDescription>
                  </EmptyHeader>
                  <EmptyContent>
                    {user ? (
                      <Link href="/ask">
                        <Button>Ask Question</Button>
                      </Link>
                    ) : (
                      <Link href="/auth/login">
                        <Button>Sign In</Button>
                      </Link>
                    )}
                  </EmptyContent>
                </Empty>
              ) : (
                <div className="space-y-3">
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
          <aside className="hidden lg:block">
            <Suspense fallback={<Skeleton className="h-64 w-full" />}>
              <CategorySidebar categories={categories} />
            </Suspense>
          </aside>
        </div>
      </main>
    </div>
  )
}
