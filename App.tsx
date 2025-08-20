
import React, { useState, useCallback, useEffect } from 'react';
import { GamePhase, GameState, Turn, UIButton } from './types';
import { INITIAL_GAME_STATE } from './constants';
import { runGameTurn, extractJsonAndNarrative } from './services/geminiService';
import CharacterCreation from './components/CharacterCreation';
import GameScreen from './components/GameScreen';
import LoadingSpinner from './components/LoadingSpinner';
import StartScreen from './components/StartScreen';
import Toast from './components/Toast';

const SAVE_GAME_KEY = 'isekaiAdventureSave_v2';

const App: React.FC = () => {
  const [gamePhase, setGamePhase] = useState<GamePhase>(GamePhase.LOADING);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [turnHistory, setTurnHistory] = useState<Turn[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [chatHistory, setChatHistory] = useState<{ role: string, parts: { text: string }[] }[]>([]);
  const [saveExists, setSaveExists] = useState<boolean>(false);
  const [toast, setToast] = useState<{ message: string; key: number } | null>(null);

  useEffect(() => {
    try {
      const savedData = localStorage.getItem(SAVE_GAME_KEY);
      if (savedData) {
        setSaveExists(true);
      }
    } catch (error) {
      console.error("Could not check for saved game:", error);
    }
    setGamePhase(GamePhase.START_SCREEN);
  }, []);
  
  const showToast = useCallback((message: string) => {
    setToast({ message, key: Date.now() });
  }, []);

  const saveGame = useCallback((stateToSave: GameState, currentTurnHistory: Turn[], currentChatHistory: { role: string, parts: { text: string }[] }[]) => {
    try {
      const dataToSave = {
        gameState: stateToSave,
        turnHistory: currentTurnHistory,
        chatHistory: currentChatHistory
      };
      localStorage.setItem(SAVE_GAME_KEY, JSON.stringify(dataToSave));
      setSaveExists(true);
    } catch (error) {
      console.error("Failed to save game:", error);
      showToast("Falha ao salvar o jogo.");
    }
  }, [showToast]);

  const loadGame = useCallback(() => {
    setIsLoading(true);
    setLoadingMessage('Carregando jogo salvo...');
    try {
      const savedData = localStorage.getItem(SAVE_GAME_KEY);
      if (savedData) {
        const { gameState: savedGameState, turnHistory: savedTurnHistory, chatHistory: savedChatHistory } = JSON.parse(savedData);
        
        // --- UPGRADE SAVE FILE ---
        if (!savedGameState.player.equipamento) {
            console.log("Old save file detected. Upgrading with Equipment system.");
            savedGameState.player.equipamento = INITIAL_GAME_STATE.player.equipamento;
            savedGameState.player.sintonias = INITIAL_GAME_STATE.player.sintonias;
        }
        
        if ((savedGameState.player as any).harem && !savedGameState.player.circuloIntimo) {
            console.log("Migrating save file: renaming 'harem' to 'circuloIntimo'.");
            savedGameState.player.circuloIntimo = (savedGameState.player as any).harem;
            delete (savedGameState.player as any).harem;
        }

        if (!savedGameState.player.relacionamentos) {
            console.log("Old save file detected. Upgrading with Relationships system.");
            savedGameState.player.relacionamentos = INITIAL_GAME_STATE.player.relacionamentos;
            savedGameState.player.circuloIntimo = INITIAL_GAME_STATE.player.circuloIntimo;
        }

        if (!savedGameState.quests) {
            console.log("Old save file detected. Upgrading with Quest system.");
            savedGameState.quests = [];
        }
        
        if (typeof savedGameState.flags !== 'object' || savedGameState.flags === null) {
            console.log("Old save file detected. Upgrading flags system.");
            savedGameState.flags = { tutorial: true };
        }
        // -------------------------

        setGameState(savedGameState);
        setTurnHistory(savedTurnHistory);
        setChatHistory(savedChatHistory || []);
        setGamePhase(GamePhase.PLAYING);
        showToast("Jogo carregado com sucesso.");
      }
    } catch (error) {
      console.error("Failed to load game:", error);
      showToast("Erro ao carregar. Iniciando novo jogo.");
      localStorage.removeItem(SAVE_GAME_KEY);
      setSaveExists(false);
      setGamePhase(GamePhase.CREATION);
    } finally {
        setIsLoading(false);
        setLoadingMessage('');
    }
  }, [showToast]);

  const startNewGame = useCallback(() => {
    const confirmationText = "Tem certeza? Todo o progresso salvo será perdido.";
    if (!saveExists || window.confirm(confirmationText)) {
      localStorage.removeItem(SAVE_GAME_KEY);
      setGameState(null);
      setTurnHistory([]);
      setChatHistory([]);
      setSaveExists(false);
      setGamePhase(GamePhase.CREATION);
    }
  }, [saveExists]);

  const exportGame = useCallback(() => {
    if (!gameState) return;
    try {
        const dataToSave = {
            gameState,
            turnHistory,
            chatHistory
        };
        const blob = new Blob([JSON.stringify(dataToSave, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `isekai-save-${gameState.player.nome}-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
        showToast("Jogo exportado.");
    } catch (error) {
        console.error("Failed to export game:", error);
        showToast("Falha ao exportar o jogo.");
    }
  }, [gameState, turnHistory, chatHistory, showToast]);

  const importGame = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const result = event.target?.result;
                if (typeof result !== 'string') throw new Error("File is not text");
                const { gameState: importedGameState, turnHistory: importedTurnHistory, chatHistory: importedChatHistory } = JSON.parse(result);
                if (!importedGameState || !importedTurnHistory) throw new Error("Invalid save file format");
                
                // --- UPGRADE IMPORTED SAVE FILE ---
                if (!importedGameState.player.equipamento) {
                    console.log("Old imported save file detected. Upgrading with Equipment system.");
                    importedGameState.player.equipamento = INITIAL_GAME_STATE.player.equipamento;
                    importedGameState.player.sintonias = INITIAL_GAME_STATE.player.sintonias;
                }

                if ((importedGameState.player as any).harem && !importedGameState.player.circuloIntimo) {
                    console.log("Migrating imported save file: renaming 'harem' to 'circuloIntimo'.");
                    importedGameState.player.circuloIntimo = (importedGameState.player as any).harem;
                    delete (importedGameState.player as any).harem;
                }

                if (!importedGameState.player.relacionamentos) {
                    console.log("Old imported save file detected. Upgrading with Relationships system.");
                    importedGameState.player.relacionamentos = INITIAL_GAME_STATE.player.relacionamentos;
                    importedGameState.player.circuloIntimo = INITIAL_GAME_STATE.player.circuloIntimo;
                }
                
                if (!importedGameState.quests) {
                    console.log("Old imported save file detected. Upgrading with Quest system.");
                    importedGameState.quests = [];
                }

                if (typeof importedGameState.flags !== 'object' || importedGameState.flags === null) {
                    console.log("Old imported save file detected. Upgrading flags system.");
                    importedGameState.flags = { tutorial: true };
                }
                // ------------------------------------

                setGameState(importedGameState);
                setTurnHistory(importedTurnHistory);
                setChatHistory(importedChatHistory || []);
                setGamePhase(GamePhase.PLAYING);
                saveGame(importedGameState, importedTurnHistory, importedChatHistory);
                showToast("Jogo importado com sucesso.");
            } catch (error) {
                console.error("Failed to import game:", error);
                showToast("Arquivo de save inválido.");
            }
        };
        reader.readAsText(file);
    };
    input.click();
  }, [saveGame, showToast]);
  
  const processTurnAtomically = useCallback(async (responseText: string, originalUserInput: string, currentGameState: GameState, currentTurnHistory: Turn[], currentChatHistory: any[]) => {
      const { narrative, jsonState } = extractJsonAndNarrative(responseText);

      if (!jsonState) {
        throw new Error("A resposta da IA não continha um bloco de estado JSON válido.");
      }
      
      const cleanedNarrative = narrative.trim();

      const newTurn: Turn = { narrative: cleanedNarrative, state: jsonState };
      
      const updatedTurnHistory = [...currentTurnHistory, newTurn];
      const updatedChatHistory = [
        ...currentChatHistory,
        { role: 'user', parts: [{ text: originalUserInput }] }, // Only add the short user input
        { role: 'model', parts: [{ text: cleanedNarrative }] },
      ];

      // Atomic state update
      setGameState(jsonState);
      setTurnHistory(updatedTurnHistory);
      setChatHistory(updatedChatHistory);

      if (jsonState.ui?.toast) {
        showToast(jsonState.ui.toast);
      }
      
      if (jsonState.ui?.settings?.autosave && jsonState.ui?.intents?.emit_state_changed) {
          saveGame(jsonState, updatedTurnHistory, updatedChatHistory);
      }
      return jsonState; // Return new state for manual save
  }, [saveGame, showToast]);

  const handleSendInput = useCallback(async (input: string, stateOverride: GameState | null = null, historyOverride: Turn[] | null = null) => {
    const currentState = stateOverride || gameState;
    const currentTurnHistory = historyOverride || turnHistory;
    const currentChatHistory = chatHistory;
    if (!currentState) return;

    setIsLoading(true);
    setLoadingMessage('O Mestre do Jogo está pensando...');

    const userPromptForApi = `
AÇÃO DO JOGADOR: "${input}"

ESTADO ATUAL DO JOGO PARA ESTE TURNO:
\`\`\`json
${JSON.stringify(currentState, null, 2)}
\`\`\`
`;
    
    const historyForApi = [...currentChatHistory, { role: 'user', parts: [{ text: userPromptForApi }] }];

    try {
      const responseText = await runGameTurn(historyForApi);
      await processTurnAtomically(responseText, input, currentState, currentTurnHistory, currentChatHistory);

    } catch (error) {
      console.error("Erro ao processar o turno:", error);
      const errorMessage = error instanceof Error ? error.message : "Um erro desconhecido ocorreu.";
      showToast(`Erro: ${errorMessage}`);
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  }, [gameState, turnHistory, chatHistory, processTurnAtomically, showToast]);

  const handleCharacterCreation = useCallback((playerData: GameState['player']) => {
    const startingState: GameState = {
      ...INITIAL_GAME_STATE,
      player: {
        ...INITIAL_GAME_STATE.player,
        ...playerData,
      },
      seed: Math.floor(Math.random() * 1000000).toString(),
    };
    
    startingState.player.derivados.HP_max = startingState.player.atributos.Vigor * 7;
    startingState.player.derivados.HP = startingState.player.derivados.HP_max;
    startingState.player.derivados.Stamina_max = startingState.player.atributos.Vigor * 7;
    startingState.player.derivados.Stamina = startingState.player.derivados.Stamina_max;
    startingState.player.derivados.Mana_max = startingState.player.atributos.Afinidade * 10;
    startingState.player.derivados.Mana = startingState.player.derivados.Mana_max;
    startingState.player.derivados.Foco_max = startingState.player.atributos.Vontade * 5;
    startingState.player.derivados.Foco = startingState.player.derivados.Foco_max;
    startingState.player.derivados.Sanidade_max = startingState.player.atributos.Vontade * 5;
    startingState.player.derivados.Sanidade = startingState.player.derivados.Sanidade_max;
    startingState.player.derivados.Carga_max = startingState.player.atributos.Força * 5;
    startingState.player.derivados.Carga = 0;

    setGameState(startingState);
    setChatHistory([]);
    setTurnHistory([]);
    handleSendInput('Começar o jogo.', startingState, []);
    setGamePhase(GamePhase.PLAYING);
  }, [handleSendInput]);

  const handleUiAction = useCallback(async (button: UIButton) => {
      if (!gameState) return;
      
      const actionId = button.id;
      
      switch (actionId) {
          case 'new':
              startNewGame();
              break;
          case 'save':
              saveGame(gameState, turnHistory, chatHistory);
              showToast("Jogo salvo com sucesso!");
              break;
          case 'load':
              loadGame();
              break;
          case 'export':
              exportGame();
              break;
          case 'import':
              importGame();
              break;
          case 'autosave': {
              const newAutosaveState = !gameState.ui?.settings?.autosave;
              const command = newAutosaveState ? "Ativar o salvamento automático" : "Desativar o salvamento automático";
              handleSendInput(command);
              break;
          }
          default:
              console.log(`UI Action (sem manipulação): ${actionId}`);
      }
  }, [gameState, turnHistory, chatHistory, startNewGame, saveGame, loadGame, exportGame, importGame, handleSendInput, showToast]);

  const renderContent = () => {
    if (isLoading && gamePhase !== GamePhase.PLAYING) {
        return <div className="flex justify-center items-center h-screen"><LoadingSpinner message={loadingMessage || "Carregando..."} /></div>;
    }

    switch (gamePhase) {
      case GamePhase.LOADING:
        return <div className="flex justify-center items-center h-screen"><LoadingSpinner message="Carregando..." /></div>;
      case GamePhase.START_SCREEN:
        return <StartScreen onContinue={loadGame} onNewGame={startNewGame} hasSave={saveExists} onImport={importGame} />;
      case GamePhase.CREATION:
        return <CharacterCreation onFinish={handleCharacterCreation} />;
      case GamePhase.PLAYING:
        return (
          <GameScreen
            gameState={gameState}
            turnHistory={turnHistory}
            onSendInput={handleSendInput}
            isLoading={isLoading}
            loadingMessage={loadingMessage}
            onUiAction={handleUiAction}
          />
        );
      default:
        return <div className="flex justify-center items-center h-screen"><LoadingSpinner message="Carregando..." /></div>;
    }
  };

  return (
    <>
      {renderContent()}
      <Toast toast={toast} />
    </>
  );
};

export default App;
