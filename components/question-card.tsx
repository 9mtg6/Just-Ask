'use client'

import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ArrowBigUp, MessageSquare, Eye, CheckCircle2 } from 'lucide-react'
import type { Question } from '@/lib/types'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import { toast } from 'sonner'

interface QuestionCardProps {
  question: Question
  currentUserId?: string
}

export function QuestionCard({ question, currentUserId }: QuestionCardProps) {
  const [upvoteCount, setUpvoteCount] = useState(question.upvote_count)
  const [hasUpvoted, setHasUpvoted] = useState(question.user_has_upvoted || false)
  const [isUpvoting, setIsUpvoting] = useState(false)

  const authorName = question.is_anonymous
    ? 'Anonymous'
    : question.profiles?.display_name || 'Anonymous'
  const initials = authorName.slice(0, 2).toUpperCase()

  async function handleUpvote(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()

    if (!currentUserId) {
      toast.error('Please sign in to upvote')
      return
    }

    setIsUpvoting(true)
    const supabase = createClient()

    if (hasUpvoted) {
      // Remove upvote
      const { error } = await supabase
        .from('upvotes')
        .delete()
        .eq('user_id', currentUserId)
        .eq('question_id', question.id)

      if (error) {
        toast.error('Failed to remove upvote')
      } else {
        setUpvoteCount((prev) => prev - 1)
        setHasUpvoted(false)
      }
    } else {
      // Add upvote
      const { error } = await supabase.from('upvotes').insert({
        user_id: currentUserId,
        question_id: question.id,
      })

      if (error) {
        if (error.code === '23505') {
          toast.error('Already upvoted')
        } else {
          toast.error('Failed to upvote')
        }
      } else {
        setUpvoteCount((prev) => prev + 1)
        setHasUpvoted(true)
      }
    }

    setIsUpvoting(false)
  }

  return (
    <Link href={`/questions/${question.id}`}>
      <Card className="transition-colors hover:bg-muted/50">
        <CardContent className="flex gap-4 p-4">
          {/* Upvote button */}
          <div className="flex flex-col items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                'h-10 w-10 rounded-lg',
                hasUpvoted && 'bg-primary/10 text-primary'
              )}
              onClick={handleUpvote}
              disabled={isUpvoting}
            >
              <ArrowBigUp className={cn('h-6 w-6', hasUpvoted && 'fill-current')} />
            </Button>
            <span className={cn('text-sm font-medium', hasUpvoted && 'text-primary')}>
              {upvoteCount}
            </span>
          </div>

          {/* Content */}
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              {question.categories && (
                <Badge variant="secondary" className="shrink-0">
                  {question.categories.name}
                </Badge>
              )}
              {question.is_resolved && (
                <Badge variant="default" className="shrink-0 gap-1 bg-emerald-500 hover:bg-emerald-600">
                  <CheckCircle2 className="h-3 w-3" />
                  Resolved
                </Badge>
              )}
            </div>
            
            <h3 className="mb-2 line-clamp-2 text-lg font-semibold leading-tight">
              {question.title}
            </h3>
            
            <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">
              {question.content}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                {question.is_anonymous ? (
                  <Avatar className="h-5 w-5">
                    <AvatarFallback className="text-[10px]">AN</AvatarFallback>
                  </Avatar>
                ) : (
                  <Avatar className="h-5 w-5">
                    <AvatarImage src={question.profiles?.avatar_url || undefined} />
                    <AvatarFallback className="text-[10px]">{initials}</AvatarFallback>
                  </Avatar>
                )}
                <span>{authorName}</span>
              </div>
              <span className="text-muted-foreground/60">·</span>
              <span>{formatDistanceToNow(new Date(question.created_at))} ago</span>
              <span className="text-muted-foreground/60">·</span>
              <div className="flex items-center gap-1">
                <MessageSquare className="h-4 w-4" />
                {question.answer_count}
              </div>
              <div className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                {question.view_count}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
