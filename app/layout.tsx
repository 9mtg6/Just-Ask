import type { Metadata, Viewport } from 'next'
import { Inter, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'

// تفعيل خط Inter ليكون الخط الأساسي للموقع
const inter = Inter({ subsets: ["latin"] });
const geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'Just Ask | E-JUST Community',
  description: 'A dedicated platform for E-JUST university students to ask questions, share knowledge, and connect with their community.',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} font-sans antialiased relative min-h-screen`}>
        
        {/* طبقة الصورة الخلفية (ثابتة لا تتحرك مع السكرول) */}
        <div className="fixed inset-0 -z-20 bg-[url('/bg-ejust.jpg')] bg-cover bg-center bg-no-repeat bg-fixed" />
        
        {/* طبقة التعتيم (Overlay) الزجاجية - تتكيف مع الوضع المظلم والفاتح */}
        <div className="fixed inset-0 -z-10 bg-background/85 backdrop-blur-[3px]" />

        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {/* محتوى الموقع الأساسي */}
          <div className="relative z-0 flex min-h-screen flex-col">
            {children}
          </div>
          <Toaster />
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}