"use client";

import Link from 'next/link';

export default function TopNav() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/90 backdrop-blur dark:border-slate-700 dark:bg-slate-950/80">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="font-semibold text-lg text-red-700">Just Ask</Link>
        <nav className="flex gap-2 text-sm text-slate-700 dark:text-slate-200">
          <Link href="/login" className="rounded-md px-3 py-1 hover:bg-slate-100 dark:hover:bg-slate-800">Login</Link>
          <Link href="/signup" className="rounded-md px-3 py-1 hover:bg-slate-100 dark:hover:bg-slate-800">Sign Up</Link>
        </nav>
      </div>
    </header>
  );
}
