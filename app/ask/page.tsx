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
import { ArrowRight, Image as ImageIcon } from 'lucide-react'
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
    const file = formData.get('image') as File | null

    let image_url = null

    // منطق رفع الصورة إذا تم إرفاقها
    if (file && file.size > 0) {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random()}-${Date.now()}.${fileExt}`
      
      const { error: uploadError } = await supabase.storage
        .from('question_images') // يجب إنشاء باكت (Bucket) بهذا الاسم في Supabase
        .upload(fileName, file)

      if (!uploadError) {
        const { data: { publicUrl } } = supabase.storage
          .from('question_images')
          .getPublicUrl(fileName)
        
        image_url = publicUrl
      }
    }

    const { error } = await supabase.from('questions').insert({
      title,
      content,
      category_id: category_id || null,
      user_id: user.id,
      is_anonymous,
      image_url // إدراج رابط الصورة
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
            <Button variant="ghost" className="gap-2 text-muted-foreground hover:text-foreground rounded-full px-4 -ms-4">
              <ArrowRight className="h-4 w-4" /> العودة للأسئلة
            </Button>
          </Link>
        </div>

        <Card className="border-white/10 bg-card/40 backdrop-blur-md shadow-2xl animate-slide-up">
          <CardHeader className="pb-6 border-b border-white/5">
            <CardTitle className="text-3xl font-extrabold text-primary">اطرح سؤالاً</CardTitle>
            <CardDescription className="text-base text-muted-foreground">
              اختر المادة المناسبة حتى يتمكن زملاؤك من إيجاد سؤالك والإجابة عليه بشكل أسرع.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form action={submitQuestion} className="space-y-6">
              
              <div className="space-y-2">
                <Label htmlFor="title" className="text-foreground font-semibold">عنوان السؤال <span className="text-destructive">*</span></Label>
                <Input id="title" name="title" placeholder="مثال: كيف نقوم بحل التكامل بالتجزئة في مادة Math 1؟" required className="bg-background/50 border-white/10 focus-visible:ring-primary h-12" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category" className="text-foreground font-semibold">المادة / التصنيف <span className="text-destructive">*</span></Label>
                <Select name="category_id" required>
                  <SelectTrigger className="bg-background/50 border-white/10 focus:ring-primary h-12">
                    <SelectValue placeholder="اختر مادة..." />
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
                <Label htmlFor="content" className="text-foreground font-semibold">التفاصيل <span className="text-destructive">*</span></Label>
                <Textarea id="content" name="content" placeholder="اشرح مشكلتك، أضف سياقاً، أو شارك ما حاولته حتى الآن..." rows={8} required className="bg-background/50 border-white/10 focus-visible:ring-primary resize-none" />
              </div>

              {/* حقل رفع الصورة (جديد) */}
              <div className="space-y-2">
                <Label htmlFor="image" className="text-foreground font-semibold flex items-center gap-2">
                  <ImageIcon className="h-4 w-4" /> إرفاق صورة (اختياري)
                </Label>
                <Input id="image" name="image" type="file" accept="image/*" className="bg-background/50 border-white/10 focus-visible:ring-primary file:text-primary file:bg-primary/10 file:border-0 file:me-4 file:py-2 file:px-4 file:rounded-md cursor-pointer" />
              </div>

              <div className="flex items-center space-x-3 space-x-reverse bg-secondary/30 p-5 rounded-2xl border border-white/5 hover:border-primary/20 transition-colors">
                <Switch id="is_anonymous" name="is_anonymous" className="data-[state=checked]:bg-primary" />
                <Label htmlFor="is_anonymous" className="flex flex-col cursor-pointer gap-1">
                  <span className="font-semibold text-foreground">طرح السؤال كمجهول</span>
                  <span className="text-sm text-muted-foreground">سيتم إخفاء اسمك وصورتك الشخصية عن الجميع.</span>
                </Label>
              </div>

              <Button type="submit" size="lg" className="w-full text-md font-bold shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5 transition-all">
                نشر السؤال
              </Button>

            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}