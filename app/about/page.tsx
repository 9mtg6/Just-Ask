import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { AppHeader } from '@/components/app-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Lightbulb, Rocket, Users, ArrowLeft } from 'lucide-react'

// قائمة بأسماء الفريق
const teamMembers = [
  { name: 'Marwan Tarek', role: 'Developer', image: '/Marwan%20Tarek.jpeg' },
  { name: 'Yassin Karim', role: 'Leader', image: '/Yassin%20Karim.jpeg' },
  { name: 'Abdelfattah Atef', role: 'Official Spokesperson', image: '/Abdelfattah%20Atef.jpeg' },
  { name: 'Omar Elnagdy', role: 'Community Manager', image: '/Omar%20Elnagdy.jpeg' },
  { name: 'El-hussieen Ali', role: 'Co-Originator of the idea', image: '/El-hussieen%20Ali.jpeg' },
  { name: 'Ziad Mohamed', role: 'Marketing Team', image: '/Ziad%20Mohamed.jpeg' },
  { name: 'Anas Yasser', role: 'Originator of the idea', image: '/logo.png' },

]

export default async function AboutPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="flex min-h-screen flex-col bg-background relative">
      <AppHeader user={user} />

      <main className="relative z-10 flex flex-1 flex-col items-center px-4 py-12 sm:py-20 overflow-hidden">
        
        {/* زر الرجوع */}
        <div className="w-full max-w-5xl mx-auto mb-8 animate-fade-in">
          <Link href="/">
            <Button variant="ghost" className="gap-2 text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors rounded-full px-4">
              <ArrowLeft className="h-4 w-4" /> Back to Home
            </Button>
          </Link>
        </div>

        {/* قسم الهيدر والقصة */}
        <div className="mx-auto max-w-4xl text-center mb-16 animate-fade-in">
          <h1 className="mb-6 text-4xl font-extrabold tracking-tight text-foreground md:text-5xl lg:text-6xl">
            The Story Behind <span className="text-primary bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">Just Ask</span>
          </h1>
          <p className="text-lg text-muted-foreground/90 md:text-xl leading-relaxed max-w-3xl mx-auto">
            It all started with a simple observation: students often hesitate to ask questions publicly. 
            Whether it was a complex assignment, a general inquiry about university life, or seeking academic guidance, 
            there was a missing link between confusion and clarity. We decided to build the bridge ourselves.
          </p>
        </div>

        {/* قسم كيف بدأنا والمراحل */}
        <div className="mx-auto grid w-full max-w-5xl gap-8 sm:grid-cols-2 mb-24">
          <Card className="border-white/10 bg-card/40 shadow-lg backdrop-blur-md">
            <CardContent className="p-8">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Lightbulb className="h-6 w-6" />
              </div>
              <h3 className="mb-3 text-2xl font-bold">The Idea</h3>
              <p className="text-muted-foreground leading-relaxed">
                As E-JUST students, we faced these exact challenges. We realized that if we created a centralized, 
                safe, and optionally anonymous space, students would be much more willing to seek the knowledge they need. 
                That&apos;s when &quot;Just Ask&quot; was born—a platform by students, for students.
              </p>
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-card/40 shadow-lg backdrop-blur-md">
            <CardContent className="p-8">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Rocket className="h-6 w-6" />
              </div>
              <h3 className="mb-3 text-2xl font-bold">The Execution</h3>
              <p className="text-muted-foreground leading-relaxed">
                We combined our skills in development and design to bring this vision to life. 
                Using modern web technologies, we focused on creating a seamless, intuitive, and secure experience. 
                It took late nights, endless debugging, and a shared passion for helping our community.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* معرض الفريق */}
        <div className="mx-auto w-full max-w-6xl text-center">
          <div className="mb-12 flex flex-col items-center justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
              <Users className="h-8 w-8" />
            </div>
            <h2 className="text-3xl font-bold md:text-4xl">Meet the Team</h2>
            <p className="mt-4 text-muted-foreground max-w-2xl">
              The dedicated group of developers and dreamers who turned &quot;Just Ask&quot; from a concept into reality.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:gap-8">
            {teamMembers.map((member, index) => (
              <div 
                key={member.name} 
                className="group flex flex-col items-center animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="relative mb-4 h-32 w-32 overflow-hidden rounded-full border-4 border-background shadow-xl ring-2 ring-primary/20 transition-all duration-300 group-hover:scale-105 group-hover:ring-primary/50 sm:h-40 sm:w-40">
                  <Image
                    src={member.image}
                    alt={`${member.name} photo`}
                    fill
                    className="object-cover"
                  />
                </div>
                <h3 className="text-lg font-bold text-foreground">{member.name}</h3>
                <p className="text-sm font-medium text-primary/80">{member.role}</p>
              </div>
            ))}
          </div>
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