import type { Metadata, Viewport } from 'next'
import { Inter, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'

const inter = Inter({ subsets: ["latin"] });
const geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'Just Ask | E-JUST Community',
  description: 'A dedicated platform for E-JUST university students to ask questions.',
  generator: 'v0.app',
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
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <body className={`${inter.className} font-sans antialiased relative min-h-screen`}>
        
        <div className="fixed inset-0 -z-20 bg-[url('/bg-ejust.jpg')] bg-cover bg-center bg-no-repeat bg-fixed" />
        <div className="fixed inset-0 -z-10 bg-background/85 backdrop-blur-[3px]" />

        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
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