
import React from 'react';
import { PlayerState, NPC } from '../types';

interface RelationshipsScreenProps {
  player: PlayerState;
  onClose: () => void;
}

const getRelationshipColor = (level: number): string => {
    if (level <= 10) return 'text-slate-500';
    if (level <= 30) return 'text-slate-400';
    if (level <= 50) return 'text-blue-400';
    if (level <= 70) return 'text-green-400';
    if (level <= 90) return 'text-emerald-400';
    return 'text-amber-400';
};

const getStatusColor = (status: string): string => {
    const lowerStatus = status.toLowerCase();
    if (lowerStatus.includes('inimigo') || lowerStatus.includes('rival')) return 'bg-red-800/70 text-red-300';
    if (lowerStatus.includes('amante') || lowerStatus.includes('esposa')) return 'bg-pink-800/70 text-pink-300';
    if (lowerStatus.includes('amigo')) return 'bg-green-800/70 text-green-300';
    return 'bg-slate-700/70 text-slate-300';
}

const RelationshipsScreen: React.FC<RelationshipsScreenProps> = ({ player, onClose }) => {
  const { relacionamentos } = player;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-4xl max-h-[90vh] bg-slate-800 border border-slate-600 rounded-lg shadow-2xl flex flex-col" onClick={e => e.stopPropagation()}>
        <header className="flex justify-between items-center p-4 border-b border-slate-600">
          <h2 className="text-3xl font-bold text-amber-400 font-cinzel">Relações</h2>
          <button onClick={onClose} className="text-3xl text-slate-400 hover:text-white">&times;</button>
        </header>
        <div className="flex-1 p-6 overflow-y-auto">
            {relacionamentos && relacionamentos.length > 0 ? (
                <div className="space-y-3">
                    {relacionamentos.map(npc => (
                        <div key={npc.id} className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-xl font-bold text-amber-300 font-cinzel">{npc.nome}</h3>
                                    <p className="text-sm text-slate-400">{npc.ocupacao || 'Ocupação desconhecida'}</p>
                                </div>
                                <div className="text-right">
                                    <p className={`font-bold text-lg ${getRelationshipColor(npc.nivelRelacionamento)}`}>
                                        {npc.nivelRelacionamento} / 100
                                    </p>
                                    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${getStatusColor(npc.statusRelacionamento)}`}>
                                        {npc.statusRelacionamento}
                                    </span>
                                </div>
                            </div>
                            <div className="mt-2 pt-2 border-t border-slate-700/50">
                                <p className="text-xs text-slate-500">Última interação: {npc.ultimaInteracao}</p>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex items-center justify-center h-full text-slate-500">
                    <p>Você ainda não estabeleceu relações significativas com ninguém.</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default RelationshipsScreen;
