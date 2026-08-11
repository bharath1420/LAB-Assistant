export type UserRole = 'student' | 'admin';

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  studentId?: string;
  department?: string;
  loginTime: string;
  lastActive: string;
  chatCount: number;
  status: 'active' | 'inactive';
}

export type Role = 'user' | 'assistant' | 'system';

export interface ChatMessage {
  id: string;
  role: Role;
  content: string;
  timestamp: string;
  isError?: boolean;
  experimentId?: number;
  imageName?: string;
  imageUrl?: string;
  sourceDoc?: string;
}

export interface ChatSession {
  id: string;
  userId?: string;
  userName?: string;
  userEmail?: string;
  studentId?: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface LabExperiment {
  id: number;
  title: string;
  category: string;
  aim: string;
  theory: string;
  algorithm?: string;
  procedure: string[];
  sqlCode: string;
  expectedOutput: {
    columns: string[];
    rows: (string | number)[][];
  };
  result: string;
  vivaQuestions: {
    question: string;
    answer: string;
  }[];
  tips: string[];
  isCustom?: boolean;
}

export interface SuggestedQuestion {
  id: string;
  text: string;
  category: 'Concepts' | 'SQL' | 'Experiments' | 'Viva & Interview';
}

export interface SyllabusUnit {
  id: string;
  unitNumber: number;
  title: string;
  description: string;
  topics: string[];
  isCompleted?: boolean;
}

export interface UploadedDocument {
  id: string;
  name: string;
  fileType: 'pdf' | 'docx' | 'txt';
  size: string;
  uploadDate: string;
  uploadedBy: string;
  category: string;
  content: string;
  description?: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  details: string;
  timestamp: string;
}

export interface UserSettings {
  theme: 'light' | 'dark';
  responseStyle: 'balanced' | 'concise' | 'detailed';
  fontSize: 'small' | 'medium' | 'large';
  autoScroll: boolean;
}

export interface AdminStats {
  totalStudents: number;
  activeStudents: number;
  totalChats: number;
  uploadedDocuments: number;
  totalExperiments: number;
}

export interface CourseInfo {
  code: string;
  name: string;
  department: string;
  regulation: string;
  instructor: string;
  announcement: string;
  semester: string;
}

