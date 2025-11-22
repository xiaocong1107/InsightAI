import React from 'react';
import { SqlResult } from '../types';
import { ClipboardDocumentIcon } from '@heroicons/react/24/outline';

interface SqlPreviewProps {
  result: SqlResult;
}

export const SqlPreview: React.FC<SqlPreviewProps> = ({ result }) => {
  const copyToClipboard = () => {
    navigator.clipboard.writeText(result.query);
  };

  return (
    <div className="mt-4 bg-slate-900 rounded-lg border border-slate-800 overflow-hidden shadow-sm">
      <div className="flex items-center justify-between px-4 py-2 bg-slate-800/50 border-b border-slate-800">
        <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            <span className="text-xs font-mono text-slate-400 uppercase">MySQL Query</span>
        </div>
        <button 
          onClick={copyToClipboard}
          className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-white transition-colors"
          title="Copy SQL"
        >
          <ClipboardDocumentIcon className="w-4 h-4" />
        </button>
      </div>
      <div className="p-4 overflow-x-auto">
        <pre className="font-mono text-sm text-blue-300 whitespace-pre-wrap">
          <code>{result.query}</code>
        </pre>
      </div>
      <div className="px-4 py-2 bg-slate-900 text-xs text-slate-500 border-t border-slate-800">
         Execution time: {(Math.random() * 0.5).toFixed(3)}s • {result.data.length} rows returned
      </div>
    </div>
  );
};
