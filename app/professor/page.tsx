"use client";

import Link from 'next/link';
import { sampleQuestions } from '../data/questions';

export default function ProfessorPage() {
  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-8">
      <div className="mx-auto max-w-5xl space-y-4">
        <div className="rounded-2xl bg-white p-4 shadow-sm dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-red-700">Professor Insights</p>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Your teaching dashboard</h1>
            </div>
            <Link href="/knowledge-base" className="text-sm text-red-700 hover:underline">Knowledge base</Link>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-slate-900"><p className="text-xs uppercase text-slate-500">Most asked topic</p><p className="mt-1 text-xl font-semibold text-slate-900 dark:text-white">Optimization</p></div>
          <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-slate-900"><p className="text-xs uppercase text-slate-500">Confusing concept</p><p className="mt-1 text-xl font-semibold text-slate-900 dark:text-white">Quantum tunneling</p></div>
          <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-slate-900"><p className="text-xs uppercase text-slate-500">Repeat concern</p><p className="mt-1 text-xl font-semibold text-slate-900 dark:text-white">Math fundamentals</p></div>
        </div>

        <section className="rounded-2xl bg-white p-4 shadow-sm dark:bg-slate-900">
          <h2 className="font-semibold text-slate-900 dark:text-white">Recent student questions</h2>
          <div className="mt-2 space-y-2">
            {sampleQuestions.map((q) => (
              <div key={q.id} className="rounded-xl border border-slate-200 p-3 dark:border-slate-700">
                <div className="flex items-start justify-between gap-2 text-sm text-slate-600 dark:text-slate-300"><span>{q.course}</span><span className="rounded-full bg-red-100 px-2 py-0.5 text-red-700">{q.status}</span></div>
                <p className="mt-1 text-base font-semibold text-slate-900 dark:text-white">{q.text}</p>
                <div className="mt-1 text-xs text-slate-500">{q.votes} votes • Posted {q.posted}</div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
