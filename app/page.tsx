import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { AppHeader } from '@/components/app-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowRight, Target, Users, ShieldCheck } from 'lucide-react'

export default async function LandingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    // استخدام bg-transparent لأن الخلفية (صورة الجامعة) موجودة بالفعل في ملف layout.tsx
    <div className="flex min-h-screen flex-col bg-transparent relative">
      <AppHeader user={user} />

      {/* المحتوى الرئيسي للصفحة */}
      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 py-12 sm:py-24">
        
        {/* قسم الترحيب والنبذة المختصرة */}
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <h1 className="mb-6 text-4xl font-extrabold tracking-tight text-foreground drop-shadow-md md:text-6xl">
            A Safe Space to <span className="text-primary">Ask & Learn</span>
          </h1>
          
          {/* صندوق النبذة (بتأثير الزجاج ليتناسب مع الخلفية) */}
          <div className="mb-8 rounded-2xl border border-white/10 bg-background/40 p-6 shadow-sm backdrop-blur-md sm:p-8">
            <p className="text-lg leading-relaxed text-foreground/90 md:text-xl font-medium">
              Welcome to <strong>Just Ask</strong>. We built this platform because every student deserves clear answers without hesitation. Whether it's about a complex physics equation, university housing, or choosing your major, this is your community knowledge base.
            </p>
          </div>

          {/* أزرار اتخاذ القرار (Call to Action) */}
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            {user ? (
              <Link href="/home">
                <Button size="lg" className="gap-2 rounded-full px-8 shadow-lg transition-all hover:-translate-y-1">
                  Go to Feed <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/auth/sign-up">
                  <Button size="lg" className="gap-2 rounded-full px-8 shadow-lg transition-all hover:-translate-y-1">
                    Join the Community <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/home">
                  <Button size="lg" variant="outline" className="rounded-full border-white/20 bg-background/50 px-8 backdrop-blur-md hover:bg-background/80">
                    Explore Questions
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* قسم (الفكرة - السبب - المنفذين) عبارة عن 3 كروت بسيطة */}
        <div className="mx-auto grid w-full max-w-5xl gap-6 sm:grid-cols-3">
          
          {/* الكارت الأول: الهدف */}
          <Card className="border-white/10 bg-card/60 shadow-lg backdrop-blur-md transition-transform hover:-translate-y-1">
            <CardContent className="flex flex-col items-center p-6 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary shadow-inner">
                <Target className="h-7 w-7" />
              </div>
              <h3 className="mb-2 text-xl font-bold">Our Mission</h3>
              <p className="text-sm text-muted-foreground/90 leading-relaxed">
                To bridge the gap between confusion and clarity for E-JUST students by providing a centralized, reliable Q&A platform.
              </p>
            </CardContent>
          </Card>

          {/* الكارت الثاني: السبب */}
          <Card className="border-white/10 bg-card/60 shadow-lg backdrop-blur-md transition-transform hover:-translate-y-1">
            <CardContent className="flex flex-col items-center p-6 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary shadow-inner">
                <ShieldCheck className="h-7 w-7" />
              </div>
              <h3 className="mb-2 text-xl font-bold">Why We Built It</h3>
              <p className="text-sm text-muted-foreground/90 leading-relaxed">
                We know that asking questions publicly can be intimidating. "Just Ask" offers an anonymous option so you can focus on learning, not judging.
              </p>
            </CardContent>
          </Card>

          {/* الكارت الثالث: المنفذين */}
          <Card className="border-white/10 bg-card/60 shadow-lg backdrop-blur-md transition-transform hover:-translate-y-1">
            <CardContent className="flex flex-col items-center p-6 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary shadow-inner">
                <Users className="h-7 w-7" />
              </div>
              <h3 className="mb-2 text-xl font-bold">Who We Are</h3>
              <p className="text-sm text-muted-foreground/90 leading-relaxed">
                Created by fellow E-JUST students who faced the same challenges and wanted to build a supportive, knowledge-sharing community.
              </p>
            </CardContent>
          </Card>

        </div>
      </main>
      
      {/* تذييل بسيط جداً (Footer) */}
      <footer className="relative z-10 border-t border-white/10 bg-background/40 py-6 backdrop-blur-md">
        <div className="text-center text-sm font-medium text-muted-foreground">
          Built with care for the E-JUST Community.
        </div>
      </footer>
    </div>
  )
}