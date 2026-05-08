'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { setLanguage } from '@/app/actions/language'
import { Languages } from 'lucide-react'

export function LanguageToggle({ currentLang }: { currentLang: 'en' | 'ar' }) {
  const router = useRouter()

  const toggle = async () => {
    const newLang = currentLang === 'en' ? 'ar' : 'en'
    await setLanguage(newLang)
    router.refresh() // يقوم بتحديث الصفحة لتطبيق اللغة الجديدة
  }

  return (
    <Button variant="ghost" size="icon" onClick={toggle} className="rounded-full">
      <Languages className="h-5 w-5" />
      <span className="sr-only">تغيير اللغة</span>
    </Button>
  )
}