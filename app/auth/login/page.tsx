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

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    const EJUST_EMAIL_REGEX = /^[a-zA-Z]+\.[0-9]+@ejust\.edu\.eg$/
    if (!EJUST_EMAIL_REGEX.test(email)) {
      setError('Only official EJUST university emails are allowed.')
      setIsLoading(false)
      return
    }

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.warn('Supabase env vars missing in client runtime; still attempting sign in.')
    }

    const supabase = createClient()
    let data
    let error
    try {
      const result = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      data = result.data
      error = result.error
      console.log('Supabase signIn result', result)
    } catch (err: unknown) {
      console.error('Supabase signIn network error:', err)
      setError(
        err instanceof Error
          ? `Network error while connecting to Supabase: ${err.message}`
          : 'Network error while connecting to Supabase.'
      )
      setIsLoading(false)
      return
    }

    if (error) {
      setError(error.message)
      setIsLoading(false)
      return
    }

    const user = data.user
    const role = user?.user_metadata?.role || 'student'
    if (role === 'professor') {
      router.push('/professor')
    } else if (role === 'admin') {
      router.push('/admin')
    } else {
      router.push('/home')
    }

    router.refresh()
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
          <CardTitle className="text-2xl">Welcome back</CardTitle>
          <CardDescription>Sign in to your account to continue</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
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
                  placeholder="Your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
              </Field>
              {error && <FieldError>{error}</FieldError>}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? <Spinner className="mr-2" /> : null}
                Sign In
              </Button>
            </FieldGroup>
          </form>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            {"Don't have an account? "}
            <Link href="/auth/sign-up" className="font-medium text-primary hover:underline">
              Sign up
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
