import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { AppHeader } from '@/components/app-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Shield, 
  Users, 
  Sparkles, 
  ArrowRight,
  CheckCircle2,
  BookOpen,
  Building,
  Briefcase
} from 'lucide-react'

export default async function LandingPage() {
  // جلب بيانات المستخدم لعرضها في الـ Header إذا كان مسجل دخول
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen bg-background">
      {/* استخدام الـ Header الموحد لضمان تناسق الهوية البصرية */}
      <AppHeader user={user} />

      {/* Hero Section */}
      <section className="px-4 py-20 md:py-32 relative z-10">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm text-primary font-medium backdrop-blur-sm">
            <Sparkles className="h-4 w-4" />
            <span>The Official E-JUST Q&A Community</span>
          </div>
          <h1 className="mb-6 text-balance text-4xl font-bold tracking-tight md:text-6xl drop-shadow-sm">
            Ask anything,{' '}
            <span className="text-primary">get real answers</span>
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-balance text-lg text-muted-foreground md:text-xl">
            A safe, anonymous platform where E-JUST students can ask questions, 
            share knowledge, and help each other succeed. No judgment, just answers.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            {user ? (
              <Link href="/home">
                <Button size="lg" className="gap-2 shadow-lg shadow-primary/20 hover:-translate-y-1 transition-all">
                  Go to Feed
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/auth/sign-up">
                  <Button size="lg" className="gap-2 shadow-lg shadow-primary/20 hover:-translate-y-1 transition-all">
                    Start Asking
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/home">
                  <Button size="lg" variant="outline" className="backdrop-blur-sm bg-background/50 hover:bg-background/80">
                    Browse Questions
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="border-t border-white/5 bg-muted/40 px-4 py-20 backdrop-blur-sm relative z-10">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold drop-shadow-sm">Why Just Ask?</h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              Built by students, for students. Everything you need to get the answers you deserve.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="border-white/10 bg-card/60 backdrop-blur-md shadow-lg hover:-translate-y-1 transition-transform">
              <CardContent className="pt-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 shadow-inner">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 text-xl font-bold">Anonymous by Default</h3>
                <p className="text-muted-foreground">
                  Ask sensitive questions without revealing your identity. Your privacy is our priority.
                </p>
              </CardContent>
            </Card>
            <Card className="border-white/10 bg-card/60 backdrop-blur-md shadow-lg hover:-translate-y-1 transition-transform">
              <CardContent className="pt-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 shadow-inner">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 text-xl font-bold">Community Driven</h3>
                <p className="text-muted-foreground">
                  Get answers from peers who understand your challenges. Upvote the best responses.
                </p>
              </CardContent>
            </Card>
            <Card className="border-white/10 bg-card/60 backdrop-blur-md shadow-lg hover:-translate-y-1 transition-transform">
              <CardContent className="pt-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 shadow-inner">
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 text-xl font-bold">Quality Answers</h3>
                <p className="text-muted-foreground">
                  Upvoting system ensures the best answers rise to the top. Find solutions quickly.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Categories Preview */}
      <section className="px-4 py-20 relative z-10">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold drop-shadow-sm">Explore Topics</h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              Find questions and answers across a variety of categories
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { name: 'Academic', icon: BookOpen, color: 'text-blue-500', bg: 'bg-blue-500/10' },
              { name: 'Campus Life', icon: Building, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
              { name: 'Career', icon: Briefcase, color: 'text-violet-500', bg: 'bg-violet-500/10' },
            ].map((category) => (
              <Card key={category.name} className="group cursor-pointer border-white/10 bg-card/40 backdrop-blur-sm transition-all hover:bg-card/80 hover:shadow-md hover:border-primary/30">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${category.bg}`}>
                    <category.icon className={`h-6 w-6 ${category.color} group-hover:scale-110 transition-transform`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold">{category.name}</h3>
                    <p className="text-sm text-muted-foreground">Browse questions</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-20 relative z-10">
        <div className="mx-auto max-w-4xl">
          <Card className="overflow-hidden border-0 bg-gradient-to-br from-primary to-primary/80 shadow-2xl">
            <CardContent className="p-8 text-center md:p-12 relative">
              <div className="absolute inset-0 bg-[url('/bg-ejust.jpg')] bg-cover bg-center opacity-10 mix-blend-overlay"></div>
              <h2 className="mb-4 text-3xl font-bold text-primary-foreground relative z-10">
                Ready to get started?
              </h2>
              <p className="mb-8 text-primary-foreground/90 relative z-10 font-medium">
                Join thousands of students already asking and answering questions.
              </p>
              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row relative z-10">
                {!user && (
                  <Link href="/auth/sign-up">
                    <Button size="lg" variant="secondary" className="gap-2 font-bold hover:scale-105 transition-transform">
                      Create Free Account
                      <CheckCircle2 className="h-4 w-4" />
                    </Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}