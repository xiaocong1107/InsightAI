import React, { useState } from 'react';
import { ConnectionModal } from './components/ConnectionModal';
import { ChatInterface } from './components/ChatInterface';
import { DatabaseConfig, Message } from './types';
import { generateBiInsight } from './services/geminiService';
import { CircleStackIcon, PlusIcon } from '@heroicons/react/24/outline';

export default function App() {
  const [dbConfig, setDbConfig] = useState<DatabaseConfig>({
    host: '',
    user: '',
    database: '',
    connected: false,
    tables: [],
  });
  
  const [showConnectionModal, setShowConnectionModal] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isThinking, setIsThinking] = useState(false);

  const handleConnect = (config: DatabaseConfig) => {
    setDbConfig(config);
    setShowConnectionModal(false);
    // Add system welcome message
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      role: 'system',
      content: `Connected to ${config.database} successfully.\nI've detected the following tables: ${config.tables.map(t => t.name).join(', ')}.\n\nTry asking: "Show me total orders by month" or "Which users have the highest spend?"`,
      timestamp: Date.now()
    }]);
  };

  const handleSendMessage = async (content: string) => {
    // Add User Message
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: Date.now()
    };
    setMessages(prev => [...prev, userMsg]);

    if (!dbConfig.connected) {
      setTimeout(() => {
        setMessages(prev => [...prev, {
            id: (Date.now() + 1).toString(),
            role: 'system',
            content: "Please connect to a database first so I can analyze your data.",
            timestamp: Date.now()
        }]);
        setShowConnectionModal(true);
      }, 500);
      return;
    }

    setIsThinking(true);

    // Call Gemini Service
    const insight = await generateBiInsight(content, dbConfig.tables);

    setIsThinking(false);

    if (insight) {
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: insight.sql.explanation, // Use explanation as main text
        timestamp: Date.now(),
        sqlResult: insight.sql,
        chartConfig: insight.chart
      };
      setMessages(prev => [...prev, aiMsg]);
    } else {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: "I'm sorry, I couldn't generate an insight for that query. Could you try rephrasing it?",
        timestamp: Date.now()
      }]);
    }
  };

  const resetChat = () => {
    setMessages([]);
  };

  return (
    <div className="flex h-screen w-full bg-slate-950 text-slate-200 font-sans selection:bg-indigo-500/30">
      
      {/* Sidebar */}
      <div className="w-64 border-r border-slate-800 bg-slate-950 flex flex-col hidden md:flex">
        <div className="p-4 border-b border-slate-800 flex items-center space-x-2">
          <div className="w-6 h-6 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-lg"></div>
          <span className="font-bold text-lg tracking-tight">InsightAI</span>
        </div>

        <div className="flex-1 p-4 space-y-4 overflow-y-auto">
           <button 
             onClick={resetChat}
             className="w-full flex items-center justify-center space-x-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-sm font-medium py-2.5 rounded-lg transition-colors"
           >
             <PlusIcon className="w-4 h-4" />
             <span>New Analysis</span>
           </button>

           <div className="pt-4">
             <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Data Source</div>
             <button 
               onClick={() => setShowConnectionModal(true)}
               className={`w-full flex items-center space-x-3 p-2 rounded-lg text-sm transition-all border ${
                 dbConfig.connected 
                 ? 'bg-indigo-500/10 border-indigo-500/50 text-indigo-300' 
                 : 'bg-transparent border-transparent hover:bg-slate-900 text-slate-400'
               }`}
             >
               <CircleStackIcon className={`w-5 h-5 ${dbConfig.connected ? 'text-indigo-400' : 'text-slate-500'}`} />
               <div className="text-left">
                 <div className="font-medium">{dbConfig.connected ? dbConfig.database : 'No Connection'}</div>
                 <div className="text-xs opacity-70">{dbConfig.connected ? 'Active' : 'Tap to configure'}</div>
               </div>
               {dbConfig.connected && (
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse ml-auto"></span>
               )}
             </button>
           </div>

           {dbConfig.connected && (
             <div className="pt-2">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Tables Detected</div>
                <ul className="space-y-1">
                  {dbConfig.tables.map(t => (
                    <li key={t.name} className="text-sm text-slate-400 px-2 py-1 rounded hover:bg-slate-900 cursor-help" title={t.columns.join(', ')}>
                       # {t.name}
                    </li>
                  ))}
                </ul>
             </div>
           )}
        </div>
        
        <div className="p-4 border-t border-slate-800 text-xs text-slate-600 text-center">
          Powered by Gemini 2.5 Flash
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-[url('https://grainy-gradients.vercel.app/noise.svg')]">
        {/* Mobile Header */}
        <div className="md:hidden h-14 border-b border-slate-800 flex items-center justify-between px-4 bg-slate-950">
            <span className="font-bold">InsightAI</span>
            <button onClick={() => setShowConnectionModal(true)}>
               <CircleStackIcon className={`w-6 h-6 ${dbConfig.connected ? 'text-indigo-400' : 'text-slate-500'}`} />
            </button>
        </div>

        <ChatInterface 
          messages={messages} 
          onSendMessage={handleSendMessage}
          isThinking={isThinking}
        />
      </div>

      <ConnectionModal 
        isOpen={showConnectionModal} 
        onClose={() => setShowConnectionModal(false)} 
        onConnect={handleConnect}
      />
    </div>
  );
}
