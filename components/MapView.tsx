import React, { useEffect, useMemo, useRef } from 'react';
import { GameState, NPC, Enemy } from '../types';

interface MapViewProps {
  gameState: GameState;
  onSendInput: (input: string) => void;
}

const TILE_CONFIG: { [key: string]: { char: string; color: string; bgColor: string; walkable: boolean; description: string } } = {
    ' ': { char: ' ', color: '#000', bgColor: '#020617', walkable: false, description: 'Vazio' },
    '.': { char: '·', color: '#64748b', bgColor: '#1e293b', walkable: true, description: 'Chão' },
    '#': { char: '#', color: '#94a3b8', bgColor: '#334155', walkable: false, description: 'Parede' },
    ',': { char: '„', color: '#16a34a', bgColor: '#1e293b', walkable: true, description: 'Grama' },
    '*': { char: '∗', color: '#22c55e', bgColor: '#1e293b', walkable: true, description: 'Grama Alta' },
    'T': { char: '♣', color: '#166534', bgColor: '#1e293b', walkable: false, description: 'Árvore' },
    '~': { char: '≈', color: '#3b82f6', bgColor: '#1e3a8a', walkable: false, description: 'Água' },
    '+': { char: '⌸', color: '#ca8a04', bgColor: '#422006', walkable: true, description: 'Porta Fechada' },
    "'": { char: '⌹', color: '#facc15', bgColor: '#422006', walkable: true, description: 'Porta Aberta' },
    '>': { char: '>', color: '#eab308', bgColor: '#1e293b', walkable: true, description: 'Escada para baixo' },
    '<': { char: '<', color: '#eab308', bgColor: '#1e293b', walkable: true, description: 'Escada para cima' },
    '$': { char: '$', color: '#fde047', bgColor: '#1e293b', walkable: true, description: 'Tesouro' },
    'default': { char: '?', color: '#f43f5e', bgColor: '#1e293b', walkable: false, description: 'Desconhecido' },
};

const MapView: React.FC<MapViewProps> = ({ gameState, onSendInput }) => {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    // FIX: Destructure 'relacionamentos' from player state, not game state.
    const { player, world, combat } = gameState;
    const { relacionamentos } = player;
    const map = world.map;

    const entities = useMemo(() => {
        const allEntities: { id: string, x: number, y: number, char: string, color: string, type: string }[] = [];
        
        // Add Player
        if (player.posicao) {
             allEntities.push({ id: 'player', x: player.posicao.x, y: player.posicao.y, char: '@', color: '#f59e0b', type: 'player' });
        }

        // Add Enemies
        combat?.enemies.forEach(e => {
            if(e.posicao) allEntities.push({ id: e.id, x: e.posicao.x, y: e.posicao.y, char: 'E', color: '#ef4444', type: 'enemy' });
        });
        
        // Add NPCs
        relacionamentos.forEach(n => {
             if(n.posicao) allEntities.push({ id: n.id, x: n.posicao.x, y: n.posicao.y, char: 'N', color: '#34d399', type: 'npc' });
        });

        return allEntities;
    }, [player.posicao, combat?.enemies, relacionamentos]);


    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!player.posicao || !map) return;

            let dx = 0;
            let dy = 0;

            switch (e.key) {
                case 'ArrowUp': case 'w': dy = -1; break;
                case 'ArrowDown': case 's': dy = 1; break;
                case 'ArrowLeft': case 'a': dx = -1; break;
                case 'ArrowRight': case 'd': dx = 1; break;
                case 'e':
                     // Interaction logic
                    const neighbors = [{x:0, y:-1}, {x:0, y:1}, {x:-1, y:0}, {x:1, y:0}];
                    for (const n of neighbors) {
                        const checkX = player.posicao.x + n.x;
                        const checkY = player.posicao.y + n.y;
                        const targetNPC = relacionamentos.find(npc => npc.posicao?.x === checkX && npc.posicao?.y === checkY);
                        if (targetNPC) {
                            onSendInput(`Falar com ${targetNPC.nome}`);
                            e.preventDefault();
                            return;
                        }
                    }
                    return;
                default:
                    return;
            }
            
            if (dx === 0 && dy === 0) return;

            e.preventDefault();
            
            const newX = player.posicao.x + dx;
            const newY = player.posicao.y + dy;

            if (newX >= 0 && newX < map.width && newY >= 0 && newY < map.height) {
                const targetTileChar = map.tiles[newY][newX];
                const targetTileConfig = TILE_CONFIG[targetTileChar] || TILE_CONFIG.default;

                if (targetTileConfig.walkable) {
                    onSendInput(`O jogador se move para (${newX}, ${newY})`);
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [player.posicao, map, onSendInput, relacionamentos]);

    if (!map) {
        return <div className="flex items-center justify-center h-full text-slate-500 bg-black/30 rounded-lg">Carregando mapa...</div>;
    }
    
    const TILE_SIZE = 24; // size in pixels
    const mapWidth = map.width * TILE_SIZE;
    const mapHeight = map.height * TILE_SIZE;
    
    // Center view on player
    const viewX = player.posicao ? player.posicao.x * TILE_SIZE - (mapContainerRef.current?.clientWidth || 0) / 2 + TILE_SIZE / 2 : 0;
    const viewY = player.posicao ? player.posicao.y * TILE_SIZE - (mapContainerRef.current?.clientHeight || 0) / 2 + TILE_SIZE / 2 : 0;


    return (
        <div ref={mapContainerRef} className="w-full h-full bg-slate-900 border border-slate-700 rounded-lg overflow-hidden flex items-center justify-center">
            <div 
                className="relative transition-transform duration-200" 
                style={{
                    width: `${mapWidth}px`, 
                    height: `${mapHeight}px`,
                    transform: `translate(${-viewX}px, ${-viewY}px)`
                }}>
                <div className="absolute inset-0" style={{ fontFamily: 'monospace', fontSize: `${TILE_SIZE * 0.8}px`, lineHeight: `${TILE_SIZE}px` }}>
                    {map.tiles.map((row, y) => (
                        <div key={y} className="flex" style={{ height: `${TILE_SIZE}px`}}>
                            {row.map((tile, x) => {
                                const config = TILE_CONFIG[tile] || TILE_CONFIG.default;
                                return (
                                    <div
                                        key={`${x}-${y}`}
                                        className="flex items-center justify-center"
                                        style={{
                                            width: `${TILE_SIZE}px`,
                                            height: `${TILE_SIZE}px`,
                                            color: config.color,
                                            backgroundColor: config.bgColor,
                                        }}
                                        title={`${config.description} (${x}, ${y})`}
                                    >
                                        {config.char}
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>
                {/* Entities Layer */}
                <div className="absolute inset-0 pointer-events-none" style={{ fontFamily: 'monospace', fontSize: `${TILE_SIZE * 0.8}px`, lineHeight: `${TILE_SIZE}px` }}>
                     {entities.map(entity => (
                        <div
                            key={entity.id}
                            className="absolute flex items-center justify-center font-bold"
                            style={{
                                left: `${entity.x * TILE_SIZE}px`,
                                top: `${entity.y * TILE_SIZE}px`,
                                width: `${TILE_SIZE}px`,
                                height: `${TILE_SIZE}px`,
                                color: entity.color,
                                textShadow: '1px 1px 2px black',
                            }}
                        >
                            {entity.char}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default MapView;