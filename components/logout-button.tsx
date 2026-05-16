'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LogoutButtonProps {
  showLabel?: boolean
  className?: string
  variant?: 'ghost' | 'outline' | 'default' | 'secondary'
}

export function LogoutButton({ showLabel = false, className, variant = 'ghost' }: LogoutButtonProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  async function handleLogout() {
    setIsLoading(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/auth/login')
    router.refresh()
  }

  return (
    <Button
      variant={variant}
      size={showLabel ? 'sm' : 'icon'}
      className={cn(showLabel && 'gap-2', 'rounded-full', className)}
      onClick={handleLogout}
      disabled={isLoading}
      title="Log out"
    >
      <LogOut className="h-4 w-4" />
      {showLabel && <span>{isLoading ? 'Signing out...' : 'Log out'}</span>}
    </Button>
  )
}
