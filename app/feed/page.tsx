"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';
import { sampleQuestions } from '../data/questions';

export default function FeedPage() {
  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-8">
      <div className="mx-auto max-w-5xl space-y-3">
        <div className="flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm dark:bg-slate-900">
          <div>
            <p className="text-xs uppercase text-red-700">Question feed</p>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Latest student questions</h1>
          </div>
          <Link href="/ask" className="rounded-xl bg-red-700 px-3 py-2 text-white">Ask question</Link>
        </div>

        <div className="grid gap-3">
          {sampleQuestions.map((q, idx) => (
            <motion.article key={q.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
              <div className="flex items-center justify-between text-xs text-slate-500"><span>{q.course}</span><span>{q.posted}</span></div>
              <Link href={`/question/${q.id}`} className="mt-2 block text-lg font-semibold text-slate-900 dark:text-white hover:text-red-700">{q.text}</Link>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500"><span>Professor {q.professor}</span><span>{q.votes} votes</span><span className="rounded-full bg-red-100 px-2 py-0.5 text-red-700">{q.status}</span></div>
            </motion.article>
          ))}
        </div>
      </div>
    </div>
  );
}
