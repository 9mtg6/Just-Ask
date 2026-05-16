'use client'

import { useEffect, useState } from 'react'
import { formatDistanceToNow } from 'date-fns'

interface RelativeTimeProps {
  date: string | Date
  className?: string
  fallback?: string
}

export function RelativeTime({ date, className, fallback = 'Just now' }: RelativeTimeProps) {
  const [label, setLabel] = useState(fallback)

  useEffect(() => {
    const parsed = typeof date === 'string' ? new Date(date) : date
    if (Number.isNaN(parsed.getTime())) {
      setLabel(fallback)
      return
    }
    setLabel(formatDistanceToNow(parsed, { addSuffix: true }))
  }, [date, fallback])

  return <span className={className}>{label}</span>
}
