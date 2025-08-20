
import React, { useState, useRef, useEffect } from 'react';
import { GameState, Suggestion, UIButton, Turn } from '../types';
import LoadingSpinner from './LoadingSpinner';
import CharacterSheet from './CharacterSheet';
import JsonViewer from './JsonViewer';
import SpaceInventory from './SpaceInventory';
import EquipmentScreen from './EquipmentScreen';
import CompanionsScreen from './CompanionsScreen';
import CombatStatusPanel from './CombatStatusPanel';
import RelationshipsScreen from './RelationshipsScreen';
import ImplantsScreen from './ImplantsScreen';
import QuestLog from './QuestLog';

interface GameScreenProps {
  gameState: GameState | null;
  turnHistory: Turn[];
  onSendInput: (input: string) => void;
  isLoading: boolean;
  loadingMessage: string;
  onUiAction: (button: UIButton) => void;
}

const SuggestionInfo: React.FC<{ suggestion: Suggestion }> = ({ suggestion }) => {
    const details = [];
    if (suggestion.travel?.required) {
        details.push(`Viagem: ${suggestion.travel.eta_h}h`);
        details.push(`Risco: ${suggestion.travel.risk}`);
    }
    if (suggestion.costs?.tempo_min > 0) {
        details.push(`Tempo: ${suggestion.costs.tempo_min}min`);
    }

    if (details.length === 0) return null;

    return (
        <div className="text-xs text-slate-400 mt-1 flex gap-2">
            {details.map((d, i) => <span key={i}>{d}</span>)}
        </div>
    );
};

const GameScreen: React.FC<GameScreenProps> = ({ gameState, turnHistory, onSendInput, isLoading, loadingMessage, onUiAction }) => {
  const [userInput, setUserInput] = useState('');
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isJsonOpen, setIsJsonOpen] = useState(false);
  const [isInvSpaceOpen, setIsInvSpaceOpen] = useState(false);
  const [isEquipmentOpen, setIsEquipmentOpen] = useState(false);
  const [isCompanionsOpen, setIsCompanionsOpen] = useState(false);
  const [isRelationshipsOpen, setIsRelationshipsOpen] = useState(false);
  const [isImplantsScreenOpen, setIsImplantsScreenOpen] = useState(false);
  const [isQuestLogOpen, setIsQuestLogOpen] = useState(false);
  const [isGameMenuOpen, setGameMenuOpen] = useState(false);
  const [isSettingsMenuOpen, setSettingsMenuOpen] = useState(false);
  const endOfMessagesRef = useRef<HTMLDivElement>(null);
  const gameMenuRef = useRef<HTMLDivElement>(null);
  const settingsMenuRef = useRef<HTMLDivElement>(null);
  
  const lastTurnState = gameState;

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [turnHistory]);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (gameMenuRef.current && !gameMenuRef.current.contains(event.target as Node)) {
        setGameMenuOpen(false);
      }
      if (settingsMenuRef.current && !settingsMenuRef.current.contains(event.target as Node)) {
        setSettingsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (userInput.trim() && !isLoading) {
      onSendInput(userInput.trim());
      setUserInput('');
    }
  };

  const handleSuggestionClick = (suggestionLabel: string) => {
    if (!isLoading) {
      onSendInput(suggestionLabel);
    }
  };
  
  const handleHeaderClick = (button: UIButton) => {
    switch(button.id) {
        case 'sheet':
            setIsSheetOpen(true);
            break;
        case 'json':
            setIsJsonOpen(true);
            break;
        case 'invspace':
            setIsInvSpaceOpen(true);
            break;
        case 'equipment':
            setIsEquipmentOpen(true);
            break;
        case 'implants':
            setIsImplantsScreenOpen(true);
            break;
        case 'companions':
            setIsCompanionsOpen(true);
            break;
        case 'relations':
            setIsRelationshipsOpen(true);
            break;
        case 'quests':
            setIsQuestLogOpen(true);
            break;
        default:
            onUiAction(button);
            break;
    }
  }
  
  const formatNarrative = (text: string): string => {
    let formattedText = text
      .replace(/\n/g, '<br />')
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/^\* (.*$)/gm, '<li class="ml-4 list-disc">$1</li>');
  
    // Highlight level-up messages
    const levelUpRegex = /(VOCÊ ATINGIU O NÍVEL \d+!|\[\w+\] aumentou para \d+!|\[\w+\] atingiu o nível \d+!)/gi;
    formattedText = formattedText.replace(levelUpRegex, '<strong class="text-amber-400 font-bold">$1</strong>');
  
    return formattedText;
  };

  if (!lastTurnState) {
    return <div className="flex justify-center items-center h-screen"><LoadingSpinner message="Carregando o mundo..." /></div>;
  }

  return (
    <div className="flex h-screen text-slate-300">
      {/* Main Content */}
      <main className="flex-1 flex flex-col p-4 md:p-6 overflow-hidden relative">
        <header className="flex justify-between items-center pb-4 border-b border-slate-800">
          {/* Título do Jogo */}
          <h1 className="text-3xl font-bold text-amber-400 font-cinzel tracking-wider">ISEKAI</h1>

          {/* Menus e Botões */}
          <div className="flex items-center gap-2">
            
            {/* --- Botões Principais (Alta Frequência) --- */}
            {lastTurnState.ui.buttons.filter(b => ['sheet', 'equipment', 'invspace', 'companions', 'relations', 'quests'].includes(b.id)).map(button => (
              <button 
                key={button.id} 
                onClick={() => handleHeaderClick(button)} 
                className="px-4 py-2 rounded-md transition-colors text-sm font-semibold border bg-amber-600/20 border-amber-800/80 text-amber-300 hover:bg-amber-500/30 hover:border-amber-700"
              >
                {button.label}
              </button>
            ))}
            {lastTurnState.ui.buttons.filter(b => b.id === 'implants').map(button => (
              <button 
                key={button.id} 
                onClick={() => handleHeaderClick(button)} 
                className="px-4 py-2 rounded-md transition-colors text-sm font-semibold border bg-cyan-600/20 border-cyan-800/80 text-cyan-300 hover:bg-cyan-500/30 hover:border-cyan-700"
              >
                {button.label}
              </button>
            ))}


            {/* --- Menu Dropdown de Jogo (Ações de Sistema) --- */}
            <div className="relative" ref={gameMenuRef}>
              <button 
                onClick={() => setGameMenuOpen(prev => !prev)}
                className="px-4 py-2 rounded-md transition-colors text-sm font-semibold border bg-slate-800/50 border-slate-700 hover:bg-slate-700/70 hover:border-slate-500"
              >
                Jogo
              </button>
              {isGameMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-slate-800 border border-slate-600 rounded-md shadow-lg z-20">
                  {lastTurnState.ui.buttons.filter(b => ['new', 'save', 'load', 'export', 'import'].includes(b.id)).map(button => (
                     <button 
                        key={button.id} 
                        onClick={() => { handleHeaderClick(button); setGameMenuOpen(false); }}
                        className="block w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-700"
                      >
                       {button.label}
                     </button>
                  ))}
                </div>
              )}
            </div>

            {/* --- Menu Dropdown de Configurações (Outras Ações) --- */}
            <div className="relative" ref={settingsMenuRef}>
                <button 
                    onClick={() => setSettingsMenuOpen(prev => !prev)}
                    className="px-3 py-2 rounded-md transition-colors text-sm font-semibold border bg-slate-800/50 border-slate-700 hover:bg-slate-700/70 hover:border-slate-500"
                >
                    {/* Sugestão: Substitua por um ícone de engrenagem */}
                    ⚙️
                </button>
                {isSettingsMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-slate-800 border border-slate-600 rounded-md shadow-lg z-20">
                        {lastTurnState.ui.buttons.filter(b => ['json', 'autosave'].includes(b.id)).map(button => (
                            <button 
                                key={button.id} 
                                onClick={() => { handleHeaderClick(button); if(button.id !== 'autosave') setSettingsMenuOpen(false); }}
                                className={`block w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 ${button.id === 'autosave' && button.checked ? 'text-green-400' : ''}`}
                            >
                                {button.label} {button.id === 'autosave' ? (button.checked ? ' (ON)' : ' (OFF)') : ''}
                            </button>
                        ))}
                    </div>
                )}
            </div>
          </div>
        </header>
        
        {/* NOVO: HUD de Status do Jogador */}
        <div className="absolute top-[80px] left-6 flex items-center gap-6 bg-black/30 p-2 rounded-lg border border-slate-800 backdrop-blur-sm shadow-lg">
          <div className="text-center px-2">
              <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Nível</p>
              <p className="text-xl font-bold text-white font-cinzel">{lastTurnState.player.nivel}</p>
          </div>
           <div className="border-l border-slate-700 h-8"></div>
          <div className="px-2">
              <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Classe</p>
              <p className="text-lg font-semibold text-amber-300 font-cinzel">{lastTurnState.player.classes[0]?.nome || 'N/A'}</p>
          </div>
           <div className="border-l border-slate-700 h-8"></div>
          <div className="px-2">
              <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Rank</p>
              <p className="text-lg font-semibold text-amber-300 font-cinzel">{lastTurnState.player.patente}</p>
          </div>
        </div>

        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 overflow-hidden pt-12">
          {/* Left Panel: Narrative */}
          <div className="md:col-span-2 flex flex-col bg-slate-900/70 shadow-lg rounded-lg overflow-hidden">
            <div className="flex-1 p-6 overflow-y-auto prose prose-invert prose-p:text-slate-300 prose-p:leading-relaxed prose-li:text-slate-300">
               {turnHistory.map((turn, index) => (
                    <React.Fragment key={index}>
                        {index > 0 && <hr className="my-6 turn-separator" />}
                        <div className="mb-6">
                            <div
                                dangerouslySetInnerHTML={{ __html: formatNarrative(turn.narrative) }}
                            />
                        </div>
                    </React.Fragment>
                ))}

             {isLoading && <div className="p-6"><LoadingSpinner message={loadingMessage} /></div>}
             <div ref={endOfMessagesRef} />
            </div>

            <div className="p-4 border-t border-slate-800">
              <form onSubmit={handleSubmit}>
                <input
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder={isLoading ? "Aguarde..." : "O que você faz?"}
                  disabled={isLoading}
                  className="w-full px-4 py-3 text-lg text-slate-200 bg-slate-800 border border-slate-700 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 transition-colors"
                />
              </form>
            </div>
          </div>
          
          {/* Right Panel: Suggestions or Combat Status */}
          <aside className="md:col-span-1 flex flex-col gap-4">
            {lastTurnState.combat ? (
                <CombatStatusPanel gameState={lastTurnState} />
            ) : (
                <div className="flex-1 bg-slate-900/70 shadow-lg rounded-lg p-4 flex flex-col">
                  <h2 className="text-xl font-bold text-amber-400 mb-3 pb-2 border-b border-slate-800 font-cinzel">SUGESTÕES</h2>
                  <div className="flex-1 overflow-y-auto -mr-2 pr-2">
                    <ul className="space-y-2">
                      {lastTurnState?.ui?.suggestions?.filter(s => s.label).map((s) => (
                        <li key={s.id}>
                          <button 
                            onClick={() => handleSuggestionClick(s.label)} 
                            disabled={isLoading || !s.valid_now}
                            className="w-full text-left px-3 py-2 bg-slate-800/60 rounded hover:bg-slate-700/80 disabled:opacity-50 disabled:bg-slate-800/40 disabled:cursor-not-allowed transition-colors border border-transparent hover:border-slate-600"
                          >
                            <p className={!s.valid_now ? 'text-slate-500' : 'text-slate-200'}>{s.label}</p>
                            <SuggestionInfo suggestion={s} />
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
            )}
          </aside>
        </div>
      </main>

      {isSheetOpen && <CharacterSheet player={lastTurnState.player} onClose={() => setIsSheetOpen(false)} />}
      {isJsonOpen && <JsonViewer data={lastTurnState} onClose={() => setIsJsonOpen(false)} />}
      {isInvSpaceOpen && <SpaceInventory inventory={lastTurnState.player.inventario_espaco} onClose={() => setIsInvSpaceOpen(false)} />}
      {isEquipmentOpen && <EquipmentScreen player={lastTurnState.player} onClose={() => setIsEquipmentOpen(false)} onSendInput={onSendInput} />}
      {isCompanionsOpen && <CompanionsScreen companions={lastTurnState.companheiros} onClose={() => setIsCompanionsOpen(false)} onSendInput={onSendInput} />}
      {isRelationshipsOpen && <RelationshipsScreen player={lastTurnState.player} onClose={() => setIsRelationshipsOpen(false)} />}
      {isImplantsScreenOpen && <ImplantsScreen player={lastTurnState.player} onClose={() => setIsImplantsScreenOpen(false)} onSendInput={onSendInput} />}
      {isQuestLogOpen && <QuestLog quests={lastTurnState.quests} onClose={() => setIsQuestLogOpen(false)} />}
    </div>
  );
};

export default GameScreen;
