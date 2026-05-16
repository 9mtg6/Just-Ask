'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Layers, Infinity, Calculator, Beaker, Code, Globe, PenTool, Settings, Factory, Zap, BookOpen } from 'lucide-react'
import type { Category } from '@/lib/types'

interface CategorySidebarProps {
  categories: Category[]
}

const getIconForCategory = (name: string) => {
  const lowerName = name.toLowerCase()
  if (lowerName.includes('math')) return <Calculator className="h-4 w-4" />
  if (lowerName.includes('physic')) return <Zap className="h-4 w-4" />
  if (lowerName.includes('mechanic')) return <Settings className="h-4 w-4" />
  if (lowerName.includes('chemist')) return <Beaker className="h-4 w-4" />
  if (lowerName.includes('drawing')) return <PenTool className="h-4 w-4" />
  if (lowerName.includes('english')) return <Globe className="h-4 w-4" />
  if (lowerName.includes('program')) return <Code className="h-4 w-4" />
  if (lowerName.includes('manufactur')) return <Factory className="h-4 w-4" />
  return <BookOpen className="h-4 w-4" />
}

function useActiveCategory() {
  const searchParams = useSearchParams()
  return searchParams.get('category')
}

function CategoryFilterButtons({
  categories,
  activeCategoryId,
  layout,
}: CategorySidebarProps & { activeCategoryId: string | null; layout: 'sidebar' | 'mobile' }) {
  const isMobile = layout === 'mobile'

  const activeClass =
    'bg-primary/15 text-primary hover:bg-primary/25 font-bold shadow-sm ring-1 ring-primary/20'
  const inactiveClass = 'text-muted-foreground hover:text-foreground hover:bg-white/5'

  return (
    <>
      <Link href="/home" className={isMobile ? 'shrink-0' : undefined}>
        <Button
          variant={!activeCategoryId ? 'secondary' : 'ghost'}
          size={isMobile ? 'sm' : 'default'}
          className={cn(
            'gap-2 rounded-xl transition-all duration-300',
            isMobile ? 'whitespace-nowrap' : 'w-full justify-start gap-3',
            !activeCategoryId ? activeClass : inactiveClass,
          )}
        >
          <Infinity className={cn('h-4 w-4', !activeCategoryId && 'text-primary')} />
          All Questions
        </Button>
      </Link>

      {categories.map((category) => (
        <Link
          key={category.id}
          href={`/home?category=${category.id}`}
          className={isMobile ? 'shrink-0' : undefined}
        >
          <Button
            variant={activeCategoryId === category.id ? 'secondary' : 'ghost'}
            size={isMobile ? 'sm' : 'default'}
            className={cn(
              'gap-2 rounded-xl transition-all duration-300',
              isMobile ? 'whitespace-nowrap' : 'w-full justify-start gap-3',
              activeCategoryId === category.id ? activeClass : inactiveClass,
            )}
          >
            {getIconForCategory(category.name)}
            <span className={isMobile ? undefined : 'truncate'}>{category.name}</span>
          </Button>
        </Link>
      ))}
    </>
  )
}

export function CategorySidebar({ categories }: CategorySidebarProps) {
  const activeCategoryId = useActiveCategory()

  return (
    <div className="rounded-2xl border border-white/10 bg-card/40 p-5 backdrop-blur-md shadow-sm sticky top-24">
      <div className="mb-5 flex items-center gap-2 font-bold text-foreground px-2">
        <Layers className="h-5 w-5 text-primary" />
        <h3 className="text-lg">Filter by Subject</h3>
      </div>

      <div className="flex flex-col gap-2">
        <CategoryFilterButtons
          categories={categories}
          activeCategoryId={activeCategoryId}
          layout="sidebar"
        />
      </div>
    </div>
  )
}

export function CategoryMobileFilter({ categories }: CategorySidebarProps) {
  const activeCategoryId = useActiveCategory()

  return (
    <div className="rounded-2xl border border-white/10 bg-card/40 p-4 backdrop-blur-md shadow-sm lg:hidden">
      <div className="mb-3 flex items-center gap-2 font-bold text-foreground px-1">
        <Layers className="h-4 w-4 text-primary" />
        <h3 className="text-sm">Filter by Subject</h3>
      </div>
      <div className="-mx-1 overflow-x-auto pb-1">
        <div className="flex gap-2 px-1 w-max min-w-full">
          <CategoryFilterButtons
            categories={categories}
            activeCategoryId={activeCategoryId}
            layout="mobile"
          />
        </div>
      </div>
    </div>
  )
}

