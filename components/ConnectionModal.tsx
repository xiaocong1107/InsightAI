import React, { useState } from 'react';
import { DatabaseConfig, TableSchema } from '../types';
import { detectSchema } from '../services/geminiService';
import { ServerStackIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

interface ConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect: (config: DatabaseConfig) => void;
}

export const ConnectionModal: React.FC<ConnectionModalProps> = ({ isOpen, onClose, onConnect }) => {
  const [host, setHost] = useState('47.113.229.134');
  const [user, setUser] = useState('emote_user');
  const [password, setPassword] = useState('666888Ab!@');
  const [database, setDatabase] = useState('ai_boss');
  const [description, setDescription] = useState('Production database for ai_boss platform. Contains sys_user, ai_draw_record, ai_chat_record, user_order tables.');
  const [status, setStatus] = useState<'idle' | 'connecting' | 'success' | 'error'>('idle');
  const [detectedTables, setDetectedTables] = useState<TableSchema[]>([]);

  if (!isOpen) return null;

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('connecting');
    
    // Simulate network delay for realism
    setTimeout(async () => {
      try {
        // Pass ALL connection info to ensure strict matching in the detection service
        const connectionInfo = `Host: ${host}, User: ${user}, Database: ${database}, Description: ${description}`;
        console.log("Connecting with info:", connectionInfo);

        const tables = await detectSchema(connectionInfo);
        setDetectedTables(tables);
        setStatus('success');
        
        // Auto close after success
        setTimeout(() => {
           onConnect({
             host,
             user,
             database,
             connected: true,
             tables: tables
           });
        }, 1500);
      } catch (err) {
        console.error("Connection failed", err);
        setStatus('error');
      }
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        <div className="bg-slate-800/50 p-6 border-b border-slate-700 flex items-center space-x-3">
          <div className="p-2 bg-indigo-500/20 rounded-lg">
            <ServerStackIcon className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Connect Data Source</h2>
            <p className="text-sm text-slate-400">Configure your MySQL connection</p>
          </div>
        </div>

        <form onSubmit={handleConnect} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Host IP</label>
              <input 
                type="text" 
                value={host}
                onChange={(e) => setHost(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Database Name</label>
              <input 
                type="text" 
                value={database}
                onChange={(e) => setDatabase(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Username</label>
              <input 
                type="text" 
                value={user}
                onChange={(e) => setUser(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
              />
            </div>
          </div>

          <div>
             <label className="block text-xs font-medium text-slate-400 mb-1">Context Description (for AI)</label>
             <textarea 
               value={description}
               onChange={(e) => setDescription(e.target.value)}
               rows={3}
               className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition resize-none"
               placeholder="Describe what kind of data is in this database..."
             />
          </div>

          {status === 'error' && (
             <div className="flex items-center space-x-2 text-red-400 bg-red-400/10 p-3 rounded-lg text-sm">
                <XCircleIcon className="w-5 h-5" />
                <span>Connection failed. Please check credentials.</span>
             </div>
          )}

          {status === 'success' && (
             <div className="flex items-center space-x-2 text-green-400 bg-green-400/10 p-3 rounded-lg text-sm">
                <CheckCircleIcon className="w-5 h-5" />
                <span>Connected! Schema detected ({detectedTables.length} tables).</span>
             </div>
          )}

          <div className="pt-4 flex justify-end space-x-3">
            <button 
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-white transition"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={status === 'connecting' || status === 'success'}
              className={`px-6 py-2 rounded-lg text-sm font-medium text-white shadow-lg shadow-indigo-500/20 transition-all
                ${status === 'connecting' ? 'bg-indigo-700 cursor-wait' : 'bg-indigo-600 hover:bg-indigo-500'}
                ${status === 'success' ? 'bg-green-600' : ''}
              `}
            >
              {status === 'connecting' ? 'Authenticating...' : status === 'success' ? 'Success' : 'Connect Database'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};