import React from 'react';

interface JsonViewerProps {
  data: object;
  onClose: () => void;
}

const JsonViewer: React.FC<JsonViewerProps> = ({ data, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-2xl max-h-[90vh] bg-slate-800 border border-slate-600 rounded-lg shadow-2xl flex flex-col" onClick={e => e.stopPropagation()}>
        <header className="flex justify-between items-center p-4 border-b border-slate-600">
          <h2 className="text-xl font-bold text-amber-400 font-cinzel">Game State JSON</h2>
          <button onClick={onClose} className="text-2xl text-slate-400 hover:text-white">&times;</button>
        </header>
        <div className="flex-1 p-4 overflow-auto">
          <pre className="text-sm text-slate-300 bg-slate-900 p-4 rounded-md">
            <code>
              {JSON.stringify(data, null, 2)}
            </code>
          </pre>
        </div>
      </div>
    </div>
  );
};

export default JsonViewer;
