import React, { useState, useMemo, useEffect } from 'react';
import { PlayerState, PlayerAttributes } from '../types';
import { ATTRIBUTE_POINTS, MIN_ATTRIBUTE, MAX_ATTRIBUTE, INITIAL_GAME_STATE, ATTRIBUTE_DESCRIPTIONS, SUPER_SKILLS, SOCIAL_ORIGINS } from '../constants';

interface CharacterCreationProps {
  onFinish: (playerData: Partial<PlayerState>) => void;
}

type AttributeKeys = keyof PlayerAttributes;

// --- Helper Functions ---
const calculateAgeModifiers = (age: number): Partial<PlayerAttributes> => {
    if (age <= 2) return { Força: -900, Agilidade: -900, Vigor: -900, Inteligência: -900, Vontade: -900, Percepção: -900, Carisma: -900, Sorte: 0, Técnica: -900, Afinidade: -900 }; // Bebê (penalidade percentual seria complexa, usando valores fixos altos)
    if (age >= 3 && age <= 10) return { Força: -40, Vigor: -40, Inteligência: 10, Afinidade: 10 }; // Criança
    if (age >= 11 && age <= 17) return { Agilidade: 20, Vigor: 10, Inteligência: -10, Carisma: -10 }; // Jovem
    if (age >= 41 && age <= 60) return { Força: -10, Agilidade: -10, Inteligência: 20, Vontade: 20 }; // Experiente
    if (age >= 61) return { Força: -25, Vigor: -25, Inteligência: 30, Vontade: 30 }; // Idoso
    return {}; // Adulto (18-40)
};

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

const CharacterCreation: React.FC<CharacterCreationProps> = ({ onFinish }) => {
  const [step, setStep] = useState(1);
  const [player, setPlayer] = useState<Partial<PlayerState>>({
    ...INITIAL_GAME_STATE.player,
    idade: 20,
    origem: 'origem_reencarnado', // Default origin
  });
  const [selectedSkillIds, setSelectedSkillIds] = useState<string[]>([]);
  const [ageModifiers, setAgeModifiers] = useState<Partial<PlayerAttributes>>({});

  useEffect(() => {
    if(player.idade !== undefined) {
        setAgeModifiers(calculateAgeModifiers(player.idade));
    }
  }, [player.idade]);


  const totalPointsUsed = useMemo(() => {
    if (!player.atributos) return 0;
    return Object.values(player.atributos).reduce((sum, val) => sum + (val - MIN_ATTRIBUTE), 0);
  }, [player.atributos]);

  const remainingPoints = ATTRIBUTE_POINTS - totalPointsUsed;

  const handleAttributeChange = (attr: AttributeKeys, valueAsString: string) => {
    let value = parseInt(valueAsString, 10);
    if (isNaN(value)) {
        value = MIN_ATTRIBUTE;
    }

    setPlayer(prev => {
        const oldAttributes = { ...prev.atributos } as PlayerAttributes;
        
        let otherPointsUsed = 0;
        for (const key in oldAttributes) {
            if (key !== attr) {
                otherPointsUsed += (oldAttributes[key as AttributeKeys] - MIN_ATTRIBUTE);
            }
        }
        
        const pointsAvailableForThisAttr = ATTRIBUTE_POINTS - otherPointsUsed;
        const maxValueForThisAttr = pointsAvailableForThisAttr + MIN_ATTRIBUTE;

        const clampedValue = Math.max(MIN_ATTRIBUTE, Math.min(MAX_ATTRIBUTE, Math.min(value, maxValueForThisAttr)));

        const newAttributes = { ...oldAttributes, [attr]: clampedValue };
        
        const newAtributosXp = { ...prev.atributos_xp };
        for (const key in newAttributes) {
            const attrKey = key as keyof PlayerAttributes;
            newAtributosXp[attrKey] = { xp: 0, next: Math.floor(10 * Math.pow(newAttributes[attrKey] + 1, 2)) };
        }

        return { ...prev, atributos: newAttributes, atributos_xp: newAtributosXp };
    });
  };
  
    const handleAttributeIncrement = (attr: AttributeKeys, amount: number) => {
    if (!player.atributos) return;
    const currentValue = player.atributos[attr];
    const newValue = currentValue + amount;
    handleAttributeChange(attr, String(newValue));
  };
  
  const handleDistributeEqually = () => {
    if (!player.atributos) return;
    const attrKeys = Object.keys(player.atributos) as AttributeKeys[];
    const numAttributes = attrKeys.length;
    const pointsPerAttribute = Math.floor(ATTRIBUTE_POINTS / numAttributes);
    const remainder = ATTRIBUTE_POINTS % numAttributes;

    const newAttributes = { ...player.atributos } as PlayerAttributes;
    
    attrKeys.forEach((key, index) => {
      let points = pointsPerAttribute + (index < remainder ? 1 : 0);
      newAttributes[key] = MIN_ATTRIBUTE + points;
    });
    
    setPlayer(prev => ({ ...prev, atributos: newAttributes }));
  };

  const handleSkillToggle = (skillId: string) => {
    setSelectedSkillIds(prev => {
      if (prev.includes(skillId)) {
        return prev.filter(id => id !== skillId);
      }
      if (prev.length < 7) {
        return [...prev, skillId];
      }
      return prev;
    });
  };

  const handleFinish = () => {
    if (!player.nome || player.nome.trim() === '') {
        alert("Por favor, insira um nome para o seu personagem.");
        setStep(1);
        return;
    }
    if (remainingPoints !== 0) {
        alert(`Você deve usar todos os ${ATTRIBUTE_POINTS} pontos. Pontos restantes: ${remainingPoints}.`);
        setStep(2);
        return;
    }
    
    const finalSkills = SUPER_SKILLS
        .filter(s => selectedSkillIds.includes(s.id))
        .map(s => ({
            id: s.id,
            nome: s.name,
            tipo: 'passiva' as 'passiva',
            nível: 1,
            xp: 0,
            xp_next: 200, // 50 * (1+1)^2
        }));

    onFinish({ ...player, habilidades: finalSkills });
  };
  
  const renderStep = () => {
    if(!player.atributos) return null;
    switch (step) {
      case 1:
        return (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-amber-400 font-cinzel">IDENTIDADE</h2>
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-1">Nome do Personagem</label>
                <input type="text" id="name" value={player.nome} onChange={e => setPlayer({...player, nome: e.target.value})} className="w-full px-3 py-2 text-slate-200 bg-[#1e293b] border border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500" />
              </div>
              <div>
                <label htmlFor="age" className="block text-sm font-medium text-slate-300 mb-1">Idade</label>
                <input type="number" id="age" value={player.idade} onChange={e => setPlayer({...player, idade: parseInt(e.target.value,10) || 18 })} className="w-full px-3 py-2 text-slate-200 bg-[#1e293b] border border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500" />
                {Object.keys(ageModifiers).length > 0 && (
                  <div className="mt-2 p-3 bg-slate-900/50 rounded-md text-sm">
                      <p className="font-bold text-slate-400 mb-1">Modificadores de Idade:</p>
                      <ul className="list-disc list-inside space-y-1">
                          {Object.entries(ageModifiers).map(([attr, value]) => (
                              <li key={attr} className={value > 0 ? 'text-green-400' : 'text-red-400'}>
                                  {attr}: {value > 0 ? `+${value}` : value}
                              </li>
                          ))}
                      </ul>
                  </div>
                )}
              </div>
               <div>
                  <h3 className="text-lg font-bold text-amber-400 font-cinzel mb-2">ORIGEM SOCIAL</h3>
                  <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                    {Object.entries(SOCIAL_ORIGINS).map(([category, origins]) => (
                      <div key={category}>
                        <h4 className="font-semibold text-slate-400 border-b border-slate-700 pb-1 mb-2">{category}</h4>
                        <div className="space-y-2">
                          {origins.map(origin => (
                            <label key={origin.id} className={`block p-3 rounded-md cursor-pointer border-2 transition-all ${player.origem === origin.id ? 'bg-amber-900/40 border-amber-500' : 'bg-slate-800 border-slate-700 hover:border-slate-500'}`}>
                              <input type="radio" name="origin" value={origin.id} checked={player.origem === origin.id} onChange={(e) => setPlayer({...player, origem: e.target.value})} className="hidden" />
                              <p className="font-bold text-amber-300">{origin.name}</p>
                              <p className="text-sm text-slate-400">{origin.description}</p>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
               </div>
            </div>
        );

      case 2: // Attributes
        return (
            <div>
              <h2 className="text-2xl font-bold text-amber-400 mb-2 font-cinzel">ATRIBUTOS</h2>
              <p className="mb-4 text-slate-400">Distribua seus {ATTRIBUTE_POINTS} pontos. Base {MIN_ATTRIBUTE}, Máximo {MAX_ATTRIBUTE}.</p>
              <div className="mb-4 p-3 bg-slate-900 rounded-md flex justify-center items-center gap-4">
                <span className="text-xl font-bold text-amber-400">Pontos Restantes: {remainingPoints}</span>
                 <button
                    onClick={handleDistributeEqually}
                    className="px-3 py-1 text-xs font-bold bg-slate-700 text-amber-300 rounded-md hover:bg-slate-600 transition-colors"
                  >
                    Distribuir Igualmente
                  </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 max-h-[50vh] overflow-y-auto pr-2">
                {(Object.keys(player.atributos) as Array<AttributeKeys>).map(attrKey => {
                  const value = player.atributos![attrKey];
                  return (
                    <div key={attrKey} className="flex items-center justify-between bg-slate-800 p-2 rounded-md">
                       <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-300 w-24">{attrKey}</span>
                          <Tooltip text={ATTRIBUTE_DESCRIPTIONS[attrKey]}>
                              <div className="cursor-help w-5 h-5 flex items-center justify-center bg-slate-700 text-slate-400 rounded-full text-xs font-bold border border-slate-600 select-none">?</div>
                          </Tooltip>
                      </div>
                      <div className="flex items-center gap-1">
                          {[-100, -10, -1].map(amount => (
                              <button key={amount} onClick={() => handleAttributeIncrement(attrKey, amount)} disabled={value + amount < MIN_ATTRIBUTE} className="w-9 h-8 font-mono text-sm font-bold bg-slate-700 rounded hover:bg-slate-600 disabled:bg-slate-800 disabled:text-slate-600 disabled:cursor-not-allowed transition-colors">{amount}</button>
                          ))}
                          <input type="number" value={value} onChange={(e) => handleAttributeChange(attrKey, e.target.value)} className="w-20 px-2 py-1 text-center font-bold text-xl text-white bg-[#1e293b] border border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"/>
                          {[1, 10, 100].map(amount => (
                              <button key={amount} onClick={() => handleAttributeIncrement(attrKey, amount)} disabled={remainingPoints < amount || value + amount > MAX_ATTRIBUTE} className="w-9 h-8 font-mono text-sm font-bold bg-slate-700 rounded hover:bg-slate-600 disabled:bg-slate-800 disabled:text-slate-600 disabled:cursor-not-allowed transition-colors">+{amount}</button>
                          ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
        );

      case 3: // Super Skills
        return (
            <div>
                <h2 className="text-2xl font-bold text-amber-400 mb-2 font-cinzel">HABILIDADES</h2>
                <p className="mb-4 text-slate-400">Escolha até 7 super-habilidades iniciais.</p>
                <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                    {SUPER_SKILLS.map(skill => (
                        <div key={skill.id} onClick={() => handleSkillToggle(skill.id)} className={`p-4 rounded-md cursor-pointer border-2 transition-all ${selectedSkillIds.includes(skill.id) ? 'bg-amber-900/50 border-amber-400' : 'bg-slate-800 border-slate-700 hover:border-slate-500'}`}>
                            <h3 className="font-bold text-lg text-amber-300">{skill.name}</h3>
                            <p className="text-sm text-slate-300">{skill.description}</p>
                            <p className="text-xs text-red-400 mt-1"><strong>Contra:</strong> {skill.contra}</p>
                        </div>
                    ))}
                </div>
            </div>
        );
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-[#0c1425]">
      <div className="w-full max-w-5xl p-8 space-y-6 bg-[#111827]/80 backdrop-blur-sm border border-slate-700 rounded-lg shadow-2xl">
        <h1 className="text-4xl font-bold text-center text-amber-400 font-cinzel">CRIAÇÃO DE PERSONAGEM</h1>
        
        <div className="border-b border-slate-700">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                 <button onClick={() => setStep(1)} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-lg ${step === 1 ? 'border-amber-500 text-amber-400' : 'border-transparent text-slate-500 hover:text-slate-300 hover:border-slate-400'}`}>Identidade</button>
                 <button onClick={() => setStep(2)} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-lg ${step === 2 ? 'border-amber-500 text-amber-400' : 'border-transparent text-slate-500 hover:text-slate-300 hover:border-slate-400'}`}>Atributos</button>
                 <button onClick={() => setStep(3)} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-lg ${step === 3 ? 'border-amber-500 text-amber-400' : 'border-transparent text-slate-500 hover:text-slate-300 hover:border-slate-400'}`}>Habilidades</button>
            </nav>
        </div>

        <div className="min-h-[450px] pt-4">
          {renderStep()}
        </div>

        <div className="flex justify-between mt-8 pt-6 border-t border-slate-700">
          <button onClick={() => setStep(s => Math.max(1, s - 1))} disabled={step === 1} className="px-8 py-2 font-bold bg-[#334155] text-slate-200 rounded-md hover:bg-slate-500 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed transition-colors">Voltar</button>
          {step < 3 ? (
            <button onClick={() => setStep(s => Math.min(3, s + 1))} className="px-8 py-2 font-bold bg-amber-500 text-slate-900 rounded-md hover:bg-amber-600 transition-colors">Avançar</button>
          ) : (
            <button onClick={handleFinish} className="px-8 py-2 font-bold bg-green-500 text-slate-900 rounded-md hover:bg-green-600 transition-colors">Finalizar e Jogar</button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CharacterCreation;