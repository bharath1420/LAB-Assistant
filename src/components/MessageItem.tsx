import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { 
  Bot, 
  User, 
  Copy, 
  Check, 
  Volume2, 
  VolumeX, 
  AlertTriangle,
  Database,
  Terminal,
  Sparkles
} from 'lucide-react';
import { ChatMessage } from '../types';

interface MessageItemProps {
  message: ChatMessage;
  onAskExperiment?: (expId: number) => void;
}

export const MessageItem: React.FC<MessageItemProps> = ({ message }) => {
  const [copied, setCopied] = useState(false);
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const isAssistant = message.role === 'assistant';

  const handleCopyText = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  const handleToggleSpeech = () => {
    if (!('speechSynthesis' in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      window.speechSynthesis.cancel();
      // Remove code blocks and markdown symbols for audio reading
      const cleanText = message.content
        .replace(/```[\s\S]*?```/g, ' SQL code block omitted. ')
        .replace(/[#*`_]/g, '');

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 1.0;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      setIsSpeaking(true);
      window.speechSynthesis.speak(utterance);
    }
  };

  // Check if message is the polite refusal
  const isRefusalMessage = isAssistant && message.content.includes("I am a DBMS Lab Assistant. I can answer only Database Management System questions");

  return (
    <div className={`flex gap-3 max-w-4xl mx-auto my-3 px-4 ${isAssistant ? '' : 'flex-row-reverse'}`}>
      {/* Avatar */}
      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm ${
        isAssistant 
          ? 'bg-blue-600 text-white font-bold' 
          : 'bg-slate-800 dark:bg-slate-700 text-white font-bold'
      }`}>
        {isAssistant ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
      </div>

      {/* Message Bubble Container */}
      <div className={`flex flex-col max-w-[88%] sm:max-w-[80%] ${isAssistant ? 'items-start' : 'items-end'}`}>
        {/* Header line */}
        <div className="flex items-center gap-2 mb-1 px-1">
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            {isAssistant ? 'DBMS Assistant' : 'Student'}
          </span>
          <span className="text-[10px] text-slate-400">
            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>

        {/* Bubble */}
        <div className={`
          relative rounded-2xl px-4 py-3.5 text-sm leading-relaxed shadow-xs transition-colors
          ${isAssistant 
            ? isRefusalMessage
              ? 'bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 rounded-tl-none'
              : 'bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-100 rounded-tl-none' 
            : 'bg-blue-600 text-white rounded-tr-none font-medium'
          }
        `}>
          {/* If Refusal Warning Header */}
          {isRefusalMessage && (
            <div className="flex items-center gap-2 font-semibold text-amber-800 dark:text-amber-300 text-xs mb-2 pb-2 border-b border-amber-200 dark:border-amber-800/60">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <span>DBMS Domain Restriction Notice</span>
            </div>
          )}

          {/* Render Attached Image if user uploaded one */}
          {message.imageUrl && (
            <div className="mb-2 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 max-w-xs">
              <img 
                src={message.imageUrl} 
                alt="Uploaded Question Image" 
                className="w-full max-h-48 object-cover"
              />
              <span className="block px-2 py-1 bg-slate-950/80 text-white text-[10px] font-mono truncate">
                📷 {message.imageName || 'Attached Question Image'}
              </span>
            </div>
          )}

          {/* Render Source Document Attribution Badge if RAG matched */}
          {message.sourceDoc && (
            <div className="mb-2 p-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 text-purple-900 dark:text-purple-200 text-[11px] font-semibold flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-purple-600 shrink-0" />
              <span>Sourced from Uploaded Document: <strong>{message.sourceDoc}</strong></span>
            </div>
          )}

          {/* Render Content */}
          <div className="max-w-none text-sm break-words">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code({ node, inline, className, children, ...props }: any) {
                  const match = /language-(\w+)/.exec(className || '');
                  const codeString = String(children).replace(/\n$/, '');
                  const codeId = Math.random().toString(36).substring(7);

                  if (!inline && match) {
                    const language = match[1];
                    return (
                      <div className="my-3 rounded-xl overflow-hidden border border-slate-700/60 bg-slate-950 text-slate-100 shadow-md">
                        {/* Header bar */}
                        <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900 border-b border-slate-800 text-xs text-slate-400 font-mono">
                          <div className="flex items-center gap-1.5">
                            <Terminal className="w-3.5 h-3.5 text-blue-400" />
                            <span className="uppercase font-semibold text-[11px] text-blue-300">
                              {language}
                            </span>
                          </div>
                          <button
                            onClick={() => handleCopyCode(codeString, codeId)}
                            className="flex items-center gap-1 px-2 py-0.5 rounded hover:bg-slate-800 text-slate-300 text-[11px] transition-colors"
                          >
                            {copiedCodeId === codeId ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-400" />
                                <span className="text-emerald-400">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>Copy SQL</span>
                              </>
                            )}
                          </button>
                        </div>
                        {/* Code area */}
                        <pre className="p-3 text-xs font-mono overflow-x-auto text-emerald-300 leading-relaxed">
                          <code>{codeString}</code>
                        </pre>
                      </div>
                    );
                  }

                  return (
                    <code className="bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-300 px-1.5 py-0.5 rounded text-xs font-mono" {...props}>
                      {children}
                    </code>
                  );
                },
                table({ children }) {
                  return (
                    <div className="overflow-x-auto my-3 border border-slate-200 dark:border-slate-800 rounded-lg">
                      <table className="min-w-full w-full table-auto text-xs text-left text-slate-700 dark:text-slate-300 border-collapse">
                        {children}
                      </table>
                    </div>
                  );
                },
                th({ children }) {
                  return (
                    <th className="bg-slate-100 dark:bg-slate-800/80 px-3 py-2 border-b border-slate-200 dark:border-slate-800 font-bold text-slate-900 dark:text-white whitespace-normal">
                      {children}
                    </th>
                  );
                },
                td({ children }) {
                  return (
                    <td className="px-3 py-2 border-b border-slate-100 dark:border-slate-800/50 whitespace-normal">
                      {children}
                    </td>
                  );
                }
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>

          {/* Action Footer for Assistant */}
          {isAssistant && (
            <div className="flex items-center gap-3 mt-3 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-slate-400 text-xs">
              <button
                onClick={handleCopyText}
                className="flex items-center gap-1 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                title="Copy entire answer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>

              <button
                onClick={handleToggleSpeech}
                className="flex items-center gap-1 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                title="Read answer aloud"
              >
                {isSpeaking ? <VolumeX className="w-3.5 h-3.5 text-blue-500" /> : <Volume2 className="w-3.5 h-3.5" />}
                <span>{isSpeaking ? 'Stop Audio' : 'Listen'}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
