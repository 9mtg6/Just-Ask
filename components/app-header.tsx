'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
// تم دمج الاستيرادات لمنع التكرار وإضافة الجرس (Bell)
import { Bell, Plus, User, LogOut, Sparkles, Shield } from 'lucide-react'
import type { User as SupabaseUser } from '@supabase/supabase-js'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { NotificationBell } from '@/components/notification-bell'

interface AppHeaderProps {
  user: SupabaseUser | null
}

export function AppHeader({ user }: AppHeaderProps) {
  const router = useRouter()

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const displayName = user?.user_metadata?.display_name || user?.user_metadata?.full_name || 'Student'
  const initials = displayName.slice(0, 2).toUpperCase()
  const role = user?.user_metadata?.role || 'student'

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-background/60 backdrop-blur-xl transition-all supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        <Link href="/home" className="flex items-center gap-3 transition-transform hover:scale-105">
          <div className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl shadow-sm">
            <Image 
              src="/logo.png" 
              alt="Just Ask Logo" 
              fill
              className="object-cover"
              sizes="40px"
              priority
            />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold tracking-tight text-foreground">Just Ask</span>
            <span className="text-[10px] font-medium tracking-wider text-muted-foreground uppercase">E-JUST Community</span>
          </div>
        </Link>

        <div className="flex items-center gap-3 sm:gap-4">
          <ThemeToggle />
          
          {user ? (
            <>
              <NotificationBell userId={user.id} />

              {role === 'student' && (
                <Link href="/ask">
                  <Button size="sm" className="hidden gap-2 rounded-full sm:flex shadow-sm hover:shadow-primary/25 transition-all">
                    <Plus className="h-4 w-4" />
                    <span>Ask Question</span>
                  </Button>
                </Link>
              )}
              {role === 'professor' && (
                <Link href="/professor">
                  <Button size="sm" variant="secondary" className="hidden gap-2 rounded-full sm:flex">
                    <Sparkles className="h-4 w-4" />
                    <span>Professor Panel</span>
                  </Button>
                </Link>
              )}
              {role === 'admin' && (
                <Link href="/admin">
                  <Button size="sm" variant="destructive" className="hidden gap-2 rounded-full sm:flex">
                    <Shield className="h-4 w-4" />
                    <span>Admin</span>
                  </Button>
                </Link>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-full ring-2 ring-transparent transition-all hover:ring-primary/50">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={user.user_metadata?.avatar_url} />
                      <AvatarFallback className="bg-secondary text-secondary-foreground font-semibold">{initials}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 rounded-xl p-2">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{displayName}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  
                  <DropdownMenuItem asChild className="sm:hidden cursor-pointer">
                    <Link href="/ask" className="flex items-center gap-2 text-primary">
                      <Plus className="h-4 w-4" />
                      Ask Question
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link href="/profile" className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Profile Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-destructive cursor-pointer focus:bg-destructive/10">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Link href="/auth/login">
              <Button size="sm" className="rounded-full px-6 font-medium shadow-sm transition-all hover:shadow-primary/25 hover:-translate-y-0.5">
                Sign In
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}