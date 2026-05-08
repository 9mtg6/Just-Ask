'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldLabel, FieldGroup, FieldError } from '@/components/ui/field'
import { Spinner } from '@/components/ui/spinner'
import { toast } from 'sonner'

export default function SignUpPage() {
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [studentId, setStudentId] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // التعديل هنا: السماح بإيميلات الجامعة فقط للطلاب
  const EJUST_EMAIL_REGEX = /^[a-zA-Z]+\.[0-9]+@ejust\.edu\.eg$/

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!fullName.trim() || !studentId.trim()) {
      setError('Full Name and Student ID are required.')
      return
    }

    if (!EJUST_EMAIL_REGEX.test(email)) {
      setError('Only official EJUST university emails are allowed (e.g., name.id@ejust.edu.eg).')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setIsLoading(true)
    const supabase = createClient()

    // 1. إنشاء الحساب في نظام الـ Auth الخاص بـ Supabase
    // سيتم إعطاء صلاحية 'student' بشكل افتراضي داخل بيانات المستخدم
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          student_id: studentId,
          role: 'student' // إجبار جميع الحسابات الجديدة لتكون طلاب
        }
      }
    })

    if (signUpError || !data.user) {
      setError(signUpError?.message || 'Unable to create account. Email might already exist.')
      setIsLoading(false)
      return
    }

    // 2. إنشاء ملف تعريفي (Profile) للمستخدم في جدول الـ profiles
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: data.user.id,
        full_name: fullName,
        email: email,
      })

    if (profileError) {
      console.warn('Could not create profile details, but account was created.')
    }

    toast.success('Account created successfully! Welcome to Just Ask.')
    router.push('/home')
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12 relative bg-background">
      {/* خلفية زجاجية أنيقة */}
      <div className="fixed inset-0 -z-10 bg-[url('/bg-ejust.jpg')] bg-cover bg-center opacity-10 blur-sm" />

      <div className="w-full max-w-md">
        <Link href="/" className="mb-8 flex flex-col items-center justify-center gap-3 transition-transform hover:scale-105">
          <div className="relative h-16 w-16 overflow-hidden rounded-2xl shadow-lg">
            <Image src="/logo.png" alt="Just Ask Logo" fill className="object-cover" priority />
          </div>
          <span className="text-2xl font-bold tracking-tight">Just Ask E-JUST</span>
        </Link>
        
        <Card className="border-white/10 bg-card/80 backdrop-blur-xl shadow-2xl">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl font-bold">Student Sign Up</CardTitle>
            <CardDescription className="text-muted-foreground font-medium">
              Join the official E-JUST Q&A community.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <FieldGroup>
                
                <Field>
                  <FieldLabel htmlFor="fullName" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Full Name</FieldLabel>
                  <Input id="fullName" placeholder="Ahmed Mohamed" value={fullName} onChange={(e) => setFullName(e.target.value)} required className="bg-background/50" />
                </Field>
                
                <Field>
                  <FieldLabel htmlFor="studentId" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Student ID</FieldLabel>
                  <Input id="studentId" placeholder="220102345" value={studentId} onChange={(e) => setStudentId(e.target.value)} required className="bg-background/50" />
                </Field>
                
                <Field>
                  <FieldLabel htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">University Email</FieldLabel>
                  <Input id="email" type="email" placeholder="ahmed.220102345@ejust.edu.eg" value={email} onChange={(e) => setEmail(e.target.value)} required className="bg-background/50" />
                </Field>

                <div className="grid grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Password</FieldLabel>
                    <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} className="bg-background/50" />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="confirmPassword" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Confirm</FieldLabel>
                    <Input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required minLength={6} className="bg-background/50" />
                  </Field>
                </div>

                {error && <FieldError className="bg-destructive/10 text-destructive p-3 rounded-lg text-sm font-medium border border-destructive/20">{error}</FieldError>}
                
                <Button type="submit" className="w-full mt-4 h-12 text-lg font-bold shadow-lg" disabled={isLoading}>
                  {isLoading ? <Spinner className="mr-2" /> : null} Create Account
                </Button>
                
              </FieldGroup>
            </form>
            
            <p className="mt-6 text-center text-sm font-medium text-muted-foreground">
              Already have an account?{' '}
              <Link href="/auth/login" className="text-primary hover:underline font-bold">Sign in</Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}