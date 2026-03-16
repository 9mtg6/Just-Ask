"use client";

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

const emailRegex = /^[a-zA-Z]+\.[0-9]+@ejust\.edu\.eg$/;

export default function SignUpPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [studentId, setStudentId] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !studentId.trim()) {
      setError('Please complete all fields.');
      return;
    }
    if (!emailRegex.test(email)) {
      setError('Only official EJUST university emails are allowed.');
      return;
    }
    if (password.length < 6 || password !== confirm) {
      setError('Password must match and be at least 6 chars.');
      return;
    }
    setError('');
    alert('Signup completed (mock).');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-slate-100 to-slate-200 p-4 md:p-10">
      <motion.main initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mx-auto w-full max-w-md rounded-3xl bg-white p-6 shadow-soft dark:bg-slate-900">
        <p className="text-xs uppercase tracking-[0.2em] text-red-700">Create student account</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">Join Just Ask</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Use your EJUST email to access lecture Q&A.</p>

        <form onSubmit={onSubmit} className="mt-6 space-y-3">
          <div><label className="block text-sm font-medium text-slate-700">Full Name</label><input value={fullName} onChange={(e) => setFullName(e.target.value)} required className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-red-500/30" placeholder="Ahmed Gamal" /></div>
          <div><label className="block text-sm font-medium text-slate-700">University Email</label><input value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-red-500/30" placeholder="ahmed.220102345@ejust.edu.eg" /></div>
          <div><label className="block text-sm font-medium text-slate-700">Student ID</label><input value={studentId} onChange={(e) => setStudentId(e.target.value)} required className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-red-500/30" placeholder="220102345" /></div>
          <div><label className="block text-sm font-medium text-slate-700">Password</label><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-red-500/30" /></div>
          <div><label className="block text-sm font-medium text-slate-700">Confirm Password</label><input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-red-500/30" /></div>
          {error && <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
          <button type="submit" className="w-full rounded-xl bg-red-700 px-3 py-2 text-white transition hover:bg-red-800">Create account</button>
        </form>

        <p className="mt-4 text-center text-sm text-slate-600 dark:text-slate-300">Already have an account? <Link className="font-semibold text-red-700 hover:underline" href="/login">Login</Link></p>
      </motion.main>
    </div>
  );
}
