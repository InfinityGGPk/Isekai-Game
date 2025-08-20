
import React from 'react';
import { SpaceInventory as SpaceInventoryType } from '../types';

interface SpaceInventoryProps {
  inventory: SpaceInventoryType;
  onClose: () => void;
}

const SpaceInventory: React.FC<SpaceInventoryProps> = ({ inventory, onClose }) => {
  const percentage = inventory.slots_max > 0 ? (inventory.slots_used / inventory.slots_max) * 100 : 0;
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-2xl max-h-[90vh] bg-slate-800 border border-slate-600 rounded-lg shadow-2xl flex flex-col" onClick={e => e.stopPropagation()}>
        <header className="flex justify-between items-center p-4 border-b border-slate-600">
          <h2 className="text-2xl font-bold text-amber-400 font-cinzel">Inventário do Espaço</h2>
          <button onClick={onClose} className="text-2xl text-slate-400 hover:text-white">&times;</button>
        </header>
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="mb-4 bg-slate-900 p-3 rounded-md">
            <div className="flex justify-between font-bold mb-1">
                <span>Uso de Slots</span>
                <span>{inventory.slots_used} / {inventory.slots_max}</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-4">
                <div className="bg-purple-600 h-4 rounded-full" style={{ width: `${percentage}%` }}></div>
            </div>
          </div>
          
          <div>
             <h3 className="text-xl font-bold text-amber-300 mb-3 font-cinzel">Itens Armazenados</h3>
             {inventory.items && inventory.items.length > 0 ? (
                <ul className="space-y-2">
                    {inventory.items.map(item => (
                        <li key={item.id} className="flex justify-between items-center bg-slate-700/50 p-3 rounded-md">
                            <div>
                                <p className="font-semibold">{item.nome}</p>
                                <p className="text-xs text-slate-400">Tipo: {item.tipo}</p>
                            </div>
                            <div className="text-right">
                                <p className="font-bold text-lg">x{item.qtd}</p>
                                {typeof item.slots === 'number' && item.slots > 0 && <p className="text-xs text-slate-400">Slots: {item.slots}</p>}
                            </div>
                        </li>
                    ))}
                </ul>
             ) : (
                <p className="text-slate-400 text-center py-4">O inventário do espaço está vazio.</p>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpaceInventory;
