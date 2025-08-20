import React from 'react';
import { PlayerState, Item, PlayerAttributes } from '../types';

// Props do componente principal
interface EquipmentScreenProps {
  player: PlayerState;
  onClose: () => void;
  onSendInput: (input: string) => void;
}

// --- COMPONENTES INTERNOS (Helpers de UI) ---

// Ícone para cada tipo de item (lógica mantida)
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
    return '✨';
};

// Componente de Slot individual (lógica mantida, estilo ajustado)
const Slot: React.FC<{
    item: Item | null | undefined;
    label?: string;
    onClick?: () => void;
    className?: string;
}> = ({ item, label, onClick, className = '' }) => {
    const hasItem = item !== null && item !== undefined;
    const isClickable = onClick !== undefined;

    const baseStyle = 'aspect-square bg-black/40 flex items-center justify-center p-1 relative group transition-all duration-200 border border-yellow-800/60 rounded-md';
    const clickableStyle = isClickable ? 'cursor-pointer hover:bg-yellow-500/10 hover:border-yellow-500' : '';
    const displayName = item?.nome || `[${item?.tipo || 'Item'}]`;

    return (
        <div 
            className={`${baseStyle} ${clickableStyle} ${className}`}
            onClick={onClick}
            title={hasItem ? displayName : label || 'Vazio'}
        >
            {hasItem ? (
                 <>
                    <span className="text-3xl" role="img" aria-label={displayName}>{getIconForItem(item)}</span>
                    {item.quantidade > 1 && (
                         <span className="absolute -top-1 -right-1 text-xs font-bold text-white bg-slate-900/80 px-1 rounded-sm border border-slate-600">{item.quantidade}</span>
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

// NOVO: Componente para agrupar slots verticalmente
const SlotColumn: React.FC<{
    title: string;
    children: React.ReactNode;
}> = ({ title, children }) => (
    <div className="flex flex-col items-center gap-2">
        <h3 className="text-xs font-bold text-yellow-600/80 font-cinzel tracking-wider">{title}</h3>
        <div className="flex flex-col gap-2">
            {children}
        </div>
    </div>
);

// --- COMPONENTE PRINCIPAL (Reestruturado) ---

const EquipmentScreen: React.FC<EquipmentScreenProps> = ({ player, onClose, onSendInput }) => {
  const { equipamento, inventario, atributos, derivados } = player;
  
  const INVENTORY_SLOTS = 32; // 4x8 grid para mais espaço
  const inventorySlots = Array.from({ length: INVENTORY_SLOTS }).map((_, i) => inventario[i] || null);
  
  const handleEquip = (item: Item) => {
    if (item) onSendInput(`Equipar ${item.nome || item.id}`);
  }
  
  const handleUnequip = (item: Item) => {
    if (item) onSendInput(`Desequipar ${item.nome || item.id}`);
  }

  // NOVO: Painel de Estatísticas
  const StatsPanel = () => (
      <div className="w-56 flex-shrink-0 bg-black/30 p-4 rounded-lg flex flex-col">
          <h2 className="text-xl text-center font-bold text-yellow-400/90 font-cinzel tracking-widest mb-4">ATRIBUTOS</h2>
          <div className="space-y-2 text-sm overflow-y-auto pr-2">
              <div className="flex justify-between"><span>HP:</span> <span className="font-semibold">{derivados.HP} / {derivados.HP_max}</span></div>
              <div className="flex justify-between"><span>Mana:</span> <span className="font-semibold">{derivados.Mana} / {derivados.Mana_max}</span></div>
              <div className="flex justify-between"><span>Stamina:</span> <span className="font-semibold">{derivados.Stamina} / {derivados.Stamina_max}</span></div>
              <hr className="border-slate-700 my-2"/>
              {Object.entries(atributos).map(([key, value]) => (
                  <div key={key} className="flex justify-between">
                      <span className="text-slate-400">{key}:</span>
                      <span className="font-semibold">{value}</span>
                  </div>
              ))}
          </div>
      </div>
  );

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-2 z-50 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="w-full max-w-7xl h-[90vh] border border-yellow-900/80 rounded-lg shadow-2xl flex relative overflow-hidden p-6 gap-6" 
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
        
        {/* PAINEL DE ESTATÍSTICAS (Esquerda) */}
        <StatsPanel />

        {/* PAINEL DE EQUIPAMENTO (Centro) */}
        <div className="flex-1 flex flex-col">
            <h2 className="text-3xl text-center font-bold text-yellow-400/90 font-cinzel tracking-widest mb-4">EQUIPAMENTO</h2>
            <div className="flex-1 grid grid-cols-5 gap-4">
              
                {/* Coluna Acessórios 1 */}
                <SlotColumn title="ACESSÓRIOS">
                    <Slot item={equipamento.necklace[0]} onClick={() => handleUnequip(equipamento.necklace[0])} label="Amuleto 1" />
                    <Slot item={equipamento.ring[0]} onClick={() => handleUnequip(equipamento.ring[0])} label="Anel 1" />
                    <Slot item={equipamento.ring[1]} onClick={() => handleUnequip(equipamento.ring[1])} label="Anel 2" />
                    <Slot item={equipamento.earring[0]} onClick={() => handleUnequip(equipamento.earring[0])} label="Brinco 1" />
                    <Slot item={equipamento.relic[0]} onClick={() => handleUnequip(equipamento.relic[0])} label="Relíquia 1" />
                </SlotColumn>

                {/* Coluna Armas/Mãos Esquerda */}
                <SlotColumn title="COMBATE">
                    <Slot item={equipamento.weapon_main} onClick={() => handleUnequip(equipamento.weapon_main)} label="Arma Prin." />
                    <Slot item={equipamento.shield} onClick={() => handleUnequip(equipamento.shield)} label="Secundária" />
                    <Slot item={equipamento.ranged} onClick={() => handleUnequip(equipamento.ranged)} label="Distância" />
                    <Slot item={equipamento.ammo_pouch} onClick={() => handleUnequip(equipamento.ammo_pouch)} label="Munição" />
                </SlotColumn>

                {/* Coluna Central - Armadura Principal */}
                <SlotColumn title="ARMADURA">
                    <Slot item={equipamento.helmet} onClick={() => handleUnequip(equipamento.helmet)} label="Cabeça" />
                    <Slot item={equipamento.cloak} onClick={() => handleUnequip(equipamento.cloak)} label="Manto" />
                    <Slot item={equipamento.chest} onClick={() => handleUnequip(equipamento.chest)} label="Peitoral" className="h-24"/>
                    <Slot item={equipamento.pants} onClick={() => handleUnequip(equipamento.pants)} label="Calças" className="h-24"/>
                    <Slot item={equipamento.boots} onClick={() => handleUnequip(equipamento.boots)} label="Botas" />
                </SlotColumn>

                {/* Coluna Armadura Secundária */}
                <SlotColumn title="PROTEÇÃO">
                    <Slot item={equipamento.pauldron[0]} onClick={() => handleUnequip(equipamento.pauldron[0])} label="Ombro" />
                    <Slot item={equipamento.glove} onClick={() => handleUnequip(equipamento.glove)} label="Mãos" />
                    <Slot item={equipamento.bracer[0]} onClick={() => handleUnequip(equipamento.bracer[0])} label="Braçadeira" />
                    <Slot item={equipamento.belt} onClick={() => handleUnequip(equipamento.belt)} label="Cinto" />
                </SlotColumn>

                {/* Coluna Acessórios 2 */}
                <SlotColumn title="ACESSÓRIOS">
                    <Slot item={equipamento.necklace[1]} onClick={() => handleUnequip(equipamento.necklace[1])} label="Amuleto 2" />
                    <Slot item={equipamento.ring[2]} onClick={() => handleUnequip(equipamento.ring[2])} label="Anel 3" />
                    <Slot item={equipamento.ring[3]} onClick={() => handleUnequip(equipamento.ring[3])} label="Anel 4" />
                    <Slot item={equipamento.earring[1]} onClick={() => handleUnequip(equipamento.earring[1])} label="Brinco 2" />
                    <Slot item={equipamento.relic[1]} onClick={() => handleUnequip(equipamento.relic[1])} label="Relíquia 2" />
                </SlotColumn>

            </div>
        </div>

        {/* PAINEL DE INVENTÁRIO (Direita) */}
        <div className="w-80 flex-shrink-0 flex flex-col">
            <h2 className="text-2xl text-center font-bold text-yellow-400/90 font-cinzel tracking-widest mb-4">INVENTÁRIO</h2>
            <div className="flex-1 grid grid-cols-4 grid-rows-8 gap-2 p-2 bg-black/30 rounded-lg">
                {inventorySlots.map((item, index) => (
                    <Slot key={index} item={item} onClick={() => item && handleEquip(item)} />
                ))}
            </div>
            <div className="flex justify-center mt-2">
                <p className="text-xs text-slate-500">Clique em um item para equipá-lo.</p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default EquipmentScreen;
