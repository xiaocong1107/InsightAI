import React, { useEffect, useRef } from 'react';
import { Message } from '../types';
import { SqlPreview } from './SqlPreview';
import { Visualization } from './Visualization';
import { UserCircleIcon, SparklesIcon, BoltIcon } from '@heroicons/react/24/solid';
import { PaperAirplaneIcon } from '@heroicons/react/24/outline';

interface ChatInterfaceProps {
  messages: Message[];
  onSendMessage: (content: string) => void;
  isThinking: boolean;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ messages, onSendMessage, isThinking }) => {
  const [inputValue, setInputValue] = React.useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    onSendMessage(inputValue);
    setInputValue('');
  };

  return (
    <div className="flex flex-col h-full relative">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-8 pb-32">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center opacity-40 text-center space-y-4">
             <div className="w-20 h-20 bg-indigo-500/20 rounded-full flex items-center justify-center">
                <BoltIcon className="w-10 h-10 text-indigo-400" />
             </div>
             <h3 className="text-2xl font-bold text-white">InsightAI</h3>
             <p className="max-w-md">Connect a database and ask questions like "Show me sales trend for last year" or "Predict next month's revenue".</p>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-4xl w-full flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              
              {/* Avatar */}
              <div className="flex-shrink-0">
                {msg.role === 'user' ? (
                  <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center">
                    <UserCircleIcon className="w-6 h-6 text-slate-300" />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                    <SparklesIcon className="w-5 h-5 text-white" />
                  </div>
                )}
              </div>

              {/* Content */}
              <div className={`flex-1 space-y-4 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                <div className={`inline-block p-3 rounded-2xl ${
                  msg.role === 'user' 
                    ? 'bg-indigo-600 text-white rounded-tr-none' 
                    : 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700'
                }`}>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</p>
                </div>

                {/* AI Rich Content */}
                {msg.role === 'ai' && (
                  <div className="space-y-6 animate-fade-in">
                    {msg.chartConfig && msg.sqlResult && (
                      <Visualization data={msg.sqlResult.data} config={msg.chartConfig} />
                    )}
                    {msg.sqlResult && (
                      <SqlPreview result={msg.sqlResult} />
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {isThinking && (
           <div className="flex justify-start">
             <div className="flex gap-4 max-w-4xl">
                <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center animate-pulse">
                   <SparklesIcon className="w-5 h-5 text-white" />
                </div>
                <div className="bg-slate-800/50 border border-slate-700 p-3 rounded-2xl rounded-tl-none flex items-center space-x-2">
                   <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms'}}></div>
                   <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms'}}></div>
                   <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms'}}></div>
                   <span className="text-xs text-slate-400 ml-2 font-mono">Analyzing data...</span>
                </div>
             </div>
           </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input Area */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-slate-950 via-slate-950 to-transparent pt-10">
        <div className="max-w-4xl mx-auto bg-slate-900/80 backdrop-blur-md border border-slate-700 p-2 rounded-2xl shadow-2xl flex items-center gap-2">
           <input 
             type="text" 
             value={inputValue}
             onChange={(e) => setInputValue(e.target.value)}
             onKeyDown={(e) => e.key === 'Enter' && handleSend(e)}
             placeholder="Ask a question about your data..."
             className="flex-1 bg-transparent border-none outline-none text-slate-100 placeholder-slate-500 px-4 py-2"
             disabled={isThinking}
           />
           <button 
             onClick={handleSend}
             disabled={!inputValue.trim() || isThinking}
             className="p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
           >
             <PaperAirplaneIcon className="w-5 h-5 -rotate-45 translate-x-0.5 -translate-y-0.5" />
           </button>
        </div>
        <p className="text-center text-xs text-slate-600 mt-2">
          AI can make mistakes. Please review the generated SQL.
        </p>
      </div>
    </div>
  );
};
