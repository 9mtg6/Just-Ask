import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Just Ask | Academic Q&A Platform',
  description: 'Modern anonymous academic Q&A platform for EJUST students and professors.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">{children}</body>
    </html>
  );
}
