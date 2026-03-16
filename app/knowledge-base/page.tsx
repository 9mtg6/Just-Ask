"use client";

import Link from 'next/link';
import { sampleQuestions } from '../data/questions';

export default function KnowledgeBasePage() {
  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-8">
      <div className="mx-auto max-w-5xl space-y-4">
        <div className="rounded-2xl bg-white p-4 shadow-sm dark:bg-slate-900">
          <div className="flex items-center justify-between"><div><p className="text-xs uppercase text-red-700">Knowledge Base</p><h1 className="text-2xl font-bold text-slate-900 dark:text-white">Search past answers</h1></div><Link href="/professor" className="text-sm text-red-700 hover:underline">Back to insights</Link></div>
        </div>
        <div className="rounded-2xl bg-white p-4 shadow-sm dark:bg-slate-900">
          {sampleQuestions.filter((q) => q.answer).map((q) => (
            <article key={q.id} className="mb-3 rounded-xl border border-slate-200 p-3 dark:border-slate-700">
              <div className="text-xs uppercase tracking-[0.2em] text-slate-500">{q.course}</div>
              <h2 className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">{q.text}</h2>
              <p className="mt-1 text-slate-600 dark:text-slate-300">{q.answer}</p>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
