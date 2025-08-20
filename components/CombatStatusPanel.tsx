
import React from 'react';
import { GameState, Condition } from '../types';

const ResourceBar: React.FC<{ value: number; max: number; label: string; color: string }> = ({ value, max, label, color }) => {
    const percentage = max > 0 ? Math.min(100, (value / max) * 100) : 0;
    return (
        <div className="mb-2">
            <div className="flex justify-between text-xs font-semibold text-slate-300">
                <span>{label}</span>
                <span>{value} / {max}</span>
            </div>
            <div className="w-full bg-slate-900 rounded-full h-4 border border-slate-600">
                <div className={`${color} h-full rounded-full text-center text-xs text-black font-bold flex items-center justify-center transition-all duration-500`} style={{ width: `${percentage}%` }}>
                   {value > 0 ? `${Math.round(percentage)}%` : ''}
                </div>
            </div>
        </div>
    );
};

const CombatantStatus: React.FC<{ name: string; level: number | string; hp: number; hpMax: number; mana?: number; manaMax?: number; stamina?: number; staminaMax?: number; conditions: (string | Condition)[] }> = ({ name, level, hp, hpMax, mana, manaMax, stamina, staminaMax, conditions }) => {
    return (
        <div className="bg-slate-800/50 p-3 rounded-lg mb-4">
            <h3 className="font-bold text-lg text-amber-400 font-cinzel">{name} <span className="text-sm text-slate-400 font-sans"> (Nvl. {level})</span></h3>
            <ResourceBar value={hp} max={hpMax} label="HP" color="bg-red-500" />
            {mana !== undefined && manaMax !== undefined && manaMax > 0 && <ResourceBar value={mana} max={manaMax} label="Mana" color="bg-blue-500" />}
            {stamina !== undefined && staminaMax !== undefined && staminaMax > 0 && <ResourceBar value={stamina} max={staminaMax} label="Stamina" color="bg-green-500" />}
            {conditions.length > 0 && (
                <div className="mt-2 text-xs">
                    <span className="font-semibold text-slate-400">Condições: </span>
                    <span className="text-red-400">{conditions.map(c => typeof c === 'string' ? c : c.nome).join(', ')}</span>
                </div>
            )}
        </div>
    );
};


interface CombatStatusPanelProps {
  gameState: GameState;
}

const CombatStatusPanel: React.FC<CombatStatusPanelProps> = ({ gameState }) => {
    const { player, combat } = gameState;

    if (!combat) return null;

    return (
        <div className="flex-1 bg-slate-900/70 shadow-lg rounded-lg p-4 flex flex-col">
            <h2 className="text-xl font-bold text-red-500 mb-3 pb-2 border-b border-slate-800 font-cinzel tracking-wider">COMBATE</h2>
            <div className="flex-1 overflow-y-auto -mr-2 pr-2">
                <CombatantStatus 
                    name={player.nome}
                    level={player.pericias.Combate || 1}
                    hp={player.derivados.HP}
                    hpMax={player.derivados.HP_max}
                    mana={player.derivados.Mana}
                    manaMax={player.derivados.Mana_max}
                    stamina={player.derivados.Stamina}
                    staminaMax={player.derivados.Stamina_max}
                    conditions={player.condicoes}
                />

                <hr className="my-4 border-slate-700" />

                {combat.enemies.map(enemy => (
                    <CombatantStatus 
                        key={enemy.id}
                        name={enemy.nome}
                        level={enemy.nivel}
                        hp={enemy.hp}
                        hpMax={enemy.hp_max}
                        mana={enemy.mana}
                        manaMax={enemy.mana_max}
                        stamina={enemy.stamina}
                        staminaMax={enemy.stamina_max}
                        conditions={enemy.condicoes}
                    />
                ))}
            </div>
        </div>
    );
};

export default CombatStatusPanel;
