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

interface AnswerFormProps {
  questionId: string
  userId: string
  onAnswerSubmitted: (answer: Answer) => void
}

export function AnswerForm({ questionId, userId, onAnswerSubmitted }: AnswerFormProps) {
  const [content, setContent] = useState('')
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    const supabase = createClient()

    // Ensure user profile exists for FK integrity
    const { data: profile, error: profileCheckError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single()

    if (profileCheckError && profileCheckError.code !== 'PGRST116') {
      console.error('Profile check error', profileCheckError)
      setError('Unable to verify profile. Please try again.')
      setIsLoading(false)
      return
    }

    if (!profile) {
      const { error: upsertError } = await supabase.from('profiles').insert({
        id: userId,
        full_name: 'Unknown User',
        email: '',
      })
      if (upsertError) {
        console.error('Profile upsert error', upsertError)
        setError('Unable to create profile record for your account. Please contact support.')
        setIsLoading(false)
        return
      }
    }

    const { data, error } = await supabase
      .from('answers')
      .insert({
        content,
        question_id: questionId,
        user_id: userId,
        is_anonymous: isAnonymous,
      })
      .select(`
        *,
        profiles:user_id (id, display_name, avatar_url)
      `)
      .single()

    if (error) {
      console.error('Answer post error', error)
      if (error.message.includes('Could not find the table')) {
        setError('Database not initialized. Please create the tables in Supabase SQL first.')
      } else {
        setError(error.message)
      }
      setIsLoading(false)
      return
    }

    toast.success('Answer posted!')
    setContent('')
    setIsAnonymous(false)
    onAnswerSubmitted(data as Answer)
    setIsLoading(false)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Your Answer</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            <Field>
              <Textarea
                placeholder="Write your answer here..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                rows={4}
              />
            </Field>

            <div className="flex items-center justify-between rounded-lg border p-3">
              <div className="flex items-center gap-3">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <Label htmlFor="answer-anonymous" className="text-sm">
                  Post anonymously
                </Label>
              </div>
              <Switch
                id="answer-anonymous"
                checked={isAnonymous}
                onCheckedChange={setIsAnonymous}
              />
            </div>

            {error && <FieldError>{error}</FieldError>}

            <Button type="submit" disabled={isLoading || !content.trim()}>
              {isLoading ? <Spinner className="mr-2" /> : null}
              Post Answer
            </Button>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}
