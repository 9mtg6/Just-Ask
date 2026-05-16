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
    <div className="flex min-h-screen flex-col bg-transparent relative animate-fade-in">
      <AppHeader user={user} />

      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 py-12 sm:py-24 overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute left-[10%] top-10 h-36 w-36 rounded-full bg-primary/15 blur-2xl animate-float-slow" />
          <div className="absolute right-[8%] top-24 h-40 w-40 rounded-full bg-secondary/15 blur-2xl animate-float-delayed" />
        </div>
        
        <div className="mx-auto mb-16 max-w-3xl text-center">
          {/* تم إضافة حركة الدخول الناعمة هنا */}
          <h1 className="mb-6 text-4xl font-extrabold tracking-tight text-foreground drop-shadow-md md:text-6xl animate-slide-up">
            A Safe Space to <span className="text-gradient-brand">Ask & Learn</span>
          </h1>
          
          <div className="mb-8 rounded-3xl border border-white/10 bg-background/40 p-6 shadow-2xl backdrop-blur-xl sm:p-8 animate-slide-up-delayed border-gradient-brand">
            <p className="text-lg leading-relaxed text-foreground/90 md:text-xl font-medium">
              Welcome to <strong>Just Ask</strong>. We built this platform because every student deserves clear answers without hesitation. Whether it's about a complex physics equation, university housing, or choosing your major, this is your community knowledge base.
            </p>
          </div>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row animate-slide-up-delayed-2">
            {user ? (
              <Button asChild size="lg" className="gap-2 rounded-full px-8 shadow-xl shadow-primary/20 transition-all duration-500 hover:-translate-y-1.5 hover:shadow-primary/40 animate-glow-pulse">
                <Link href="/home">
                  Go to Feed <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            ) : (
              <>
                <Button asChild size="lg" className="gap-2 rounded-full px-8 shadow-xl shadow-primary/20 transition-all duration-500 hover:-translate-y-1.5 hover:shadow-primary/40 animate-glow-pulse">
                  <Link href="/auth/sign-up">
                    Join the Community <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="rounded-full border-white/20 bg-background/50 px-8 backdrop-blur-md transition-all duration-500 hover:bg-background/80 hover:-translate-y-1 hover:shadow-lg">
                  <Link href="/home">Explore Questions</Link>
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="mx-auto grid w-full max-w-5xl gap-6 sm:grid-cols-3 animate-slide-up-delayed-2">
          
          <Card className="border-white/10 bg-card/40 shadow-xl backdrop-blur-md transition-all duration-500 hover:-translate-y-2 hover:bg-card/60 hover:shadow-2xl hover:border-primary/20 group border-gradient-brand">
            <CardContent className="flex flex-col items-center p-8 text-center">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-inner transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
                <Target className="h-8 w-8" />
              </div>
              <h3 className="mb-3 text-xl font-bold">Our Mission</h3>
              <p className="text-sm text-muted-foreground/90 leading-relaxed">
                To bridge the gap between confusion and clarity for E-JUST students by providing a centralized, reliable Q&A platform.
              </p>
            </CardContent>
          </Card>

          <Link href="/why" className="block w-full h-full animate-slide-up-delayed-2">
            <Card className="h-full border-white/10 bg-card/40 shadow-xl backdrop-blur-md transition-all duration-500 hover:-translate-y-2 hover:bg-card/60 hover:shadow-2xl hover:border-primary/20 group cursor-pointer border-gradient-brand">
              <CardContent className="flex h-full flex-col items-center p-8 text-center">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-inner transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-3">
                  <ShieldCheck className="h-8 w-8" />
                </div>
                <h3 className="mb-3 text-xl font-bold">Why We Built It</h3>
                <p className="text-sm text-muted-foreground/90 leading-relaxed mb-6">
                  We noticed a real struggle among students. Discover our vision, the data from our survey, and why Just Ask is the solution.
                </p>
                <div className="mt-auto flex items-center text-sm font-semibold text-primary transition-transform group-hover:translate-x-1">
                  Discover the Motive <ArrowRight className="ml-2 h-4 w-4" />
                </div>
              </CardContent>
            </Card>
          </Link>

         <Link href="/about" className="block w-full h-full animate-slide-up-delayed-2">
            <Card className="h-full border-white/10 bg-card/40 shadow-xl backdrop-blur-md transition-all duration-500 hover:-translate-y-2 hover:bg-card/60 hover:shadow-2xl hover:border-primary/20 group cursor-pointer border-gradient-brand">
              <CardContent className="flex h-full flex-col items-center p-8 text-center">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-inner transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
                  <Users className="h-8 w-8" />
                </div>
                <h3 className="mb-3 text-xl font-bold">Who We Are</h3>
                <p className="text-sm text-muted-foreground/90 leading-relaxed mb-6">
                  Created by a group of students who faced the same challenges. Click here to discover our story and meet the team behind Just Ask.
                </p>
                <div className="mt-auto flex items-center text-sm font-semibold text-primary transition-transform group-hover:translate-x-1">
                  Meet the Team <ArrowRight className="ml-2 h-4 w-4" />
                </div>
              </CardContent>
            </Card>
          </Link>

        </div>
      </main>
      
      <footer className="relative z-10 border-t border-white/5 bg-background/20 py-8 backdrop-blur-lg mt-auto">
        <div className="text-center text-sm font-medium text-muted-foreground/80 tracking-wide">
          Built with precision for the E-JUST Community.
        </div>
      </footer>
    </div>
  )
}