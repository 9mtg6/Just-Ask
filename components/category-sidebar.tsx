'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Layers, Infinity, Calculator, Beaker, Code, Globe, PenTool, Settings, Factory, Zap, BookOpen } from 'lucide-react'
import type { Category } from '@/lib/types'
import { useLocale } from '@/components/locale-provider'
import { dictionaries } from '@/lib/dictionary'

interface CategorySidebarProps {
  categories: Category[]
}

// دالة لاختيار أيقونة مناسبة لكل مادة بناءً على اسمها
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

export function CategorySidebar({ categories }: CategorySidebarProps) {
  const searchParams = useSearchParams()
  const activeCategoryId = searchParams.get('category')
  const locale = useLocale()
  const dict = dictionaries[locale].home

  return (
    <div className="rounded-2xl border border-white/10 bg-card/40 p-5 backdrop-blur-md shadow-sm sticky top-24">
      <div className="mb-5 flex items-center gap-2 font-bold text-foreground px-2">
        <Layers className="h-5 w-5 text-primary" />
        <h3 className="text-lg">{dict.filterBySubject}</h3>
      </div>
      
      <div className="flex flex-col gap-2">
        {/* زر عرض جميع الأسئلة */}
        <Link href="/home">
          <Button
            variant={!activeCategoryId ? "secondary" : "ghost"}
            className={cn(
              "w-full justify-start gap-3 rounded-xl transition-all duration-300",
              !activeCategoryId 
                ? "bg-primary/15 text-primary hover:bg-primary/25 font-bold shadow-sm ring-1 ring-primary/20" 
                : "text-muted-foreground hover:text-foreground hover:bg-white/5"
            )}
          >
            <Infinity className={cn("h-4 w-4", !activeCategoryId && "text-primary")} />
            {dict.allQuestions}
          </Button>
        </Link>

        <div className="h-px w-full bg-border/50 my-2" /> {/* خط فاصل */}

        {/* قائمة المواد الديناميكية من قاعدة البيانات */}
        {categories.map((category) => (
          <Link key={category.id} href={`/home?category=${category.id}`}>
            <Button
              variant={activeCategoryId === category.id ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start gap-3 rounded-xl transition-all duration-300",
                activeCategoryId === category.id 
                  ? "bg-primary/15 text-primary hover:bg-primary/25 font-bold shadow-sm ring-1 ring-primary/20" 
                  : "text-muted-foreground hover:text-foreground hover:bg-white/5"
              )}
            >
              {getIconForCategory(category.name)}
              <span className="truncate">{category.name}</span>
            </Button>
          </Link>
        ))}
      </div>
    </div>
  )
}