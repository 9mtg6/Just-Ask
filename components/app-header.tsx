'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'
import { UserCircle, PlusCircle } from 'lucide-react'

export function AppHeader({ user }: { user: any }) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-background/60 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/home" className="flex items-center gap-2">
            <span className="text-xl font-bold text-primary">Just Ask</span>
          </Link>
        </div>

        <div className="flex items-center gap-2">
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