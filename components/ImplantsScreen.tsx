import React from 'react';
import { PlayerState, Item } from '../types';

interface ImplantsScreenProps {
  player: PlayerState;
  onClose: () => void;
  onSendInput: (input: string) => void;
}

const getIconForImplant = (item: Item | null | undefined): string => {
    if (!item) return '⚙️';
    const type = (item.tipo || '').toLowerCase();
    
    if (type.includes('ocular')) return '👁️';
    if (type.includes('espinhal')) return '⚡';
    if (type.includes('cardiaco')) return '❤️';
    if (type.includes('manual')) return '🖐️';
    
    return '⚙️';
};

const ImplantSlot: React.FC<{
    item: Item | null | undefined;
    label: string;
    onAction: (item: Item) => void;
    className?: string;
    isMultiple?: boolean;
    index?: number;
}> = ({ item, label, onAction, className = '', isMultiple = false, index = 0 }) => {
    const hasItem = item !== null && item !== undefined;

    const baseStyle = 'relative group w-20 h-20 bg-black/40 border-2 border-cyan-800/60 rounded-full flex items-center justify-center transition-all duration-300';
    const clickableStyle = 'cursor-pointer hover:bg-cyan-500/10 hover:border-cyan-500';

    const displayName = item?.nome || 'Vazio';

    return (
        <div className={`flex flex-col items-center gap-2 ${className}`}>
            <div 
                className={`${baseStyle} ${hasItem && clickableStyle}`}
                onClick={() => hasItem && onAction(item)}
                title={displayName}
                aria-label={displayName}
            >
                {hasItem ? (
                    <>
                        <span className="text-4xl" role="img" aria-label={displayName}>{getIconForImplant(item)}</span>
                        <div className="absolute bottom-full mb-2 w-max max-w-xs p-2 bg-slate-950 border border-cyan-800 text-slate-300 text-sm rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-20">
                           <p className="font-bold text-cyan-400">{item.nome}</p>
                           <p className="text-xs">{item.descrição}</p>
                           <p className="text-xs text-red-400 mt-1">Clique para remover</p>
                        </div>
                    </>
                ) : (
                    <div className="w-8 h-8 bg-cyan-900/50 rounded-full"/>
                )}
            </div>
            <p className="text-sm font-semibold text-cyan-600/80 font-cinzel select-none">{label}{isMultiple ? ` ${index+1}`:''}</p>
        </div>
    );
};


const ImplantsScreen: React.FC<ImplantsScreenProps> = ({ player, onClose, onSendInput }) => {
  const { equipamento, inventario } = player;

  const availableImplants = inventario.filter(item => item.tipo && item.tipo.startsWith('implante_'));

  const handleInstall = (item: Item) => {
    onSendInput(`Instalar ${item.nome || item.id}`);
  }
  
  const handleUninstall = (item: Item) => {
    onSendInput(`Remover ${item.nome || item.id}`);
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-2 z-50 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="w-full max-w-5xl h-[720px] bg-[#0a192f] border border-cyan-900/80 rounded-lg shadow-2xl flex relative overflow-hidden p-8" 
        style={{
            backgroundImage: 'radial-gradient(rgba(0, 255, 255, 0.05) 1px, transparent 1px)',
            backgroundSize: '20px 20px',
        }}
        onClick={e => e.stopPropagation()}
      >
         <div className="absolute top-4 right-4 z-10">
            <button onClick={onClose} className="text-4xl text-cyan-800/70 hover:text-cyan-500 transition-colors">&times;</button>
         </div>
        
        <main className="flex-1 grid grid-cols-2 gap-x-12 z-0">
            {/* Left Panel: Body System */}
            <div className="flex flex-col">
                <h2 className="text-3xl text-center font-bold text-cyan-400/90 font-cinzel tracking-widest mb-6" style={{textShadow: '1px 1px 5px rgba(0,255,255,0.3)'}}>SISTEMA CORPORAL</h2>
                 <div className="flex-1 relative">
                    {/* Body Silhouette */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-[0.05] pointer-events-none">
                        <svg viewBox="0 0 24 24" className="w-2/3 h-2/3" fill="currentColor" color="#00ffff">
                            <path d="M12,2A2,2 0 0,1 14,4A2,2 0 0,1 12,6A2,2 0 0,1 10,4A2,2 0 0,1 12,2M10.5,7H13.5A2,2 0 0,1 15.5,9V14.5H14V22H10V14.5H8.5V9A2,2 0 0,1 10.5,7Z" />
                        </svg>
                    </div>

                    <div className="relative w-full h-full">
                        <ImplantSlot item={equipamento.implant_eye[0]} label="Olho" onAction={handleUninstall} isMultiple index={0} className="absolute top-[10%] left-[5%]"/>
                        <ImplantSlot item={equipamento.implant_eye[1]} label="Olho" onAction={handleUninstall} isMultiple index={1} className="absolute top-[10%] right-[5%]"/>
                        <ImplantSlot item={equipamento.implant_heart} label="Coração" onAction={handleUninstall} className="absolute top-[35%] left-1/2 -translate-x-1/2"/>
                        <ImplantSlot item={equipamento.implant_spine} label="Espinha" onAction={handleUninstall} className="absolute top-[58%] left-1/2 -translate-x-1/2"/>
                        <ImplantSlot item={equipamento.implant_hand[0]} label="Mão" onAction={handleUninstall} isMultiple index={0} className="absolute bottom-[5%] left-[0%]"/>
                        <ImplantSlot item={equipamento.implant_hand[1]} label="Mão" onAction={handleUninstall} isMultiple index={1} className="absolute bottom-[5%] right-[0%]"/>
                    </div>
                 </div>
            </div>

            {/* Right Panel: Available Implants */}
            <div className="flex flex-col">
                <h2 className="text-3xl text-center font-bold text-cyan-400/90 font-cinzel tracking-widest mb-6" style={{textShadow: '1px 1px 5px rgba(0,255,255,0.3)'}}>IMPLANTES DISPONÍVEIS</h2>
                 <div className="flex-1 bg-black/30 rounded-md p-3 space-y-2 overflow-y-auto">
                   {availableImplants.length > 0 ? availableImplants.map((item) => (
                      <div 
                        key={item.id} 
                        className="p-3 bg-slate-800/70 border border-transparent hover:border-cyan-700 rounded-md cursor-pointer transition-colors"
                        onClick={() => handleInstall(item)}
                        title={`Instalar ${item.nome}`}
                      >
                         <p className="font-bold text-cyan-300">{getIconForImplant(item)} {item.nome}</p>
                         <p className="text-xs text-slate-400 pl-6">{item.descrição}</p>
                      </div>
                   )) : (
                     <div className="flex items-center justify-center h-full">
                        <p className="text-slate-500">Nenhum implante no inventário.</p>
                     </div>
                   )}
                 </div>
            </div>
        </main>
      </div>
    </div>
  );
};

export default ImplantsScreen;
