'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { AppHeader } from '@/components/app-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Field, FieldLabel, FieldGroup, FieldError, FieldDescription } from '@/components/ui/field'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'
import { ArrowLeft, Shield } from 'lucide-react'
import { toast } from 'sonner'
import type { User } from '@supabase/supabase-js'
import type { Category } from '@/lib/types'

export default function AskQuestionPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [categoryId, setCategoryId] = useState<string>('')
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isInitializing, setIsInitializing] = useState(true)

  useEffect(() => {
    async function init() {
      const supabase = createClient()
      
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }
      setUser(user)

      const { data: cats, error: catError } = await supabase
        .from('categories')
        .select('*')
        .order('name')
      
      if (catError) {
        console.error('Categories error', catError)
        setError('Failed to load categories. Make sure database is initialized.')
      } else {
        setCategories(cats || [])
      }
      
      setIsInitializing(false)
    }

    init()
  }, [router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return

    setError(null)
    setIsLoading(true)

    const supabase = createClient()

    // 1. إنشاء الحساب التعريفي للمستخدم (Profile) إذا لم يكن موجوداً
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .maybeSingle()

    if (!profile) {
      const { error: upsertError } = await supabase.from('profiles').insert({
        id: user.id,
        full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Anonymous User',
        email: user.email || '',
      })

      if (upsertError) {
        setError('Error creating user profile. Please try again.')
        setIsLoading(false)
        return
      }
    }

    // 2. إدخال السؤال في قاعدة البيانات
    const { data: insertedQuestion, error: insertError } = await supabase
      .from('questions')
      .insert({
        title: title.trim(),
        content: content.trim(),
        user_id: user.id,
        category_id: categoryId || null,
        is_anonymous: isAnonymous,
      })
      .select('id')
      .single()

    if (insertError || !insertedQuestion?.id) {
      console.error('Ask post error', insertError)
      setError(insertError?.message || 'Failed to create question.')
      setIsLoading(false)
      return
    }

    toast.success('Question posted successfully!')
    
    // 3. مسح كاش المسارات والانتقال المباشر للرابط الجديد
    router.refresh()
    setTimeout(() => {
      router.push(`/questions/${insertedQuestion.id}`)
    }, 100) // تأخير بسيط لضمان تحديث كاش الـ Next.js
  }

  if (isInitializing) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader user={user} />

      <main className="mx-auto max-w-3xl px-4 py-6">
        <Link
          href="/home"
          className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to questions
        </Link>

        <Card>
          <CardHeader>
            <CardTitle>Ask a Question</CardTitle>
            <CardDescription>
              Get help from the community. Be specific and provide enough context.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="title">Title</FieldLabel>
                  <FieldDescription>
                    Summarize your question in a clear, concise title
                  </FieldDescription>
                  <Input
                    id="title"
                    placeholder="e.g., How do I prepare for the calculus final exam?"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    maxLength={200}
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="content">Details</FieldLabel>
                  <FieldDescription>
                    Explain your question in detail. Include any relevant background information.
                  </FieldDescription>
                  <Textarea
                    id="content"
                    placeholder="Describe your question here..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    required
                    rows={6}
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="category">Category</FieldLabel>
                  <Select value={categoryId} onValueChange={setCategoryId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>

                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                      <Shield className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <Label htmlFor="anonymous" className="font-medium">
                        Post anonymously
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Your name will be hidden from other users
                      </p>
                    </div>
                  </div>
                  <Switch
                    id="anonymous"
                    checked={isAnonymous}
                    onCheckedChange={setIsAnonymous}
                  />
                </div>

                {error && <FieldError className="text-red-500 font-semibold">{error}</FieldError>}

                <div className="flex gap-3">
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? <Spinner className="mr-2" /> : null}
                    Post Question
                  </Button>
                  <Button type="button" variant="outline" onClick={() => router.back()} disabled={isLoading}>
                    Cancel
                  </Button>
                </div>
              </FieldGroup>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}