import React from 'react';
import { 
  BookOpen, 
  Database, 
  ShieldCheck, 
  Layers, 
  GraduationCap, 
  Sparkles,
  MessageSquare,
  CheckCircle2
} from 'lucide-react';
import { DBMS_SYLLABUS, FREQUENT_INTERVIEW_QUESTIONS } from '../data/syllabusData';

interface AboutViewProps {
  onAskTopic: (topic: string) => void;
}

export const AboutView: React.FC<AboutViewProps> = ({ onAskTopic }) => {
  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50/50 dark:bg-slate-950/60">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Banner Hero */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 text-white shadow-lg relative overflow-hidden">
          <div className="relative z-10 max-w-2xl">
            <span className="inline-block px-3 py-1 rounded-full bg-white/20 backdrop-blur-xs text-xs font-bold uppercase tracking-wider mb-3">
              Course: CS3492 - DBMS
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold mb-2 leading-tight">
              Database Management System Lab Assistant
            </h1>
            <p className="text-sm text-blue-100 leading-relaxed mb-4">
              A specialized academic AI assistant designed exclusively for college students to master Relational Databases, SQL queries, Normalization, Transactions, and Laboratory Practical Experiments.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => onAskTopic("Summarize the complete DBMS syllabus and key exam topics")}
                className="px-4 py-2 rounded-xl bg-white text-blue-700 font-bold text-xs shadow-md hover:bg-blue-50 transition-colors flex items-center gap-2"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Ask AI About Syllabus</span>
              </button>
            </div>
          </div>
        </div>

        {/* Application Purpose & Strict Restriction Card */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Application Purpose & Domain Rules
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Why this assistant is specialized and non-general
              </p>
            </div>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
            Unlike general-purpose conversational chatbots like ChatGPT, the AI Lab Assistant is strictly locked to <strong>DBMS (Database Management System)</strong> course material. It enforces domain boundaries to prevent distractions during practical lab sessions.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block text-slate-800 dark:text-slate-200">What it answers:</span>
                <span className="text-slate-500 dark:text-slate-400 text-[11px]">
                  SQL queries, ER Diagrams, Normal Forms, ACID, Joins, Triggers, Viva Q&A, Lab Experiments 1-10.
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block text-slate-800 dark:text-slate-200">What it refuses:</span>
                <span className="text-slate-500 dark:text-slate-400 text-[11px]">
                  General knowledge, celebrities (e.g. Virat Kohli), non-database programming, sports, news, recipes.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Syllabus Units Breakdown */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              DBMS Academic Syllabus Units
            </h2>
          </div>

          <div className="space-y-4">
            {DBMS_SYLLABUS.map((unit) => (
              <div 
                key={unit.unitNumber}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-blue-300 dark:hover:border-blue-800 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="w-6 h-6 rounded-md bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs flex items-center justify-center font-extrabold">
                      {unit.unitNumber}
                    </span>
                    {unit.title}
                  </h3>

                  <button
                    onClick={() => onAskTopic(`Explain ${unit.title}: ${unit.topics.slice(0, 3).join(', ')}`)}
                    className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline flex items-center gap-1 shrink-0"
                  >
                    <span>Explain Unit</span>
                    <MessageSquare className="w-3.5 h-3.5" />
                  </button>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-400 mb-3 leading-relaxed">
                  {unit.description}
                </p>

                <div className="flex flex-wrap gap-1.5">
                  {unit.topics.map((topic, idx) => (
                    <button
                      key={idx}
                      onClick={() => onAskTopic(`Explain ${topic} in detail with SQL examples`)}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-[11px] font-medium text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-950 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      {topic}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* High Frequency Interview Prep */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center gap-2 mb-4">
            <GraduationCap className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Frequent Viva & Technical Interview Questions
            </h2>
          </div>

          <div className="space-y-3">
            {FREQUENT_INTERVIEW_QUESTIONS.map((faq, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                    {faq.category}
                  </span>
                  <button
                    onClick={() => onAskTopic(`Give detailed interview response for: ${faq.q}`)}
                    className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold hover:underline flex items-center gap-1"
                  >
                    <span>Ask AI</span>
                  </button>
                </div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-1">
                  Q: {faq.q}
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
