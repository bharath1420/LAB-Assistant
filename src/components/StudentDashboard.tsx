import React from 'react';
import { 
  BookOpen, 
  MessageSquare, 
  FileCode2, 
  Clock, 
  Settings, 
  GraduationCap, 
  Calendar, 
  Sparkles, 
  ArrowRight,
  Database,
  CheckCircle2,
  ShieldAlert
} from 'lucide-react';
import { UserAccount, SyllabusUnit, CourseInfo } from '../types';

interface StudentDashboardProps {
  user: UserAccount | null;
  syllabus: SyllabusUnit[];
  courseInfo?: CourseInfo;
  onNavigate: (tab: 'chat' | 'experiments' | 'about' | 'settings') => void;
  onAskTopic: (query: string) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  user,
  syllabus,
  courseInfo,
  onNavigate,
  onAskTopic,
}) => {
  const cCode = courseInfo?.code || 'CS3492';
  const cName = courseInfo?.name || 'Database Management Systems Laboratory';
  const cDept = courseInfo?.department || 'Computer Science & Engineering';
  const cReg = courseInfo?.regulation || '2021 Regulation';
  const cInstructor = courseInfo?.instructor || 'Prof. S. Ramanujam';
  const cAnnouncement = courseInfo?.announcement || 'Welcome to CS3492 DBMS Lab Course. Complete Experiments 1 to 10 & refer to the uploaded lab manuals.';

  const todayDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const completedUnits = syllabus.filter(u => u.isCompleted).length;
  const totalUnits = syllabus.length || 5;

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50/60 dark:bg-slate-950/60">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Top Student Banner & Greeting */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-xs text-xs font-bold uppercase tracking-wider text-white">
                  <Database className="w-3.5 h-3.5" />
                  Subject: {cCode} - {cName}
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-900/40 text-blue-100 text-xs font-semibold">
                  <Calendar className="w-3.5 h-3.5" />
                  {todayDate}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black leading-tight tracking-tight">
                Welcome back, {user ? user.name : 'Student'}! 👋
              </h1>

              <p className="text-sm text-blue-100 leading-relaxed">
                Your dedicated AI Lab Assistant is ready. Ask any SQL query, Normalization theory, or Lab Experiment question for instant academic assistance.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
              <button
                onClick={() => onNavigate('chat')}
                className="px-5 py-3 rounded-2xl bg-white text-blue-700 font-bold text-xs shadow-lg hover:bg-blue-50 transition-all flex items-center justify-center gap-2"
              >
                <MessageSquare className="w-4 h-4 text-blue-600" />
                <span>Launch AI Chat Assistant</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Course Info & Notice Board Card (Student Read-Only View) */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  {cCode}: {cName}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {cDept} • {cReg} • Instructor: {cInstructor}
                </p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-bold">
              👁️ Student View Only
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-800/60 text-xs text-blue-900 dark:text-blue-200 flex items-start gap-2.5">
            <span className="font-extrabold text-blue-600 dark:text-blue-400 shrink-0">📢 Notice Board:</span>
            <span>{cAnnouncement}</span>
          </div>
        </div>

        {/* 5 Primary Navigation Cards */}
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
            Quick Portal Navigation
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            
            {/* 1. Chat Assistant */}
            <button
              onClick={() => onNavigate('chat')}
              className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-blue-500 hover:shadow-md transition-all text-left group"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold mb-3 group-hover:scale-105 transition-transform">
                <MessageSquare className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1">
                Chat Assistant
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Ask SQL, Normalization, Viva Qs or Upload Image
              </p>
            </button>

            {/* 2. Lab Manual */}
            <button
              onClick={() => onNavigate('experiments')}
              className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-emerald-500 hover:shadow-md transition-all text-left group"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold mb-3 group-hover:scale-105 transition-transform">
                <FileCode2 className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1">
                Lab Manual
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Experiments 1 to 10 with SQL code & outputs
              </p>
            </button>

            {/* 3. Syllabus */}
            <button
              onClick={() => onNavigate('about')}
              className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-purple-500 hover:shadow-md transition-all text-left group"
            >
              <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold mb-3 group-hover:scale-105 transition-transform">
                <BookOpen className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1">
                Syllabus
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Units 1 to 5 breakdown & topic guide
              </p>
            </button>

            {/* 4. Previous Chats */}
            <button
              onClick={() => onNavigate('chat')}
              className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-amber-500 hover:shadow-md transition-all text-left group"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold mb-3 group-hover:scale-105 transition-transform">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1">
                Previous Chats
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                View saved chat history & query answers
              </p>
            </button>

            {/* 5. Settings */}
            <button
              onClick={() => onNavigate('settings')}
              className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-slate-500 hover:shadow-md transition-all text-left group"
            >
              <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center font-bold mb-3 group-hover:scale-105 transition-transform">
                <Settings className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1">
                Settings
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Theme, response depth & data manager
              </p>
            </button>

          </div>
        </div>

        {/* Academic Progress & Supported Topics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Progress Card */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Syllabus Progress
              </span>
              <span className="text-xs font-black text-blue-600 dark:text-blue-400">
                {completedUnits} / {totalUnits} Units
              </span>
            </div>
            
            <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div 
                className="h-full bg-blue-600 rounded-full transition-all duration-500" 
                style={{ width: `${(completedUnits / totalUnits) * 100}%` }}
              />
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Units I and II completed. Next focus: Unit III Normalization & Decomposition.
            </p>

            <button
              onClick={() => onNavigate('about')}
              className="w-full py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950 transition-colors flex items-center justify-center gap-1.5"
            >
              <span>View Detailed Syllabus</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Quick AI Starter Questions */}
          <div className="md:col-span-2 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500" />
                Featured DBMS Questions to Try
              </span>
              <span className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold">
                Click to ask AI
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {[
                { title: "DELETE vs TRUNCATE", q: "Explain difference between DELETE and TRUNCATE in SQL with rollback rules" },
                { title: "SQL Joins Code", q: "Give complete SQL code for INNER, LEFT, and RIGHT joins with Employee table" },
                { title: "ACID Properties", q: "Explain ACID properties in DBMS transactions with a bank account transfer example" },
                { title: "3NF Normalization", q: "How do I check if a table is in 3NF or BCNF? Explain transitive dependency" }
              ].map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => onAskTopic(item.q)}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800 text-left hover:border-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-950/40 transition-all group"
                >
                  <span className="font-bold text-slate-900 dark:text-white block group-hover:text-blue-600 dark:group-hover:text-blue-400">
                    {item.title}
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                    {item.q}
                  </span>
                </button>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
