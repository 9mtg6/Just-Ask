"use client";

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { sampleQuestions } from '../../data/questions';

export default function QuestionDetail() {
  const params = useParams();
  const id = params?.id as string;
  const question = sampleQuestions.find((q) => q.id === id);

  if (!question) {
    return (
      <div className="min-h-screen bg-slate-100 p-4"><div className="mx-auto max-w-2xl rounded-xl bg-white p-5 shadow-sm">Question not found.</div></div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-8">
      <div className="mx-auto max-w-3xl space-y-3">
        <div className="rounded-2xl bg-white p-4 shadow-sm dark:bg-slate-900">
          <div className="flex items-center justify-between"><div><p className="text-xs uppercase tracking-[0.2em] text-red-700">Question details</p><h1 className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{question.course}</h1></div><Link href="/feed" className="text-sm text-red-700">Back to feed</Link></div>
          <p className="mt-2 text-slate-600 dark:text-slate-300">{question.text}</p>
          <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500"><span>Professor {question.professor}</span><span>{question.votes} votes</span><span className="rounded-full bg-red-100 px-2 py-0.5 text-red-700">{question.status}</span></div>
        </div>

        <div className="rounded-2xl bg-white p-4 shadow-sm dark:bg-slate-900">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Professor response</h2>
          {question.answer ? <p className="mt-2 text-slate-600 dark:text-slate-300">{question.answer}</p> : <div className="mt-2 rounded-xl border border-dashed border-slate-300 p-4 text-slate-500">This question has not been answered yet.</div>}
        </div>
      </div>
    </div>
  );
}
