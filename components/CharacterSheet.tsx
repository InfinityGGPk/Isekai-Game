
import React from 'react';
import { PlayerState, PlayerAttributes, Skill } from '../types';
import { SKILL_DESCRIPTIONS } from '../constants';

interface CharacterSheetProps {
  player: PlayerState;
  onClose: () => void;
}

// --- Componentes de UI Internos ---

const Tooltip: React.FC<{ text: string; children: React.ReactNode }> = ({ text, children }) => (
  <div className="relative flex items-center group">
    {children}
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-slate-900 border border-slate-600 text-slate-300 text-sm rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
      {text}
    </div>
  </div>
);

const ProgressBar: React.FC<{ value: number; max: number; label: string }> = ({ value, max, label }) => {
  const percentage = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div>
      <div className="flex justify-between text-xs text-slate-400">
        <span>{label}</span>
        <span>{value} / {max}</span>
      </div>
      <div className="w-full bg-slate-900 rounded-full h-2.5">
        <div className="bg-amber-500 h-2.5 rounded-full" style={{ width: `${percentage}%` }}></div>
      </div>
    </div>
  );
};

const ResourceBar: React.FC<{ value: number; max: number; label: string; color: string }> = ({ value, max, label, color }) => {
  const percentage = max > 0 ? (value / max) * 100 : 0;
  return (
    <div>
      <div className="flex justify-between font-semibold text-sm">
        <span>{label}</span>
        <span>{value}/{max}</span>
      </div>
      <div className="w-full bg-slate-900 rounded-full h-4 border border-slate-600">
        <div className={`${color} h-full rounded-full flex items-center justify-center`} style={{ width: `${percentage}%` }}>
          <span className="text-xs text-black font-bold">{Math.round(percentage)}%</span>
        </div>
      </div>
    </div>
  );
};

// --- Componente Principal Reestruturado ---

const CharacterSheet: React.FC<CharacterSheetProps> = ({ player, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-6xl max-h-[90vh] bg-slate-800 border border-slate-600 rounded-lg shadow-2xl flex flex-col" onClick={e => e.stopPropagation()}>
        
        {/* Header com Nível, Classe e Rank */}
        <header className="flex justify-between items-center p-4 border-b border-slate-600">
          <div>
            <h2 className="text-3xl font-bold text-amber-400 font-cinzel">{player.nome}</h2>
            <p className="text-sm text-slate-400">{player.títulos?.join(', ') || 'Aventureiro'}</p>
          </div>
          {/* NOVO: Painel de Status */}
          <div className="flex items-center gap-4 text-center">
              <div className="px-3">
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Nível</p>
                  <p className="text-2xl font-bold text-white">{player.nivel}</p>
              </div>
              <div className="border-l border-slate-700 h-10"></div>
              <div className="px-3">
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Classe Principal</p>
                  <p className="text-xl font-semibold text-amber-300">{player.classes[0]?.nome || 'N/A'}</p>
              </div>
              <div className="border-l border-slate-700 h-10"></div>
              <div className="px-3">
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Rank</p>
                  <p className="text-xl font-semibold text-amber-300">{player.patente}</p>
              </div>
          </div>
          <button onClick={onClose} className="text-3xl text-slate-400 hover:text-white">&times;</button>
        </header>

        {/* Corpo Principal com 2 Colunas */}
        <div className="flex-1 p-6 overflow-y-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Coluna da Esquerda: Atributos, Perícias, Habilidades */}
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
                <div>
                    <h3 className="text-xl font-bold text-amber-300 mb-3 font-cinzel">Atributos</h3>
                    <ul className="space-y-3">
                      {Object.entries(player.atributos).map(([key, value]) => {
                        const attrKey = key as keyof PlayerAttributes;
                        const xpInfo = player.atributos_xp[attrKey];
                        return (
                          <li key={key} className="bg-slate-700/50 p-2 rounded">
                            <div className="flex justify-between font-bold">
                              <span>{attrKey}</span>
                              <span>{value}</span>
                            </div>
                            {xpInfo && <ProgressBar value={xpInfo.xp} max={xpInfo.next} label="XP" />}
                          </li>
                        );
                      })}
                    </ul>
                </div>
                <div>
                    <h3 className="text-xl font-bold text-amber-300 mb-3 font-cinzel">Perícias</h3>
                    <ul className="space-y-2">
                      {Object.entries(player.pericias).map(([key, value]) => (
                        <li key={key} className="flex justify-between items-center bg-slate-700/50 px-3 py-1 rounded text-sm">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">{key}</span>
                            <Tooltip text={SKILL_DESCRIPTIONS[key] || "Descrição não disponível."}>
                               <div className="cursor-help w-4 h-4 flex items-center justify-center bg-slate-700 text-slate-400 rounded-full text-xs font-bold border border-slate-600 select-none">?</div>
                            </Tooltip>
                          </div>
                          <span className="font-bold">{value}</span>
                        </li>
                      ))}
                    </ul>
                </div>
            </div>
            <div>
              <h3 className="text-xl font-bold text-amber-300 mb-3 font-cinzel">Classes</h3>
              {player.classes && player.classes.length > 0 ? (
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {player.classes.map((classe) => (
                    <li key={classe.nome} className="bg-slate-700/50 p-3 rounded">
                      <p className="font-bold text-amber-200">{classe.nome}</p>
                      <div className="mt-1">
                        <ProgressBar value={classe.xp} max={classe.xp_next} label={`Nível ${classe.nivel} XP`} />
                      </div>
                    </li>
                  ))}
                </ul>
              ) : <p className="text-slate-400">Nenhuma classe adquirida.</p>}
            </div>
             <div>
              <h3 className="text-xl font-bold text-amber-300 mb-3 font-cinzel">Super-Habilidades</h3>
              {player.habilidades.length > 0 ? (
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {player.habilidades.map((skill: Skill) => (
                    <li key={skill.id} className="bg-slate-700/50 p-3 rounded">
                      <p className="font-bold text-amber-200">{skill.nome}</p>
                      <div className="mt-1">
                        <ProgressBar value={skill.xp} max={skill.xp_next} label={`Nível ${skill.nível} XP`} />
                      </div>
                    </li>
                  ))}
                </ul>
              ) : <p className="text-slate-400">Nenhuma habilidade.</p>}
            </div>
          </div>

          {/* Coluna da Direita: Recursos e Informações Gerais */}
          <div className="space-y-6">
            <div>
                <h3 className="text-xl font-bold text-amber-300 mb-3 font-cinzel">Recursos</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ResourceBar value={player.derivados.HP} max={player.derivados.HP_max} label="HP" color="bg-red-500"/>
                    <ResourceBar value={player.derivados.Stamina} max={player.derivados.Stamina_max} label="Stamina" color="bg-green-500"/>
                    <ResourceBar value={player.derivados.Mana} max={player.derivados.Mana_max} label="Mana" color="bg-blue-500"/>
                    <ResourceBar value={player.derivados.Foco} max={player.derivados.Foco_max} label="Foco" color="bg-purple-500"/>
                    <ResourceBar value={player.derivados.Sanidade} max={player.derivados.Sanidade_max} label="Sanidade" color="bg-slate-400"/>
                </div>
            </div>
            <div className="bg-slate-700/50 p-4 rounded-lg space-y-3">
                <h3 className="text-xl font-bold text-amber-300 mb-3 font-cinzel">Fama e Rank</h3>
                <ProgressBar value={player.fama.xp} max={player.fama.xp_next} label={`Progresso para o Próximo Rank`} />
            </div>
            <div className="bg-slate-700/50 p-4 rounded-lg space-y-3">
                 <div className="flex justify-between items-center">
                    <h4 className="font-bold text-amber-300 font-cinzel">Moedas</h4>
                    <div className="flex gap-4 text-center">
                        <div><p className="text-lg font-bold text-yellow-500">{player.moedas.ouro}</p><p className="text-xs text-slate-400">Ouro</p></div>
                        <div><p className="text-lg font-bold text-slate-300">{player.moedas.prata}</p><p className="text-xs text-slate-400">Prata</p></div>
                        <div><p className="text-lg font-bold text-orange-400">{player.moedas.cobre}</p><p className="text-xs text-slate-400">Cobre</p></div>
                    </div>
                 </div>
                 <hr className="border-slate-600"/>
                 <div>
                    <h4 className="font-bold text-amber-300 font-cinzel mb-2">Condições</h4>
                    {player.condicoes.length > 0 ? (
                       <ul className="flex flex-wrap gap-2">
                        {player.condicoes.map((cond, index) => {
                           const isString = typeof cond === 'string';
                           const condition = isString ? { nome: cond } : cond as { id?: string, nome: string, descricao?: string, duracao?: string | number };
                           const key = condition.id || `${condition.nome}-${index}`;
                           const tooltipText = `${condition.descricao || ''}${condition.duracao ? ` (Duração: ${condition.duracao})` : ''}`;
                           return (
                             <Tooltip key={key} text={tooltipText}>
                                <li className="bg-red-900/50 text-red-300 px-2 py-1 rounded text-sm cursor-help">{condition.nome}</li>
                             </Tooltip>
                           );
                        })}
                      </ul>
                    ) : <p className="text-sm text-slate-400">Nenhuma condição ativa.</p>}
                 </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CharacterSheet;
