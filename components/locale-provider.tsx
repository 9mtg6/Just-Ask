'use client'

import { createContext, useContext } from 'react'

const LocaleContext = createContext<'en' | 'ar'>('en')

export function LocaleProvider({ children, locale }: { children: React.ReactNode, locale: 'en' | 'ar' }) {
  return <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>
}

export const useLocale = () => useContext(LocaleContext)