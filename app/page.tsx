import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ThemeToggle } from '@/components/theme-toggle'
import { 
  MessageCircleQuestion, 
  Shield, 
  Users, 
  Sparkles, 
  ArrowRight,
  CheckCircle2,
  BookOpen,
  Building,
  Briefcase
} from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <MessageCircleQuestion className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-semibold">Just Ask</span>
          </Link>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link href="/auth/login">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/auth/sign-up">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-4 py-20 md:py-32">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-muted/50 px-4 py-1.5 text-sm text-muted-foreground">
            <Sparkles className="h-4 w-4" />
            <span>Anonymous Q&A for Students</span>
          </div>
          <h1 className="mb-6 text-balance text-4xl font-bold tracking-tight md:text-6xl">
            Ask anything,{' '}
            <span className="text-primary">get real answers</span>
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-balance text-lg text-muted-foreground md:text-xl">
            A safe, anonymous platform where university students can ask questions, 
            share knowledge, and help each other succeed. No judgment, just answers.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/auth/sign-up">
              <Button size="lg" className="gap-2">
                Start Asking
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/home">
              <Button size="lg" variant="outline">
                Browse Questions
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="border-t bg-muted/30 px-4 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold">Why Just Ask?</h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              Built by students, for students. Everything you need to get the answers you deserve.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="border-0 bg-card shadow-sm">
              <CardContent className="pt-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">Anonymous by Default</h3>
                <p className="text-muted-foreground">
                  Ask sensitive questions without revealing your identity. Your privacy is our priority.
                </p>
              </CardContent>
            </Card>
            <Card className="border-0 bg-card shadow-sm">
              <CardContent className="pt-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">Community Driven</h3>
                <p className="text-muted-foreground">
                  Get answers from peers who understand your challenges. Upvote the best responses.
                </p>
              </CardContent>
            </Card>
            <Card className="border-0 bg-card shadow-sm">
              <CardContent className="pt-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">Quality Answers</h3>
                <p className="text-muted-foreground">
                  Upvoting system ensures the best answers rise to the top. Find solutions quickly.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Categories Preview */}
      <section className="px-4 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold">Explore Topics</h2>
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
              <Card key={category.name} className="group cursor-pointer transition-colors hover:bg-muted/50">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${category.bg}`}>
                    <category.icon className={`h-6 w-6 ${category.color}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{category.name}</h3>
                    <p className="text-sm text-muted-foreground">Browse questions</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="border-t bg-muted/30 px-4 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold">How It Works</h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              Getting started is simple. Ask your first question in minutes.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              { step: '01', title: 'Sign Up', desc: 'Create your free account with just an email' },
              { step: '02', title: 'Ask or Answer', desc: 'Post questions or help others with answers' },
              { step: '03', title: 'Engage', desc: 'Upvote helpful content and build your reputation' },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground">
                  {item.step}
                </div>
                <h3 className="mb-2 text-xl font-semibold">{item.title}</h3>
                <p className="text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-20">
        <div className="mx-auto max-w-4xl">
          <Card className="overflow-hidden border-0 bg-primary">
            <CardContent className="p-8 text-center md:p-12">
              <h2 className="mb-4 text-3xl font-bold text-primary-foreground">
                Ready to get started?
              </h2>
              <p className="mb-8 text-primary-foreground/80">
                Join thousands of students already asking and answering questions.
              </p>
              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link href="/auth/sign-up">
                  <Button size="lg" variant="secondary" className="gap-2">
                    Create Free Account
                    <CheckCircle2 className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t px-4 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <MessageCircleQuestion className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-semibold">Just Ask</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Built with care for university students everywhere.
          </p>
        </div>
      </footer>
    </div>
  )
}
