import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Trash2, 
  Sparkles, 
  Loader2, 
  Bot, 
  AlertCircle,
  Database,
  Terminal,
  ArrowDown,
  Image as ImageIcon,
  Paperclip,
  X,
  FileCode
} from 'lucide-react';
import { ChatMessage } from '../types';
import { MessageItem } from './MessageItem';
import { SuggestedQuestionsPanel } from './SuggestedQuestionsPanel';

interface ChatWindowProps {
  messages: ChatMessage[];
  isLoading: boolean;
  onSendMessage: (text: string, imageBase64?: string, imageName?: string, fileData?: { name: string; base64: string; fileType: string; size?: string }) => void;
  onClearMessages: () => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  messages,
  isLoading,
  onSendMessage,
  onClearMessages,
}) => {
  const [inputText, setInputText] = useState('');
  const [selectedImageBase64, setSelectedImageBase64] = useState<string | null>(null);
  const [selectedImageName, setSelectedImageName] = useState<string | null>(null);
  const [selectedFileData, setSelectedFileData] = useState<{ name: string; base64: string; fileType: string; size?: string } | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      const isImage = ['image/jpeg', 'image/png', 'image/jpg'].includes(file.type);

      if (isImage) {
        setSelectedImageBase64(base64);
        setSelectedImageName(file.name);
        setSelectedFileData(null);
      } else {
        setSelectedFileData({
          name: file.name,
          base64,
          fileType: file.type || file.name.split('.').pop() || 'txt',
          size: `${Math.max(1, Math.round(file.size / 1024))} KB`
        });
        setSelectedImageBase64(null);
        setSelectedImageName(null);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAttachment = () => {
    setSelectedImageBase64(null);
    setSelectedImageName(null);
    setSelectedFileData(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((!inputText.trim() && !selectedImageBase64 && !selectedFileData) || isLoading) return;

    onSendMessage(
      inputText.trim(),
      selectedImageBase64 || undefined,
      selectedImageName || undefined,
      selectedFileData || undefined
    );
    setInputText('');
    setSelectedImageBase64(null);
    setSelectedImageName(null);
    setSelectedFileData(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const quickExperimentsPills = [
    "Explain Experiment 1",
    "SQL Joins (Experiment 4)",
    "Explain Normalization",
    "DELETE vs TRUNCATE",
    "ACID Properties",
    "Experiment 3 Code"
  ];

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50/50 dark:bg-slate-950/60 overflow-hidden relative">
      {/* Messages Scroll Area */}
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto px-2 sm:px-4 py-6 space-y-4"
      >
        {messages.length === 0 ? (
          <div className="max-w-3xl mx-auto text-center py-10 px-4">
            <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white mx-auto flex items-center justify-center shadow-lg shadow-blue-500/20 mb-4">
              <Database className="w-8 h-8" />
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-2">
              Welcome to DBMS Lab Assistant!
            </h2>

            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-lg mx-auto mb-6 leading-relaxed">
              I am your dedicated Database Management System laboratory instructor. Ask me anything about SQL queries, DDL/DML commands, Normalization, ER Diagrams, Transactions, or upload a photo of a DBMS question paper!
            </p>

            {/* Quick launch pills */}
            <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
              {quickExperimentsPills.map((pill, idx) => (
                <button
                  key={idx}
                  onClick={() => onSendMessage(pill)}
                  className="px-3 py-1.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 shadow-2xs transition-all"
                >
                  ✨ {pill}
                </button>
              ))}
            </div>

            {/* Suggested Questions Grid */}
            <SuggestedQuestionsPanel onSelectQuestion={(q) => onSendMessage(q)} />
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg) => (
              <MessageItem key={msg.id} message={msg} />
            ))}

            {/* Loading / Typing indicator */}
            {isLoading && (
              <div className="flex gap-3 max-w-4xl mx-auto my-3 px-4">
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm animate-pulse">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl px-4 py-3 shadow-2xs flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs font-medium">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-600 dark:text-blue-400" />
                  <span>DBMS Assistant is analyzing prompt/image and generating answer...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Form Bar */}
      <div className="p-3 sm:p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 sticky bottom-0 z-20">
        <div className="max-w-4xl mx-auto space-y-2">
          
          {/* Selected Attachment Preview Box */}
          {(selectedImageBase64 || selectedFileData) && (
            <div className="p-2 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 rounded-2xl flex items-center justify-between text-xs animate-in fade-in">
              <div className="flex items-center gap-2.5">
                {selectedImageBase64 ? (
                  <img 
                    src={selectedImageBase64} 
                    alt="Preview" 
                    className="w-10 h-10 object-cover rounded-xl border border-blue-300 dark:border-blue-700" 
                  />
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                    <Paperclip className="w-5 h-5" />
                  </div>
                )}
                <div>
                  <span className="font-bold text-slate-900 dark:text-white block truncate max-w-[220px]">
                    {selectedImageName || selectedFileData?.name}
                  </span>
                  <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold">
                    {selectedImageBase64 ? 'Attached for Gemini Vision OCR & DBMS analysis' : 'Attached study document for RAG-based answer retrieval'}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleRemoveAttachment}
                className="p-1 rounded-full hover:bg-blue-200 dark:hover:bg-blue-900 text-slate-500 hover:text-slate-900"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {messages.length > 0 && (
            <div className="flex items-center justify-between px-1 text-xs">
              <span className="text-slate-400 dark:text-slate-500 font-medium">
                Ask strictly DBMS & SQL queries or upload question screenshot
              </span>
              <button
                type="button"
                onClick={() => setShowClearConfirm(true)}
                className="flex items-center gap-1 text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear Chat</span>
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="relative flex flex-col gap-2">
            <div className="relative flex items-center bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-1.5 shadow-inner">
              
              {/* Image upload button */}
              <input
                type="file"
                ref={fileInputRef}
                accept="image/jpeg,image/png,image/jpg,.pdf,.doc,.docx,.txt,text/plain"
                onChange={handleFileSelect}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-xl transition-colors shrink-0"
                title="Upload image or study document"
              >
                {selectedFileData ? <Paperclip className="w-5 h-5 text-purple-600 dark:text-purple-400" /> : <ImageIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
              </button>

              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about SQL, Joins, Normalization, DDL/DML, or upload a study document..."
                rows={1}
                disabled={isLoading}
                className="flex-1 bg-transparent border-none focus:ring-0 focus:outline-none text-sm px-3 py-2.5 resize-none font-sans text-slate-800 dark:text-slate-100 placeholder-slate-400"
              />

              <button
                type="submit"
                disabled={(!inputText.trim() && !selectedImageBase64 && !selectedFileData) || isLoading}
                className="h-10 w-10 bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center justify-center shadow-md shadow-blue-200/50 dark:shadow-none transition-all shrink-0 disabled:opacity-40"
                title="Send Message"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </div>
          </form>

          <p className="text-[11px] text-center text-slate-400 dark:text-slate-500">
            Image OCR, document RAG, and DBMS prompt analysis powered by Google Gemini.
          </p>
        </div>
      </div>

      {/* Clear Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-sm w-full border border-slate-200 dark:border-slate-800 shadow-xl">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
              Clear Conversation?
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-6">
              This will remove all messages from the current active chat window. This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onClearMessages();
                  setShowClearConfirm(false);
                }}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition-colors"
              >
                Clear History
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

