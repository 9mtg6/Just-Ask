'use client'

import { useState, type ReactNode } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  Layers,
  Infinity,
  Calculator,
  Beaker,
  Code,
  Globe,
  PenTool,
  Settings,
  Factory,
  Zap,
  BookOpen,
  ChevronDown,
  Check,
} from 'lucide-react'
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

const activeClass =
  'bg-primary/15 text-primary hover:bg-primary/25 font-semibold shadow-sm ring-1 ring-primary/20'
const inactiveClass = 'text-muted-foreground hover:text-foreground hover:bg-white/5'

function CategoryFilterButtons({
  categories,
  activeCategoryId,
}: CategorySidebarProps & { activeCategoryId: string | null }) {
  return (
    <>
      <Link href="/home">
        <Button
          variant={!activeCategoryId ? 'secondary' : 'ghost'}
          className={cn(
            'w-full justify-start gap-3 rounded-xl transition-all duration-300',
            !activeCategoryId ? activeClass : inactiveClass,
          )}
        >
          <Infinity className={cn('h-4 w-4', !activeCategoryId && 'text-primary')} />
          All Questions
        </Button>
      </Link>

      {categories.map((category) => (
        <Link key={category.id} href={`/home?category=${category.id}`}>
          <Button
            variant={activeCategoryId === category.id ? 'secondary' : 'ghost'}
            className={cn(
              'w-full justify-start gap-3 rounded-xl transition-all duration-300',
              activeCategoryId === category.id ? activeClass : inactiveClass,
            )}
          >
            {getIconForCategory(category.name)}
            <span className="truncate">{category.name}</span>
          </Button>
        </Link>
      ))}
    </>
  )
}

function CategorySheetItem({
  href,
  label,
  icon,
  isActive,
  onSelect,
}: {
  href: string
  label: string
  icon: ReactNode
  isActive: boolean
  onSelect: () => void
}) {
  return (
    <Link
      href={href}
      onClick={onSelect}
      className={cn(
        'flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm transition-colors',
        isActive ? activeClass : inactiveClass,
      )}
    >
      <span className={cn('shrink-0', isActive && 'text-primary')}>{icon}</span>
      <span className="flex-1 truncate font-medium">{label}</span>
      {isActive && <Check className="h-4 w-4 shrink-0 text-primary" />}
    </Link>
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
        <CategoryFilterButtons categories={categories} activeCategoryId={activeCategoryId} />
      </div>
    </div>
  )
}

export function CategoryMobileFilter({ categories }: CategorySidebarProps) {
  const activeCategoryId = useActiveCategory()
  const [open, setOpen] = useState(false)
  const activeCategory = categories.find((c) => c.id === activeCategoryId)

  const currentLabel = activeCategory?.name ?? 'All Subjects'
  const currentIcon = activeCategory
    ? getIconForCategory(activeCategory.name)
    : <Infinity className="h-4 w-4 text-primary" />

  return (
    <div className="mb-4 lg:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            className="h-12 w-full justify-between gap-3 rounded-2xl border-white/10 bg-card/55 px-4 shadow-sm backdrop-blur-md hover:bg-card/70"
          >
            <span className="flex min-w-0 items-center gap-2.5">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                {currentIcon}
              </span>
              <span className="min-w-0 text-left">
                <span className="block text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  Subject
                </span>
                <span className="block truncate text-sm font-semibold">{currentLabel}</span>
              </span>
            </span>
            <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
          </Button>
        </SheetTrigger>

        <SheetContent
          side="bottom"
          className="rounded-t-3xl border-white/10 bg-background/95 px-4 pb-8 backdrop-blur-xl"
        >
          <SheetHeader className="px-0 pb-2 text-left">
            <SheetTitle className="flex items-center gap-2 text-lg">
              <Layers className="h-5 w-5 text-primary" />
              Filter by Subject
            </SheetTitle>
          </SheetHeader>

          <div className="mt-2 flex max-h-[55vh] flex-col gap-1 overflow-y-auto">
            <CategorySheetItem
              href="/home"
              label="All Questions"
              icon={<Infinity className="h-4 w-4" />}
              isActive={!activeCategoryId}
              onSelect={() => setOpen(false)}
            />
            {categories.map((category) => (
              <CategorySheetItem
                key={category.id}
                href={`/home?category=${category.id}`}
                label={category.name}
                icon={getIconForCategory(category.name)}
                isActive={activeCategoryId === category.id}
                onSelect={() => setOpen(false)}
              />
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
