import React, { useState } from 'react';
import { 
  ShieldCheck, 
  GraduationCap, 
  UserCheck, 
  Mail, 
  Lock, 
  User, 
  Building, 
  KeyRound, 
  Sparkles,
  X,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { UserAccount, UserRole } from '../types';
import { loginWithSupabase, registerStudentWithSupabase, syncStudentToSupabase } from '../lib/supabase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserAccount | null;
  onLogin: (user: UserAccount) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLogin,
}) => {
  const [role, setRole] = useState<UserRole>('student');
  const [credential, setCredential] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Step 1: Attempt Supabase Auth login for Login mode if credential is an email
      if (credential.includes('@')) {
        const sbRes = await loginWithSupabase(credential, password, role);
        if (sbRes.user) {
          fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: credential, password, role })
          }).catch(() => {});

          onLogin(sbRes.user as UserAccount);
          onClose();
          setLoading(false);
          return;
        } else if (sbRes.error && !sbRes.error.includes('Invalid API key')) {
          setError(sbRes.error);
          setLoading(false);
          return;
        }
      }

      // Step 2: Main Backend server API Authentication
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: credential, credential, password, role })
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        setError(data.error || 'Authentication failed. Please check your Roll No / Email and password.');
      } else if (data.user) {
        if (data.user.role === 'student') {
          syncStudentToSupabase({
            id: data.user.id,
            name: data.user.name,
            email: data.user.email,
            role: data.user.role,
            student_id: data.user.studentId,
            department: data.user.department
          });
        }
        onLogin(data.user);
        onClose();
      }
    } catch (err: any) {
      setError('Authentication connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen && currentUser) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-150">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 text-white relative">
          {currentUser && (
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 p-1 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-xs flex items-center justify-center font-bold text-white">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold tracking-wider uppercase text-blue-100">
              Lab Portal Sign In
            </span>
          </div>
          <h2 className="text-xl font-extrabold text-white">
            DBMS Lab Portal Authentication
          </h2>
          <p className="text-xs text-blue-100 mt-1">
            Access Student Dashboard or Faculty Admin Portal
          </p>
        </div>

        {/* Auth Body */}
        <div className="p-6 space-y-4">
          {/* Role selector */}
          <div className="flex p-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold">
            <button
              type="button"
              onClick={() => {
                setRole('student');
                setError('');
              }}
              className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 cursor-pointer transition-all ${
                role === 'student'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>Student Sign In</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setRole('admin');
                setError('');
              }}
              className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 cursor-pointer transition-all ${
                role === 'admin'
                  ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Admin / Teacher</span>
            </button>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400">
            {role === 'student' ? (
              <span>🔒 <strong>Notice:</strong> Student accounts are created by the Admin in the Admin Portal. Enter the Roll No / Email and password provided by your teacher.</span>
            ) : (
              <span>🔒 <strong>Faculty Admin Access:</strong> Restricted to pre-authorized faculty email addresses.</span>
            )}
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                {role === 'admin' ? 'Faculty Admin Email Address' : 'Roll No / Register ID or Email'} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                {role === 'admin' ? (
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                ) : (
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                )}
                <input
                  type={role === 'admin' ? 'email' : 'text'}
                  required
                  value={credential}
                  onChange={e => setCredential(e.target.value)}
                  placeholder={role === 'admin' ? 'e.g. admin@college.edu' : 'e.g. 22CS045 or CS2026-102'}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-xl font-bold text-white shadow-md transition-all mt-2 ${
                role === 'admin'
                  ? 'bg-purple-600 hover:bg-purple-700'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {loading ? 'Authenticating...' : `Sign In to ${role === 'admin' ? 'Admin Portal' : 'Student Portal'}`}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
