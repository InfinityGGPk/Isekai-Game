
export enum GamePhase {
  LOADING,
  START_SCREEN,
  CREATION,
  PLAYING,
}

export interface PlayerAttributes {
  Força: number;
  Agilidade: number;
  Vigor: number;
  Inteligência: number;
  Vontade: number;
  Percepção: number;
  Carisma: number;
  Sorte: number;
  Técnica: number;
  Afinidade: number;
}

export interface PlayerAttributeXP {
    xp: number;
    next: number;
}

export interface PlayerDerivatives {
  HP: number;
  HP_max: number;
  Stamina: number;
  Stamina_max: number;
  Mana: number;
  Mana_max: number;
  Foco: number;
  Foco_max: number;
  Sanidade: number;
  Sanidade_max: number;
  Carga: number;
  Carga_max: number;
}

export interface Skill {
  id: string;
  nome: string;
  tipo: 'ativa' | 'passiva';
  nível: number;
  xp: number;
  xp_next: number;
}

export interface Item {
  id: string;
  nome: string;
  quantidade: number;
  descrição: string;
  tipo?: string;
}

export interface SpaceItem {
    id: string;
    nome: string;
    qtd: number;
    tipo: string;
    slots: number;
}

export interface SpaceInventory {
    slots_max: number;
    slots_used: number;
    weightless: boolean;
    items: SpaceItem[];
}

export interface Equipment {
  // Joias & acessórios
  ring: (Item | null)[]; // 10
  necklace: (Item | null)[]; // 5
  bracelet: (Item | null)[]; // 2
  earring: (Item | null)[]; // 2
  anklet: (Item | null)[]; // 2
  belt: Item | null;
  belt_charm: (Item | null)[]; // 3
  brooch: Item | null;
  
  // Cabeça & rosto
  helmet: Item | null;
  circlet: Item | null;
  goggles: Item | null;
  mask: Item | null;
  
  // Tronco & ombros
  chest: Item | null;
  undershirt: Item | null;
  cloak: Item | null;
  pauldron: (Item | null)[]; // 2
  backpack: Item | null;
  
  // Braços & mãos
  bracer: (Item | null)[]; // 2
  glove: Item | null;
  focus: Item | null;
  
  // Cintura, pernas & pés
  pants: Item | null;
  greave: (Item | null)[]; // 2
  boots: Item | null;
  spurs: Item | null;
  
  // Armas & utilitários
  weapon_main: Item | null;
  weapon_off: Item | null;
  shield: Item | null;
  weapon_2h: Item | null;
  ranged: Item | null;
  ammo_pouch: Item | null;
  tool_quick: (Item | null)[]; // 5
  instrument: Item | null;

  // Místicos & metamagia
  relic: (Item | null)[]; // 5
  aura: Item | null;
  soul_core: (Item | null)[]; // 3
  totem: (Item | null)[]; // 5
  oath_seal: (Item | null)[]; // 7
  rune_matrix: (Item | null)[]; // 18

  // Biotecnologia/implantes
  implant_eye: (Item | null)[]; // 2
  implant_spine: Item | null;
  implant_heart: Item | null;
  implant_hand: (Item | null)[]; // 2

  // Companheiros/Montarias
  familiar: (Item | null)[]; // 5
  mount: {
      saddle: Item | null;
      reins: Item | null;
      shoes: Item | null;
      barding: Item | null;
  };
  pet_harness: (Item | null)[]; // 3
}

export interface NPC {
  id: string;
  nome: string;
  nivelRelacionamento: number; // 0-100
  statusRelacionamento: string; // Ex: "Conhecido", "Amigo", "Rival", "Amante", "Esposa"
  ultimaInteracao: string; // Ex: "Dia 1 na Floresta de Elara"
  ocupacao?: string;
  localizacao?: string;
  afeto?: number; // Para mecânicas de sedução
  lealdade?: number;
}

export interface CirculoIntimo {
  membros: string[]; // Array de IDs de NPCs
  sinergiaAtiva: boolean;
  bonus: {
    regeneracao_hp_mana_pct?: number;
    chance_ataque_extra_pct?: number;
    bonus_atributos?: Partial<PlayerAttributes>;
  };
}


export interface PlayerState {
  nome: string;
  idade: number;
  origem: string;
  atributos: PlayerAttributes;
  atributos_xp: Record<keyof PlayerAttributes, PlayerAttributeXP>;
  derivados: PlayerDerivatives;
  habilidades: Skill[];
  inventario: Item[];
  inventario_espaco: SpaceInventory;
  equipamento: Equipment;
  sintonias: { usadas: number; max: number };
  moedas: { cobre: number; prata: number; ouro: number };
  pericias: Record<string, number>;
  condicoes: string[];
  fama: Record<string, number>;
  patente: string;
  títulos: string[];
  relacionamentos: NPC[];
  circuloIntimo: CirculoIntimo;
}

export interface WorldState {
  regiao: string;
  perigoGlobal: number;
  eventosRecentes: string[];
  mercados: { cidade: string; tendencias: Record<string, string> }[];
}

export interface KingdomState {
    posse: boolean;
    titulo: string | null;
    recursos: Record<string, number>;
    politicas: string[];
    diplomacia: Record<string, string>;
    defesas: string[];
}

export interface TKPrimordialPCRules {
  range: string;
  targets_formula: string;
  mass_per_object: string;
  total_mass_multiplier: number;
  throw_speed: string;
  mana_cost: string;
  antimagic_ignored_up_to: string;
  null_zone_behavior: string;
}

export interface TKPrimordialRules {
  pc_mode: boolean;
  npc_variant: string;
  pc_overrides: TKPrimordialPCRules;
}

export interface SuggestionRules {
  min_here_pct: number;
  max_travel_opts: number;
  default_ttl_turns: number;
  cooldown_rejected_turns: number;
  auto_convert: boolean;
  pin_types: string[];
}

export interface SuperOverrides {
    global: any;
    olho_verdade: any;
    inventario_abs: any;
    forja_criacao: any;
    biblioteca_viva: any;
    dominio_fluxo: any;
    fortuna_cadeia: any;
    engenheiro_eter: any;
    pacto_feras: any;
    soberania_alma: any;
    teia_tatica: any;
    mercador_dest: any;
    arquiteto_run: any;
}


export interface GameRules {
  attr_cap: number;
  player_start_points: number;
  npc_avg_points: number;
  unique_skill_weights: {
    comum: number;
    rara: number;
    epica: number;
    lendaria: number;
  };
  xp_curve_attr: string;
  xp_curve_skill: string;
  tk_primordial?: TKPrimordialRules;
  suggestions?: SuggestionRules;
  super_overrides?: SuperOverrides;
}

export interface SuggestionLocationReq {
  zone_id: string;
  biome: string;
}

export interface SuggestionPreconditions {
  have_items: any[];
  need_items: string[];
  companions: any[];
}

export interface SuggestionTravel {
  required: boolean;
  eta_h: number;
  risk: string;
}

export interface SuggestionCosts {
  tempo_min: number;
  stamina: number;
  mana: number;
}

export interface SuggestionRewardHint {
  ouro?: string;
  reputacao?: string;
  craft?: string;
}

export interface SuggestionOriginContext {
  zone_id: string;
  turn: number;
}

export interface Suggestion {
  id: string;
  label: string;
  act: string;
  location_req: SuggestionLocationReq;
  preconditions: SuggestionPreconditions;
  travel: SuggestionTravel;
  costs: SuggestionCosts;
  reward_hint: SuggestionRewardHint;
  pin: boolean;
  ttl_turns: number;
  origin_context: SuggestionOriginContext;
  valid_now: boolean;
  score: number;
}

export interface UIContext {
  zone_id: string;
  area_tag: string;
  timeblock: string;
  weather: string;
}

export interface UIButton {
    id: string;
    label: string;
    checked?: boolean;
}

export interface UISettings {
    autosave: boolean;
}

export interface UIIntents {
    emit_state_changed: boolean;
}

export interface UIState {
  suggestions: Suggestion[];
  context: UIContext;
  buttons: UIButton[];
  settings: UISettings;
  toast: string | null;
  save_hint: string | null;
  intents: UIIntents;
}

export interface Companion {
  id: string;
  nome: string;
  classe: string;
  nivel: number;
  hp: number;
  hp_max: number;
  recurso_nome?: 'Mana' | 'Stamina' | 'Energia';
  recurso_valor?: number;
  recurso_max?: number;
  statusRelacionamento: string;
  avatarUrl?: string;
  biografia: string;
  atributos: PlayerAttributes;
  habilidadesCombate: { id: string, nome: string }[];
  habilidadesApoio: { id: string, nome: string }[];
  equipamento: Partial<Equipment>;
  emMissao: boolean;
}

export interface Enemy {
  id: string;
  nome: string;
  nivel: number;
  hp: number;
  hp_max: number;
  stamina?: number;
  stamina_max?: number;
  mana?: number;
  mana_max?: number;
  condicoes: string[];
}

export interface CombatState {
  enemies: Enemy[];
}

export interface GameState {
  version: number;
  seed: string;
  time: { dia: number; hora: number; minuto?: number; estacao: string };
  world: WorldState;
  player: PlayerState;
  companheiros: Companion[];
  construcoes: any[];
  caravanas: any[];
  reino: KingdomState;
  quests: any[];
  bestiarioVisto: string[];
  flags: Record<string, boolean>;
  ui: UIState;
  rules: GameRules;
  combat: CombatState | null;
}

export interface Turn {
  narrative: string;
  state: GameState;
}
