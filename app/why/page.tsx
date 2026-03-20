import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { AppHeader } from '@/components/app-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowLeft, Target, Eye, BarChart3, AlertTriangle, CheckCircle2 } from 'lucide-react'

export default async function WhyPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="flex min-h-screen flex-col bg-background relative">
      <AppHeader user={user} />

      <main className="relative z-10 flex flex-1 flex-col items-center px-4 py-8 sm:py-12 overflow-hidden">
        
        {/* زر الرجوع */}
        <div className="w-full max-w-5xl mx-auto mb-8 animate-fade-in">
          <Link href="/">
            <Button variant="ghost" className="gap-2 text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors rounded-full px-4">
              <ArrowLeft className="h-4 w-4" /> Back to Home
            </Button>
          </Link>
        </div>

        {/* الهيدر */}
        <div className="mx-auto max-w-4xl text-center mb-16 animate-fade-in">
          <h1 className="mb-6 text-4xl font-extrabold tracking-tight text-foreground md:text-5xl">
            Why We Built <span className="text-primary bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">Just Ask</span>
          </h1>
          <p className="text-lg text-muted-foreground/90 md:text-xl leading-relaxed max-w-3xl mx-auto">
            Our platform wasn&apos;t built just for the sake of writing code. It was born out of a real, 
            measured necessity within the E-JUST community.
          </p>
        </div>

        {/* الرؤية والهدف */}
        <div className="mx-auto grid w-full max-w-5xl gap-8 sm:grid-cols-2 mb-16 animate-slide-up">
          <Card className="border-white/10 bg-card/40 shadow-lg backdrop-blur-md">
            <CardContent className="p-8 flex flex-col items-center text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Target className="h-7 w-7" />
              </div>
              <h3 className="mb-3 text-2xl font-bold">Our Mission</h3>
              <p className="text-muted-foreground leading-relaxed">
                To democratize knowledge sharing within E-JUST. We want to ensure that no question goes unanswered and no student feels left behind because they were afraid to ask.
              </p>
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-card/40 shadow-lg backdrop-blur-md">
            <CardContent className="p-8 flex flex-col items-center text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Eye className="h-7 w-7" />
              </div>
              <h3 className="mb-3 text-2xl font-bold">Our Vision</h3>
              <p className="text-muted-foreground leading-relaxed">
                To become the ultimate, reliable, and central hub for every E-JUST student&apos;s academic and campus-life inquiries, fostering a culture of mutual support.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* المشكلة والاستبيان (البيانات الحقيقية) */}
        <div className="mx-auto w-full max-w-4xl mb-16 animate-slide-up-delayed">
          <Card className="border-white/10 bg-card/60 shadow-2xl backdrop-blur-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-2 h-full bg-primary"></div>
            <CardContent className="p-8 sm:p-10">
              <div className="flex items-center gap-4 mb-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
                  <AlertTriangle className="h-6 w-6" />
                </div>
                <h2 className="text-3xl font-bold">The Problem We Saw</h2>
              </div>
              
              <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                We noticed that many students were suffering in silence. Fear of judgment, confusion about where to find the right answers, and scattered communication channels left many students frustrated. 
              </p>

              <div className="bg-background/50 rounded-2xl p-6 mb-6 border border-white/5">
                <div className="flex items-center gap-3 mb-4 text-foreground font-semibold text-xl">
                  <BarChart3 className="h-6 w-6 text-primary" />
                  We didn&apos;t just guess; we collected data.
                </div>
                <p className="text-muted-foreground mb-6">
                  We launched a campus-wide survey to validate our assumptions. The results were overwhelming: a massive percentage of students confirmed they face severe difficulties in finding answers to their academic and administrative questions, and many preferred an anonymous way to ask.
                </p>
                <a 
                  href="https://forms.gle/SGkqjyQuSRGBGr4m8" 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <Button className="gap-2 rounded-full shadow-lg hover:shadow-primary/25 transition-all">
                    View Our Original Survey <ArrowLeft className="h-4 w-4 rotate-135 hidden" />
                  </Button>
                </a>
              </div>

              <div className="flex items-start gap-3 text-muted-foreground">
                <CheckCircle2 className="h-6 w-6 text-green-500 mt-0.5 shrink-0" />
                <p>
                  <strong className="text-foreground">The Conclusion:</strong> The community desperately needed a dedicated, organized, and safe space for Q&A. Thus, <strong>Just Ask</strong> was created.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

      </main>

      <footer className="relative z-10 border-t border-white/5 bg-background/20 py-8 backdrop-blur-lg mt-auto">
        <div className="text-center text-sm font-medium text-muted-foreground/80 tracking-wide">
          Built with precision for the <span className="text-foreground">E-JUST</span> Community.
        </div>
      </footer>
    </div>
  )
}