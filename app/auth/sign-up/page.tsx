'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldLabel, FieldGroup, FieldError } from '@/components/ui/field'
import { Spinner } from '@/components/ui/spinner'
import { MessageCircleQuestion } from 'lucide-react'

export default function SignUpPage() {
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [studentId, setStudentId] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [role, setRole] = useState<'student' | 'professor' | 'admin'>('student')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const EJUST_EMAIL_REGEX = /^[a-zA-Z]+\.[0-9]+@ejust\.edu\.eg$/

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!fullName.trim()) {
      setError('Full Name is required.')
      return
    }

    if (!studentId.trim()) {
      setError('Student ID is required.')
      return
    }

    if (!EJUST_EMAIL_REGEX.test(email)) {
      setError('Only official EJUST university emails are allowed.')
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

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.warn('Supabase env vars missing in client runtime; form submit will still attempt auth.')
    }

    setIsLoading(true)

    const supabase = createClient()
    let data
    let error
    try {
      const result = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          emailRedirectTo: "https://your-site.vercel.app"
        }
      })
      data = result.data
      error = result.error
      console.log('Supabase signUp result', result)
    } catch (err: unknown) {
      console.error('Supabase signUp network error:', err)
      setError(
        err instanceof Error
          ? `Network error while connecting to Supabase: ${err.message}`
          : 'Network error while connecting to Supabase.'
      )
      setIsLoading(false)
      return
    }

    if (error || !data.user) {
      if (error?.status === 429 || error?.message?.toLowerCase().includes('rate limit')) {
        setError('Email rate limit exceeded. Please wait a few minutes or use a different email.')
      } else {
        setError(error?.message ?? 'Unable to create account.')
      }
      setIsLoading(false)
      return
    }

    // Ensure profile is present / updated
    const profileUpdate = await supabase
      .from('profiles')
      .upsert({
        id: data.user.id,
        full_name: fullName,
        email,
      })

    if (profileUpdate.error) {
      console.warn('Profile upsert warning:', profileUpdate.error)
      const profileError = profileUpdate.error.message || 'Unable to save profile details.'
      const help = profileError.includes('Could not find the table')
        ? ' (Hint: create the profiles table using your Supabase SQL schema.)'
        : ''
      // Continue to allow account creation even if profile table isn't set yet.
      console.warn(`Account created, but we could not save profile details: ${profileError}${help}`)
    }

    // Redirect based on role
    if (role === 'professor') {
      router.push('/professor')
    } else if (role === 'admin') {
      router.push('/admin')
    } else {
      router.push('/home')
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <Link href="/" className="mb-8 flex items-center gap-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
          <MessageCircleQuestion className="h-6 w-6 text-primary-foreground" />
        </div>
        <span className="text-2xl font-semibold">Just Ask</span>
      </Link>
      
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Create an account</CardTitle>
          <CardDescription>Join the community and start asking</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldGroup>
                  <Field>
                <FieldLabel htmlFor="fullName">Full Name</FieldLabel>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Ahmed Mohamed"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  autoComplete="name"
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="studentId">Student ID</FieldLabel>
                <Input
                  id="studentId"
                  type="text"
                  placeholder="220102345"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  required
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="role">Role</FieldLabel>
                <select
                  id="role"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
                  value={role}
                  onChange={(e) => setRole(e.target.value as 'student' | 'professor' | 'admin')}
                >
                  <option value="student">Student</option>
                  <option value="professor">Professor</option>
                  <option value="admin">Admin</option>
                </select>
              </Field>
              <Field>
                <FieldLabel htmlFor="email">University Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="ahmed.220102345@ejust.edu.eg"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <Input
                  id="password"
                  type="password"
                  placeholder="Create a strong password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  autoComplete="new-password"
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="confirmPassword">Confirm Password</FieldLabel>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </Field>
              {error && <FieldError>{error}</FieldError>}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? <Spinner className="mr-2" /> : null}
                Create Account
              </Button>
            </FieldGroup>
          </form>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/auth/login" className="font-medium text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
