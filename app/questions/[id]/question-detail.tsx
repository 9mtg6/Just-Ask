'use client'

import { useState } from 'react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { AnswerCard } from '@/components/answer-card'
import { AnswerForm } from '@/components/answer-form'
import { ArrowBigUp, MessageSquare, Eye, CheckCircle2 } from 'lucide-react'
import type { Question, Answer } from '@/lib/types'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface QuestionDetailProps {
  question: Question
  answers: Answer[]
  currentUserId?: string
}

export function QuestionDetail({ question, answers: initialAnswers, currentUserId }: QuestionDetailProps) {
  const [upvoteCount, setUpvoteCount] = useState(question.upvotes_count)
  const [hasUpvoted, setHasUpvoted] = useState(question.user_has_upvoted || false)
  const [isUpvoting, setIsUpvoting] = useState(false)
  const [answers, setAnswers] = useState(initialAnswers)
  const [isResolved, setIsResolved] = useState(question.is_resolved)

  const authorName = question.is_anonymous
    ? 'Anonymous'
    : question.profiles?.full_name || question.profiles?.display_name || 'Anonymous'
  const initials = authorName.slice(0, 2).toUpperCase()

  async function handleUpvote() {
    if (!currentUserId) {
      toast.error('Please sign in to upvote')
      return
    }

    setIsUpvoting(true)
    const supabase = createClient()

    if (hasUpvoted) {
      const { error } = await supabase
        .from('question_upvotes')
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
      const { error } = await supabase.from('question_upvotes').insert({
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

  function handleAnswerSubmitted(answer: Answer) {
    setAnswers((prev) => [...prev, answer])
  }

  async function handleAcceptAnswer(answerId: string) {
    // Update local state to mark the question as resolved
    setIsResolved(true)
    setAnswers((prev) =>
      prev.map((a) => ({
        ...a,
        is_accepted: a.id === answerId,
      }))
    )

    // Update question as resolved
    const supabase = createClient()
    await supabase
      .from('questions')
      .update({ is_resolved: true })
      .eq('id', question.id)
  }

  return (
    <div className="space-y-6">
      {/* Question */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-wrap items-center gap-2">
            {question.categories && (
              <Badge variant="secondary">{question.categories.name}</Badge>
            )}
            {isResolved && (
              <Badge variant="default" className="gap-1 bg-emerald-500 hover:bg-emerald-600">
                <CheckCircle2 className="h-3 w-3" />
                Resolved
              </Badge>
            )}
          </div>
          <h1 className="text-2xl font-bold leading-tight">{question.title}</h1>
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              {question.is_anonymous ? (
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="text-xs">AN</AvatarFallback>
                </Avatar>
              ) : (
                <Avatar className="h-6 w-6">
                  <AvatarImage src={question.profiles?.avatar_url || undefined} />
                  <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                </Avatar>
              )}
              <span>{authorName}</span>
            </div>
            <span className="text-muted-foreground/60">·</span>
            <span>Asked {formatDistanceToNow(new Date(question.created_at))} ago</span>
            <span className="text-muted-foreground/60">·</span>
            <div className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              {question.views_count} views
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <p className="whitespace-pre-wrap">{question.content}</p>
          </div>

          <Separator className="my-4" />

          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{isResolved ? 'Answered' : 'Pending'}</Badge>
            <Badge variant="outline">{question.is_anonymous ? 'Anonymous' : 'Public'}</Badge>
          </div>
          <div className="mt-3 flex items-center gap-4">
            <Button
              variant="ghost"
              className={cn(
                'gap-2',
                hasUpvoted && 'bg-primary/10 text-primary'
              )}
              onClick={handleUpvote}
              disabled={isUpvoting}
            >
              <ArrowBigUp className={cn('h-5 w-5', hasUpvoted && 'fill-current')} />
              {upvoteCount} Upvotes
            </Button>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MessageSquare className="h-4 w-4" />
              {answers.length} Answers
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              size="sm"
              variant={isResolved ? 'default' : 'outline'}
              onClick={async () => {
                const supabase = createClient()
                await supabase.from('questions').update({ is_resolved: !isResolved }).eq('id', question.id)
                setIsResolved(!isResolved)
              }}
            >
              {isResolved ? 'Mark as Pending' : 'Mark as Answered'}
            </Button>
            <Button size="sm" variant="outline" onClick={() => toast.success('Marked important (local)')}>
              Mark Important
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Answers */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">
          {answers.length} {answers.length === 1 ? 'Answer' : 'Answers'}
        </h2>

        {answers.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <MessageSquare className="mx-auto mb-3 h-10 w-10 text-muted-foreground/50" />
              <p className="text-muted-foreground">
                No answers yet. Be the first to help!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {answers.map((answer) => (
              <AnswerCard
                key={answer.id}
                answer={answer}
                currentUserId={currentUserId}
                questionOwnerId={question.user_id}
                onAccept={handleAcceptAnswer}
              />
            ))}
          </div>
        )}
      </div>

      {/* Answer form */}
      {currentUserId ? (
        <AnswerForm
          questionId={question.id}
          userId={currentUserId}
          onAnswerSubmitted={handleAnswerSubmitted}
        />
      ) : (
        <Card>
          <CardContent className="py-6 text-center">
            <p className="mb-3 text-muted-foreground">
              Sign in to post an answer
            </p>
            <Link href="/auth/login">
              <Button>Sign In</Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
