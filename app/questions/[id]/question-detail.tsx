'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { formatDistanceToNow } from 'date-fns'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { AnswerCard } from '@/components/answer-card'
import { AnswerForm } from '@/components/answer-form'
import { ArrowBigUp, MessageSquare, Trash2, Eye, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import Image from 'next/image'

// أضفنا currentUserRole لمعرفة إذا كان المستخدم أدمن أو دكتور
interface QuestionDetailProps {
  question: any
  answers: any[]
  currentUserId?: string
  currentUserRole?: string 
}

export function QuestionDetail({ question, answers: initialAnswers, currentUserId, currentUserRole }: QuestionDetailProps) {
  const router = useRouter()
  const [upvoteCount, setUpvoteCount] = useState(question.upvotes_count || 0)
  const [hasUpvoted, setHasUpvoted] = useState(question.user_has_upvoted || false)
  const [isUpvoting, setIsUpvoting] = useState(false)
  const [answers, setAnswers] = useState(initialAnswers)

  const isAdmin = currentUserRole === 'admin'
  const isOwner = currentUserId === question.user_id

  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this question?')) return
    const supabase = createClient()
    const { error } = await supabase.from('questions').delete().eq('id', question.id)
    if (error) {
      toast.error('Failed to delete question')
    } else {
      toast.success('Question deleted successfully')
      router.push('/home')
    }
  }

  // دالة الإعجاب كما هي...
  async function handleUpvote() { /* ... */ }

  return (
    <div className="space-y-6">
      <Card className="border-white/10 bg-card/60 backdrop-blur-md shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap items-center gap-2">
                {question.categories && <Badge variant="secondary">{question.categories.name}</Badge>}
              </div>
              <h1 className="text-2xl font-bold leading-tight text-foreground">{question.title}</h1>
            </div>
            {/* زر الحذف يظهر فقط للأدمن أو صاحب السؤال */}
            {(isAdmin || isOwner) && (
              <Button variant="destructive" size="icon" onClick={handleDelete} title="Delete Question">
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent>
          <div className="prose prose-sm dark:prose-invert max-w-none mb-6">
            <p className="whitespace-pre-wrap text-base">{question.content}</p>
          </div>

          {/* عرض الصورة إذا كانت موجودة */}
          {question.image_url && (
            <div className="mb-6 overflow-hidden rounded-xl border border-white/10">
              <img src={question.image_url} alt="Question Attachment" className="w-full max-h-[500px] object-contain bg-black/5" />
            </div>
          )}

          <Separator className="my-4 border-white/10" />
          
          <div className="mt-3 flex items-center justify-between">
            <Button variant="ghost" className={cn('gap-2', hasUpvoted && 'bg-primary/10 text-primary')} onClick={handleUpvote} disabled={isUpvoting}>
              <ArrowBigUp className={cn('h-5 w-5', hasUpvoted && 'fill-current')} />
              {upvoteCount} Upvotes
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* منطقة الإجابات (كما هي في الكود الأصلي لديك)... */}
      {/* ... */}
    </div>
  )
}