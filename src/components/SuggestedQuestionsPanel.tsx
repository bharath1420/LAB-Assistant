import React, { useState } from 'react';
import { Sparkles, HelpCircle, Code, FlaskConical, GraduationCap } from 'lucide-react';
import { SUGGESTED_QUESTIONS } from '../data/suggestedQuestions';
import { SuggestedQuestion } from '../types';

interface SuggestedQuestionsPanelProps {
  onSelectQuestion: (questionText: string) => void;
}

export const SuggestedQuestionsPanel: React.FC<SuggestedQuestionsPanelProps> = ({ onSelectQuestion }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', 'Concepts', 'SQL', 'Experiments', 'Viva & Interview'];

  const filteredQuestions = selectedCategory === 'All'
    ? SUGGESTED_QUESTIONS
    : SUGGESTED_QUESTIONS.filter(q => q.category === selectedCategory);

  return (
    <div className="w-full max-w-4xl mx-auto my-4 p-4 bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
            Suggested DBMS Questions
          </h3>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white font-semibold shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of question buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {filteredQuestions.map((q) => (
          <button
            key={q.id}
            onClick={() => onSelectQuestion(q.text)}
            className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 hover:bg-blue-50 dark:hover:bg-blue-950/50 border border-slate-200/60 dark:border-slate-800 text-left transition-all group"
          >
            <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-colors shrink-0 mt-0.5">
              {q.category === 'SQL' ? (
                <Code className="w-3.5 h-3.5" />
              ) : q.category === 'Experiments' ? (
                <FlaskConical className="w-3.5 h-3.5" />
              ) : q.category === 'Viva & Interview' ? (
                <GraduationCap className="w-3.5 h-3.5" />
              ) : (
                <HelpCircle className="w-3.5 h-3.5" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <span className="block text-xs font-medium text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-300 transition-colors line-clamp-2">
                {q.text}
              </span>
              <span className="inline-block mt-1 text-[10px] text-slate-400 dark:text-slate-500 font-semibold">
                {q.category}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
