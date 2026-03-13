import { useState, type FormEvent } from 'react';
import { api } from '../api';
import type { User } from '../types';

interface AuthScreenProps {
  onAuth: (user: User) => void;
}

export default function AuthScreen({ onAuth }: AuthScreenProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setErr('');
    try {
      const data = await api<{ token: string; user: User }>(`/api/auth/${mode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      localStorage.setItem('weave_token', data.token);
      onAuth(data.user);
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : 'Failed');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-violet-950 to-slate-950 flex items-center justify-center p-6">
      <form onSubmit={submit} className="bg-slate-900/80 backdrop-blur-xl border border-violet-500/20 rounded-2xl p-8 w-full max-w-md text-white shadow-2xl shadow-violet-900/30">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center font-bold text-lg">CW</div>
          <div>
            <h1 className="text-xl font-bold">ContentWeave</h1>
            <p className="text-violet-300/60 text-xs">Headless CMS admin</p>
          </div>
        </div>
        {err && <p className="text-rose-400 text-sm mb-3 bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2">{err}</p>}
        <input
          className="w-full bg-slate-800/80 border border-slate-700 rounded-lg px-3 py-2.5 mb-3 text-sm focus:border-violet-500 focus:outline-none"
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="w-full bg-slate-800/80 border border-slate-700 rounded-lg px-3 py-2.5 mb-4 text-sm focus:border-violet-500 focus:outline-none"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit" className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-lg py-2.5 font-medium hover:opacity-90 transition">
          {mode === 'login' ? 'Sign in' : 'Register (first user = admin)'}
        </button>
        <button type="button" className="w-full mt-3 text-sm text-violet-300/80 hover:text-white" onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>
          {mode === 'login' ? 'Need an account? Register' : 'Already have an account? Sign in'}
        </button>
      </form>
    </div>
  );
}
