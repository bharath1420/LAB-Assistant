import React, { useState } from 'react';
import { 
  Settings, 
  Moon, 
  Sun, 
  Trash2, 
  Sliders, 
  Cpu, 
  ShieldCheck, 
  Type,
  Check,
  RotateCcw
} from 'lucide-react';
import { UserSettings } from '../types';

interface SettingsViewProps {
  settings: UserSettings;
  onUpdateSettings: (newSettings: Partial<UserSettings>) => void;
  onClearHistory: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
  onClearHistory,
}) => {
  const [clearedToast, setClearedToast] = useState(false);

  const handleClear = () => {
    onClearHistory();
    setClearedToast(true);
    setTimeout(() => setClearedToast(false), 3000);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50/50 dark:bg-slate-950/60">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              Application Settings
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Customize appearance, AI response depth, and local history
            </p>
          </div>
        </div>

        {/* Theme Settings */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              {settings.theme === 'dark' ? (
                <Moon className="w-5 h-5 text-blue-400" />
              ) : (
                <Sun className="w-5 h-5 text-amber-500" />
              )}
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Color Theme
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Switch between Light and Dark interface modes
                </p>
              </div>
            </div>

            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              <button
                onClick={() => onUpdateSettings({ theme: 'light' })}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  settings.theme === 'light'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <Sun className="w-3.5 h-3.5 text-amber-500" />
                Light
              </button>
              <button
                onClick={() => onUpdateSettings({ theme: 'dark' })}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  settings.theme === 'dark'
                    ? 'bg-slate-950 text-white shadow-xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-white'
                }`}
              >
                <Moon className="w-3.5 h-3.5 text-blue-400" />
                Dark
              </button>
            </div>
          </div>
        </div>

        {/* Response Style */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5">
            <Sliders className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                AI Response Depth
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Choose explanation style for DBMS questions
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { id: 'balanced', label: 'Balanced Academic', desc: 'Standard lab manual explanations with SQL code' },
              { id: 'concise', label: 'Concise Notes', desc: 'Quick bullet points and essential SQL snippets' },
              { id: 'detailed', label: 'Deep Theoretical', desc: 'Comprehensive exam & viva level derivations' }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => onUpdateSettings({ responseStyle: item.id as any })}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  settings.responseStyle === item.id
                    ? 'bg-blue-50 dark:bg-blue-950/70 border-blue-500 text-blue-900 dark:text-blue-200 font-semibold shadow-2xs'
                    : 'bg-slate-50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold">{item.label}</span>
                  {settings.responseStyle === item.id && (
                    <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  )}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-normal leading-snug">
                  {item.desc}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Chat Data Management */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Trash2 className="w-5 h-5 text-red-500" />
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Clear All Chat History
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Delete saved chat sessions from local storage
                </p>
              </div>
            </div>

            <button
              onClick={handleClear}
              className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-xs shadow-xs transition-colors"
            >
              Clear History
            </button>
          </div>

          {clearedToast && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-500" />
              <span>Chat history cleared successfully!</span>
            </div>
          )}
        </div>

        {/* AI System Diagnostics Info */}
        <div className="p-5 rounded-2xl bg-slate-900 text-slate-100 shadow-md space-y-3 font-mono text-xs">
          <div className="flex items-center gap-2 text-blue-400 font-bold font-sans text-sm">
            <Cpu className="w-4 h-4" />
            <span>AI Architecture & Model Info</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-300">
            <div>
              <span className="text-slate-400 block">Model Engine:</span>
              <span className="font-bold text-white">Google Gemini 3.6 Flash</span>
            </div>
            <div>
              <span className="text-slate-400 block">API Integration:</span>
              <span className="font-bold text-emerald-400">@google/genai (Server Route)</span>
            </div>
            <div>
              <span className="text-slate-400 block">System Guardrail:</span>
              <span className="font-bold text-amber-400">DBMS Strict Refusal Filter</span>
            </div>
            <div>
              <span className="text-slate-400 block">Course Code:</span>
              <span className="font-bold text-white">CS3492 / DBMS Lab</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
