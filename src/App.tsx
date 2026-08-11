import React, { useState, useEffect, useMemo } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { ChatWindow } from './components/ChatWindow';
import { ExperimentsView } from './components/ExperimentsView';
import { AboutView } from './components/AboutView';
import { SettingsView } from './components/SettingsView';
import { StudentDashboard } from './components/StudentDashboard';
import { AdminPortal } from './components/AdminPortal';
import { AuthModal } from './components/AuthModal';
import { ChatMessage, ChatSession, UserSettings, UserAccount, SyllabusUnit, CourseInfo } from './types';
import { ShieldCheck, GraduationCap, UserCheck, LogOut, LayoutDashboard, Sparkles } from 'lucide-react';

const STORAGE_KEY_SESSIONS = 'dbms_lab_ai_sessions_v1';
const STORAGE_KEY_SETTINGS = 'dbms_lab_ai_settings_v1';

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'chat' | 'experiments' | 'about' | 'admin' | 'settings'>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // User auth state
  const [user, setUser] = useState<UserAccount | null>(null);

  const handleLogoutUser = () => {
    setUser(null);
    setActiveTab('dashboard');
    setIsAuthModalOpen(true);
  };

  useEffect(() => {
    if (!user) {
      setIsAuthModalOpen(true);
    }
  }, [user]);

  const handleLoginUser = (newUser: UserAccount) => {
    setUser(newUser);
    if (newUser.role === 'admin') {
      setActiveTab('admin');
    } else {
      setActiveTab('dashboard');
    }
  };

  const handleNavigateTab = (tab: 'dashboard' | 'chat' | 'experiments' | 'about' | 'admin' | 'settings') => {
    if (tab === 'admin') {
      if (!user) {
        setIsAuthModalOpen(true);
        return;
      }
      if (user.role !== 'admin') {
        alert('Access Restricted: Only pre-authorized faculty admin accounts can access the Admin Portal.');
        return;
      }
    }
    setActiveTab(tab);
  };

  // Syllabus state
  const [syllabus, setSyllabus] = useState<SyllabusUnit[]>([]);

  // Sessions & Messages state
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SESSIONS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [activeSessionId, setActiveSessionId] = useState<string | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SESSIONS);
      if (saved) {
        const parsed: ChatSession[] = JSON.parse(saved);
        if (parsed.length > 0) return parsed[0].id;
      }
    } catch {}
    return null;
  });

  const [isLoading, setIsLoading] = useState(false);

  // Settings state
  const [settings, setSettings] = useState<UserSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SETTINGS);
      return saved ? JSON.parse(saved) : {
        theme: 'light',
        responseStyle: 'balanced',
        fontSize: 'medium',
        autoScroll: true
      };
    } catch {
      return {
        theme: 'light',
        responseStyle: 'balanced',
        fontSize: 'medium',
        autoScroll: true
      };
    }
  });

  // Course Info state (Admin customizable, Student view only)
  const [courseInfo, setCourseInfo] = useState<CourseInfo>({
    code: 'CS3492',
    name: 'Database Management Systems Laboratory',
    department: 'Computer Science & Engineering',
    regulation: '2021 Regulation',
    instructor: 'Prof. S. Ramanujam',
    announcement: 'Welcome to CS3492 DBMS Lab Course. Complete Experiments 1 to 10 & refer to the uploaded lab manuals.',
    semester: 'Semester IV'
  });

  // Fetch Syllabus, Course Info, and Backend Chat History on start
  useEffect(() => {
    fetch('/api/syllabus')
      .then(r => r.json())
      .then(data => {
        if (data.syllabus) setSyllabus(data.syllabus);
      })
      .catch(err => console.error('Failed to fetch syllabus:', err));

    fetch('/api/course-info')
      .then(r => r.json())
      .then(data => {
        if (data.courseInfo) setCourseInfo(data.courseInfo);
      })
      .catch(err => console.error('Failed to fetch course info:', err));

    fetch('/api/history')
      .then(r => r.json())
      .then(data => {
        if (data.sessions && Array.isArray(data.sessions)) {
          setSessions(prev => {
            const map = new Map<string, ChatSession>();
            data.sessions.forEach((s: ChatSession) => map.set(s.id, s));
            prev.forEach((s: ChatSession) => map.set(s.id, s));
            return Array.from(map.values());
          });
        }
      })
      .catch(err => console.error('Failed to fetch chat history from server:', err));
  }, []);

  // Compute visible sessions based on user role (Students see ONLY their own, Admins see ALL)
  const visibleSessions = useMemo(() => {
    if (!user) return sessions;
    if (user.role === 'admin') {
      return sessions; // Admin sees ALL chat sessions across all students
    } else {
      // Student sees ONLY their own chat sessions
      return sessions.filter(s =>
        s.userId === user.id ||
        (s.userEmail && user.email && s.userEmail.toLowerCase() === user.email.toLowerCase()) ||
        (s.studentId && user.studentId && s.studentId.toLowerCase() === user.studentId.toLowerCase())
      );
    }
  }, [sessions, user]);

  // Ensure active session exists for current logged in student/admin
  useEffect(() => {
    if (user && user.role === 'student') {
      const studentSessions = visibleSessions;
      if (studentSessions.length === 0) {
        createNewChat(user);
      } else if (!activeSessionId || !studentSessions.some(s => s.id === activeSessionId)) {
        setActiveSessionId(studentSessions[0].id);
      }
    } else if (sessions.length > 0 && (!activeSessionId || !sessions.some(s => s.id === activeSessionId))) {
      setActiveSessionId(sessions[0].id);
    }
  }, [user, sessions, visibleSessions]);

  const createNewChat = (userObj = user) => {
    const newSession: ChatSession = {
      id: 'session_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
      userId: userObj?.id,
      userName: userObj?.name,
      userEmail: userObj?.email,
      studentId: userObj?.studentId,
      title: 'New DBMS Chat',
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setSessions(prev => [newSession, ...prev]);
    setActiveSessionId(newSession.id);

    // Sync new session to backend
    fetch('/api/history', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session: newSession })
    }).catch(() => {});
  };

  const currentSession = visibleSessions.find(s => s.id === activeSessionId) || visibleSessions[0] || sessions.find(s => s.id === activeSessionId) || sessions[0];
  const messages = currentSession ? currentSession.messages : [];

  const handleSendMessage = async (text: string, imageBase64?: string, imageName?: string, fileData?: { name: string; base64: string; fileType: string; size?: string }) => {
    if ((!text.trim() && !imageBase64 && !fileData) || isLoading) return;

    let targetSessionId = activeSessionId;
    if (!targetSessionId || !sessions.some(s => s.id === targetSessionId)) {
      const newSession: ChatSession = {
        id: 'session_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
        userId: user?.id,
        userName: user?.name,
        userEmail: user?.email,
        studentId: user?.studentId,
        title: text ? (text.length > 28 ? text.substring(0, 28) + '...' : text) : 'Image Query',
        messages: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setSessions(prev => [newSession, ...prev]);
      targetSessionId = newSession.id;
      setActiveSessionId(newSession.id);
    }

    const userMsg: ChatMessage = {
      id: 'msg_' + Date.now(),
      role: 'user',
      content: text || (imageBase64 ? 'Please analyze this DBMS question/diagram image.' : fileData ? `Please analyze the uploaded file: ${fileData.name}` : ''),
      timestamp: new Date().toISOString(),
      imageUrl: imageBase64 || undefined,
      imageName: imageName || (fileData && fileData.fileType?.includes('image') ? fileData.name : undefined),
    };

    const assistantMsgId = 'msg_ast_' + Date.now();

    // Add user message and assistant placeholder message.
    // If this is the session's first assistant reply, include an immediate greeting
    // with the assistant username to improve perceived responsiveness.
    setSessions(prev => prev.map(s => {
      if (s.id === targetSessionId) {
        const isFirst = s.messages.length === 0;
        const defaultTitle = text ? (text.length > 30 ? text.substring(0, 30) + '...' : text) : 'Image Question';
        const assistantPlaceholder: ChatMessage = {
          id: assistantMsgId,
          role: 'assistant',
          content: '',
          timestamp: new Date().toISOString()
        };

        return {
          ...s,
          title: isFirst ? defaultTitle : s.title,
          messages: [...s.messages, userMsg, assistantPlaceholder],
          updatedAt: new Date().toISOString()
        };
      }
      return s;
    }));

    setIsLoading(true);

    try {
      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          imageBase64: imageBase64,
          imageMimeType: imageBase64 ? (imageBase64.split(';')[0].split(':')[1] || 'image/jpeg') : undefined,
          fileData: fileData ? {
            name: fileData.name,
            base64: fileData.base64,
            fileType: fileData.fileType,
            size: fileData.size
          } : undefined,
          // Strip base64 image data from history to avoid sending multi-MB payloads
          // on every subsequent request (critical for image query performance)
          history: currentSession ? currentSession.messages.map(m => ({
            id: m.id,
            role: m.role,
            content: m.content,
            timestamp: m.timestamp,
            sourceDoc: m.sourceDoc,
          })) : [],
          userId: user?.id
        })
      });

      if (!response.ok || !response.body) {
        throw new Error('Streaming connection failed');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedContent = '';
      let matchedSourceDoc: string | undefined = undefined;
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunkText = decoder.decode(value, { stream: true });
        buffer += chunkText;

        // Try to parse server-sent-event (SSE) style messages split by double newlines.
        let handledSSE = false;
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const lineStr of lines) {
          const trimmedLine = lineStr.trim();
          if (trimmedLine.startsWith('data: ')) {
            handledSSE = true;
            try {
              const data = JSON.parse(trimmedLine.slice(6));

              if (data.sourceDoc) {
                matchedSourceDoc = data.sourceDoc;
              }

              if (data.chunk) {
                accumulatedContent += data.chunk;
                setSessions(prev => prev.map(s => {
                  if (s.id === targetSessionId) {
                    return {
                      ...s,
                      messages: s.messages.map(m =>
                        m.id === assistantMsgId
                          ? { ...m, content: accumulatedContent, sourceDoc: matchedSourceDoc || m.sourceDoc }
                          : m
                      ),
                      updatedAt: new Date().toISOString()
                    };
                  }
                  return s;
                }));
              }

              if (data.error) {
                accumulatedContent += (accumulatedContent ? '\n\n' : '') + `⚠️ ${data.error}`;
                setSessions(prev => prev.map(s => {
                  if (s.id === targetSessionId) {
                    return {
                      ...s,
                      messages: s.messages.map(m =>
                        m.id === assistantMsgId ? { ...m, content: accumulatedContent, isError: true } : m
                      ),
                      updatedAt: new Date().toISOString()
                    };
                  }
                  return s;
                }));
              }
            } catch (e) {
              console.error('Failed to parse SSE line:', e);
            }
          }
        }

        // If the server isn't using SSE framing, render any raw chunk immediately
        // to improve perceived responsiveness.
        if (!handledSSE && chunkText) {
          accumulatedContent += chunkText;
          setSessions(prev => prev.map(s => {
            if (s.id === targetSessionId) {
              return {
                ...s,
                messages: s.messages.map(m =>
                  m.id === assistantMsgId ? { ...m, content: accumulatedContent } : m
                ),
                updatedAt: new Date().toISOString()
              };
            }
            return s;
          }));
        }
      }

      // Final fallback check if message content remains empty
      if (!accumulatedContent) {
        setSessions(prev => prev.map(s => {
          if (s.id === targetSessionId) {
            return {
              ...s,
              messages: s.messages.map(m =>
                m.id === assistantMsgId
                  ? { ...m, content: 'I am a DBMS Lab Assistant. I can answer only Database Management System questions.' }
                  : m
              )
            };
          }
          return s;
        }));
      }

    } catch (err: any) {
      console.warn('Streaming failed, attempting standard REST fallback:', err);
      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: text,
            imageBase64: imageBase64,
            imageMimeType: imageBase64 ? (imageBase64.split(';')[0].split(':')[1] || 'image/jpeg') : undefined,
            fileData: fileData ? {
              name: fileData.name,
              base64: fileData.base64,
              fileType: fileData.fileType,
              size: fileData.size
            } : undefined,
            history: currentSession ? currentSession.messages.map(m => ({
              id: m.id,
              role: m.role,
              content: m.content,
              timestamp: m.timestamp,
              sourceDoc: m.sourceDoc,
            })) : [],
            userId: user?.id
          })
        });

        const data = await response.json();

        setSessions(prev => prev.map(s => {
          if (s.id === targetSessionId) {
            return {
              ...s,
              messages: s.messages.map(m =>
                m.id === assistantMsgId
                  ? {
                      ...m,
                      content: data.reply || (data.error ? `Error: ${data.error}` : 'I am a DBMS Lab Assistant. I can answer only Database Management System questions.'),
                      isError: !!data.error,
                      sourceDoc: data.sourceDoc
                    }
                  : m
              ),
              updatedAt: new Date().toISOString()
            };
          }
          return s;
        }));
      } catch (fallbackErr) {
        setSessions(prev => prev.map(s => {
          if (s.id === targetSessionId) {
            return {
              ...s,
              messages: s.messages.map(m =>
                m.id === assistantMsgId
                  ? { ...m, content: '⚠️ Connection error. Unable to reach DBMS Assistant server. Please try again.', isError: true }
                  : m
              )
            };
          }
          return s;
        }));
      }
    } finally {
      setIsLoading(false);
      // Post updated session to backend server history for Admin monitoring
      setTimeout(() => {
        setSessions(currentSessions => {
          const finishedSession = currentSessions.find(s => s.id === targetSessionId);
          if (finishedSession) {
            fetch('/api/history', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ session: finishedSession })
            }).catch(() => {});
          }
          return currentSessions;
        });
      }, 300);
    }
  };

  const handleClearCurrentMessages = () => {
    if (!activeSessionId) return;
    setSessions(prev => prev.map(s => {
      if (s.id === activeSessionId) {
        return { ...s, messages: [], updatedAt: new Date().toISOString() };
      }
      return s;
    }));
  };

  const handleDeleteSession = (id: string) => {
    // Delete from server
    fetch('/api/history', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: id })
    }).catch(() => {});

    setSessions(prev => {
      const filtered = prev.filter(s => s.id !== id);
      if (filtered.length === 0) {
        const brandNew: ChatSession = {
          id: 'session_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
          userId: user?.id,
          userName: user?.name,
          userEmail: user?.email,
          studentId: user?.studentId,
          title: 'New DBMS Chat',
          messages: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        setActiveSessionId(brandNew.id);
        return [brandNew];
      }
      if (activeSessionId === id) {
        const remainingVisible = filtered.filter(s => 
          !user || user.role === 'admin' || s.userId === user.id || s.userEmail === user.email || (user.studentId && s.studentId === user.studentId)
        );
        if (remainingVisible.length > 0) {
          setActiveSessionId(remainingVisible[0].id);
        } else {
          setActiveSessionId(filtered[0].id);
        }
      }
      return filtered;
    });
  };

  const handleClearAllSessions = () => {
    if (user && user.role === 'student') {
      // Clear ONLY current student's sessions
      const studentSessionIds = visibleSessions.map(s => s.id);
      studentSessionIds.forEach(id => {
        fetch('/api/history', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId: id })
        }).catch(() => {});
      });

      setSessions(prev => prev.filter(s => !studentSessionIds.includes(s.id)));
      createNewChat(user);
    } else {
      // Admin clear all
      fetch('/api/history', { method: 'DELETE' }).catch(() => {});
      setSessions([]);
      createNewChat(user);
    }
  };

  const handleAskInChatFromOtherView = (query: string) => {
    setActiveTab('chat');
    handleSendMessage(query);
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans">
      
      {/* Top Bar with Portal Role Switcher */}
      <div className="bg-slate-900 text-white px-4 py-1.5 border-b border-slate-800 flex items-center justify-between text-xs z-40 shrink-0">
        <div className="flex items-center gap-2">
          <span className="font-bold text-blue-400">DBMS AI Lab System</span>
          <span className="text-slate-500">•</span>
          <span className="text-slate-300">{courseInfo.code} - {courseInfo.name}</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Active user status & role indicator */}
          {user && (
            <div className="flex items-center gap-1.5 bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700">
              {user.role === 'admin' ? (
                <ShieldCheck className="w-3.5 h-3.5 text-purple-400 shrink-0" />
              ) : (
                <GraduationCap className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              )}
              <span className="font-bold text-white truncate max-w-[180px]">
                {user.name} {user.studentId && user.studentId !== 'CS2026-SUPABASE' ? `(${user.studentId})` : ''}
              </span>
              <span className={`px-1.5 py-0.2 rounded text-[10px] font-extrabold uppercase ${
                user.role === 'admin' ? 'bg-purple-900 text-purple-200' : 'bg-blue-900 text-blue-200'
              }`}>
                {user.role === 'admin' ? 'Teacher Admin' : 'Student'}
              </span>
            </div>
          )}

          {/* Logout / Switch Portal Button */}
          {user ? (
            <button
              onClick={handleLogoutUser}
              className="px-2.5 py-1 rounded-lg bg-red-600/80 hover:bg-red-600 text-white font-bold transition-colors flex items-center gap-1"
              title="Logout from Account"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          ) : (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold transition-colors flex items-center gap-1"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign In</span>
            </button>
          )}
        </div>
      </div>

      <Navbar
        activeTab={activeTab as any}
        setActiveTab={handleNavigateTab as any}
        onNewChat={() => createNewChat(user)}
        toggleSidebar={() => setIsSidebarOpen(prev => !prev)}
        chatTitle={currentSession?.title}
        user={user}
        courseInfo={courseInfo}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onLogout={handleLogoutUser}
      />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          activeTab={activeTab as any}
          setActiveTab={handleNavigateTab as any}
          sessions={visibleSessions}
          activeSessionId={activeSessionId}
          onSelectSession={(id) => setActiveSessionId(id)}
          onNewChat={() => createNewChat(user)}
          onDeleteSession={handleDeleteSession}
          onClearAllSessions={handleClearAllSessions}
          user={user}
          courseInfo={courseInfo}
        />

        <main className="flex-1 flex flex-col h-full overflow-hidden relative">
          
          {/* STUDENT DASHBOARD VIEW */}
          {activeTab === 'dashboard' && (
            <StudentDashboard
              user={user}
              syllabus={syllabus}
              courseInfo={courseInfo}
              onNavigate={(tab) => setActiveTab(tab as any)}
              onAskTopic={handleAskInChatFromOtherView}
            />
          )}

          {/* CHAT ASSISTANT VIEW */}
          {activeTab === 'chat' && (
            <ChatWindow
              messages={messages}
              isLoading={isLoading}
              onSendMessage={handleSendMessage}
              onClearMessages={handleClearCurrentMessages}
            />
          )}

          {/* LAB MANUAL VIEW */}
          {activeTab === 'experiments' && (
            <ExperimentsView onAskInChat={handleAskInChatFromOtherView} />
          )}

          {/* SYLLABUS VIEW */}
          {activeTab === 'about' && (
            <AboutView onAskTopic={handleAskInChatFromOtherView} />
          )}

          {/* ADMIN PORTAL VIEW */}
          {activeTab === 'admin' && (
            <AdminPortal
              user={user}
              courseInfo={courseInfo}
              onUpdateCourseInfo={setCourseInfo}
              allSessions={sessions}
              onDeleteStudentSession={handleDeleteSession}
            />
          )}

          {/* SETTINGS VIEW */}
          {activeTab === 'settings' && (
            <SettingsView
              settings={settings}
              onUpdateSettings={(newS) => setSettings(p => ({ ...p, ...newS }))}
              onClearHistory={handleClearAllSessions}
            />
          )}
        </main>
      </div>

      {/* Auth & RBAC Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={user}
        onLogin={handleLoginUser}
      />
    </div>
  );
}
