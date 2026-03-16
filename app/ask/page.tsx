"use client";

import { FormEvent, useState } from 'react';
import Link from 'next/link';

export default function AskPage() {
  const [course, setCourse] = useState('Programming');
  const [professor, setProfessor] = useState('Dr. Hatem');
  const [question, setQuestion] = useState('');
  const [anonymous, setAnonymous] = useState(true);
  const [message, setMessage] = useState('');

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!question.trim()) {
      setMessage('Please type your question.');
      return;
    }
    setMessage('Question posted successfully (mock).');
  };

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-8">
      <div className="mx-auto max-w-3xl rounded-3xl bg-white p-5 shadow-sm dark:bg-slate-900">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Ask a question</h1>
            <p className="text-sm text-slate-600 dark:text-slate-300">Safety first: you can post anonymously.</p>
          </div>
          <Link href="/student" className="text-sm text-red-700 hover:underline">Back to dashboard</Link>
        </div>

        <form onSubmit={onSubmit} className="space-y-3">
          <label className="block text-sm font-medium text-slate-700">Course Name</label>
          <input value={course} onChange={(e) => setCourse(e.target.value)} className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-red-500/30" />

          <label className="block text-sm font-medium text-slate-700">Professor Name</label>
          <input value={professor} onChange={(e) => setProfessor(e.target.value)} className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-red-500/30" />

          <label className="block text-sm font-medium text-slate-700">Question</label>
          <textarea value={question} onChange={(e) => setQuestion(e.target.value)} rows={4} className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-red-500/30" placeholder="Type your question..." />

          <div className="flex items-center gap-2">
            <input id="anon" checked={anonymous} onChange={(e) => setAnonymous(e.target.checked)} type="checkbox" className="h-4 w-4 rounded border-slate-300 text-red-700 focus:ring-red-500" />
            <label htmlFor="anon" className="text-sm text-slate-700">Post anonymously</label>
          </div>
          {message && <div className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">{message}</div>}
          <button type="submit" className="rounded-xl bg-red-700 px-4 py-2 text-white hover:bg-red-800">Submit question</button>
        </form>
      </div>
    </div>
  );
}
