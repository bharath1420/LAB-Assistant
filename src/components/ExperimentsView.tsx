import React, { useState, useEffect } from 'react';
import { 
  FlaskConical, 
  Check, 
  Copy, 
  Terminal, 
  MessageSquare, 
  HelpCircle, 
  ChevronRight, 
  Lightbulb, 
  Table, 
  BookOpen,
  ArrowRight,
  Sparkles,
  Edit3
} from 'lucide-react';
import { LAB_EXPERIMENTS } from '../data/experimentsData';
import { LabExperiment } from '../types';

interface ExperimentsViewProps {
  onAskInChat: (query: string) => void;
}

export const ExperimentsView: React.FC<ExperimentsViewProps> = ({ onAskInChat }) => {
  const [experiments, setExperiments] = useState<LabExperiment[]>(LAB_EXPERIMENTS);
  const [selectedExpId, setSelectedExpId] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<'all' | 'sql' | 'output' | 'viva'>('all');
  const [copiedCode, setCopiedCode] = useState(false);

  // Fetch updated experiments list from backend
  useEffect(() => {
    fetch('/api/experiments')
      .then(res => res.json())
      .then(data => {
        if (data.experiments && Array.isArray(data.experiments) && data.experiments.length > 0) {
          setExperiments(data.experiments);
        }
      })
      .catch(err => console.error('Failed to fetch experiments:', err));
  }, []);

  const currentExp: LabExperiment = experiments.find(e => e.id === selectedExpId) || experiments[0] || LAB_EXPERIMENTS[0];

  const handleCopyCode = () => {
    navigator.clipboard.writeText(currentExp.sqlCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row h-full overflow-hidden bg-slate-50/50 dark:bg-slate-950/60">
      {/* Left List Column */}
      <div className="w-full md:w-80 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col shrink-0">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2 mb-1">
            <FlaskConical className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h2 className="font-bold text-slate-900 dark:text-white text-base">
              DBMS Lab Manual
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            10 Standard Practical Experiments
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {experiments.map((exp) => {
            const isSelected = exp.id === selectedExpId;
            return (
              <button
                key={exp.id}
                onClick={() => setSelectedExpId(exp.id)}
                className={`w-full text-left p-3 rounded-xl transition-all flex items-start gap-2.5 ${
                  isSelected
                    ? 'bg-blue-50 dark:bg-blue-950/70 border border-blue-200 dark:border-blue-800/80 text-blue-900 dark:text-blue-200 font-medium shadow-2xs'
                    : 'hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                }`}
              >
                <span className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 ${
                  isSelected ? 'bg-blue-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}>
                  {exp.id}
                </span>
                <div className="flex-1 min-w-0">
                  <span className="block text-xs font-semibold leading-snug line-clamp-2">
                    {exp.title}
                  </span>
                  <span className="inline-block mt-1 text-[10px] text-slate-400 font-medium">
                    {exp.category}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Experiment Detail Area */}
      <div className="flex-1 flex flex-col h-full overflow-y-auto p-4 sm:p-6">
        <div className="max-w-4xl mx-auto w-full space-y-6">
          {/* Header Card */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 px-2.5 py-1 rounded-md bg-blue-50 dark:bg-blue-950 border border-blue-100 dark:border-blue-900">
                  {currentExp.category}
                </span>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-2">
                  {currentExp.title}
                </h1>
              </div>

              <button
                onClick={() => onAskInChat(`Explain ${currentExp.title} and give SQL code details`)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-all shrink-0"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Ask AI Assistant</span>
              </button>
            </div>

            {/* Aim */}
            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Aim
              </h3>
              <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                {currentExp.aim}
              </p>
            </div>
          </div>

          {/* Theory & Procedure */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Theory */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
              <div className="flex items-center gap-2 mb-2 text-slate-900 dark:text-white font-bold text-sm">
                <BookOpen className="w-4 h-4 text-blue-500" />
                <h3>Theory Overview</h3>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {currentExp.theory}
              </p>
            </div>

            {/* Procedure */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
              <div className="flex items-center gap-2 mb-2 text-slate-900 dark:text-white font-bold text-sm">
                <ChevronRight className="w-4 h-4 text-emerald-500" />
                <h3>Procedure Steps</h3>
              </div>
              <ol className="space-y-1.5 list-decimal list-inside text-xs text-slate-600 dark:text-slate-300">
                {currentExp.procedure.map((step, idx) => (
                  <li key={idx} className="leading-snug">{step}</li>
                ))}
              </ol>
            </div>
          </div>

          {/* SQL Code Block */}
          <div className="rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-md">
            <div className="flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-blue-400" />
                <span className="font-mono text-xs font-bold text-blue-300 uppercase">
                  Executable SQL Source
                </span>
              </div>
              <button
                onClick={handleCopyCode}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
              >
                {copiedCode ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied SQL</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Code</span>
                  </>
                )}
              </button>
            </div>
            <pre className="p-4 text-xs font-mono text-emerald-300 overflow-x-auto leading-relaxed">
              <code>{currentExp.sqlCode}</code>
            </pre>
          </div>

          {/* Expected Output Table */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <div className="flex items-center gap-2 mb-3 text-slate-900 dark:text-white font-bold text-sm">
              <Table className="w-4 h-4 text-purple-500" />
              <h3>Expected Tabular Output</h3>
            </div>

            <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold border-b border-slate-200 dark:border-slate-800">
                    {currentExp.expectedOutput.columns.map((col, idx) => (
                      <th key={idx} className="px-3 py-2">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                  {currentExp.expectedOutput.rows.map((row, rIdx) => (
                    <tr key={rIdx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      {row.map((val, cIdx) => (
                        <td key={cIdx} className="px-3 py-2 font-mono">
                          {String(val)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Result */}
            <div className="mt-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-900 dark:text-emerald-200 text-xs font-medium">
              <span className="font-bold block mb-0.5">Result:</span>
              {currentExp.result}
            </div>
          </div>

          {/* Viva Questions */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <div className="flex items-center gap-2 mb-3 text-slate-900 dark:text-white font-bold text-sm">
              <HelpCircle className="w-4 h-4 text-amber-500" />
              <h3>Lab Viva Examination Questions</h3>
            </div>

            <div className="space-y-3">
              {currentExp.vivaQuestions.map((viva, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800">
                  <p className="font-semibold text-xs text-slate-900 dark:text-white mb-1">
                    Q{idx + 1}: {viva.question}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    <span className="font-semibold text-blue-600 dark:text-blue-400">Ans: </span>
                    {viva.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Pro Tips */}
          <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 text-xs">
            <div className="flex items-center gap-2 font-bold text-blue-900 dark:text-blue-200 mb-1.5">
              <Lightbulb className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Lab Instructor Pro Tips</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-slate-700 dark:text-slate-300">
              {currentExp.tips.map((tip, idx) => (
                <li key={idx}>{tip}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
