"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';

const features = [
  { title: 'Ask anonymously', description: 'Post questions comfortably without pressure.' },
  { title: 'Vote top questions', description: 'Students promote questions professors should answer first.' },
  { title: 'Professor Insights', description: 'Insights on confusing topics and repeated themes.' },
  { title: 'Knowledge base', description: 'Published answers become searchable reference notes.' }
];

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-slate-200 px-6 py-8 md:px-12">
      <main className="mx-auto max-w-5xl">
        <header className="flex flex-wrap items-center justify-between gap-3 pb-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-red-700">EJUST • Just Ask</p>
            <h1 className="mt-3 text-4xl font-bold leading-tight text-slate-900 md:text-5xl">Some questions stay silent in the lecture hall. <span className="text-red-700">Just Ask gives them a voice.</span></h1>
            <p className="mt-4 max-w-2xl text-slate-600">A modern Japanese-inspired academic platform for anonymous student questions, professor responses, and learning insights.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link className="rounded-xl bg-red-700 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-red-700/25 transition hover:-translate-y-0.5 hover:bg-red-800" href="/login">Start Asking</Link>
              <Link className="rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-red-700 hover:text-red-700" href="/signup">Create account</Link>
            </div>
          </div>
          <div className="rounded-3xl bg-white p-4 shadow-soft dark:bg-slate-900 md:p-6">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-red-600">Live Questions</div>
            <div className="mt-3 space-y-2 text-sm text-slate-700 dark:text-slate-200">
              <div className="rounded-xl border border-slate-200 p-3 dark:border-slate-700">Programming • 12 votes • <span className="font-semibold">How to optimize loops?</span></div>
              <div className="rounded-xl border border-slate-200 p-3 dark:border-slate-700">Physics • 9 votes • <span className="font-semibold">Explain quantum tunneling?</span></div>
              <div className="rounded-xl border border-slate-200 p-3 dark:border-slate-700">Math • 7 votes • <span className="font-semibold">How to avoid common integration mistakes?</span></div>
            </div>
          </div>
        </header>

        <section className="mt-10 grid gap-4 md:grid-cols-2">
          {features.map((feature, idx) => (
            <motion.article key={feature.title} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.07 }} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
              <div className="text-xs uppercase tracking-[0.2em] text-red-700">Feature</div>
              <h3 className="mt-2 text-xl font-semibold text-slate-900 dark:text-slate-100">{feature.title}</h3>
              <p className="mt-1 text-slate-600 dark:text-slate-300">{feature.description}</p>
            </motion.article>
          ))}
        </section>

        <section className="mt-12 rounded-3xl bg-gradient-to-r from-red-50 via-white to-slate-50 p-6 dark:from-slate-800 dark:via-slate-900 dark:to-slate-950">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-red-700">How it works</p>
              <h2 className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">From quiet question to classroom learning</h2>
              <p className="mt-2 text-slate-600 dark:text-slate-300">Students ask anonymously, classmates vote, professors answer publicly, and the knowledge base keeps expanding.</p>
            </div>
            <Link href="/signup" className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">Join EJUST Now</Link>
          </div>
        </section>
      </main>
    </div>
  );
}
