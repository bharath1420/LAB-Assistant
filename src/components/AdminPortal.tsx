import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldCheck, 
  Users, 
  FileText, 
  BookOpen, 
  FileCode2, 
  Upload, 
  Plus, 
  Edit3, 
  Trash2, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  MessageSquare,
  AlertCircle,
  BarChart3,
  Check,
  X,
  FileCheck2,
  FolderPlus,
  ListOrdered,
  Eye,
  Activity,
  Sparkles,
  Play,
  Server,
  Layers,
  Table,
  HelpCircle,
  RefreshCw,
  Settings
} from 'lucide-react';
import { 
  UserAccount, 
  UploadedDocument, 
  LabExperiment, 
  SyllabusUnit, 
  ActivityLog, 
  AdminStats,
  CourseInfo,
  ChatSession
} from '../types';

interface AdminPortalProps {
  user: UserAccount | null;
  courseInfo: CourseInfo;
  onUpdateCourseInfo: (info: CourseInfo) => void;
  allSessions?: ChatSession[];
  onDeleteStudentSession?: (id: string) => void;
  onRefreshData?: () => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({ 
  user, 
  courseInfo, 
  onUpdateCourseInfo, 
  allSessions = [], 
  onDeleteStudentSession, 
  onRefreshData 
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'course' | 'chat-history' | 'students' | 'syllabus' | 'experiments' | 'documents' | 'logs'>('overview');

  // Student Chat Histories state
  const [serverSessions, setServerSessions] = useState<ChatSession[]>([]);
  const [selectedStudentFilter, setSelectedStudentFilter] = useState<string>('all');
  const [historySearchQuery, setHistorySearchQuery] = useState<string>('');
  const [selectedChatSessionId, setSelectedChatSessionId] = useState<string | null>(null);

  const fetchChatHistories = async () => {
    try {
      const res = await fetch('/api/history');
      const data = await res.json();
      if (data.sessions && Array.isArray(data.sessions)) {
        setServerSessions(data.sessions);
      }
    } catch (err) {
      console.error('Failed to load student chat histories:', err);
    }
  };

  useEffect(() => {
    fetchChatHistories();
  }, [activeTab]);

  // Confirmation Modal State (replaces blocked native confirm dialogs)
  const [deleteConfirmTarget, setDeleteConfirmTarget] = useState<{
    type: 'student' | 'session' | 'document' | 'syllabus' | 'experiment';
    id: string | number;
    name: string;
  } | null>(null);

  const executeDelete = async () => {
    if (!deleteConfirmTarget) return;
    const { type, id } = deleteConfirmTarget;
    setDeleteConfirmTarget(null);

    try {
      if (type === 'student') {
        const studentIdStr = String(id);
        setStudents(prev => prev.filter(s => s.id !== studentIdStr));
        await fetch(`/api/admin/students/${studentIdStr}`, { method: 'DELETE' }).catch(() => {});
        await fetch(`/api/students/${studentIdStr}`, { method: 'DELETE' }).catch(() => {});
        fetchData();
        if (onRefreshData) onRefreshData();
      } else if (type === 'session') {
        const sessIdStr = String(id);
        setServerSessions(prev => prev.filter(s => s.id !== sessIdStr));
        if (onDeleteStudentSession) onDeleteStudentSession(sessIdStr);
        if (selectedChatSessionId === sessIdStr) {
          setSelectedChatSessionId(null);
        }
        await fetch(`/api/history?sessionId=${encodeURIComponent(sessIdStr)}`, {
          method: 'DELETE'
        }).catch(() => {});
        await fetchChatHistories();
      } else if (type === 'document') {
        const docIdStr = String(id);
        setDocuments(prev => prev.filter(d => d.id !== docIdStr));
        await fetch(`/api/documents/${docIdStr}`, { method: 'DELETE' }).catch(() => {});
        fetchData();
      } else if (type === 'syllabus') {
        const unitIdStr = String(id);
        setSyllabus(prev => prev.filter(u => u.id !== unitIdStr));
        await fetch(`/api/syllabus/${unitIdStr}`, { method: 'DELETE' }).catch(() => {});
        fetchData();
      } else if (type === 'experiment') {
        const expIdNum = Number(id);
        setExperiments(prev => prev.filter(e => e.id !== expIdNum));
        await fetch(`/api/experiments/${expIdNum}`, { method: 'DELETE' }).catch(() => {});
        fetchData();
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const handleAdminDeleteSession = (sessionId: string, sessionTitle?: string) => {
    setDeleteConfirmTarget({ type: 'session', id: sessionId, name: sessionTitle || 'Student Chat Session' });
  };

  // Combine prop allSessions and backend serverSessions
  const combinedSessionsMap = new Map<string, ChatSession>();
  serverSessions.forEach(s => combinedSessionsMap.set(s.id, s));
  allSessions.forEach(s => combinedSessionsMap.set(s.id, s));
  const displaySessions = Array.from(combinedSessionsMap.values());

  const filteredSessions = displaySessions.filter(s => {
    const matchesStudent = selectedStudentFilter === 'all' || s.userId === selectedStudentFilter || s.userEmail === selectedStudentFilter || s.studentId === selectedStudentFilter;
    const q = historySearchQuery.toLowerCase().trim();
    const matchesQuery = !q || 
      (s.title && s.title.toLowerCase().includes(q)) || 
      (s.userName && s.userName.toLowerCase().includes(q)) || 
      (s.studentId && s.studentId.toLowerCase().includes(q)) ||
      (s.messages && s.messages.some(m => m.content && m.content.toLowerCase().includes(q)));
    return matchesStudent && matchesQuery;
  });

  const activeSelectedSession = displaySessions.find(s => s.id === selectedChatSessionId) || (filteredSessions.length > 0 ? filteredSessions[0] : null);

  // Course Customization state
  const [cCode, setCCode] = useState(courseInfo?.code || 'CS3492');
  const [cName, setCName] = useState(courseInfo?.name || 'Database Management Systems Laboratory');
  const [cDept, setCDept] = useState(courseInfo?.department || 'Computer Science & Engineering');
  const [cReg, setCReg] = useState(courseInfo?.regulation || '2021 Regulation');
  const [cInstructor, setCInstructor] = useState(courseInfo?.instructor || 'Prof. S. Ramanujam');
  const [cAnnouncement, setCAnnouncement] = useState(courseInfo?.announcement || 'Welcome to CS3492 DBMS Lab Course. Complete Experiments 1 to 10 & refer to the uploaded lab manuals.');
  const [cSemester, setCSemester] = useState(courseInfo?.semester || 'Semester IV');
  const [savingCourse, setSavingCourse] = useState(false);
  const [courseSaveSuccess, setCourseSaveSuccess] = useState('');
  const [courseSaveError, setCourseSaveError] = useState('');

  useEffect(() => {
    if (courseInfo) {
      setCCode(courseInfo.code);
      setCName(courseInfo.name);
      setCDept(courseInfo.department);
      setCReg(courseInfo.regulation);
      setCInstructor(courseInfo.instructor);
      setCAnnouncement(courseInfo.announcement);
      setCSemester(courseInfo.semester);
    }
  }, [courseInfo]);

  const handleSaveCourseInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingCourse(true);
    setCourseSaveSuccess('');
    setCourseSaveError('');

    try {
      const res = await fetch('/api/course-info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: cCode,
          name: cName,
          department: cDept,
          regulation: cReg,
          instructor: cInstructor,
          announcement: cAnnouncement,
          semester: cSemester
        })
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        setCourseSaveError(data.error || 'Failed to save course settings');
      } else {
        setCourseSaveSuccess('Course details updated successfully!');
        if (data.courseInfo) {
          onUpdateCourseInfo(data.courseInfo);
        }
        setTimeout(() => setCourseSaveSuccess(''), 3000);
      }
    } catch (err) {
      setCourseSaveError('Connection error while saving course settings');
    } finally {
      setSavingCourse(false);
    }
  };

  // Stats state
  const [stats, setStats] = useState<AdminStats>({
    totalStudents: 0,
    activeStudents: 0,
    totalChats: 0,
    uploadedDocuments: 0,
    totalExperiments: 10
  });



  // Students monitoring state
  const [students, setStudents] = useState<UserAccount[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Add Student by Admin state
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [newStdName, setNewStdName] = useState('');
  const [newStdEmail, setNewStdEmail] = useState('');
  const [newStdPassword, setNewStdPassword] = useState('');
  const [newStdRollNo, setNewStdRollNo] = useState('');
  const [newStdDept, setNewStdDept] = useState('Computer Science & Eng');
  const [addStdLoading, setAddStdLoading] = useState(false);
  const [addStdError, setAddStdError] = useState('');
  const [addStdSuccess, setAddStdSuccess] = useState('');

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddStdError('');
    setAddStdSuccess('');
    setAddStdLoading(true);

    try {
      const res = await fetch('/api/admin/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newStdName,
          email: newStdEmail,
          password: newStdPassword,
          studentId: newStdRollNo,
          department: newStdDept
        })
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        setAddStdError(data.error || 'Failed to add student');
      } else {
        setAddStdSuccess(`Student ${newStdName} (${newStdRollNo}) added successfully!`);
        setStudents(prev => [data.student, ...prev]);
        setNewStdName('');
        setNewStdEmail('');
        setNewStdPassword('');
        setNewStdRollNo('');
        fetchData();
        setTimeout(() => {
          setShowAddStudentModal(false);
          setAddStdSuccess('');
        }, 1200);
      }
    } catch (err) {
      setAddStdError('Connection error while adding student.');
    } finally {
      setAddStdLoading(false);
    }
  };

  const handleDeleteStudent = (id: string, name: string) => {
    setDeleteConfirmTarget({ type: 'student', id, name: name || 'Student Account' });
  };

  // Documents state
  const [documents, setDocuments] = useState<UploadedDocument[]>([]);
  const [docName, setDocName] = useState('');
  const [docCategory, setDocCategory] = useState('Official Lab Notes');
  const [docContent, setDocContent] = useState('');
  const [docDescription, setDocDescription] = useState('');
  const [docType, setDocType] = useState<'pdf' | 'docx' | 'txt'>('pdf');
  const [docUploading, setDocUploading] = useState(false);
  const [docSuccessMsg, setDocSuccessMsg] = useState('');
  const [selectedDocFile, setSelectedDocFile] = useState<{ name: string; base64: string; fileType: string; size?: string } | null>(null);
  const docFileInputRef = useRef<HTMLInputElement>(null);

  // Syllabus state
  const [syllabus, setSyllabus] = useState<SyllabusUnit[]>([]);
  const [showAddUnitModal, setShowAddUnitModal] = useState(false);
  const [newUnitTitle, setNewUnitTitle] = useState('');
  const [newUnitDesc, setNewUnitDesc] = useState('');
  const [newUnitTopics, setNewUnitTopics] = useState('');

  // Experiments state & Customization
  const [experiments, setExperiments] = useState<LabExperiment[]>([]);
  const [expSearchQuery, setExpSearchQuery] = useState('');
  const [expCategoryFilter, setExpCategoryFilter] = useState('all');
  const [showAddExpModal, setShowAddExpModal] = useState(false);
  
  // New Exp states
  const [expTitle, setExpTitle] = useState('');
  const [expCategory, setExpCategory] = useState('SQL Practical');
  const [expAim, setExpAim] = useState('');
  const [expTheory, setExpTheory] = useState('');
  const [expAlgorithm, setExpAlgorithm] = useState('');
  const [expSqlCode, setExpSqlCode] = useState('');
  const [expResult, setExpResult] = useState('');

  // Customize/Edit Existing Exp states
  const [editingExp, setEditingExp] = useState<LabExperiment | null>(null);
  const [showEditExpModal, setShowEditExpModal] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editAim, setEditAim] = useState('');
  const [editTheory, setEditTheory] = useState('');
  const [editAlgorithm, setEditAlgorithm] = useState('');
  const [editProcedureText, setEditProcedureText] = useState('');
  const [editSqlCode, setEditSqlCode] = useState('');
  const [editColumnsText, setEditColumnsText] = useState('');
  const [editRowsText, setEditRowsText] = useState('');
  const [editResult, setEditResult] = useState('');
  const [editVivaList, setEditVivaList] = useState<{ question: string; answer: string }[]>([]);
  const [editTipsText, setEditTipsText] = useState('');

  // Activity logs state
  const [logs, setLogs] = useState<ActivityLog[]>([]);

  // Fetch initial data
  const fetchData = async () => {
    try {
      const [statsRes, studentsRes, docsRes, syllabusRes, expsRes, logsRes] = await Promise.all([
        fetch('/api/admin/stats').then(r => r.json()),
        fetch('/api/students').then(r => r.json()),
        fetch('/api/documents').then(r => r.json()),
        fetch('/api/syllabus').then(r => r.json()),
        fetch('/api/experiments').then(r => r.json()),
        fetch('/api/activity-logs').then(r => r.json())
      ]);

      if (statsRes) setStats(statsRes);
      if (studentsRes.students) setStudents(studentsRes.students);
      if (docsRes.documents) setDocuments(docsRes.documents);
      if (syllabusRes.syllabus) setSyllabus(syllabusRes.syllabus);
      if (expsRes.experiments) setExperiments(expsRes.experiments);
      if (logsRes.logs) setLogs(logsRes.logs);
    } catch (err) {
      console.error('Failed to fetch admin data:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filtered students
  const filteredStudents = students.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (s.studentId && s.studentId.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleDocFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      const normalizedType = (file.type || file.name.split('.').pop() || 'txt').toLowerCase();
      const type = normalizedType.includes('pdf') ? 'pdf' : normalizedType.includes('docx') || normalizedType.includes('word') ? 'docx' : 'txt';
      setDocType(type as 'pdf' | 'docx' | 'txt');
      setSelectedDocFile({
        name: file.name,
        base64,
        fileType: normalizedType,
        size: `${Math.max(1, Math.round(file.size / 1024))} KB`
      });
      setDocName(file.name.replace(/\s+/g, '_'));
      if (!docDescription.trim()) {
        setDocDescription(`Uploaded ${file.name}`);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveSelectedDocFile = () => {
    setSelectedDocFile(null);
    setDocName('');
    setDocContent('');
    setDocDescription('');
    if (docFileInputRef.current) docFileInputRef.current.value = '';
  };

  // Handle Document Upload
  const handleUploadDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docName.trim()) return;

    setDocUploading(true);
    try {
      const res = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: docName.trim().endsWith(`.${docType}`) ? docName.trim() : `${docName.trim()}.${docType}`,
          fileType: docType,
          size: selectedDocFile?.size || `${Math.round((docContent.length || 1) / 1024 * 10) / 10 + 0.5} KB`,
          uploadedBy: user ? user.name : 'Admin Faculty',
          category: docCategory,
          content: docContent.trim(),
          description: docDescription.trim() || 'Uploaded course document for student AI assistant.',
          fileName: selectedDocFile?.name || docName.trim(),
          base64Content: selectedDocFile?.base64 ? selectedDocFile.base64.split(',')[1] : undefined
        })
      });

      const data = await res.json();
      if (data.success) {
        setDocuments(prev => [data.document, ...prev]);
        setDocName('');
        setDocContent('');
        setDocDescription('');
        setSelectedDocFile(null);
        setDocSuccessMsg('Document successfully uploaded & indexed into AI knowledge base!');
        setTimeout(() => setDocSuccessMsg(''), 4000);
        fetchData();
      }
    } catch (err) {
      console.error('Upload document error:', err);
    } finally {
      setDocUploading(false);
    }
  };

  // Delete document
  const handleDeleteDocument = (id: string, docName?: string) => {
    setDeleteConfirmTarget({ type: 'document', id, name: docName || 'Uploaded Document' });
  };

  // Toggle Syllabus Unit completed
  const handleToggleUnitCompleted = async (unit: SyllabusUnit) => {
    const updated = !unit.isCompleted;
    await fetch(`/api/syllabus/${unit.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isCompleted: updated })
    });
    setSyllabus(prev => prev.map(u => u.id === unit.id ? { ...u, isCompleted: updated } : u));
  };

  // Add new syllabus unit
  const handleAddSyllabusUnit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUnitTitle.trim()) return;

    const topicsArr = newUnitTopics.split(',').map(t => t.trim()).filter(Boolean);

    const res = await fetch('/api/syllabus', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        unitNumber: syllabus.length + 1,
        title: newUnitTitle,
        description: newUnitDesc || 'Academic unit covering fundamental database concepts.',
        topics: topicsArr.length > 0 ? topicsArr : ['Topic 1', 'Topic 2']
      })
    });

    const data = await res.json();
    if (data.success) {
      setSyllabus(prev => [...prev, data.unit]);
      setNewUnitTitle('');
      setNewUnitDesc('');
      setNewUnitTopics('');
      setShowAddUnitModal(false);
    }
  };

  // Delete syllabus unit
  const handleDeleteUnit = (id: string, unitTitle?: string) => {
    setDeleteConfirmTarget({ type: 'syllabus', id, name: unitTitle || 'Syllabus Unit' });
  };

  // Add new Lab Experiment
  const handleAddExperiment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expTitle.trim() || !expAim.trim()) return;

    const res = await fetch('/api/experiments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: experiments.length + 1,
        title: expTitle,
        category: expCategory,
        aim: expAim,
        theory: expTheory || 'Theoretical concepts for ' + expTitle,
        algorithm: expAlgorithm || '1. Connect to database\n2. Execute SQL query\n3. Verify results',
        procedure: ['Step 1: Open SQL client', 'Step 2: Enter query code', 'Step 3: Execute and capture output'],
        sqlCode: expSqlCode || '-- SQL Query\nSELECT * FROM Student;',
        expectedOutput: { columns: ['ID', 'NAME'], rows: [[1, 'Sample Data']] },
        result: expResult || 'Experiment completed successfully.',
        vivaQuestions: [{ question: 'What is the objective of this lab?', answer: expAim }],
        tips: ['Always verify table foreign keys first.']
      })
    });

    const data = await res.json();
    if (data.success) {
      setExperiments(prev => [...prev, data.experiment]);
      setExpTitle('');
      setExpAim('');
      setExpTheory('');
      setExpAlgorithm('');
      setExpSqlCode('');
      setShowAddExpModal(false);
    }
  };

  // Delete experiment
  const handleDeleteExperiment = (id: number, title?: string) => {
    setDeleteConfirmTarget({ type: 'experiment', id, name: title || `Experiment ${id}` });
  };

  // Open Experiment Customizer Modal
  const startEditExperiment = (exp: LabExperiment) => {
    setEditingExp(exp);
    setEditTitle(exp.title);
    setEditCategory(exp.category);
    setEditAim(exp.aim);
    setEditTheory(exp.theory || '');
    setEditAlgorithm(exp.algorithm || '');
    setEditProcedureText(exp.procedure ? exp.procedure.join('\n') : '');
    setEditSqlCode(exp.sqlCode || '');
    setEditColumnsText(exp.expectedOutput?.columns ? exp.expectedOutput.columns.join(', ') : '');
    setEditRowsText(exp.expectedOutput?.rows ? exp.expectedOutput.rows.map(r => r.join(', ')).join('\n') : '');
    setEditResult(exp.result || '');
    setEditVivaList(exp.vivaQuestions ? [...exp.vivaQuestions] : []);
    setEditTipsText(exp.tips ? exp.tips.join('\n') : '');
    setShowEditExpModal(true);
  };

  // Save Customized Experiment via PUT /api/experiments/:id
  const handleSaveEditedExperiment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingExp) return;

    const columnsArr = editColumnsText.split(',').map(c => c.trim()).filter(Boolean);
    const rowsArr = editRowsText.split('\n').map(rowStr => rowStr.split(',').map(cell => cell.trim())).filter(row => row.some(Boolean));
    const procedureArr = editProcedureText.split('\n').map(p => p.trim()).filter(Boolean);
    const tipsArr = editTipsText.split('\n').map(t => t.trim()).filter(Boolean);

    const updatedPayload: Partial<LabExperiment> = {
      title: editTitle,
      category: editCategory,
      aim: editAim,
      theory: editTheory,
      algorithm: editAlgorithm,
      procedure: procedureArr.length > 0 ? procedureArr : editingExp.procedure,
      sqlCode: editSqlCode,
      expectedOutput: {
        columns: columnsArr.length > 0 ? columnsArr : ['COLUMN_1'],
        rows: rowsArr.length > 0 ? rowsArr : [['DATA_1']]
      },
      result: editResult,
      vivaQuestions: editVivaList,
      tips: tipsArr
    };

    try {
      const res = await fetch(`/api/experiments/${editingExp.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedPayload)
      });
      const data = await res.json();
      if (data.success) {
        setExperiments(prev => prev.map(e => e.id === editingExp.id ? { ...e, ...updatedPayload } : e));
        setShowEditExpModal(false);
        setEditingExp(null);
      }
    } catch (err) {
      console.error('Failed to update experiment:', err);
    }
  };

  // Viva question editing helpers
  const handleAddVivaQuestion = () => {
    setEditVivaList(prev => [...prev, { question: 'New Viva Question?', answer: 'Answer here.' }]);
  };

  const handleUpdateVivaQuestion = (index: number, field: 'question' | 'answer', value: string) => {
    setEditVivaList(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleRemoveVivaQuestion = (index: number) => {
    setEditVivaList(prev => prev.filter((_, i) => i !== index));
  };



  return (
    <div className="flex-1 overflow-y-auto bg-slate-50/70 dark:bg-slate-950/70 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Banner Header */}
        <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-800 via-purple-700 to-indigo-800 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-xs text-xs font-bold uppercase tracking-wider text-purple-100 mb-2">
                <ShieldCheck className="w-4 h-4 text-purple-200" />
                Teacher & Admin Control Portal
              </div>
              <h1 className="text-2xl sm:text-3xl font-black">
                DBMS Department Administration
              </h1>
              <p className="text-xs text-purple-100 mt-1">
                Monitor student activity, upload lab documents, edit syllabus units & manage lab experiments.
              </p>
            </div>

            <div className="flex items-center gap-2 bg-white/10 p-2 rounded-2xl backdrop-blur-xs text-xs">
              <span className="font-semibold text-purple-200">Logged in as:</span>
              <span className="font-bold text-white bg-purple-900/60 px-2.5 py-1 rounded-xl">
                {user ? user.name : 'Prof. Ramanujam'}
              </span>
            </div>
          </div>
        </div>

        {/* Portal Tabs Navigation */}
        <div className="flex overflow-x-auto gap-2 p-1.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs text-xs font-bold no-scrollbar">
          {[
            { id: 'overview', label: 'Dashboard Overview', icon: BarChart3 },
            { id: 'chat-history', label: 'Student Chat Oversight', icon: MessageSquare, badge: displaySessions.length },
            { id: 'course', label: 'CS3492 Course Settings', icon: Settings },
            { id: 'students', label: 'Student Monitoring', icon: Users, badge: students.length },
            { id: 'syllabus', label: 'Syllabus Manager', icon: BookOpen },
            { id: 'experiments', label: 'Experiment Manager & Customizer', icon: FileCode2, badge: experiments.length },
            { id: 'documents', label: 'Document Upload (RAG)', icon: Upload, badge: documents.length },

            { id: 'logs', label: 'Activity Logs', icon: Activity }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                    isActive ? 'bg-purple-800 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* TAB: STUDENT CHAT OVERSIGHT (ADMIN ONLY) */}
        {activeTab === 'chat-history' && (
          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-slate-900 dark:text-white">
                      Student Chat History Oversight
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      View all students' AI Assistant conversations, questions, attached diagrams, and AI answers.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={fetchChatHistories}
                    className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Refresh History</span>
                  </button>
                  <span className="px-3 py-1.5 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 text-xs font-extrabold border border-purple-200 dark:border-purple-800">
                    🔒 Admin Access Only
                  </span>
                </div>
              </div>

              {/* Filters & Search */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 text-xs">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                    Filter by Student:
                  </label>
                  <select
                    value={selectedStudentFilter}
                    onChange={(e) => setSelectedStudentFilter(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-semibold outline-none focus:ring-2 focus:ring-purple-500/20"
                  >
                    <option value="all">All Enrolled Students ({displaySessions.length} total sessions)</option>
                    {students.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.studentId || s.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                    Search Question / Keyword:
                  </label>
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      value={historySearchQuery}
                      onChange={(e) => setHistorySearchQuery(e.target.value)}
                      placeholder="Search DBMS topic, SQL code, or student question..."
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-purple-500/20"
                    />
                  </div>
                </div>
              </div>

              {/* Master-Detail Split Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[480px]">
                {/* Left List of Student Sessions */}
                <div className="lg:col-span-5 space-y-3 max-h-[560px] overflow-y-auto pr-1">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Student Chat Sessions ({filteredSessions.length})
                  </h3>

                  {filteredSessions.length === 0 ? (
                    <div className="p-8 text-center rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 text-slate-500 text-xs">
                      No chat sessions found for this filter.
                    </div>
                  ) : (
                    filteredSessions.map((sess) => {
                      const isSelected = activeSelectedSession?.id === sess.id;
                      const msgCount = sess.messages ? sess.messages.length : 0;
                      return (
                        <div
                          key={sess.id}
                          onClick={() => setSelectedChatSessionId(sess.id)}
                          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-purple-50/80 dark:bg-purple-950/40 border-purple-300 dark:border-purple-800 shadow-xs'
                              : 'bg-white dark:bg-slate-950/60 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2 mb-1.5">
                            <div className="flex items-center gap-2">
                              <span className="w-6 h-6 rounded-full bg-purple-200 dark:bg-purple-900 text-purple-800 dark:text-purple-200 text-[10px] font-extrabold flex items-center justify-center shrink-0">
                                {sess.userName ? sess.userName.charAt(0).toUpperCase() : 'S'}
                              </span>
                              <div>
                                <h4 className="font-bold text-xs text-slate-900 dark:text-white leading-tight">
                                  {sess.userName || 'Student'}
                                </h4>
                                <span className="text-[10px] text-purple-600 dark:text-purple-400 font-bold">
                                  {sess.studentId ? `Roll No: ${sess.studentId}` : (sess.userEmail || 'Student Session')}
                                </span>
                              </div>
                            </div>

                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold shrink-0">
                              {msgCount} messages
                            </span>
                          </div>

                          <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 line-clamp-1 mb-1.5">
                            {sess.title}
                          </p>

                          <div className="flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500 border-t border-slate-100 dark:border-slate-900 pt-2 mt-1">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(sess.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAdminDeleteSession(sess.id);
                              }}
                              className="text-slate-400 hover:text-red-500 p-2 rounded-lg transition-colors bg-slate-50 dark:bg-slate-950/80 hover:bg-red-50 dark:hover:bg-red-950/80"
                              title="Delete Student Chat History"
                              aria-label="Delete Student Chat History"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Right Transcript Inspection View */}
                <div className="lg:col-span-7 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 p-4 flex flex-col h-[560px]">
                  {activeSelectedSession ? (
                    <>
                      {/* Session Top Header */}
                      <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 mb-3 shadow-xs flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-black text-sm text-slate-900 dark:text-white">
                              {activeSelectedSession.userName || 'Student'}
                            </span>
                            <span className="px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 text-[10px] font-mono font-bold">
                              {activeSelectedSession.studentId || activeSelectedSession.userEmail || 'Roll No: N/A'}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                            Topic: <span className="font-semibold text-slate-800 dark:text-slate-200">{activeSelectedSession.title}</span>
                          </p>
                        </div>

                        <button
                          onClick={() => handleAdminDeleteSession(activeSelectedSession.id)}
                          className="px-3 py-1.5 rounded-xl bg-red-50 dark:bg-red-950/60 hover:bg-red-100 text-red-600 dark:text-red-400 text-xs font-bold border border-red-200 dark:border-red-900 transition-colors flex items-center gap-1.5 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete Session</span>
                        </button>
                      </div>

                      {/* Messages Thread Transcript */}
                      <div className="flex-1 overflow-y-auto space-y-3 pr-2 text-xs">
                        {activeSelectedSession.messages && activeSelectedSession.messages.length > 0 ? (
                          activeSelectedSession.messages.map((m) => (
                            <div
                              key={m.id}
                              className={`p-3.5 rounded-2xl border ${
                                m.role === 'user'
                                  ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900/60 text-slate-900 dark:text-slate-100 ml-6'
                                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 mr-6'
                              }`}
                            >
                              <div className="flex items-center justify-between gap-2 mb-1 border-b border-slate-100 dark:border-slate-800/60 pb-1">
                                <span className={`font-bold text-[11px] ${m.role === 'user' ? 'text-blue-700 dark:text-blue-300' : 'text-purple-600 dark:text-purple-400'}`}>
                                  {m.role === 'user' ? `🙋‍♂️ Student (${activeSelectedSession.userName || 'User'})` : '🤖 AI Lab Assistant'}
                                </span>
                                <span className="text-[10px] text-slate-400 font-mono">
                                  {new Date(m.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>

                              {m.imageUrl && (
                                <div className="mb-2">
                                  <img src={m.imageUrl} alt="Uploaded Diagram" className="max-h-40 rounded-lg border border-slate-300 dark:border-slate-700" />
                                </div>
                              )}

                              <div className="whitespace-pre-wrap font-sans leading-relaxed">
                                {m.content || (m.role === 'assistant' ? 'Generating answer...' : '')}
                              </div>

                              {m.sourceDoc && (
                                <div className="mt-2 text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                                  <FileText className="w-3 h-3" />
                                  <span>Cited Reference: {m.sourceDoc}</span>
                                </div>
                              )}
                            </div>
                          ))
                        ) : (
                          <div className="p-8 text-center text-slate-400">
                            No messages recorded in this chat session.
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 dark:text-slate-500 space-y-2">
                      <MessageSquare className="w-10 h-10 text-slate-300 dark:text-slate-700" />
                      <p className="font-bold text-xs text-slate-600 dark:text-slate-400">
                        Select a student chat session from the left list
                      </p>
                      <p className="text-[11px] max-w-xs">
                        Admin faculty can inspect full question and answer transcripts for any student in the DBMS course.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB: COURSE CUSTOMIZATION (ADMIN ONLY EDITABLE) */}
        {activeTab === 'course' && (
          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
              <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
                    <Settings className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-slate-900 dark:text-white">
                      Course Customization & Regulations
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Customize course details like Code, Subject Name, Department, and Lab Announcements. Students view these in real-time.
                    </p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 text-xs font-extrabold border border-purple-200 dark:border-purple-800">
                  🔒 Faculty Admin Control
                </span>
              </div>

              {courseSaveSuccess && (
                <div className="mb-4 p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{courseSaveSuccess}</span>
                </div>
              )}

              {courseSaveError && (
                <div className="mb-4 p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{courseSaveError}</span>
                </div>
              )}

              <form onSubmit={handleSaveCourseInfo} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                      Course Code <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={cCode}
                      onChange={e => setCCode(e.target.value)}
                      placeholder="e.g. CS3492"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-mono font-bold focus:ring-2 focus:ring-purple-500/20 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                      Subject / Course Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={cName}
                      onChange={e => setCName(e.target.value)}
                      placeholder="e.g. Database Management Systems Laboratory"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-purple-500/20 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                      Academic Department
                    </label>
                    <input
                      type="text"
                      value={cDept}
                      onChange={e => setCDept(e.target.value)}
                      placeholder="e.g. Computer Science & Engineering"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500/20 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                      Academic Regulation
                    </label>
                    <input
                      type="text"
                      value={cReg}
                      onChange={e => setCReg(e.target.value)}
                      placeholder="e.g. 2021 Regulation"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500/20 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                      Faculty / Course Coordinator
                    </label>
                    <input
                      type="text"
                      value={cInstructor}
                      onChange={e => setCInstructor(e.target.value)}
                      placeholder="e.g. Prof. S. Ramanujam"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500/20 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                      Semester
                    </label>
                    <input
                      type="text"
                      value={cSemester}
                      onChange={e => setCSemester(e.target.value)}
                      placeholder="e.g. Semester IV"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500/20 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                    Student Notice Board / Lab Announcement
                  </label>
                  <textarea
                    rows={3}
                    value={cAnnouncement}
                    onChange={e => setCAnnouncement(e.target.value)}
                    placeholder="Enter announcement or special instructions for students..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500/20 outline-none"
                  />
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={savingCourse}
                    className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold shadow-md transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{savingCourse ? 'Saving Course...' : 'Save & Broadcast Course Details'}</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Live Student View Preview */}
            <div className="p-6 rounded-3xl bg-slate-900 text-white space-y-3 shadow-lg border border-slate-800">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-400 bg-purple-950 px-2.5 py-1 rounded-full border border-purple-800">
                Live Student Portal Header Preview
              </span>
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-white/20 text-xs font-bold uppercase">
                  Subject: {cCode} - {cName}
                </span>
                <span className="px-3 py-1 rounded-full bg-blue-900/60 text-blue-200 text-xs font-semibold">
                  {cDept} ({cReg})
                </span>
              </div>
              <p className="text-xs text-slate-300 italic">
                📢 Notice to Enrolled Students: "{cAnnouncement}"
              </p>
            </div>
          </div>
        )}

        {/* TAB 1: OVERVIEW & METRICS */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-1">
                <div className="flex items-center justify-between text-slate-500">
                  <span className="text-xs font-bold uppercase tracking-wider">Total Students</span>
                  <Users className="w-4 h-4 text-blue-500" />
                </div>
                <div className="text-2xl font-black text-slate-900 dark:text-white">
                  {stats.totalStudents}
                </div>
                <span className="text-[11px] text-emerald-600 font-semibold">Enrolled in CS3492</span>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-1">
                <div className="flex items-center justify-between text-slate-500">
                  <span className="text-xs font-bold uppercase tracking-wider">Active Students</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                </div>
                <div className="text-2xl font-black text-slate-900 dark:text-white">
                  {stats.activeStudents}
                </div>
                <span className="text-[11px] text-slate-500">Logged in recently</span>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-1">
                <div className="flex items-center justify-between text-slate-500">
                  <span className="text-xs font-bold uppercase tracking-wider">Total AI Chats</span>
                  <MessageSquare className="w-4 h-4 text-purple-500" />
                </div>
                <div className="text-2xl font-black text-slate-900 dark:text-white">
                  {stats.totalChats}
                </div>
                <span className="text-[11px] text-purple-600 font-semibold">DBMS queries answered</span>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-1">
                <div className="flex items-center justify-between text-slate-500">
                  <span className="text-xs font-bold uppercase tracking-wider">Uploaded Docs</span>
                  <FileText className="w-4 h-4 text-amber-500" />
                </div>
                <div className="text-2xl font-black text-slate-900 dark:text-white">
                  {stats.uploadedDocuments}
                </div>
                <span className="text-[11px] text-amber-600 font-semibold">AI RAG reference files</span>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-1">
                <div className="flex items-center justify-between text-slate-500">
                  <span className="text-xs font-bold uppercase tracking-wider">Lab Experiments</span>
                  <FileCode2 className="w-4 h-4 text-indigo-500" />
                </div>
                <div className="text-2xl font-black text-slate-900 dark:text-white">
                  {stats.totalExperiments}
                </div>
                <span className="text-[11px] text-indigo-600 font-semibold">Experiments 1-10</span>
              </div>
            </div>

            {/* Quick Actions Shortcuts */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Admin Quick Management Actions
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <button
                  onClick={() => setActiveTab('documents')}
                  className="p-4 rounded-xl bg-purple-50 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-800 text-purple-900 dark:text-purple-200 font-bold hover:bg-purple-100 transition-colors flex items-center gap-3"
                >
                  <Upload className="w-5 h-5 text-purple-600 shrink-0" />
                  <div className="text-left">
                    <span>Upload Study Document</span>
                    <span className="block text-[11px] font-normal text-purple-700 dark:text-purple-300">
                      Add PDF/DOCX to AI knowledge base
                    </span>
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab('syllabus')}
                  className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-200 font-bold hover:bg-blue-100 transition-colors flex items-center gap-3"
                >
                  <BookOpen className="w-5 h-5 text-blue-600 shrink-0" />
                  <div className="text-left">
                    <span>Manage Syllabus Units</span>
                    <span className="block text-[11px] font-normal text-blue-700 dark:text-blue-300">
                      Add units & mark completion
                    </span>
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab('experiments')}
                  className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 font-bold hover:bg-emerald-100 transition-colors flex items-center gap-3"
                >
                  <FileCode2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div className="text-left">
                    <span>Manage Lab Experiments</span>
                    <span className="block text-[11px] font-normal text-emerald-700 dark:text-emerald-300">
                      Add or edit SQL code & viva Qs
                    </span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: STUDENT MONITORING */}
        {activeTab === 'students' && (
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>Student Enrolled List & Management</span>
                  <span className="px-2 py-0.5 rounded-md bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 text-xs">
                    {filteredStudents.length} enrolled
                  </span>
                </h2>
                <p className="text-xs text-slate-500">
                  Add new student accounts with Roll No & Password, track activity logs, and manage logins.
                </p>
              </div>

              {/* Add Student & Search Controls */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setShowAddStudentModal(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Student</span>
                </button>

                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search name, email, ID..."
                    className="pl-9 pr-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value as any)}
                  className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active Only</option>
                  <option value="inactive">Inactive Only</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider font-bold bg-slate-50 dark:bg-slate-950">
                    <th className="py-3 px-4">Student Name</th>
                    <th className="py-3 px-4">Register / Roll No</th>
                    <th className="py-3 px-4">Department</th>
                    <th className="py-3 px-4">Login Time</th>
                    <th className="py-3 px-4">Last Active</th>
                    <th className="py-3 px-4">AI Chat Count</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredStudents.map((std) => (
                    <tr key={std.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                        {std.name}
                        <span className="block text-[11px] font-normal text-slate-500 dark:text-slate-400">
                          {std.email}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-purple-600 dark:text-purple-400">
                        {std.studentId || 'N/A'}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">
                        {std.department || 'Computer Science'}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">
                        {new Date(std.loginTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">
                        {new Date(std.lastActive).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-700 dark:text-slate-300">
                        {std.chatCount} queries
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold capitalize ${
                          std.status === 'active'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                        }`}>
                          {std.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleDeleteStudent(std.id, std.name)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-lg transition-colors"
                          title="Remove Student"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: SYLLABUS MANAGEMENT */}
        {activeTab === 'syllabus' && (
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Syllabus Units Management
                </h2>
                <p className="text-xs text-slate-500">
                  Add, edit, reorder units, or mark unit completion status for students.
                </p>
              </div>

              <button
                onClick={() => setShowAddUnitModal(true)}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Syllabus Unit</span>
              </button>
            </div>

            <div className="space-y-3">
              {syllabus.map((unit) => (
                <div key={unit.id || unit.unitNumber} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1 max-w-2xl">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-md bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 text-xs flex items-center justify-center font-extrabold">
                        {unit.unitNumber}
                      </span>
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                        {unit.title}
                      </h3>
                      {unit.isCompleted && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-bold">
                          Completed
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      {unit.description}
                    </p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {unit.topics.map((t, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-300">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleToggleUnitCompleted(unit)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                        unit.isCompleted
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 hover:bg-emerald-50 hover:text-emerald-600'
                      }`}
                    >
                      {unit.isCompleted ? 'Mark Pending' : 'Mark Complete'}
                    </button>
                    <button
                      onClick={() => handleDeleteUnit(unit.id)}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors"
                      title="Delete Unit"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: EXPERIMENT MANAGEMENT & CUSTOMIZER */}
        {activeTab === 'experiments' && (
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    Practical Lab Experiments Manager & Customizer
                  </h2>
                  <span className="px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 text-[10px] font-extrabold">
                    Full CRUD
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Customize lab experiments, SQL queries, step-by-step algorithms, expected table outputs, and viva questions.
                </p>
              </div>

              <button
                onClick={() => setShowAddExpModal(true)}
                className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-2 shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Add Custom Experiment</span>
              </button>
            </div>

            {/* Search and Category Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-3 text-xs">
              <div className="flex-1 relative">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={expSearchQuery}
                  onChange={e => setExpSearchQuery(e.target.value)}
                  placeholder="Search experiments by title, aim, or category..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-slate-400" />
                <select
                  value={expCategoryFilter}
                  onChange={e => setExpCategoryFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none font-medium"
                >
                  <option value="all">All Categories</option>
                  <option value="DDL Commands">DDL Commands</option>
                  <option value="DML Commands">DML Commands</option>
                  <option value="SQL Joins">SQL Joins</option>
                  <option value="Aggregate Functions">Aggregate Functions</option>
                  <option value="Subqueries">Subqueries</option>
                  <option value="Views & Triggers">Views & Triggers</option>
                  <option value="PL/SQL & Procedures">PL/SQL & Procedures</option>
                  <option value="Normalization">Normalization</option>
                  <option value="Transactions">Transactions</option>
                  <option value="JDBC Connectivity">JDBC Connectivity</option>
                </select>
              </div>
            </div>

            {/* Experiments List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {experiments
                .filter(exp => {
                  const matchSearch = exp.title.toLowerCase().includes(expSearchQuery.toLowerCase()) ||
                                      exp.aim.toLowerCase().includes(expSearchQuery.toLowerCase()) ||
                                      exp.category.toLowerCase().includes(expSearchQuery.toLowerCase());
                  const matchCat = expCategoryFilter === 'all' || exp.category.toLowerCase() === expCategoryFilter.toLowerCase();
                  return matchSearch && matchCat;
                })
                .map((exp) => (
                  <div key={exp.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 space-y-3 relative group hover:border-purple-300 dark:hover:border-purple-900 transition-all shadow-2xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-purple-600 text-white font-extrabold text-xs flex items-center justify-center">
                          {exp.id}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 text-[10px] font-bold uppercase">
                          {exp.category}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => startEditExperiment(exp)}
                          className="px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-[11px] font-bold transition-colors flex items-center gap-1"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Customize</span>
                        </button>

                        <button
                          onClick={() => handleDeleteExperiment(exp.id)}
                          className="p-1 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/60 transition-colors"
                          title="Delete Experiment"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                        {exp.title}
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">
                        <strong>Aim:</strong> {exp.aim}
                      </p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-900 font-mono text-[11px] text-emerald-400 overflow-x-auto max-h-24 leading-relaxed">
                      <code>{exp.sqlCode}</code>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200/60 dark:border-slate-800">
                      <span>Viva Qs: <strong>{exp.vivaQuestions?.length || 0}</strong></span>
                      <span>Output cols: <strong>{exp.expectedOutput?.columns?.length || 0}</strong></span>
                      <span>Steps: <strong>{exp.procedure?.length || 0}</strong></span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}




        {/* TAB 5: DOCUMENT UPLOAD (RAG) */}
        {activeTab === 'documents' && (
          <div className="space-y-6">
            {/* Upload Box */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    Upload Study Reference Documents (Admin Only)
                  </h2>
                  <p className="text-xs text-slate-500">
                    PDF, DOCX, or TXT content uploaded here automatically feeds into the AI's RAG knowledge base.
                  </p>
                </div>
              </div>

              {docSuccessMsg && (
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>{docSuccessMsg}</span>
                </div>
              )}

              <form onSubmit={handleUploadDocument} className="space-y-3 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                      Document Title / File Name
                    </label>
                    <input
                      type="text"
                      required
                      value={docName}
                      onChange={e => setDocName(e.target.value)}
                      placeholder="e.g. CS3492_Lab_Manual_Part2"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                      Document File Type
                    </label>
                    <select
                      value={docType}
                      onChange={e => setDocType(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none"
                    >
                      <option value="pdf">PDF Document (.pdf)</option>
                      <option value="docx">Word Document (.docx)</option>
                      <option value="txt">Text File (.txt)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Upload a File (PDF, DOCX, TXT)
                  </label>
                  <input
                    ref={docFileInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx,.txt,text/plain"
                    onChange={handleDocFileSelect}
                    className="block w-full text-xs text-slate-600 dark:text-slate-400 file:mr-3 file:rounded-xl file:border-0 file:bg-purple-600 file:px-3 file:py-2 file:text-white file:font-semibold"
                  />
                </div>

                {selectedDocFile && (
                  <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-white">{selectedDocFile.name}</div>
                      <div className="text-slate-500">{selectedDocFile.size} • Ready to index</div>
                    </div>
                    <button type="button" onClick={handleRemoveSelectedDocFile} className="text-purple-700 dark:text-purple-300 font-semibold">Remove</button>
                  </div>
                )}

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Document Category & Description
                  </label>
                  <input
                    type="text"
                    value={docDescription}
                    onChange={e => setDocDescription(e.target.value)}
                    placeholder="e.g. Official lab manual notes covering Normalization and Trigger queries."
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Optional Notes (added to index if the file is text-only)
                  </label>
                  <textarea
                    rows={3}
                    value={docContent}
                    onChange={e => setDocContent(e.target.value)}
                    placeholder="Optional notes or highlights to include alongside the uploaded file..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-mono text-xs focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                  />
                </div>

                <button
                  type="submit"
                  disabled={docUploading || !selectedDocFile}
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold shadow-md transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  <Upload className="w-4 h-4" />
                  <span>{docUploading ? 'Uploading & Indexing...' : 'Upload & Index into AI Knowledge'}</span>
                </button>
              </form>
            </div>

            {/* List of uploaded documents */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Indexed Reference Documents ({documents.length})
              </h3>

              <div className="space-y-3">
                {documents.map((doc) => (
                  <div key={doc.id} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-purple-600" />
                        <span className="font-bold text-xs text-slate-900 dark:text-white">
                          {doc.name}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 text-[10px] font-bold uppercase">
                          {doc.fileType} • {doc.size}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {doc.description || doc.category}
                      </p>
                      <span className="text-[10px] text-slate-400 block">
                        Uploaded by {doc.uploadedBy} on {new Date(doc.uploadDate).toLocaleDateString()}
                      </span>
                    </div>

                    <button
                      onClick={() => handleDeleteDocument(doc.id, doc.name)}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors"
                      title="Remove Document"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: ACTIVITY LOGS */}
        {activeTab === 'logs' && (
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              System & Security Activity Logs
            </h2>

            <div className="space-y-2">
              {logs.map((log) => (
                <div key={log.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <Activity className="w-4 h-4 text-purple-500 shrink-0" />
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {log.action}
                      </span>
                      <span className="text-slate-500 ml-2">
                        • {log.userName} ({log.userRole})
                      </span>
                      <p className="text-[11px] text-slate-500 font-normal">
                        {log.details}
                      </p>
                    </div>
                  </div>

                  <span className="text-[10px] text-slate-400 shrink-0 font-mono">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add Syllabus Modal */}
        {showAddUnitModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
            <div className="w-full max-w-md bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  Add New Syllabus Unit
                </h3>
                <button onClick={() => setShowAddUnitModal(false)}>
                  <X className="w-4 h-4 text-slate-400" />
                </button>
              </div>

              <form onSubmit={handleAddSyllabusUnit} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Unit Title
                  </label>
                  <input
                    type="text"
                    required
                    value={newUnitTitle}
                    onChange={e => setNewUnitTitle(e.target.value)}
                    placeholder="e.g. Unit VI: Distributed Databases & Query Processing"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Description
                  </label>
                  <textarea
                    rows={2}
                    value={newUnitDesc}
                    onChange={e => setNewUnitDesc(e.target.value)}
                    placeholder="Overview of distributed query processing..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Topics (Comma-separated)
                  </label>
                  <input
                    type="text"
                    value={newUnitTopics}
                    onChange={e => setNewUnitTopics(e.target.value)}
                    placeholder="Two-Phase Commit, Fragment Replication, Distributed Joins"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-purple-600 text-white font-bold shadow-md"
                >
                  Save Syllabus Unit
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Add Experiment Modal */}
        {showAddExpModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
            <div className="w-full max-w-lg bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  Add New DBMS Practical Experiment
                </h3>
                <button onClick={() => setShowAddExpModal(false)}>
                  <X className="w-4 h-4 text-slate-400" />
                </button>
              </div>

              <form onSubmit={handleAddExperiment} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Experiment Title
                  </label>
                  <input
                    type="text"
                    required
                    value={expTitle}
                    onChange={e => setExpTitle(e.target.value)}
                    placeholder="e.g. Experiment 11: MongoDB CRUD Operations"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Category
                  </label>
                  <select
                    value={expCategory}
                    onChange={e => setExpCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                  >
                    <option value="DDL Commands">DDL Commands</option>
                    <option value="DML Commands">DML Commands</option>
                    <option value="SQL Joins">SQL Joins</option>
                    <option value="Aggregate Functions">Aggregate Functions</option>
                    <option value="Subqueries">Subqueries</option>
                    <option value="Views & Triggers">Views & Triggers</option>
                    <option value="PL/SQL & Procedures">PL/SQL & Procedures</option>
                    <option value="Normalization">Normalization</option>
                    <option value="Transactions">Transactions</option>
                    <option value="Custom Practical">Custom Practical</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Aim
                  </label>
                  <input
                    type="text"
                    required
                    value={expAim}
                    onChange={e => setExpAim(e.target.value)}
                    placeholder="Aim of the experiment..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    SQL Code / Query Commands
                  </label>
                  <textarea
                    rows={4}
                    value={expSqlCode}
                    onChange={e => setExpSqlCode(e.target.value)}
                    placeholder="CREATE TABLE Student (id INT, name VARCHAR(50));"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-mono text-xs"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-purple-600 text-white font-bold shadow-md"
                >
                  Save Experiment
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Experiment Customizer Modal */}
        {showEditExpModal && editingExp && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4">
            <div className="w-full max-w-2xl bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 max-h-[92vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <Edit3 className="w-4 h-4 text-purple-600" />
                    <h3 className="font-bold text-base text-slate-900 dark:text-white">
                      Customize Experiment #{editingExp.id}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500">
                    Modify SQL query, aim, theory, output tables, and viva questions.
                  </p>
                </div>
                <button onClick={() => setShowEditExpModal(false)} className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <form onSubmit={handleSaveEditedExperiment} className="space-y-4 text-xs">
                {/* Basic info */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                      Experiment Title
                    </label>
                    <input
                      type="text"
                      required
                      value={editTitle}
                      onChange={e => setEditTitle(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                      Category
                    </label>
                    <select
                      value={editCategory}
                      onChange={e => setEditCategory(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                    >
                      <option value="DDL Commands">DDL Commands</option>
                      <option value="DML Commands">DML Commands</option>
                      <option value="SQL Joins">SQL Joins</option>
                      <option value="Aggregate Functions">Aggregate Functions</option>
                      <option value="Subqueries">Subqueries</option>
                      <option value="Views & Triggers">Views & Triggers</option>
                      <option value="PL/SQL & Procedures">PL/SQL & Procedures</option>
                      <option value="Normalization">Normalization</option>
                      <option value="Transactions">Transactions</option>
                      <option value="JDBC Connectivity">JDBC Connectivity</option>
                      <option value="Custom Practical">Custom Practical</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Aim of Experiment
                  </label>
                  <input
                    type="text"
                    required
                    value={editAim}
                    onChange={e => setEditAim(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                      Theory & Core Concepts
                    </label>
                    <textarea
                      rows={3}
                      value={editTheory}
                      onChange={e => setEditTheory(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                      Algorithm / Logic
                    </label>
                    <textarea
                      rows={3}
                      value={editAlgorithm}
                      onChange={e => setEditAlgorithm(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                {/* Procedure steps */}
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Step-by-Step Procedure Instructions (One step per line)
                  </label>
                  <textarea
                    rows={3}
                    value={editProcedureText}
                    onChange={e => setEditProcedureText(e.target.value)}
                    placeholder="Step 1: Start MySQL CLI&#10;Step 2: Create Student table&#10;Step 3: Execute SELECT query"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                  />
                </div>

                {/* SQL Code */}
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    ANSI SQL Query Code
                  </label>
                  <textarea
                    rows={5}
                    value={editSqlCode}
                    onChange={e => setEditSqlCode(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-900 text-emerald-400 font-mono text-xs focus:outline-none"
                  />
                </div>

                {/* Expected Output */}
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
                  <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Table className="w-4 h-4 text-purple-600" />
                    <span>Expected Output Table Format</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                        Table Columns (Comma-separated)
                      </label>
                      <input
                        type="text"
                        value={editColumnsText}
                        onChange={e => setEditColumnsText(e.target.value)}
                        placeholder="STUDENT_ID, NAME, DEPT, GPA"
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                        Table Sample Rows (Comma-separated cells per line)
                      </label>
                      <textarea
                        rows={2}
                        value={editRowsText}
                        onChange={e => setEditRowsText(e.target.value)}
                        placeholder="101, Rahul Sharma, CSE, 8.9&#10;102, Priya Ananth, IT, 9.2"
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono text-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* Viva Questions Editor */}
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <HelpCircle className="w-4 h-4 text-purple-600" />
                      <span>Viva Questions & Answers</span>
                    </h4>
                    <button
                      type="button"
                      onClick={handleAddVivaQuestion}
                      className="px-2.5 py-1 rounded-lg bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-bold text-[11px]"
                    >
                      + Add Viva Question
                    </button>
                  </div>

                  {editVivaList.map((viva, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 relative">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-500 text-[10px]">Q{idx + 1}:</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveVivaQuestion(idx)}
                          className="text-red-500 hover:text-red-700 p-0.5"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <input
                        type="text"
                        value={viva.question}
                        onChange={e => handleUpdateVivaQuestion(idx, 'question', e.target.value)}
                        placeholder="Viva Question..."
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-semibold text-slate-900 dark:text-white"
                      />
                      <input
                        type="text"
                        value={viva.answer}
                        onChange={e => handleUpdateVivaQuestion(idx, 'answer', e.target.value)}
                        placeholder="High-scoring Answer..."
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-300"
                      />
                    </div>
                  ))}
                </div>

                {/* Result & Tips */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                      Expected Result Summary
                    </label>
                    <input
                      type="text"
                      value={editResult}
                      onChange={e => setEditResult(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                      Lab Tips (One tip per line)
                    </label>
                    <textarea
                      rows={2}
                      value={editTipsText}
                      onChange={e => setEditTipsText(e.target.value)}
                      placeholder="Tip 1: Always check PRIMARY KEY&#10;Tip 2: Use UPPERCASE for SQL keywords"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowEditExpModal(false)}
                    className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="px-6 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold shadow-md"
                  >
                    Save Customized Experiment
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}


        {/* Admin Add Student Modal */}
        {showAddStudentModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4">
            <div className="w-full max-w-md bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    Add New Student Account
                  </h3>
                </div>
                <button onClick={() => setShowAddStudentModal(false)}>
                  <X className="w-5 h-5 text-slate-400 hover:text-slate-600 dark:hover:text-white" />
                </button>
              </div>

              {addStdError && (
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{addStdError}</span>
                </div>
              )}

              {addStdSuccess && (
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-medium flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{addStdSuccess}</span>
                </div>
              )}

              <form onSubmit={handleAddStudent} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                    Student Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newStdName}
                    onChange={e => setNewStdName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                    Roll No / Register ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newStdRollNo}
                    onChange={e => setNewStdRollNo(e.target.value)}
                    placeholder="e.g. 22CS045 or CS2026-042"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                    Student Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={newStdEmail}
                    onChange={e => setNewStdEmail(e.target.value)}
                    placeholder="e.g. student@college.edu"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                    Account Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    value={newStdPassword}
                    onChange={e => setNewStdPassword(e.target.value)}
                    placeholder="Enter password for student"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                    Department
                  </label>
                  <select
                    value={newStdDept}
                    onChange={e => setNewStdDept(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500/20 outline-none"
                  >
                    <option value="Computer Science & Eng">Computer Science & Eng</option>
                    <option value="Information Technology">Information Technology</option>
                    <option value="Artificial Intelligence & DS">Artificial Intelligence & DS</option>
                    <option value="Electronics & Comm Eng">Electronics & Comm Eng</option>
                  </select>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddStudentModal(false)}
                    className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={addStdLoading}
                    className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold shadow-xs transition-colors"
                  >
                    {addStdLoading ? 'Saving Student...' : 'Save Student Account'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* CUSTOM DELETE CONFIRMATION MODAL (In-app popup, safe in sandboxed iframes) */}
        {deleteConfirmTarget && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
              <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-950/80 text-red-600 dark:text-red-400 flex items-center justify-center mb-4">
                <Trash2 className="w-6 h-6" />
              </div>

              <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2">
                Confirm Deletion
              </h3>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
                Are you sure you want to delete{' '}
                <span className="font-bold text-slate-900 dark:text-white">"{deleteConfirmTarget.name}"</span>?
                This action cannot be undone and will permanently remove this record from the system.
              </p>

              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => setDeleteConfirmTarget(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={executeDelete}
                  className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Yes, Delete Now</span>
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
