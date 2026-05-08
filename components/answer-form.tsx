'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldGroup, FieldError } from '@/components/ui/field'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'
import { Shield } from 'lucide-react'
import { toast } from 'sonner'
import type { Answer } from '@/lib/types'
import { useRouter } from 'next/navigation'
import { useLocale } from '@/components/locale-provider'
import { dictionaries } from '@/lib/dictionary'

interface AnswerFormProps {
  questionId: string
  userId: string
  onAnswerSubmitted: (answer: Answer) => void
}

export function AnswerForm({ questionId, userId, onAnswerSubmitted }: AnswerFormProps) {
  const router = useRouter()
  const locale = useLocale()
  const dict = dictionaries[locale]
  const [content, setContent] = useState('')
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    const supabase = createClient()

    // Ensure user profile exists
    const { data: profile } = await supabase.from('profiles').select('id').eq('id', userId).single()

    if (!profile) {
      await supabase.from('profiles').insert({ id: userId, full_name: dict.answer.unknownUser, email: '' })
    }

    const { data, error } = await supabase
      .from('answers')
      .insert({
        content,
        question_id: questionId,
        user_id: userId,
        is_anonymous: isAnonymous,
      })
      .select(`*, profiles:user_id (id, full_name, avatar_url)`)
      .single()

    if (error) {
      setError(error.message)
      setIsLoading(false)
      return
    }

    // 🐛 تم الإصلاح: تحديث عدد الإجابات في جدول الأسئلة لكي تظهر في الصفحة الرئيسية
    const { data: qData } = await supabase.from('questions').select('answers_count').eq('id', questionId).single()
    if (qData) {
      await supabase.from('questions').update({ answers_count: (qData.answers_count || 0) + 1 }).eq('id', questionId)
    }

    toast.success(dict.answer.posted)
    setContent('')
    setIsAnonymous(false)
    onAnswerSubmitted(data as Answer)
    setIsLoading(false)
    router.refresh() // لتحديث الصفحة بعد الإجابة
  }

  return (
    <Card className="border-white/10 bg-card/40 backdrop-blur-md shadow-lg">
      <CardHeader>
        <CardTitle className="text-lg">{dict.answer.yourAnswer}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            <Field>
              <Textarea
                placeholder={dict.answer.placeholder}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                rows={5}
                className="bg-background/50 border-white/10 focus-visible:ring-primary"
              />
            </Field>

            <div className="flex items-center justify-between rounded-xl border border-white/5 bg-secondary/20 p-4">
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-muted-foreground" />
                <Label htmlFor="answer-anonymous" className="text-sm font-medium cursor-pointer">
                  {dict.answer.postAnonymously}
                </Label>
              </div>
              <Switch id="answer-anonymous" checked={isAnonymous} onCheckedChange={setIsAnonymous} />
            </div>

            {error && <FieldError>{error}</FieldError>}

            <Button type="submit" size="lg" className="w-full sm:w-auto font-bold shadow-lg" disabled={isLoading || !content.trim()}>
              {isLoading ? <Spinner className="mr-2" /> : null}
              {dict.answer.postAnswer}
            </Button>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}