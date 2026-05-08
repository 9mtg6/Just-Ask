import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'
<<<<<<< HEAD
import { UserCircle, PlusCircle } from 'lucide-react'

export function AppHeader({ user }: { user: any }) {
=======
import { LanguageToggle } from '@/components/language-toggle' // استيراد الزرار
import { getLocale, getDictionary } from '@/lib/locale'
import { UserCircle, PlusCircle } from 'lucide-react'

export async function AppHeader({ user }: { user: any }) {
  const locale = await getLocale()
  const dict = await getDictionary()

>>>>>>> parent of 2d0974c (^_^)
  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-background/60 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/home" className="flex items-center gap-2">
            <span className="text-xl font-bold text-primary">Just Ask</span>
          </Link>
        </div>

        <div className="flex items-center gap-2">
<<<<<<< HEAD
=======
          {/* إضافة زر تغيير اللغة هنا */}
          <LanguageToggle currentLang={locale} />
          
>>>>>>> parent of 2d0974c (^_^)
          <ThemeToggle />
          
          {user ? (
            <>
              <Link href="/ask">
                <Button variant="default" size="sm" className="hidden sm:flex gap-2 rounded-full">
                  <PlusCircle className="h-4 w-4" />
                  Ask Question
                </Button>
              </Link>
              <Link href="/profile">
                <Button variant="ghost" size="icon" className="rounded-full">
                  <UserCircle className="h-6 w-6" />
                </Button>
              </Link>
            </>
          ) : (
            <Link href="/auth/login">
              <Button size="sm">Login</Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}