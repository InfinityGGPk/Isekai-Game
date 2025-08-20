import React from 'react';
import { PlayerState, Item } from '../types';

interface EquipmentScreenProps {
  player: PlayerState;
  onClose: () => void;
  onSendInput: (input: string) => void;
}

const getIconForItem = (item: Item | null | undefined): string => {
    if (!item) return '✨';
    const type = (item.tipo || '').toLowerCase();
    
    if (type.includes('anel')) return '💍';
    if (type.includes('espada') || type.includes('arma') || type.includes('adaga') || type.includes('lâmina')) return '⚔️';
    if (type.includes('machado')) return '🪓';
    if (type.includes('arco') || type.includes('besta') || type.includes('distância')) return '🏹';
    if (type.includes('escudo')) return '🛡️';
    if (type.includes('elmo') || type.includes('capacete') || type.includes('cabeça')) return '🪖';
    if (type.includes('peitoral') || type.includes('armadura') || type.includes('peito')) return '🎽';
    if (type.includes('luva')) return '🧤';
    if (type.includes('bota')) return '👢';
    if (type.includes('amuleto') || type.includes('colar')) return '📿';
    if (type.includes('poção')) return '🧪';
    if (type.includes('livro') || type.includes('tomo') || type.includes('foco')) return '📖';
    if (type.includes('manto') || type.includes('capa')) return '🧣';
    
    return '✨'; // Ícone padrão para tipos desconhecidos
};

const Slot: React.FC<{
    item: Item | null | undefined;
    label?: string;
    onClick?: () => void;
    className?: string;
}> = ({ item, label, onClick, className = '' }) => {
    const hasItem = item !== null && item !== undefined;
    const isClickable = onClick !== undefined;

    const baseStyle = 'aspect-square bg-black/40 flex items-center justify-center p-1 relative group transition-all duration-200 border border-yellow-800/60';
    const clickableStyle = isClickable ? 'cursor-pointer hover:bg-yellow-500/10 hover:border-yellow-500' : '';
    
    const displayName = item?.nome || `[${item?.tipo || 'Item'}]`;

    return (
        <div 
            className={`${baseStyle} ${clickableStyle} ${className}`}
            onClick={onClick}
            title={hasItem ? displayName : label || 'Vazio'}
            aria-label={hasItem ? displayName : label || 'Slot Vazio'}
        >
            {hasItem ? (
                 <>
                    <span className="text-3xl" role="img" aria-label={displayName}>{getIconForItem(item)}</span>
                    {item.quantidade > 1 && (
                         <span className="absolute bottom-1 right-1 text-xs font-bold text-white bg-slate-900/80 px-1 rounded-sm">{item.quantidade}</span>
                    )}
                    <div className="absolute bottom-full mb-2 w-max max-w-xs p-2 bg-slate-950 border border-yellow-800 text-slate-300 text-sm rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-20">
                       <p className="font-bold text-yellow-400">{displayName}</p>
                       <p className="text-xs">{item.descrição}</p>
                    </div>
                 </>
            ) : (
                label && <span className="text-[9px] text-yellow-800/70 font-semibold opacity-50 uppercase select-none">{label}</span>
            )}
        </div>
    );
};


const AccessoryGroup: React.FC<{
    items: (Item | null)[];
    label: string;
    onUnequip: (item: Item) => void;
    layout: '1+4' | '2x2';
    maxSlots: number;
}> = ({ items, label, onUnequip, layout, maxSlots }) => {
    const equippedItems = items.filter((i): i is Item => i !== null);
    
    if (layout === '1+4') {
        const mainItem = equippedItems[0] || null;
        return (
            <div className="flex flex-col items-center">
                <div className="flex items-center gap-1">
                    <Slot item={mainItem} onClick={() => mainItem && onUnequip(mainItem)} className="w-12 h-12"/>
                    <div className="grid grid-cols-2 gap-1">
                        {[...Array(maxSlots - 1)].map((_, i) => {
                            const itemInSlot = equippedItems[i + 1];
                            return <div key={i} title={itemInSlot?.nome} className={`w-3 h-3 rounded-sm border ${itemInSlot ? 'bg-yellow-500 border-yellow-400' : 'border-yellow-800/50'}`}></div>;
                        })}
                    </div>
                </div>
                 <p className="text-xs font-cinzel text-yellow-600/80 mt-1">{label}</p>
            </div>
        );
    }

    if (layout === '2x2') {
         return (
            <div className="flex flex-col items-center">
                 <p className="text-xs font-cinzel text-yellow-600/80 mb-1">{label}</p>
                <div className="grid grid-cols-2 gap-1">
                    {[...Array(maxSlots)].map((_, i) => {
                        const itemInSlot = equippedItems[i];
                        return <Slot key={i} item={itemInSlot} onClick={() => itemInSlot && onUnequip(itemInSlot)} className="w-10 h-10" />
                    })}
                </div>
            </div>
        );
    }
    
    return null;
};


const EquipmentScreen: React.FC<EquipmentScreenProps> = ({ player, onClose, onSendInput }) => {
  const { equipamento, inventario } = player;
  
  const INVENTORY_SLOTS = 24; // 4x6 grid
  const inventorySlots = Array.from({ length: INVENTORY_SLOTS }).map((_, i) => inventario[i] || null);
  
  const handleEquip = (item: Item) => {
    if (item) onSendInput(`Equipar ${item.nome || item.id}`);
  }
  
  const handleUnequip = (item: Item) => {
    if (item) onSendInput(`Desequipar ${item.nome || item.id}`);
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-2 z-50 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="w-full max-w-5xl h-[720px] border border-yellow-900/80 rounded-lg shadow-2xl flex relative overflow-hidden p-8" 
        style={{
            backgroundColor: '#1a1a1a',
            backgroundImage: 'radial-gradient(rgba(255, 215, 0, 0.05) 1px, transparent 1px)',
            backgroundSize: '16px 16px',
        }}
        onClick={e => e.stopPropagation()}
      >
         <div className="absolute top-4 right-4 z-10">
            <button onClick={onClose} className="text-4xl text-yellow-800/70 hover:text-yellow-500 transition-colors">&times;</button>
         </div>
        
        <main className="flex-1 grid grid-cols-2 gap-x-12 z-0">
            {/* Left Panel: Inventory */}
            <div className="flex flex-col">
                <h2 className="text-3xl text-center font-bold text-yellow-400/90 font-cinzel tracking-widest mb-4" style={{textShadow: '1px 1px 3px rgba(0,0,0,0.5)'}}>INVENTORY</h2>
                 <div className="flex-1 grid grid-cols-4 gap-2 p-2 bg-black/20 rounded-md">
                   {inventorySlots.map((item, index) => (
                      <Slot key={index} item={item} onClick={() => item && handleEquip(item)} />
                   ))}
                 </div>
                 <div className="flex justify-center gap-4 mt-4">
                    {['BAG 1', 'BAG 2', 'BAG 3', 'BAG 4'].map((bag, i) => (
                        <button key={bag} className={`px-6 py-2 text-sm font-bold rounded-t-md border-t-2 border-x-2 transition-colors ${i === 0 ? 'bg-black/30 border-yellow-800/80 text-yellow-300' : 'bg-black/20 border-transparent text-yellow-700 hover:bg-black/30'}`}>
                           {bag}
                        </button>
                    ))}
                 </div>
            </div>

            {/* Right Panel: Equipment */}
            <div className="flex flex-col">
                <h2 className="text-3xl text-center font-bold text-yellow-400/90 font-cinzel tracking-widest mb-4" style={{textShadow: '1px 1px 3px rgba(0,0,0,0.5)'}}>CHARACTER</h2>
                 <div className="flex-1 relative">
                    {/* Character Silhouette */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
                        <svg viewBox="0 0 100 100" className="w-3/4 h-3/4" fill="currentColor" color="#d4af37">
                          <path d="M50 0C35 0 25 10 25 20s5 15 10 15h30c5 0 10-5 10-15S65 0 50 0zM20 40c-10 0-15 10-15 20v30h20V70c0-10 5-10 5-10h40s5 0 5 10v20h20V60c0-10-5-20-15-20H20z" />
                        </svg>
                    </div>

                    <div className="grid grid-cols-5 grid-rows-6 h-full gap-2">
                      {/* Main Gear Column (Center) */}
                      <div className="col-start-3 row-start-1 flex justify-center items-end"><Slot item={equipamento.helmet} onClick={() => handleUnequip(equipamento.helmet)} label="Head"/></div>
                      <div className="col-start-3 row-start-2 flex justify-center items-center"><Slot item={equipamento.chest} onClick={() => handleUnequip(equipamento.chest)} label="Chest" className="h-24 w-24"/></div>
                      <div className="col-start-3 row-start-3 flex justify-center items-center"><Slot item={equipamento.belt} onClick={() => handleUnequip(equipamento.belt)} label="Belt"/></div>
                      <div className="col-start-3 row-start-4 flex justify-center items-center"><Slot item={equipamento.pants} onClick={() => handleUnequip(equipamento.pants)} label="Legs" className="h-24 w-24"/></div>
                      <div className="col-start-3 row-start-5 flex justify-center items-start"><Slot item={equipamento.boots} onClick={() => handleUnequip(equipamento.boots)} label="Feet"/></div>
                      
                      {/* Left Column */}
                      <div className="col-start-2 row-start-1 flex justify-center items-end"><Slot item={equipamento.pauldron[0]} onClick={() => handleUnequip(equipamento.pauldron[0])} label="Shoulder"/></div>
                      <div className="col-start-2 row-start-3 flex justify-center items-center"><Slot item={equipamento.glove} onClick={() => handleUnequip(equipamento.glove)} label="Gloves"/></div>
                      <div className="col-start-2 row-start-5 flex justify-center items-start"><Slot item={equipamento.weapon_main} onClick={() => handleUnequip(equipamento.weapon_main)} label="Weapon"/></div>
                      
                      {/* Far Left Column */}
                       <div className="col-start-1 row-start-2 flex justify-center items-center">
                          <AccessoryGroup items={equipamento.relic} label="Relics" onUnequip={handleUnequip} layout="2x2" maxSlots={4}/>
                       </div>
                       <div className="col-start-1 row-start-4 flex justify-center items-center">
                           <AccessoryGroup items={equipamento.ring.slice(0, 5)} label="Rings" onUnequip={handleUnequip} layout="1+4" maxSlots={5}/>
                       </div>
                       <div className="col-start-1 row-start-5 flex justify-center items-start"><Slot item={equipamento.ranged} onClick={() => handleUnequip(equipamento.ranged)} label="Ranged"/></div>


                      {/* Right Column */}
                      <div className="col-start-4 row-start-1 flex justify-center items-end"><Slot item={equipamento.pauldron[1]} onClick={() => handleUnequip(equipamento.pauldron[1])} label="Shoulder"/></div>
                      <div className="col-start-4 row-start-3 flex justify-center items-center"><Slot item={equipamento.bracer[0]} onClick={() => handleUnequip(equipamento.bracer[0])} label="Bracer"/></div>
                      <div className="col-start-4 row-start-5 flex justify-center items-start"><Slot item={equipamento.shield} onClick={() => handleUnequip(equipamento.shield)} label="Off-hand"/></div>

                      {/* Far Right Column */}
                      <div className="col-start-5 row-start-1 flex justify-center items-end"><Slot item={equipamento.cloak} onClick={() => handleUnequip(equipamento.cloak)} label="Cloak"/></div>
                      <div className="col-start-5 row-start-2 flex justify-center items-center">
                          <AccessoryGroup items={equipamento.necklace} label="Amulets" onUnequip={handleUnequip} layout="1+4" maxSlots={5}/>
                      </div>
                      <div className="col-start-5 row-start-4 flex justify-center items-center">
                           <AccessoryGroup items={equipamento.ring.slice(5, 10)} label="Rings" onUnequip={handleUnequip} layout="1+4" maxSlots={5}/>
                      </div>

                    </div>
                 </div>
            </div>
        </main>
      </div>
    </div>
  );
};

export default EquipmentScreen;
