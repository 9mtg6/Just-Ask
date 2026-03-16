"use client";

import Link from 'next/link';

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-8">
      <div className="mx-auto max-w-3xl rounded-3xl bg-white p-5 shadow-sm dark:bg-slate-900">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-red-700">Profile</p>
            <h1 className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">Your student profile</h1>
            <p className="text-slate-600 dark:text-slate-300">Manage your account details and activity.</p>
          </div>
          <Link href="/student" className="text-sm text-red-700">Back to dashboard</Link>
        </div>
        <div className="mt-4 grid gap-2 text-slate-700 dark:text-slate-200">
          <div className="rounded-xl border border-slate-200 p-3 dark:border-slate-700"><span className="text-xs uppercase text-slate-500">Name</span><p className="font-semibold">Ahmed Gamal</p></div>
          <div className="rounded-xl border border-slate-200 p-3 dark:border-slate-700"><span className="text-xs uppercase text-slate-500">Email</span><p className="font-semibold">ahmed.220102345@ejust.edu.eg</p></div>
          <div className="rounded-xl border border-slate-200 p-3 dark:border-slate-700"><span className="text-xs uppercase text-slate-500">Role</span><p className="font-semibold">Student</p></div>
        </div>
      </div>
    </div>
  );
}
