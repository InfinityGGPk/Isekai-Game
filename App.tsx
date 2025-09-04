
import React, { useState, useCallback, useEffect } from 'react';
import { HashRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { GamePhase, GameState, Turn, UIButton } from './types';
import { INITIAL_GAME_STATE } from './constants';
import { runGameTurn, extractJsonAndNarrative, generateImageFromPrompt } from './services/geminiService';
import CharacterCreation from './components/CharacterCreation';
import GameScreen from './components/GameScreen';
import LoadingSpinner from './components/LoadingSpinner';
import StartScreen from './components/StartScreen';
import Toast from './components/Toast';

const SAVE_GAME_KEY = 'isekaiAdventureSave_v2';

// Moved outside component as it's a pure function and doesn't depend on props or state
const upgradeSaveFile = (savedGameState: GameState) => {
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
      if (savedGameState.player.nivel === undefined) {
          console.log("Old save file detected. Upgrading with Level/Class system.");
          savedGameState.player.nivel = 1;
      }
       if ((savedGameState.player as any).classe && typeof (savedGameState.player as any).classe === 'string') {
          console.log("Migrating save file: converting single class to multi-class system.");
          savedGameState.player.classes = [{
              nome: (savedGameState.player as any).classe,
              nivel: 1,
              xp: 0,
              xp_next: 100
          }];
          delete (savedGameState.player as any).classe;
      }
      if (savedGameState.player.fama && (savedGameState.player.fama as any).xp === undefined) {
          console.log("Migrating save file: converting old fame system to new XP-based system.");
          const oldFamaReputation = savedGameState.player.fama as any;
          savedGameState.player.fama = {
              xp: 0,
              xp_next: 100,
              reputacao: oldFamaReputation.reputacao || oldFamaReputation || {}
          };
      }
      if (!savedGameState.player.nivelInfo) {
          console.log("Old save file detected. Upgrading with dedicated Level XP system.");
          const nextXp = savedGameState.player.nivel > 1 ? Math.floor(1000 * Math.pow(savedGameState.player.nivel, 1.5)) : 1000;
          savedGameState.player.nivelInfo = { xp: 0, xp_next: nextXp };
      }
      // -------------------------
      return savedGameState;
}

const AppContent: React.FC = () => {
  const [gamePhase, setGamePhase] = useState<GamePhase>(GamePhase.LOADING);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [turnHistory, setTurnHistory] = useState<Turn[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [chatHistory, setChatHistory] = useState<{ role: string, parts: { text: string }[] }[]>([]);
  const [saveExists, setSaveExists] = useState<boolean>(false);
  const [toast, setToast] = useState<{ message: string; key: number } | null>(null);

  const navigate = useNavigate();
  const location = useLocation();
  
  const showToast = useCallback((message: string) => {
    setToast({ message, key: Date.now() });
  }, []);

  const saveGame = useCallback((stateToSave: GameState, currentTurnHistory: Turn[], currentChatHistory: { role: string, parts: { text: string }[] }[]) => {
    try {
      // FIX: Truncate history to prevent exceeding localStorage quota.
      const truncatedTurnHistory = currentTurnHistory.slice(-50);
      const truncatedChatHistory = currentChatHistory.slice(-100);

      const dataToSave = {
        gameState: stateToSave,
        turnHistory: truncatedTurnHistory,
        chatHistory: truncatedChatHistory
      };
      localStorage.setItem(SAVE_GAME_KEY, JSON.stringify(dataToSave));
      setSaveExists(true);
    } catch (error) {
      console.error("Failed to save game:", error);
      if (error instanceof DOMException && (error.name === 'QuotaExceededError' || error.message.includes('quota'))) {
          showToast("Falha ao salvar: O histórico do jogo excedeu o limite de armazenamento.");
      } else {
          showToast("Falha ao salvar o jogo.");
      }
    }
  }, [showToast]);

  const loadGame = useCallback(() => {
    setIsLoading(true);
    setLoadingMessage('Carregando jogo salvo...');
    try {
      const savedData = localStorage.getItem(SAVE_GAME_KEY);
      if (savedData) {
        let { gameState: savedGameState, turnHistory: savedTurnHistory, chatHistory: savedChatHistory } = JSON.parse(savedData);
        
        savedGameState = upgradeSaveFile(savedGameState);

        setGameState(savedGameState);
        setTurnHistory(savedTurnHistory);
        setChatHistory(savedChatHistory || []);
        setGamePhase(GamePhase.PLAYING);
        showToast("Jogo carregado com sucesso.");
      } else {
          throw new Error("No saved data found.");
      }
    } catch (error) {
      console.error("Failed to load game:", error);
      showToast("Erro ao carregar. Iniciando novo jogo.");
      localStorage.removeItem(SAVE_GAME_KEY);
      setSaveExists(false);
      setGamePhase(GamePhase.START_SCREEN);
    } finally {
        setIsLoading(false);
        setLoadingMessage('');
    }
  }, [showToast]);

  // Effect to handle initial load and routing
  useEffect(() => {
    const savedData = localStorage.getItem(SAVE_GAME_KEY);
    const saveFileExists = !!savedData;
    setSaveExists(saveFileExists);

    const path = location.pathname;

    if (path === '/play' && saveFileExists) {
      loadGame();
    } else if (path === '/creation') {
      setGamePhase(GamePhase.CREATION);
    } else {
      setGamePhase(GamePhase.START_SCREEN);
    }
  }, []); // Run only once on mount

  // Effect to sync URL with gamePhase
  useEffect(() => {
    if (gamePhase === GamePhase.LOADING) return;

    const targetPath = {
      [GamePhase.START_SCREEN]: '/',
      [GamePhase.CREATION]: '/creation',
      [GamePhase.PLAYING]: '/play',
    }[gamePhase];

    if (targetPath && location.pathname !== targetPath) {
      navigate(targetPath);
    }
  }, [gamePhase, navigate, location.pathname]);


  const startNewGame = useCallback(() => {
    localStorage.removeItem(SAVE_GAME_KEY);
    setGameState(null);
    setTurnHistory([]);
    setChatHistory([]);
    setSaveExists(false);
    setGamePhase(GamePhase.CREATION);
  }, []);

  const exportGame = useCallback(() => {
    if (!gameState) return;
    try {
        const dataToSave = { gameState, turnHistory, chatHistory };
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
                let { gameState: importedGameState, turnHistory: importedTurnHistory, chatHistory: importedChatHistory } = JSON.parse(result);
                if (!importedGameState || !importedTurnHistory) throw new Error("Invalid save file format");
                
                importedGameState = upgradeSaveFile(importedGameState);

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
      if (!jsonState) throw new Error("A resposta da IA não continha um bloco de estado JSON válido.");

      if (jsonState.ui.image_prompt && !jsonState.ui.image_url) {
          try {
              setLoadingMessage('O Diretor de Arte está pintando a cena...');
              const imageUrl = await generateImageFromPrompt(jsonState.ui.image_prompt);
              jsonState.ui.image_url = imageUrl;
          } catch (imgError) {
              console.error(imgError);
              showToast(imgError instanceof Error ? imgError.message : "Erro desconhecido na imagem.");
              jsonState.ui.image_prompt = null;
          }
      }
      
      const cleanedNarrative = narrative.trim();
      const newTurn: Turn = { narrative: cleanedNarrative, state: jsonState };
      const updatedTurnHistory = [...currentTurnHistory, newTurn];
      const updatedChatHistory = [
        ...currentChatHistory,
        { role: 'user', parts: [{ text: originalUserInput }] },
        { role: 'model', parts: [{ text: cleanedNarrative }] },
      ];

      setGameState(jsonState);
      setTurnHistory(updatedTurnHistory);
      setChatHistory(updatedChatHistory);

      if (jsonState.ui?.toast) showToast(jsonState.ui.toast);
      
      if (jsonState.ui?.settings?.autosave && jsonState.ui?.intents?.emit_state_changed) {
          saveGame(jsonState, updatedTurnHistory, updatedChatHistory);
      }
      return jsonState;
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
    // FIX: Truncate chat history for API call to prevent exceeding context window.
    const truncatedChatHistoryForApi = currentChatHistory.slice(-20); // Keep last 20 messages (10 turns)
    const historyForApi = [...truncatedChatHistoryForApi, { role: 'user', parts: [{ text: userPromptForApi }] }];

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
      player: { ...INITIAL_GAME_STATE.player, ...playerData },
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
          case 'new': startNewGame(); break;
          case 'save': saveGame(gameState, turnHistory, chatHistory); showToast("Jogo salvo com sucesso!"); break;
          case 'load': loadGame(); break;
          case 'export': exportGame(); break;
          case 'import': importGame(); break;
          case 'autosave': handleSendInput(!gameState.ui?.settings?.autosave ? "Ativar o salvamento automático" : "Desativar o salvamento automático"); break;
          default: console.log(`UI Action (sem manipulação): ${actionId}`);
      }
  }, [gameState, turnHistory, chatHistory, startNewGame, saveGame, loadGame, exportGame, importGame, handleSendInput, showToast]);

  if (gamePhase === GamePhase.LOADING || (isLoading && gamePhase !== GamePhase.PLAYING)) {
      return <div className="flex justify-center items-center h-screen"><LoadingSpinner message={loadingMessage || "Carregando..."} /></div>;
  }

  return (
    <>
      <Routes>
        <Route path="/" element={<StartScreen onContinue={loadGame} onNewGame={startNewGame} hasSave={saveExists} onImport={importGame} />} />
        <Route path="/creation" element={<CharacterCreation onFinish={handleCharacterCreation} />} />
        <Route path="/play" element={
            gameState ? (
              <GameScreen
                gameState={gameState}
                turnHistory={turnHistory}
                onSendInput={handleSendInput}
                isLoading={isLoading}
                loadingMessage={loadingMessage}
                onUiAction={handleUiAction}
              />
            ) : <div className="flex justify-center items-center h-screen"><LoadingSpinner message="Preparando aventura..." /></div>
        } />
      </Routes>
      <Toast toast={toast} />
    </>
  );
};

const App: React.FC = () => {
  return (
    <HashRouter>
      <AppContent />
    </HashRouter>
  );
};

export default App;
