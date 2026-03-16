"use client";

import { sampleQuestions } from '../data/questions';

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-8">
      <div className="mx-auto max-w-5xl space-y-3">
        <div className="rounded-2xl bg-white p-4 shadow-sm dark:bg-slate-900">
          <p className="text-xs uppercase tracking-[0.2em] text-red-700">Admin console</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">Platform overview</h1>
          <p className="text-slate-600 dark:text-slate-300">Monitor activity, approve important answers, and support quality.</p>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-slate-900">Total users <p className="mt-1 text-xl font-semibold text-slate-900 dark:text-white">1,294</p></div>
          <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-slate-900">Questions <p className="mt-1 text-xl font-semibold text-slate-900 dark:text-white">3,812</p></div>
          <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-slate-900">Pending answers <p className="mt-1 text-xl font-semibold text-slate-900 dark:text-white">73</p></div>
        </div>

        <section className="rounded-2xl bg-white p-4 shadow-sm dark:bg-slate-900">
          <h2 className="font-semibold text-slate-900 dark:text-white">Recent activity</h2>
          <ul className="mt-3 space-y-2">
            {sampleQuestions.map((q) => (
              <li key={q.id} className="rounded-xl border border-slate-200 p-2 dark:border-slate-700"><span className="font-semibold text-slate-900 dark:text-white">{q.course}</span>: {q.text} <span className="text-xs text-slate-500">({q.status})</span></li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
