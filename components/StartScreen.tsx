
import React from 'react';

interface StartScreenProps {
  onContinue: () => void;
  onNewGame: () => void;
  onImport: () => void;
  hasSave: boolean;
}

const StartScreen: React.FC<StartScreenProps> = ({ onContinue, onNewGame, onImport, hasSave }) => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-900 p-4">
      <div className="w-full max-w-md p-8 space-y-8 bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg shadow-2xl text-center">
        <h1 className="text-4xl font-bold text-amber-400 font-cinzel">Isekai Adventure Engine</h1>
        <p className="text-slate-400">Sua jornada aguarda. Continue sua aventura ou forje um novo destino.</p>
        <div className="flex flex-col space-y-4">
          <button
            onClick={onContinue}
            disabled={!hasSave}
            className="w-full px-4 py-3 font-bold text-slate-900 bg-amber-400 rounded-md hover:bg-amber-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-amber-500 transition-colors duration-200 disabled:bg-slate-600 disabled:text-slate-400 disabled:cursor-not-allowed"
          >
            Continuar Jogo
          </button>
          <button
            onClick={onNewGame}
            className="w-full px-4 py-2 font-bold text-slate-200 bg-slate-700 rounded-md hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-amber-500 transition-colors duration-200"
          >
            {hasSave ? "Iniciar Novo Jogo" : "Novo Jogo"}
          </button>
           <button
            onClick={onImport}
            className="w-full px-4 py-2 font-bold text-slate-200 bg-slate-600 rounded-md hover:bg-slate-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-amber-500 transition-colors duration-200"
          >
            Importar Jogo (.json)
          </button>
        </div>
      </div>
    </div>
  );
};

export default StartScreen;
