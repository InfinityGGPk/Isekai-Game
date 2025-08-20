
import React from 'react';
import { PlayerState, PlayerAttributes, PlayerDerivatives, Skill } from '../types';
import { SKILL_DESCRIPTIONS } from '../constants';

interface CharacterSheetProps {
  player: PlayerState;
  onClose: () => void;
}

// --- Tooltip Component ---
interface TooltipProps {
  text: string;
  children: React.ReactNode;
}
const Tooltip: React.FC<TooltipProps> = ({ text, children }) => {
  return (
    <div className="relative flex items-center group">
      {children}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-slate-900 border border-slate-600 text-slate-300 text-sm rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
        {text}
      </div>
    </div>
  );
};
// -------------------------


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
            <div className="flex justify-between font-semibold">
                <span>{label}</span>
                <span>{value} / {max}</span>
            </div>
            <div className="w-full bg-slate-900 rounded-full h-4 border border-slate-600">
                <div className={`${color} h-full rounded-full text-center text-xs text-black font-bold flex items-center justify-center`} style={{ width: `${percentage}%` }}>
                   {Math.round(percentage)}%
                </div>
            </div>
        </div>
    );
}

const CharacterSheet: React.FC<CharacterSheetProps> = ({ player, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-4xl max-h-[90vh] bg-slate-800 border border-slate-600 rounded-lg shadow-2xl flex flex-col" onClick={e => e.stopPropagation()}>
        <header className="flex justify-between items-center p-4 border-b border-slate-600">
          <h2 className="text-3xl font-bold text-amber-400 font-cinzel">{player.nome}</h2>
          <button onClick={onClose} className="text-2xl text-slate-400 hover:text-white">&times;</button>
        </header>
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Col 1: Atributos & Recursos */}
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-amber-300 mb-3 font-cinzel">Recursos</h3>
                <div className="space-y-3">
                    <ResourceBar value={player.derivados.HP} max={player.derivados.HP_max} label="HP" color="bg-red-500"/>
                    <ResourceBar value={player.derivados.Stamina} max={player.derivados.Stamina_max} label="Stamina" color="bg-green-500"/>
                    <ResourceBar value={player.derivados.Mana} max={player.derivados.Mana_max} label="Mana" color="bg-blue-500"/>
                    <ResourceBar value={player.derivados.Foco} max={player.derivados.Foco_max} label="Foco" color="bg-purple-500"/>
                    <ResourceBar value={player.derivados.Sanidade} max={player.derivados.Sanidade_max} label="Sanidade" color="bg-slate-400"/>
                </div>
              </div>
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
            </div>

            {/* Col 2: Habilidades & Perícias */}
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-amber-300 mb-2 font-cinzel">Super-Habilidades</h3>
                {player.habilidades.length > 0 ? (
                  <ul className="space-y-2">
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
               <div>
                <h3 className="text-xl font-bold text-amber-300 mb-2 font-cinzel">Perícias</h3>
                <ul className="space-y-2">
                  {Object.entries(player.pericias).map(([key, value]) => (
                    <li key={key} className="flex justify-between items-center bg-slate-700/50 px-3 py-2 rounded">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{key}</span>
                        <Tooltip text={SKILL_DESCRIPTIONS[key] || "Descrição não disponível."}>
                           <div className="cursor-help w-5 h-5 flex items-center justify-center bg-slate-700 text-slate-400 rounded-full text-xs font-bold border border-slate-600 select-none">
                                ?
                           </div>
                        </Tooltip>
                      </div>
                      <span className="font-bold">{value}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Col 3: Inventário & Equipamento */}
            <div className="space-y-6">
               <div>
                <h3 className="text-xl font-bold text-amber-300 mb-2 font-cinzel">Moedas</h3>
                 <div className="flex gap-4 text-center">
                    <div className="flex-1 bg-slate-700/50 p-2 rounded">
                        <p className="text-lg font-bold text-yellow-500">{player.moedas.ouro}</p>
                        <p className="text-xs text-slate-400">Ouro</p>
                    </div>
                    <div className="flex-1 bg-slate-700/50 p-2 rounded">
                        <p className="text-lg font-bold text-slate-300">{player.moedas.prata}</p>
                        <p className="text-xs text-slate-400">Prata</p>
                    </div>
                    <div className="flex-1 bg-slate-700/50 p-2 rounded">
                        <p className="text-lg font-bold text-orange-400">{player.moedas.cobre}</p>
                        <p className="text-xs text-slate-400">Cobre</p>
                    </div>
                 </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-amber-300 mb-2 font-cinzel">Inventário</h3>
                {player.inventario.length > 0 ? (
                   <ul className="space-y-1">
                    {player.inventario.map((item) => (
                      <li key={item.id} className="bg-slate-700/50 px-2 py-1 rounded">
                        {item.nome} <span className="text-slate-400">x{item.quantidade}</span>
                      </li>
                    ))}
                  </ul>
                ) : <p className="text-slate-400">Inventário vazio.</p>}
              </div>
               <div>
                <h3 className="text-xl font-bold text-amber-300 mb-2 font-cinzel">Condições</h3>
                {player.condicoes.length > 0 ? (
                   <ul className="space-y-1">
                    {player.condicoes.map(cond => (
                      <li key={cond} className="bg-red-900/50 text-red-300 px-2 py-1 rounded">
                        {cond}
                      </li>
                    ))}
                  </ul>
                ) : <p className="text-slate-400">Nenhuma condição ativa.</p>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CharacterSheet;
