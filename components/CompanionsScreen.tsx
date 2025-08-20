
import React, { useState, useMemo } from 'react';
import { Companion, PlayerAttributes } from '../types';

interface CompanionsScreenProps {
  companions: Companion[];
  onClose: () => void;
  onSendInput: (input: string) => void;
}

const getIconForClass = (className: string): string => {
    const lowerClass = className.toLowerCase();
    if (lowerClass.includes('guerreiro') || lowerClass.includes('lutador')) return '⚔️';
    if (lowerClass.includes('mago') || lowerClass.includes('feiticeiro')) return '🧙';
    if (lowerClass.includes('arqueiro') || lowerClass.includes('caçador')) return '🏹';
    if (lowerClass.includes('ladino') || lowerClass.includes('ladrão')) return '🤫';
    if (lowerClass.includes('clérigo') || lowerClass.includes('curandeiro')) return '❤️‍🩹';
    if (lowerClass.includes('bárbaro')) return '🪓';
    if (lowerClass.includes('paladino')) return '🛡️';
    return '👤';
};

const ResourceBar: React.FC<{ value: number; max: number; label: string; color: string }> = ({ value, max, label, color }) => {
    const percentage = max > 0 ? (value / max) * 100 : 0;
    return (
        <div className="w-full">
            <div className="flex justify-between text-xs font-semibold">
                <span>{label}</span>
                <span>{value} / {max}</span>
            </div>
            <div className="w-full bg-slate-900 rounded-full h-3 border border-slate-600">
                <div className={`${color} h-full rounded-full`} style={{ width: `${percentage}%` }}></div>
            </div>
        </div>
    );
}

const CompanionsScreen: React.FC<CompanionsScreenProps> = ({ companions, onClose, onSendInput }) => {
  const [selectedCompanionId, setSelectedCompanionId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'available' | 'on_mission'>('all');
  const [sortBy, setSortBy] = useState<'nome' | 'nivel'>('nome');
  
  const activeGroup = companions.slice(0, 5);
  const reserve = companions.slice(5);
  
  const filteredAndSortedReserve = useMemo(() => {
    return reserve
      .filter(c => {
        if (filter === 'available') return !c.emMissao;
        if (filter === 'on_mission') return c.emMissao;
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'nivel') return b.nivel - a.nivel;
        return a.nome.localeCompare(b.nome);
      });
  }, [reserve, filter, sortBy]);

  const selectedCompanion = useMemo(() => {
    if (!selectedCompanionId) return null;
    return companions.find(c => c.id === selectedCompanionId) || null;
  }, [selectedCompanionId, companions]);

  const handleSelectCompanion = (companion: Companion) => {
    setSelectedCompanionId(companion.id);
  };

  const handleAddToGroup = (companion: Companion) => {
    if (activeGroup.length < 5) {
      onSendInput(`Adicionar ${companion.nome} ao grupo ativo.`);
    } else {
      alert("O grupo ativo já está cheio. Remova um membro antes de adicionar outro.");
    }
  };

  const handleRemoveFromGroup = (companion: Companion) => {
    onSendInput(`Remover ${companion.nome} do grupo ativo.`);
  };

  const renderCompanionDetails = (companion: Companion | null) => {
    if (!companion) {
        return <div className="flex items-center justify-center h-full text-slate-500">Selecione um companheiro para ver os detalhes.</div>;
    }

    return (
        <div className="p-4 space-y-4">
            <div className="flex items-center gap-4">
                <div className="text-5xl">{getIconForClass(companion.classe)}</div>
                <div>
                    <h3 className="text-2xl font-bold text-amber-400 font-cinzel">{companion.nome}</h3>
                    <p className="text-slate-400">Nível {companion.nivel} {companion.classe}</p>
                    <p className="text-sm text-yellow-300">{companion.statusRelacionamento}</p>
                </div>
            </div>
            <p className="text-sm italic text-slate-400">"{companion.biografia}"</p>
            
            <div className="space-y-2">
              <ResourceBar value={companion.hp} max={companion.hp_max} label="HP" color="bg-red-500" />
              {companion.recurso_nome && (
                <ResourceBar value={companion.recurso_valor || 0} max={companion.recurso_max || 0} label={companion.recurso_nome} color="bg-blue-500" />
              )}
            </div>

            <div>
                <h4 className="font-bold text-amber-300 mb-1 font-cinzel">Atributos</h4>
                <div className="grid grid-cols-3 gap-x-4 gap-y-1 text-sm">
                    {Object.entries(companion.atributos).map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                            <span className="text-slate-400">{key.slice(0,3)}.</span>
                            <span className="font-semibold">{value}</span>
                        </div>
                    ))}
                </div>
            </div>
            
             <div className="grid grid-cols-2 gap-4">
                <div>
                    <h4 className="font-bold text-amber-300 mb-1 font-cinzel">Habilidades de Combate</h4>
                    <ul className="text-sm list-disc list-inside space-y-1">
                        {companion.habilidadesCombate.map(h => <li key={h.id}>{h.nome}</li>)}
                    </ul>
                </div>
                 <div>
                    <h4 className="font-bold text-amber-300 mb-1 font-cinzel">Habilidades de Apoio</h4>
                    <ul className="text-sm list-disc list-inside space-y-1">
                        {companion.habilidadesApoio.map(h => <li key={h.id}>{h.nome}</li>)}
                    </ul>
                </div>
            </div>
        </div>
    );
  };
  
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-7xl h-[90vh] bg-slate-800 border border-slate-600 rounded-lg shadow-2xl flex flex-col" onClick={e => e.stopPropagation()}>
        <header className="flex justify-between items-center p-4 border-b border-slate-600">
          <h2 className="text-3xl font-bold text-amber-400 font-cinzel">Gerenciar Companheiros</h2>
          <button onClick={onClose} className="text-3xl text-slate-400 hover:text-white">&times;</button>
        </header>
        
        <main className="flex-1 grid grid-cols-3 gap-4 p-4 overflow-hidden">
            {/* Left Panel: Reserve */}
            <div className="flex flex-col bg-slate-900/50 rounded-md overflow-hidden">
                <h3 className="text-xl font-bold text-amber-300 p-3 border-b border-slate-700 font-cinzel">Reserva ({reserve.length}/30)</h3>
                <div className="p-2 flex gap-2 border-b border-slate-700">
                  <span className="text-sm font-semibold">Ordenar:</span>
                  <button onClick={() => setSortBy('nome')} className={`px-2 text-sm rounded ${sortBy === 'nome' ? 'bg-amber-500 text-black' : 'bg-slate-700'}`}>Nome</button>
                  <button onClick={() => setSortBy('nivel')} className={`px-2 text-sm rounded ${sortBy === 'nivel' ? 'bg-amber-500 text-black' : 'bg-slate-700'}`}>Nível</button>
                </div>
                <div className="flex-1 p-3 overflow-y-auto space-y-2">
                  {filteredAndSortedReserve.map(c => (
                    <div key={c.id} className={`p-2 rounded-md flex justify-between items-center cursor-pointer transition-colors ${selectedCompanionId === c.id ? 'bg-amber-900/50 ring-2 ring-amber-500' : 'bg-slate-800 hover:bg-slate-700'}`} onClick={() => handleSelectCompanion(c)}>
                        <div>
                            <p className="font-bold">{getIconForClass(c.classe)} {c.nome}</p>
                            <p className="text-xs text-slate-400">Nível {c.nivel} {c.classe}</p>
                        </div>
                        <button onClick={(e) => { e.stopPropagation(); handleAddToGroup(c); }} className="px-2 py-1 text-xs font-bold bg-green-600 hover:bg-green-500 rounded disabled:bg-slate-600 disabled:cursor-not-allowed" disabled={activeGroup.length >= 5}>Adicionar</button>
                    </div>
                  ))}
                </div>
            </div>

            {/* Center Panel: Active Group */}
            <div className="flex flex-col bg-slate-900/50 rounded-md">
                 <h3 className="text-xl font-bold text-amber-300 p-3 border-b border-slate-700 font-cinzel">Grupo Ativo ({activeGroup.length}/5)</h3>
                 <div className="flex-1 p-3 space-y-3">
                    {[...Array(5)].map((_, i) => {
                        const companion = activeGroup[i];
                        return (
                            <div key={i} className={`h-20 p-2 rounded-md flex justify-between items-center transition-colors border border-dashed ${companion ? 'border-transparent' : 'border-slate-700'} ${selectedCompanionId === companion?.id ? 'bg-amber-900/50 ring-2 ring-amber-500' : 'bg-slate-800'}`} onClick={() => companion && handleSelectCompanion(companion)}>
                                {companion ? (
                                    <>
                                        <div>
                                            <p className="font-bold">{getIconForClass(companion.classe)} {companion.nome}</p>
                                            <p className="text-xs text-slate-400">Nível {companion.nivel} {companion.classe}</p>
                                            <ResourceBar value={companion.hp} max={companion.hp_max} label="HP" color="bg-red-600" />
                                        </div>
                                        <button onClick={(e) => { e.stopPropagation(); handleRemoveFromGroup(companion); }} className="px-2 py-1 text-xs font-bold bg-red-700 hover:bg-red-600 rounded">Remover</button>
                                    </>
                                ) : (
                                    <span className="text-slate-600 text-sm w-full text-center">Slot Vazio</span>
                                )}
                            </div>
                        )
                    })}
                 </div>
            </div>

            {/* Right Panel: Details */}
             <div className="flex flex-col bg-slate-900/50 rounded-md overflow-hidden">
                <h3 className="text-xl font-bold text-amber-300 p-3 border-b border-slate-700 font-cinzel">Detalhes</h3>
                <div className="flex-1 overflow-y-auto">
                    {renderCompanionDetails(selectedCompanion)}
                </div>
             </div>
        </main>
      </div>
    </div>
  );
};

export default CompanionsScreen;
