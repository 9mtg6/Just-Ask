'use client'

import { Button } from '@/components/ui/button'
import { Share2, Check } from 'lucide-react'
import { useState } from 'react'

interface ShareButtonProps {
  questionId: string
  title?: string
}

export function ShareButton({ questionId, title }: ShareButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleShare = async () => {
    // إنشاء الرابط الخاص بالسؤال
    const url = `${window.location.origin}/questions/${questionId}`

    // التحقق إذا كان المتصفح يدعم خاصية المشاركة الأصلية (مثل الموبايل)
    if (navigator.share) {
      try {
        await navigator.share({
          title: title || 'Check out this question on Just Ask',
          text: 'Can anyone help answer this question on E-JUST Just Ask platform?',
          url: url,
        })
        return
      } catch (err) {
        console.log('Error sharing:', err)
      }
    }

    // إذا لم تكن مدعومة (أو على الكمبيوتر)، انسخ الرابط للحافظة (Clipboard)
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000) // إرجاع الأيقونة بعد ثانيتين
    } catch (err) {
      console.error('Failed to copy', err)
    }
  }

  return (
    <Button 
      variant="ghost" 
      size="sm" 
      onClick={handleShare}
      className={`gap-2 rounded-full transition-all ${copied ? 'text-green-500 bg-green-500/10' : 'text-muted-foreground hover:text-primary hover:bg-primary/10'}`}
    >
      {copied ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
      <span className="text-xs font-medium">{copied ? 'Link Copied!' : 'Share'}</span>
    </Button>
  )
}