'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { toast } from 'sonner'
import { KeyRound } from 'lucide-react'

export default function VerifyRolePage() {
  const [code, setCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    
    // الأكواد السرية (في بيئة العمل الحقيقية توضع في .env، لكن للتجربة سنكتبها هنا)
    const ADMIN_SECRET = 'EJUST_ADMIN_2026'
    const PROF_SECRET = 'EJUST_PROF_2026'

    let newRole = 'student'
    if (code === ADMIN_SECRET) newRole = 'admin'
    else if (code === PROF_SECRET) newRole = 'professor'
    else {
      toast.error('Invalid access code!')
      setIsLoading(false)
      return
    }

    const supabase = createClient()
    
    // تحديث بيانات المستخدم في Supabase (Role)
    const { error } = await supabase.auth.updateUser({
      data: { role: newRole }
    })

    if (error) {
      toast.error(error.message)
    } else {
      toast.success(`Account successfully upgraded to ${newRole.toUpperCase()}!`)
      router.push(newRole === 'admin' ? '/admin' : '/professor')
      router.refresh()
    }
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative px-4">
      <div className="fixed inset-0 -z-10 bg-[url('/bg-ejust.jpg')] bg-cover bg-center opacity-20 blur-sm" />
      
      <Card className="w-full max-w-md border-white/10 bg-card/80 backdrop-blur-xl shadow-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/20 text-primary">
            <KeyRound className="h-6 w-6" />
          </div>
          <CardTitle>Role Verification</CardTitle>
          <CardDescription>Enter the secret code provided by the university IT to upgrade your account access.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleVerify} className="space-y-4">
            <Input 
              type="password" 
              placeholder="Enter Access Code" 
              value={code} 
              onChange={(e) => setCode(e.target.value)}
              required
              className="text-center tracking-widest"
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Verifying...' : 'Verify & Upgrade'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}