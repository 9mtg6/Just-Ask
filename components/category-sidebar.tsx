'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  BookOpen, 
  Building, 
  Briefcase, 
  Laptop, 
  Users, 
  MessageCircle,
  LayoutGrid
} from 'lucide-react'
import type { Category } from '@/lib/types'
import { cn } from '@/lib/utils'

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  BookOpen,
  Building,
  Briefcase,
  Laptop,
  Users,
  MessageCircle,
}

interface CategorySidebarProps {
  categories: Category[]
}

export function CategorySidebar({ categories }: CategorySidebarProps) {
  const searchParams = useSearchParams()
  const selectedCategory = searchParams.get('category')

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Categories</CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        <Link href="/home">
          <Button
            variant="ghost"
            className={cn(
              'w-full justify-start gap-2',
              !selectedCategory && 'bg-muted'
            )}
          >
            <LayoutGrid className="h-4 w-4" />
            All Questions
          </Button>
        </Link>
        {categories.map((category) => {
          const Icon = category.icon ? iconMap[category.icon] : MessageCircle
          const isSelected = selectedCategory === category.id
          
          return (
            <Link key={category.id} href={`/home?category=${category.id}`}>
              <Button
                variant="ghost"
                className={cn(
                  'w-full justify-start gap-2',
                  isSelected && 'bg-muted'
                )}
              >
                {Icon && <Icon className="h-4 w-4" />}
                {category.name}
              </Button>
            </Link>
          )
        })}
      </CardContent>
    </Card>
  )
}
