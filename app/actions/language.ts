'use server'

import { cookies } from 'next/headers'

export async function setLanguage(lang: 'en' | 'ar') {
  const cookieStore = await cookies()
  cookieStore.set('locale', lang, { 
    path: '/',
    maxAge: 60 * 60 * 24 * 365 // سنة واحدة
  })
}