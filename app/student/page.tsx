"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';
import { sampleQuestions } from '../data/questions';

export default function StudentDashboard() {
  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 p-4 md:p-8">
      <div className="mx-auto max-w-5xl space-y-4">
        <div className="rounded-2xl bg-white p-4 shadow-md dark:bg-slate-900">
          <div className="flex justify-between items-start gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-red-700">Student</p>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Your dashboard</h1>
              <p className="text-slate-600 dark:text-slate-300">See trending questions, recent answers, and quick actions.</p>
            </div>
            <Link href="/ask" className="rounded-xl bg-red-700 px-3 py-2 text-white">Ask question</Link>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-slate-900"><p className="text-xs uppercase text-slate-500">Top Votes</p><p className="mt-1 text-2xl font-bold text-red-700">24</p></div>
          <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-slate-900"><p className="text-xs uppercase text-slate-500">Unanswered</p><p className="mt-1 text-2xl font-bold text-slate-800 dark:text-white">2</p></div>
          <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-slate-900"><p className="text-xs uppercase text-slate-500">Saved</p><p className="mt-1 text-2xl font-bold text-slate-800 dark:text-white">1</p></div>
        </div>

        <section className="rounded-2xl bg-white p-4 shadow-sm dark:bg-slate-900">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="font-semibold text-slate-900 dark:text-white">Trending Questions</h2>
            <Link href="/feed" className="text-sm text-red-700 hover:underline">View full feed</Link>
          </div>
          <div className="space-y-2">
            {sampleQuestions.map((q, idx) => (
              <motion.article key={q.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }} className="rounded-xl border border-slate-200 p-3 dark:border-slate-700">
                <div className="flex items-start justify-between gap-3 text-sm text-slate-500"><span>{q.course}</span><span className="rounded-full bg-red-100 px-2 py-0.5 text-red-700">{q.status}</span></div>
                <Link href={`/question/${q.id}`} className="mt-1 block text-base font-semibold text-slate-900 dark:text-white hover:text-red-700">{q.text}</Link>
                <div className="mt-1 flex items-center justify-between text-xs text-slate-500"><span>Professor {q.professor}</span><span>{q.votes} votes</span></div>
              </motion.article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
