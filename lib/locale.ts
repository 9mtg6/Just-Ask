import { cookies } from 'next/headers'
import { dictionaries } from './dictionary'

export async function getLocale() {
  const cookieStore = await cookies()
  const locale = cookieStore.get('locale')?.value || 'en'
  return locale as 'en' | 'ar'
}

export async function getDictionary() {
  const locale = await getLocale()
  return dictionaries[locale]
}