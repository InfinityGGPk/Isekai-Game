
import React from 'react';
import { Quest } from '../types';

interface QuestLogProps {
  quests: Quest[];
  onClose: () => void;
}

const QuestLog: React.FC<QuestLogProps> = ({ quests, onClose }) => {
  const activeQuests = quests.filter(q => q.status === 'active');

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-2xl max-h-[90vh] bg-slate-800 border border-slate-600 rounded-lg shadow-2xl flex flex-col" onClick={e => e.stopPropagation()}>
        <header className="flex justify-between items-center p-4 border-b border-slate-600">
          <h2 className="text-2xl font-bold text-amber-400 font-cinzel">Diário de Missões</h2>
          <button onClick={onClose} className="text-2xl text-slate-400 hover:text-white">&times;</button>
        </header>
        <div className="flex-1 p-6 overflow-y-auto">
          {activeQuests.length > 0 ? (
            activeQuests.map(quest => (
              <div key={quest.id} className="mb-4 bg-slate-900/50 p-3 rounded-md">
                <h3 className="font-bold text-amber-300 text-lg">{quest.title}</h3>
                <p className="text-sm text-slate-400 italic mb-2">De: {quest.giver}</p>
                <p className="text-sm text-slate-300 mb-3">{quest.description}</p>
                <ul className="list-disc list-inside space-y-1">
                  {quest.objectives.filter(o => !o.isHidden).map(obj => (
                     <li key={obj.id} className={`${obj.status === 'completed' ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                       {obj.description}
                     </li>
                  ))}
                </ul>
              </div>
            ))
          ) : (
            <p className="text-slate-400 text-center py-4">Nenhuma missão ativa.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuestLog;
