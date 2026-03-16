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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'
import { ArrowLeft, Shield, Image as ImageIcon, X } from 'lucide-react'
import { toast } from 'sonner'
import type { User } from '@supabase/supabase-js'

export default function AskQuestionPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [categories, setCategories] = useState<any[]>([])
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [categoryId, setCategoryId] = useState<string>('')
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    async function init() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return router.push('/auth/login')
      setUser(user)

      const { data: cats } = await supabase.from('categories').select('*').order('name')
      setCategories(cats || [])
    }
    init()
  }, [router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return
    setIsLoading(true)

    const supabase = createClient()
    let imageUrl = null

    // رفع الصورة إذا وجدت
    if (imageFile) {
      const fileExt = imageFile.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const filePath = `${user.id}/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, imageFile)

      if (uploadError) {
        toast.error('Failed to upload image')
        setIsLoading(false)
        return
      }

      const { data: { publicUrl } } = supabase.storage.from('images').getPublicUrl(filePath)
      imageUrl = publicUrl
    }

    const { data, error } = await supabase
      .from('questions')
      .insert({
        title: title.trim(),
        content: content.trim(),
        user_id: user.id,
        category_id: categoryId || null,
        is_anonymous: isAnonymous,
        image_url: imageUrl, // حفظ رابط الصورة
      })
      .select('id')
      .single()

    if (error) {
      toast.error(error.message)
      setIsLoading(false)
      return
    }

    toast.success('Question posted successfully!')
    router.refresh()
    setTimeout(() => router.push(`/questions/${data.id}`), 100)
  }

  return (
    <div className="min-h-screen bg-background relative">
      <AppHeader user={user} />
      <main className="mx-auto max-w-3xl px-4 py-8 relative z-10">
        <Link href="/home" className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to questions
        </Link>

        <Card className="border-white/10 bg-card/60 backdrop-blur-md shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl">Ask a Question</CardTitle>
            <CardDescription>Get help from professors and peers. Be specific!</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" placeholder="e.g., Question about Physics Chapter 3" value={title} onChange={(e) => setTitle(e.target.value)} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Details</Label>
                <Textarea id="content" placeholder="Describe your question in detail..." value={content} onChange={(e) => setContent(e.target.value)} required rows={5} />
              </div>

              {/* قسم رفع الصور */}
              <div className="space-y-2">
                <Label>Attach an Image (Optional)</Label>
                <div className="flex items-center gap-4">
                  <Input type="file" accept="image/*" className="hidden" id="image-upload" onChange={(e) => setImageFile(e.target.files?.[0] || null)} />
                  <Label htmlFor="image-upload" className="cursor-pointer flex items-center gap-2 bg-secondary/50 text-secondary-foreground px-4 py-2 rounded-lg hover:bg-secondary/70 transition">
                    <ImageIcon className="h-4 w-4" /> Choose Image
                  </Label>
                  {imageFile && (
                    <span className="flex items-center gap-2 text-sm text-muted-foreground bg-muted px-3 py-1 rounded-full">
                      {imageFile.name}
                      <X className="h-4 w-4 cursor-pointer hover:text-destructive" onClick={() => setImageFile(null)} />
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={categoryId} onValueChange={setCategoryId}>
                  <SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (<SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-white/5 bg-muted/20 p-4">
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-primary" />
                  <div>
                    <Label className="font-bold">Post anonymously</Label>
                    <p className="text-xs text-muted-foreground">Hide your name from other students</p>
                  </div>
                </div>
                <Switch checked={isAnonymous} onCheckedChange={setIsAnonymous} />
              </div>

              <div className="flex gap-3 pt-4 border-t border-white/10">
                <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
                  {isLoading ? <Spinner className="mr-2" /> : null} Post Question
                </Button>
                <Button type="button" variant="outline" onClick={() => router.back()} disabled={isLoading}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}