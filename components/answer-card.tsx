'use client'

import { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ArrowBigUp, CheckCircle2 } from 'lucide-react'
import type { Answer } from '@/lib/types'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface AnswerCardProps {
  answer: Answer
  currentUserId?: string
  questionOwnerId?: string
  onAccept?: (answerId: string) => void
}

export function AnswerCard({ 
  answer, 
  currentUserId, 
  questionOwnerId,
  onAccept 
}: AnswerCardProps) {
  const [upvoteCount, setUpvoteCount] = useState(answer.upvotes_count)
  const [hasUpvoted, setHasUpvoted] = useState(answer.user_has_upvoted || false)
  const [isUpvoting, setIsUpvoting] = useState(false)
  const [isAccepted, setIsAccepted] = useState(answer.is_accepted)

  const authorName = answer.is_anonymous
    ? 'Anonymous'
    : answer.profiles?.full_name || answer.profiles?.display_name || 'Anonymous'
  const initials = authorName.slice(0, 2).toUpperCase()

  const canAccept = currentUserId === questionOwnerId && !isAccepted

  async function handleUpvote() {
    if (!currentUserId) {
      toast.error('Please sign in to upvote')
      return
    }

    setIsUpvoting(true)
    const supabase = createClient()

    if (hasUpvoted) {
      const { error } = await supabase
        .from('answer_upvotes')
        .delete()
        .eq('user_id', currentUserId)
        .eq('answer_id', answer.id)

      if (error) {
        toast.error('Failed to remove upvote')
      } else {
        setUpvoteCount((prev) => prev - 1)
        setHasUpvoted(false)
      }
    } else {
      const { error } = await supabase.from('answer_upvotes').insert({
        user_id: currentUserId,
        answer_id: answer.id,
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

  async function handleAccept() {
    if (!currentUserId || currentUserId !== questionOwnerId) return

    const supabase = createClient()
    const { error } = await supabase
      .from('answers')
      .update({ is_accepted: true })
      .eq('id', answer.id)

    if (error) {
      toast.error('Failed to accept answer')
      return
    }

    setIsAccepted(true)
    onAccept?.(answer.id)
    toast.success('Answer accepted!')
  }

  return (
    <Card className={cn(isAccepted && 'border-emerald-500 bg-emerald-500/5')}>
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
          {isAccepted && (
            <CheckCircle2 className="h-6 w-6 text-emerald-500" />
          )}
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          {isAccepted && (
            <Badge variant="default" className="mb-2 gap-1 bg-emerald-500 hover:bg-emerald-600">
              <CheckCircle2 className="h-3 w-3" />
              Accepted Answer
            </Badge>
          )}
          
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <p className="whitespace-pre-wrap">{answer.content}</p>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {answer.is_anonymous ? (
                <Avatar className="h-5 w-5">
                  <AvatarFallback className="text-[10px]">AN</AvatarFallback>
                </Avatar>
              ) : (
                <Avatar className="h-5 w-5">
                  <AvatarImage src={answer.profiles?.avatar_url || undefined} />
                  <AvatarFallback className="text-[10px]">{initials}</AvatarFallback>
                </Avatar>
              )}
              <span>{authorName}</span>
              <span className="text-muted-foreground/60">·</span>
              <span>{formatDistanceToNow(new Date(answer.created_at))} ago</span>
            </div>

            {canAccept && (
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={handleAccept}
              >
                <CheckCircle2 className="h-4 w-4" />
                Accept Answer
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
