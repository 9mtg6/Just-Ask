import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AppHeader } from '@/components/app-header'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default async function AskPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // جلب قائمة المواد من قاعدة البيانات
  const { data: categories } = await supabase.from('categories').select('*').order('name')

  async function submitQuestion(formData: FormData) {
    'use server'
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const title = formData.get('title') as string
    const content = formData.get('content') as string
    const category_id = formData.get('category_id') as string
    const is_anonymous = formData.get('is_anonymous') === 'on'

    const { error } = await supabase.from('questions').insert({
      title,
      content,
      category_id: category_id || null,
      user_id: user.id,
      is_anonymous,
    })

    if (!error) {
      redirect('/home')
    }
  }

  return (
    <div className="min-h-screen bg-background relative flex flex-col">
      <AppHeader user={user} />
      
      <main className="flex-1 mx-auto w-full max-w-3xl px-4 py-8 sm:py-12 relative z-10">
        
        <div className="mb-6 animate-fade-in">
          <Link href="/home">
            <Button variant="ghost" className="gap-2 text-muted-foreground hover:text-foreground rounded-full px-4 -ml-4">
              <ArrowLeft className="h-4 w-4" /> Back to Questions
            </Button>
          </Link>
        </div>

        <Card className="border-white/10 bg-card/40 backdrop-blur-md shadow-2xl animate-slide-up">
          <CardHeader className="pb-6 border-b border-white/5">
            <CardTitle className="text-3xl font-extrabold text-primary">Ask a Question</CardTitle>
            <CardDescription className="text-base text-muted-foreground">
              Choose the right subject so your peers can find and answer your question faster.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form action={submitQuestion} className="space-y-6">
              
              <div className="space-y-2">
                <Label htmlFor="title" className="text-foreground font-semibold">Question Title <span className="text-destructive">*</span></Label>
                <Input id="title" name="title" placeholder="e.g., How to solve Integration by Parts in Math 1?" required className="bg-background/50 border-white/10 focus-visible:ring-primary h-12" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category" className="text-foreground font-semibold">Subject / Category <span className="text-destructive">*</span></Label>
                <Select name="category_id" required>
                  <SelectTrigger className="bg-background/50 border-white/10 focus:ring-primary h-12">
                    <SelectValue placeholder="Select a subject..." />
                  </SelectTrigger>
                  <SelectContent className="bg-card/95 backdrop-blur-xl border-white/10">
                    {categories?.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id} className="cursor-pointer hover:bg-primary/10 hover:text-primary">
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="content" className="text-foreground font-semibold">Details <span className="text-destructive">*</span></Label>
                <Textarea id="content" name="content" placeholder="Explain your problem, add context, or share what you have tried so far..." rows={8} required className="bg-background/50 border-white/10 focus-visible:ring-primary resize-none" />
              </div>

              <div className="flex items-center space-x-3 bg-secondary/30 p-5 rounded-2xl border border-white/5 hover:border-primary/20 transition-colors">
                <Switch id="is_anonymous" name="is_anonymous" className="data-[state=checked]:bg-primary" />
                <Label htmlFor="is_anonymous" className="flex flex-col cursor-pointer gap-1">
                  <span className="font-semibold text-foreground">Ask Anonymously</span>
                  <span className="text-sm text-muted-foreground">Your name and profile picture will be hidden from everyone.</span>
                </Label>
              </div>

              <Button type="submit" size="lg" className="w-full text-md font-bold shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5 transition-all">
                Post Question
              </Button>

            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}