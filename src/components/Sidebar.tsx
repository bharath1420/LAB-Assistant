import React from 'react';
import { 
  Plus, 
  MessageSquare, 
  FlaskConical, 
  BookOpen, 
  Settings, 
  Trash2, 
  Database, 
  Sparkles,
  ShieldCheck,
  X,
  ChevronRight
} from 'lucide-react';
import { ChatSession, UserAccount, CourseInfo } from '../types';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: 'dashboard' | 'chat' | 'experiments' | 'about' | 'admin' | 'settings';
  setActiveTab: (tab: 'dashboard' | 'chat' | 'experiments' | 'about' | 'admin' | 'settings') => void;
  sessions: ChatSession[];
  activeSessionId: string | null;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
  onDeleteSession: (id: string) => void;
  onClearAllSessions: () => void;
  user: UserAccount | null;
  courseInfo?: CourseInfo;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  activeTab,
  setActiveTab,
  sessions,
  activeSessionId,
  onSelectSession,
  onNewChat,
  onDeleteSession,
  onClearAllSessions,
  user,
  courseInfo,
}) => {
  const cCode = courseInfo?.code || 'CS3492';

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 md:hidden"
          onClick={onClose}
        />
      )}

      <aside className={`
        fixed md:static top-0 left-0 bottom-0 z-50
        w-72 bg-slate-50 dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800
        flex flex-col justify-between transition-transform duration-200 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Top Header */}
        <div className="p-4 flex flex-col gap-3 border-b border-slate-200/80 dark:border-slate-800/80">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                <Database className="w-4 h-4" />
              </div>
              <span className="font-bold text-slate-900 dark:text-white text-sm">
                {cCode} Lab AI
              </span>
            </div>
            <button 
              onClick={onClose}
              className="md:hidden p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <button
            onClick={() => {
              onNewChat();
              setActiveTab('chat');
              onClose();
            }}
            className="w-full py-2.5 px-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs sm:text-sm shadow-sm flex items-center justify-center gap-2 transition-all group"
          >
            <Plus className="w-4 h-4 transition-transform group-hover:rotate-90" />
            <span>New Chat Session</span>
          </button>
        </div>

        {/* Main Navigation & Chat History */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {/* Main Views Section */}
          <div>
            <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
              Navigation
            </p>
            <nav className="space-y-1">
              <button
                onClick={() => { setActiveTab('dashboard'); onClose(); }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                  activeTab === 'dashboard'
                    ? 'bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 font-semibold'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-900'
                }`}
              >
                <Database className="w-4 h-4 text-blue-500" />
                <span>Student Dashboard</span>
              </button>

              <button
                onClick={() => { setActiveTab('chat'); onClose(); }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                  activeTab === 'chat'
                    ? 'bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 font-semibold'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-900'
                }`}
              >
                <MessageSquare className="w-4 h-4 text-blue-500" />
                <span>AI Chat Assistant</span>
              </button>

              {user?.role === 'admin' && (
                <button
                  onClick={() => { setActiveTab('admin'); onClose(); }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                    activeTab === 'admin'
                      ? 'bg-purple-50 dark:bg-purple-950/70 text-purple-600 dark:text-purple-400 font-semibold'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-900'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 text-purple-500" />
                  <span>Teacher / Admin Portal</span>
                </button>
              )}

              <button
                onClick={() => { setActiveTab('experiments'); onClose(); }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                  activeTab === 'experiments'
                    ? 'bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 font-semibold'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-900'
                }`}
              >
                <FlaskConical className="w-4 h-4 text-emerald-500" />
                <div className="flex-1 flex items-center justify-between">
                  <span>Lab Manual</span>
                  <span className="text-[10px] bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-1.5 py-0.5 rounded-full font-bold">10</span>
                </div>
              </button>

              <button
                onClick={() => { setActiveTab('about'); onClose(); }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                  activeTab === 'about'
                    ? 'bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 font-semibold'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-900'
                }`}
              >
                <BookOpen className="w-4 h-4 text-amber-500" />
                <span>Subject Syllabus</span>
              </button>

              <button
                onClick={() => { setActiveTab('settings'); onClose(); }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                  activeTab === 'settings'
                    ? 'bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 font-semibold'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-900'
                }`}
              >
                <Settings className="w-4 h-4 text-slate-500" />
                <span>Settings</span>
              </button>
            </nav>
          </div>

          {/* Previous Chats History */}
          <div>
            <div className="flex items-center justify-between px-3 mb-2">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {user?.role === 'admin' ? '👥 All Student Chat Histories' : '💬 My Chat History'}
              </p>
              {sessions.length > 0 && (
                <button
                  onClick={onClearAllSessions}
                  className="text-[10px] text-slate-400 hover:text-red-500 dark:hover:text-red-400 font-medium transition-colors"
                  title="Clear history"
                >
                  Clear All
                </button>
              )}
            </div>

            {sessions.length === 0 ? (
              <div className="px-3 py-4 text-center rounded-xl bg-slate-100/60 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/50">
                <p className="text-xs text-slate-400 dark:text-slate-500">
                  {user?.role === 'admin' ? 'No student chat history recorded yet.' : 'No previous chat history. Start a new session above!'}
                </p>
              </div>
            ) : (
              <div className="space-y-1 max-h-60 overflow-y-auto pr-1">
                {sessions.map((session) => {
                  const isActive = activeSessionId === session.id && activeTab === 'chat';
                  return (
                    <div
                      key={session.id}
                      className={`group relative flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors cursor-pointer ${
                        isActive
                          ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 font-semibold shadow-xs border border-slate-200/60 dark:border-slate-800'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-900/60'
                      }`}
                      onClick={() => {
                        onSelectSession(session.id);
                        setActiveTab('chat');
                        onClose();
                      }}
                    >
                      <div className="flex flex-col min-w-0 pr-6">
                        <div className="flex items-center gap-2 overflow-hidden">
                          <MessageSquare className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} />
                          <span className="truncate">{session.title}</span>
                        </div>
                        {user?.role === 'admin' && (session.userName || session.studentId) && (
                          <span className="text-[10px] text-purple-600 dark:text-purple-400 font-bold ml-5 truncate">
                            👤 {session.userName || 'Student'} {session.studentId ? `(${session.studentId})` : ''}
                          </span>
                        )}
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteSession(session.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-500 rounded transition-opacity absolute right-2"
                        title="Delete Session"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Bottom Subject Boundary Card */}
        <div className="p-3 border-t border-slate-200/80 dark:border-slate-800/80 bg-slate-100/70 dark:bg-slate-900/60 m-3 rounded-2xl">
          <div className="flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <div className="text-[11px] leading-tight text-slate-600 dark:text-slate-300">
              <span className="font-semibold block text-slate-800 dark:text-slate-100 mb-0.5">
                Strict DBMS Restricted
              </span>
              Trained specifically for DBMS course syllabus, SQL queries & lab experiments.
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
