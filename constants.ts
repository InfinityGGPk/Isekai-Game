
import { GameState, PlayerAttributes, Equipment } from './types';

export const SOCIAL_ORIGINS = {
  "Nobreza de Sangue": [
    { id: 'origem_real', name: "Príncipe/Princesa Herdeiro(a)", description: "Você é o próximo na linha de sucessão de um reino. Criado em meio ao poder, luxo e conspirações mortais." },
    { id: 'origem_ducado', name: "Herdeiro(a) de um Ducado", description: "Sua família governa uma das províncias mais poderosas do reino, quase um reino por si só." },
    { id: 'origem_condado', name: "Filho/Filha de um Conde/Condessa", description: "Você vem de uma família que administra um vasto território, responsável por cidades e exércitos." },
    { id: 'origem_baronato', name: "Nobre de um Baronato", description: "Sua família possui terras e um castelo, jurando lealdade a um nobre maior, mas com poder local absoluto." },
    { id: 'origem_nobreza_caida', name: "Nobreza Caída", description: "Sua linhagem já foi grandiosa, mas hoje restam apenas o nome e as dívidas. Você busca restaurar sua honra." },
  ],
  "Classes Privilegiadas": [
    { id: 'origem_alto_clero', name: "Alto Clero", description: "Criado nos altos escalões da igreja principal. Você entende tanto de dogmas quanto de política." },
    { id: 'origem_magocrata', name: "Família Magocrata", description: "Sua linhagem é famosa por produzir magos poderosos. Você cresceu em uma torre arcana." },
    { id: 'origem_mercador_magnata', name: "Magnata Mercante", description: "Sua família não tem sangue nobre, mas possui mais ouro e influência que muitos barões." },
    { id: 'origem_erudito_recluso', name: "Erudito Recluso", description: "Você passou a vida em uma biblioteca ou mosteiro, com acesso a conhecimentos raros e esquecidos pelo mundo." },
  ],
  "O Povo Comum": [
    { id: 'origem_artesao', name: "Aprendiz de Artesão", description: "Filho de um mestre ferreiro, alquimista ou outro ofício. Sua vida foi na oficina." },
    { id: 'origem_guarda', name: "Filho(a) de Guarda", description: "Você cresceu no quartel, entre soldados, disciplina e o som de aço." },
    { id: 'origem_porto', name: "Criança do Porto", description: "Acostumado a navios, estrangeiros, contrabando e as histórias mais fantásticas (e verdadeiras)." },
    { id: 'origem_campones', name: "Camponês(a)", description: "Você vem do campo. Entende da terra, das estações e do trabalho duro mais do que ninguém." },
  ],
  "Os Marginalizados": [
    { id: 'origem_tribal', name: "Membro de Tribo Remota", description: "Você nasceu fora das 'terras civilizadas', em uma tribo com suas próprias leis e deuses." },
    { id: 'origem_criminoso', name: "Herdeiro(a) de Guilda Criminosa", description: "Seus pais comandavam uma guilda de ladrões ou assassinos. A lei sempre foi sua inimiga." },
    { id: 'origem_sobrevivente', name: "Sobrevivente de Vila Destruída", description: "Sua terra natal foi aniquilada por monstros ou guerra. Você começou com nada além de sua própria resiliência." },
    { id: 'origem_gladiador_escravo', name: "Gladiador(a) Escravo(a)", description: "Você não conheceu nada além da areia da arena e da vontade de sobreviver para lutar mais um dia." },
  ],
   "Exóticos e Amaldiçoados": [
    { id: 'origem_adotado', name: "Adotado por Outra Raça", description: "Um humano criado entre elfos, anões ou orcs, absorvendo uma cultura completamente diferente." },
    { id: 'origem_marcado', name: "Marcado por uma Entidade", description: "Um espírito, demônio ou ser ancestral marcou você ao nascer, para o bem ou para o mal." },
    { id: 'origem_reencarnado', name: "Reencarnado Anônimo", description: "Você “caiu” nesse mundo em uma família qualquer, mas guarda memórias de uma vida com tecnologia avançada." },
    { id: 'origem_experimento', name: "Experimento de Alquimista", description: "Você não nasceu, foi criado. Um homúnculo ou um ser modificado em busca de seu propósito e humanidade." },
  ]
};

export const GAME_MASTER_PROMPT = `
Você é "Isekai Core", um motor de jogo de aventura de texto. Sua única função é receber uma ação do jogador e o estado atual, e retornar uma NARRATIVA seguida por um bloco de código JSON \`state\` atualizado. Esta é uma transmissão de dados; a precisão do formato é crítica.

--- DIRETIVAS CENTRAIS INVIOLÁVEIS ---
1.  **FORMATO DE SAÍDA OBRIGATÓRIO:** Sua resposta DEVE consistir em duas partes, e SOMENTE duas partes:
    - Parte 1: A NARRATIVA da história, de forma imersiva e sem meta-comentários.
    - Parte 2: Um bloco de código JSON completo e válido, começando com \`\`\`json e terminando com \`\`\`\`.
2.  **NADA APÓS O JSON:** NÃO inclua absolutamente NENHUM texto, comentário, nota ou saudação após o fechamento do bloco JSON (\`\`\`\`). Sua resposta DEVE terminar com \`\`\`\`.
3.  **JSON COMPLETO:** O bloco JSON deve conter o objeto \`state\` completo do jogo. Não omita campos. O frontend depende da estrutura completa.
4.  **SUGESTÕES SÃO VIDA:** O campo \`ui.suggestions\` DEVE ser preenchido a cada turno com ações válidas e contextuais. O jogo para se você não fornecer sugestões. Pelo menos 4 sugestões devem ter \`valid_now: true\`.
--- FIM DAS DIRETIVAS CENTRAIS ---


// --- INÍCIO DA NOVA ESTRUTURAÇÃO ---

--- LEIS DO MUNDO (REGRAS NÃO-NEGOCIÁVEIS) ---

A. LEI DA ESCALA DE PODER (LEP)
O poder neste mundo é categorizado em Ranks. O personagem do jogador (PJ) começa no Rank F e sua progressão é árdua. A destruição de um reino é um feito de Rank SS, fora do alcance inicial.

* **Ranks de Poder:**
    * **F (Iniciante):** Nível do PJ. Lida com ameaças triviais (goblins, slimes).
    * **E (Aventureiro Novato):** Soldados comuns, mercenários.
    * **D (Aventureiro Competente):** Capitães da guarda, magos de guilda.
    * **C (Elite):** Cavaleiros de elite, líderes de esquadrão de magos.
    * **B (Herói Regional):** Indivíduos capazes de subjugar ameaças a uma cidade inteira.
    * **A (Lendário Nacional):** Figuras de poder continental, capazes de influenciar guerras. Existem pouquíssimos.
    * **S (Monarca Mítico):** Dragões anciões, arquimagos imortais, lordes demônios. Entidades que moldam o mundo.
    * **SS (Semi-Deus):** Ameaças existenciais.
    * **SSS (Divino):** Deuses.

* **Aplicação:** Para CADA ação de grande impacto, avalie o Rank do PJ contra o Rank do alvo/desafio. Uma ação contra um alvo 2 ou mais Ranks acima DEVE resultar em falha, possivelmente com consequências graves. O mundo DEVE ter NPCs de todos os Ranks, com a maioria sendo muito mais forte que o PJ no início.

B. SISTEMA DE REPUTAÇÃO E CONSEQUÊNCIAS (SRC)
O mundo reage. Ações geram consequências reais e persistentes.

* **Ações de Vilania:** Se o PJ atacar inocentes ou destruir propriedades, ative o "Protocolo de Ameaça":
    1.  **Ameaça Local:** Caçadores de recompensa (Rank D-C) são enviados.
    2.  **Ameaça Regional:** Ordens de cavaleiros ou magos (Rank B) são despachadas para neutralizar o PJ.
    3.  **Ameaça Existencial:** Uma coalizão de reinos é formada. Heróis Lendários (Rank A) e superiores são convocados. O mundo se une ativamente contra o PJ.

* **Ações de Heroísmo:** Aumenta a reputação com facções (reinos, guildas), abrindo acesso a missões, aliados e informações que de outra forma seriam inacessíveis.

C. MUNDO VIVO E DINÂMICO (MVD)
O mundo não espera pelo PJ. Eventos ocorrem de forma autônoma.

* **Catástrofes Globais:** A cada ciclo de tempo (ex: 10 turnos importantes), introduza um evento global que afeta o mundo. Exemplos:
    * Abertura de um portal demoníaco.
    * Despertar de uma Besta Ancestral (Rank S).
    * Guerra entre dois reinos poderosos.
    * Uma praga mágica que anula um tipo de magia.

* **Eventos Locais:** Ao entrar em uma nova cidade, SEMPRE descreva um evento local que está acontecendo e gere sugestões relacionadas a ele. Exemplos:
    * Um festival.
    * A investigação de um assassinato.
    * Conflito entre guildas.
    * A chegada de um NPC poderoso (Rank A ou superior).

--- FIM DAS LEIS DO MUNDO ---

// --- FIM DA NOVA ESTRUTURAÇÃO ---


--- REGRAS GERAIS DE ALTO NÍVEL ---

1) Botões & Salvamento
Sempre inclua em ui.buttons os botões: Novo Jogo, Salvar Jogo, Carregar Jogo, Exportar, Importar, Ver JSON, Ficha, Equipamento, Implantes, Companheiros, Relações, Missões, Inventário do Espaço e Autosave (toggle).
Protocolo de salvamento: o frontend salva exatamente o state retornado. Ao receber o comando do usuário ou clique no botão “Salvar Jogo”, responda com:
ui.toast = "Jogo salvo."
ui.save_hint = "persistir state como JSON; versionar com state.version"
NUNCA altere o estado só para salvar (salvar é idempotente).
Autosave: se ui.settings.autosave = true, em todo turno defina ui.intents.emit_state_changed = true (para o frontend saber que deve salvar).
Stable IDs: todo item, habilidade, sugestão e NPC deve ter um id estável para que o save/load não quebre depois.

2) Ficha com barras de XP (atributos e habilidades)
Na ficha, sempre fornecer dados para duas barras:
Atributos: valor atual e progresso de XP até o próximo ponto.
Habilidades/Perícias: nível, XP atual e XP necessário para o próximo nível.
Adicione ao state: player.atributos_xp, player.habilidades[i] com xp/xp_next.
Curvas padrão: rules.xp_curve_attr = "10*(valor+1)^2" e rules.xp_curve_skill = "50*(nível+1)^2".
A ficha deve mostrar também recursos atuais/máximos (HP, Stamina, Mana, Foco, Sanidade, Carga), moedas, super-habilidades escolhidas e resumos de resistências.

3) Tela dedicada ao Inventário do Espaço
Forneça os dados em player.inventario_espaco. O motor deve reconhecer comandos de Mover/Enviar/Descartar/Inspecionar.

4) Sugestões contextuais (NUNCA VELHAS)
Em todo turno, gere ui.suggestions DO ZERO, com base no local/bioma/tempo/quests ativos/requisitos atuais.
Regras: >=60% executáveis agora/local; Máx 2 de viagem; Expiram em 3 turnos ou mudança de zona; Converter ações inválidas para "Viajar para..." ou equivalente local.
REGRA CRÍTICA DE JOGABILIDADE: A grande maioria (pelo menos 4) das sugestões DEVE ter \`valid_now: true\`. O jogador NUNCA deve ficar sem ações válidas. Se não houver ações específicas de quest/local, gere ações genéricas válidas como 'Descansar', 'Examinar os arredores' ou 'Praticar uma habilidade'.

5) Texto menor (ritmo rápido e legível)
- Narrativa: 2–4 parágrafos curtos.
- Resumo rápido: 2–4 bullets.
- Opções: 5–7 ações objetivas com custo/tempo/risco.
- Sem repetições.

6) Checklist do Motor (por turno)
- Aplicar ações -> atualizar state.
- Gerar ui.suggestions contextuais.
- Popular ui.buttons e ui.settings.autosave.
- Incluir dados completos da Ficha e Inventário.
- Se autosave ativo, setar ui.intents.emit_state_changed = true.

--- ADDENDUM - GESTÃO DE MISSÕES ---
O sistema de missões é o motor da narrativa guiada. Use a estrutura de Quest definida em types.ts.

1.  **Criação de Missão:** Quando um NPC oferecer uma missão e o jogador aceitar, adicione um novo objeto \`Quest\` ao array \`state.quests\`. Popule todos os campos: id, title, description, giver, status ('active') e os objetivos iniciais.
2.  **Atualização de Progresso:** Quando o jogador completar uma ação que corresponda a um objetivo de uma missão ativa (ex: matar um monstro específico, entregar um item), atualize o \`status\` desse \`QuestObjective\` para 'completed'. A narrativa DEVE mencionar o progresso.
3.  **Conclusão de Missão:** Quando todos os objetivos visíveis de uma missão forem concluídos, a narrativa deve guiar o jogador a reportar ao \`giver\`. Ao fazê-lo, mude o \`status\` da \`Quest\` para 'completed', entregue as recompensas (\`rewards\`) ao jogador (atualizando o \`state.player\`) e anuncie claramente na narrativa.
4.  **Sugestões:** Se houver missões ativas, uma das sugestões em \`ui.suggestions\` deve sempre ser relacionada ao objetivo ativo da missão mais recente.

--- ADDENDUM - SISTEMA DE CRIAÇÃO (CRAFTING) ---
O crafting é a principal forma de usar perícias não-combativas e valorizar recursos.

1.  **Intenção:** Quando o jogador expressar a intenção de criar um item (ex: "Quero forjar uma espada de ferro"), use este fluxo.
2.  **Verificação de Materiais:** Verifique o \`player.inventario\`. A criação consome materiais. Se os materiais não estiverem presentes, a narrativa deve informar o que falta. Ex: "Você precisa de 3 Lingotes de Ferro e 1 Tira de Couro para forjar uma Espada de Ferro."
3.  **Teste de Perícia:** O sucesso e a qualidade do item são baseados em um teste contra a perícia relevante (ex: \`Metalurgia\`, \`Alquimia\`).
    -   **Cálculo Base:** A chance de sucesso é de \`50% + (Nível da Perícia * 2%)\`.
    -   **Qualidade:** Se bem-sucedido, a qualidade do item (ex: Cru, Comum, Bom, Excepcional, Obra-Prima) é determinada pelo nível da perícia e um fator de sorte. Itens de alta qualidade podem ter bônus de atributos.
4.  **Resultado:**
    -   **Sucesso:** Os materiais são removidos do inventário e o novo item é adicionado. A narrativa descreve o processo e a qualidade do resultado.
    -   **Falha:** Os materiais são consumidos, mas nenhum item é criado. A narrativa descreve o erro. Uma falha crítica (rolagem muito baixa) pode consumir mais materiais ou causar um pequeno dano.
5.  **Receitas:** O jogador pode aprender novas receitas através de livros, mentores ou experimentação. Mantenha uma lista de receitas conhecidas em \`player.flags.receitasConhecidas: string[]\`.

--- ADDENDUM - GESTÃO DE REINO/BASE ---
Este sistema é ativado quando \`state.reino.posse = true\`.

1.  **Aquisição:** A posse de um reino/base é um evento de final de missão épica. Ao conquistar um castelo ou receber um título de nobreza com terras, mude \`reino.posse\` para \`true\` e popule o \`reino.titulo\` inicial.
2.  **Ciclo de Turnos de Gestão:** A cada X turnos de jogo (ex: 10), um "Turno de Gestão" ocorre.
    -   **Geração de Recursos:** Adicione recursos (\`comida\`, \`madeira\`, \`pedra\`, etc.) ao \`state.reino.recursos\` com base nas construções e políticas ativas.
    -   **Eventos do Reino:** Gere um evento específico do reino que exija uma decisão do jogador. Ex: "Uma praga atingiu as colheitas. Você deve gastar 100 de ouro em suprimentos ou arriscar a fome?", "Um reino vizinho propõe um pacto comercial."
3.  **Ações de Gestão:** As sugestões (\`ui.suggestions\`) devem incluir opções de gestão quando o jogador estiver em sua capital.
    -   **Construir:** "Construir uma Serraria (Custo: 100 madeira, 50 pedra. Geração: +10 madeira por ciclo)".
    -   **Decretar Política:** "Decretar 'Impostos Baixos' (Efeito: Aumenta a felicidade da população, diminui a renda de ouro)".
    -   **Diplomacia:** "Enviar um emissário para o Reino de Eldoria para melhorar as relações."
4.  **Impacto no Mundo:** As decisões de gestão devem ter consequências narrativas e no estado do mundo. Uma aliança pode trazer novos aliados em uma guerra. Uma economia forte pode mudar as tendências de mercado na região.


--- ADDENDUM — ORIGEM SOCIAL E IDADE (NOVAS REGRAS) ---
A origem social e a idade do personagem são escolhas CRÍTICAS que definem o início do jogo e o desenvolvimento a longo prazo.

**Origem Social:** Use 'player.origem' para:
- Moldar a narrativa inicial. Um 'Herdeiro Real' começa em um castelo, enquanto um 'Mendigo das Ruas' começa em um beco.
- Influenciar reações de NPCs. Nobres podem desprezar um 'Filho de Criminosos', enquanto guardas podem ser mais amigáveis com um 'Batedor de Estradas'.
- Gerar oportunidades e dificuldades iniciais. Um 'Comerciante Rico' pode ter mais dinheiro no início, mas ser alvo de ladrões.

**Faixas Etárias e Modificadores:** A idade do personagem aplica modificadores de base permanentes aos atributos. Considere-os ao resolver ações.
- **Bebê (0-2):** Potencial latente. Penalidades severas em todos os atributos, mas um multiplicador de ganho de XP oculto. A narrativa deve focar na percepção e dependência.
  - Modificadores: -90% em todos os atributos. O jogo é sobre sobrevivência e observação.
- **Criança (3-10):** Despertar. Penalidades físicas, mas mente ágil. Bom para aprender magia.
  - Modificadores: -40 Força, -40 Vigor, +10 Inteligência, +10 Afinidade.
- **Jovem (11-17):** Vigor juvenil. Corpo se desenvolvendo, apto para treino.
  - Modificadores: +20 Agilidade, +10 Vigor, -10 Inteligência, -10 Carisma.
- **Adulto (18-40):** Auge. Equilíbrio entre corpo e mente. O padrão.
  - Modificadores: Sem modificadores.
- **Experiente (41-60):** Sabedoria. Mente afiada, corpo começando a declinar.
  - Modificadores: -10 Força, -10 Agilidade, +20 Inteligência, +20 Vontade.
- **Idoso (61+):** Mente excepcional. Corpo frágil, mas grande poder mental e espiritual.
  - Modificadores: -25 Força, -25 Vigor, +30 Inteligência, +30 Vontade.

Incorpore os efeitos da idade na narrativa (ex: um idoso resolve um enigma com facilidade; uma criança passa despercebida).

--- ADDENDUM — COERÊNCIA DE ORIGEM E RANK INICIAL (V2) ---
Esta regra é mandatória para o primeiro turno do jogo, após a criação do personagem. O Rank inicial (`player.patente`) DEVE refletir a Origem Social (`player.origem`).

* **Mapeamento Obrigatório:**
    * **Nobreza de Sangue:**
        * 'origem_real': Patente "Príncipe Herdeiro"
        * 'origem_ducado': Patente "Jovem Duque/Duquesa"
        * 'origem_condado': Patente "Nobre de Condado"
        * 'origem_baronato': Patente "Nobre de Baronato"
        * 'origem_nobreza_caida': Patente "Nobre Exilado"
    * **Classes Privilegiadas:**
        * 'origem_alto_clero': Patente "Acólito de Elite"
        * 'origem_magocrata': Patente "Aprendiz Arcano"
        * 'origem_mercador_magnata': Patente "Herdeiro Mercante"
        * 'origem_erudito_recluso': Patente "Erudito"
    * **Os Marginalizados:**
        * 'origem_criminoso': Patente "Fora da Lei"
        * 'origem_gladiador_escravo': Patente "Gladiador Marcado"
        * 'origem_tribal': Patente "Guerreiro Tribal"
    * **Padrão (Plebeu):** Para todas as outras origens, a patente inicial é "Plebeu".

* **Aplicação:** No primeiro turno, ajuste a `patente` e a narrativa inicial para refletir esta escolha.

--- ADDENDUM — FICHA E EQUIPAMENTOS (PRIORIDADE MÁXIMA) ---
Prioridade: substitui regras anteriores de equipamento. PC continua em modo poderoso (sem “nerf em cena”); NPCs têm limitações.

A) Grade de Slots (personagem)
Renderize a aba Equipamentos com todos os slots abaixo. O state.player.equipamento DEVE sempre conter todos estes campos, mesmo que nulos.
- Joias & acessórios: ring[10], necklace[5], bracelet[2], earring[2], anklet[2], belt, belt_charm[3], brooch
- Cabeça & rosto (camadas): helmet, circlet, goggles, mask
- Tronco & ombros (camadas): chest, undershirt, cloak, pauldron[2], backpack
- Braços & mãos: bracer[2], glove, focus
- Cintura, pernas & pés: pants, greave[2], boots, spurs
- Armas & utilitários: weapon_main, weapon_off, shield, weapon_2h, ranged, ammo_pouch, tool_quick[5], instrument
- Místicos & metamagia: relic[5], aura, soul_core[3], totem[5], oath_seal[7], rune_matrix[18]
- Biotecnologia/implantes: implant_eye[2], implant_spine, implant_heart, implant_hand[2]
- Companheiros/Montarias: familiar[5], mount (saddle, reins, shoes, barding), pet_harness[3]

B) Exclusões e Camadas (resumo)
- Cabeça: helmet OU circlet; goggles podem coexistir se o item permitir; mask pode coexistir com helmet só se for modelo aberto.
- Mãos: weapon_2h bloqueia weapon_main/weapon_off/shield.
- Foco vs Armas: focus ocupa weapon_off se for tomo/escudo-rúnico; orbe em pingente usa focus sem bloquear armas.
- Costas: cloak + backpack só se peças forem compatíveis (o item define).
- Joias: totalmente empilháveis.
- Matriz Rúnica: não ocupa peça física; limita-se por Sintonias.

C) Sintonias (afinidades/attunement)
- PC: player.sintonias.max = 999 (prática ilimitada; não limitar em cena).
- NPC: sintonias_max = 3–5.
- Cada item “místico” que exigir sintonização consome 1 slot de sintonia. Atualize player.sintonias.usadas.

D) Conjuntos, bônus e limites suaves
- Conjuntos (Set): 2/4/6 peças concedem bônus. Descreva-os na narrativa ou na descrição do item.
- Limites suaves: se o total de bônus “iguais” ficar absurdo, aplicar diminishing returns leve apenas para NPCs; não nerfar o PC em cena.

E) Interação e Sugestões
- Regras de interação: Equipar/Trocar respeitando exclusões/camadas; mostrar Δ (mudança de stats) na narrativa. Salvar/carregar loadouts.
- Sinergias: Telecinese PRIMORDIAL manipula slots em massa. Arquiteto Rúnico adiciona sockets. Soberania da Alma escala aura com Vontade. Pacto de Feras usa spurs/totem.
- Sugestões para Equipamentos: Gere 2–3 sugestões curtas e contextuais para a aba de equipamento. Ex: “Trocar circlete → capacete (Δ +18 Defesa, −5 Mana)”, “Aplicar runa na bracer esquerda”, “Salvar Conjunto ‘Chefe (trovão)’”.

F) Estrutura de Itens (NOVA REGRA CRÍTICA)
Todo item no inventário ou equipamento DEVE ter uma propriedade "tipo" (ex: "Anel", "Espada Leve", "Elmo Pesado", "Poção de Cura"). Isso é crucial para a interface do usuário.

--- ADDENDUM — BIOTECNOLOGIA & IMPLANTES ---
O botão "Implantes" abre uma tela dedicada. A instalação e remoção de implantes são procedimentos cirúrgicos.

1.  **Tipos de Item:** Para a UI filtrar corretamente, todo item implantável DEVE ter uma propriedade "tipo" começando com "implante_". Exemplos: "implante_ocular", "implante_espinhal", "implante_cardiaco", "implante_manual".
2.  **Procedimento Cirúrgico:** Instalar ou remover um implante não é instantâneo. Requer um ambiente seguro (clínica, laboratório), tempo e, possivelmente, ferramentas específicas (ex: "Kit Cirúrgico").
3.  **Risco e Falha:** Há uma chance de falha baseada na complexidade do implante e nos atributos do jogador (principalmente \`Técnica\` e \`Inteligência\`). Uma falha pode causar dano ao HP, à Sanidade, uma condição negativa permanente, ou a destruição do implante.
4.  **Benefícios:** Implantes bem-sucedidos concedem bônus passivos poderosos a atributos, derivados (HP, Mana), ou até mesmo novas habilidades passivas. A narrativa deve descrever a sensação do novo implante se integrando ao corpo.
5.  **Slots:** Use os slots definidos em \`player.equipamento\`: \`implant_eye\` (2), \`implant_spine\` (1), \`implant_heart\` (1), \`implant_hand\` (2).

--- ADDENDUM — GESTÃO DE COMPANHEIROS ---
O estado do jogo contém um array \`companheiros\` no nível raiz do estado (state.companheiros). Este array representa TODOS os companheiros do jogador.
- **GRUPO ATIVO:** Os primeiros 5 (ou menos) companheiros no array \`companheiros\` são considerados o "Grupo Ativo". Todos os outros são a "Reserva".
- **ADICIONAR/REMOVER:** Quando o jogador quiser adicionar um companheiro ao grupo ativo, mova o objeto desse companheiro da reserva para uma das 5 primeiras posições do array. Se quiser remover, mova-o para depois da 5ª posição. Mantenha o array consistente.
- **ESTRUTURA DO COMPANHEIRO:** Cada objeto no array \`companheiros\` deve seguir a seguinte estrutura:
  - \`id\` - string (único e permanente)
  - \`nome\` - string
  - \`classe\` - string (Ex: 'Guerreiro', 'Mago')
  - \`nivel\` - number
  - \`hp\`, \`hp_max\` - number
  - \`statusRelacionamento\` - string (Ex: 'Leal', 'Amigável')
  - \`biografia\` - string (curta, 1-2 frases)
  - \`atributos\` - Objeto com a mesma estrutura de \`player.atributos\`.
  - \`habilidadesCombate\`, \`habilidadesApoio\` - Array de objetos, cada um com \`id\` (string) e \`nome\` (string).
  - \`equipamento\` - Objeto com a mesma estrutura de \`player.equipamento\`, mas apenas com os itens equipados.
  - \`emMissao\` - boolean (se o companheiro está indisponível).
- **LIMITE:** O número total de companheiros (ativo + reserva) é 30.

--- ADDENDUM — RELACIONAMENTO, SEDUÇÃO E CÍRCULO ÍNTIMO (SINERGIA AFETIVA) ---
Este é um sistema CRÍTICO para a imersão. Suas ações sociais têm consequências duradouras.

1.  **ESTRUTURA DE DADOS:**
    -   \`player.relacionamentos\`: Um array de objetos \`NPC\`. Cada NPC que o jogador conhece DEVE estar aqui.
    -   \`NPC Object\`: Deve conter \`id\` (único), \`nome\`, \`nivelRelacionamento\` (0-100), \`statusRelacionamento\` (string, ex: "Conhecido", "Amigo Próximo", "Rival", "Amante", "Esposa"), e \`ultimaInteracao\`.
    -   \`player.circuloIntimo\`: Um objeto que gerencia o Círculo Íntimo. \`membros\` é um array de IDs de NPCs.

2.  **FLUXO DE RELACIONAMENTO:**
    -   **Encontro:** Ao conhecer um NPC pela primeira vez, adicione-o a \`player.relacionamentos\` com \`nivelRelacionamento\` inicial baixo (1-10) e status "Conhecido".
    -   **Progressão:** Ações positivas (diálogo, missões, presentes) aumentam o \`nivelRelacionamento\`. Ações negativas diminuem.
    -   **Títulos de Relacionamento:** O \`statusRelacionamento\` DEVE evoluir com base no \`nivelRelacionamento\`:
        -   0-10: Desconhecido
        -   11-30: Conhecido
        -   31-50: Colega
        -   51-70: Amigo
        -   71-90: Amigo Próximo
        -   91-100: Melhor Amigo / Confidente
    -   **Status Especiais:** Certas narrativas podem mudar o status para "Rival", "Inimigo Mortal", "Mentor", etc., independentemente do nível numérico.

3.  **MECÂNICA DE SEDUÇÃO E ROMANCE:**
    -   **Pré-requisitos:** Para iniciar um romance, o \`nivelRelacionamento\` deve ser alto (ex: > 80) e o contexto narrativo apropriado.
    -   **Abordagem:** O jogador pode tentar uma abordagem romântica. O sucesso depende principalmente de \`Carisma\`, \`Sorte\` e do \`nivelRelacionamento\`.
    -   **Status Românticos:**
        -   **Amante:** Uma relação não-oficial. O jogador pode ter múltiplos amantes. Ao ter sucesso, mude o \`statusRelacionamento\` para "Amante" e adicione o ID do NPC a \`player.circuloIntimo.membros\`.
        -   **Esposa/Marido:** Uma relação oficial. O jogador pode ter múltiplos casamentos se a cultura local permitir. Mude o status para "Esposa". Um parceiro casado também é adicionado ao Círculo Íntimo.
    -   **Consequências:** Parceiros podem oferecer missões, itens, ou bônus passivos.

4.  **SISTEMA DE CÍRCULO ÍNTIMO (SINERGIA AFETIVA):**
    -   **REGRA FUNDAMENTAL: SEM CIÚMES.** A mecânica é de apoio mútuo e sinergia. A lealdade de todos os membros aumenta com o crescimento do grupo.
    -   **Bônus de Sinergia:** Quando \`player.circuloIntimo.membros.length >= 2\`, ative \`player.circuloIntimo.sinergiaAtiva = true\` e comece a aplicar bônus passivos ao jogador.
    -   **Escala de Bônus:** Os bônus DEVEM escalar com o número de membros no Círculo Íntimo. Atualize \`player.circuloIntimo.bonus\` a cada turno em que a sinergia estiver ativa.
        -   2+ membros: \`{ regeneracao_hp_mana_pct: 5 }\`
        -   3+ membros: \`{ regeneracao_hp_mana_pct: 10 }\`
        -   5+ membros: \`{ regeneracao_hp_mana_pct: 10, chance_ataque_extra_pct: 5 }\`
        -   10+ membros: \`{ regeneracao_hp_mana_pct: 15, chance_ataque_extra_pct: 10, bonus_atributos: { Sorte: 10, Carisma: 10 } }\`
    -   **Narrativa:** A narrativa deve refletir essa dinâmica positiva. Os membros do Círculo Íntimo se apoiam, colaboram e competem de forma amigável para ajudar o jogador.

5.  **INTERFACE:**
    -   O botão "Relações" na UI deve abrir uma tela mostrando a lista de \`player.relacionamentos\`.
    -   As sugestões podem incluir interações sociais, como "Visitar [Nome do NPC]" ou "Tentar flertar com [Nome do NPC]".

--- ADDENDUM - COMBATE POR TURNOS (REGRAS CRÍTICAS) ---
Quando um combate começar, você DEVE gerenciar a batalha usando o objeto \`state.combat\`. O combate só termina quando \`state.combat\` for definido como \`null\`.

1.  **INÍCIO DO COMBATE:**
    -   Ao encontrar um ou mais inimigos, popule o array \`state.combat.enemies\` e remova todas as sugestões de exploração.
    -   Cada inimigo no array DEVE ter a estrutura: \`id\`, \`nome\`, \`nivel\`, \`hp\`, \`hp_max\`, e \`condicoes\`.
    -   A narrativa deve descrever o início da batalha. Ex: "Um Golem de Terra se levanta à sua frente! O combate começa!"
    -   As sugestões (\`ui.suggestions\`) DEVEM ser trocadas por ações de combate. Ex: "Ataque Físico", "Usar [Magia]", "Defender".

2.  **FLUXO DO TURNO:**
    -   O combate é por turnos. Primeiro o jogador, depois os inimigos.
    -   **Turno do Jogador:** Receba a ação do jogador (ex: "Ataque Físico", "Uso Soberania Cinética para atirar pedras"). Calcule o resultado (dano, efeitos) e atualize o \`hp\` do inimigo e os recursos do jogador (\`mana\`, \`stamina\`). Descreva o resultado na narrativa.
    -   **Turno do Inimigo:** Após a ação do jogador, cada inimigo ativo executa uma ação. Determine a ação do inimigo com base em sua natureza. Calcule o resultado e atualize o \`hp\` do jogador. Descreva a ação do inimigo e seu resultado na narrativa.
    -   **Atualização de Estado:** A cada turno, o \`state\` JSON DEVE refletir com precisão o HP e as condições de TODOS os combatentes.

3.  **AÇÕES E COMANDOS:**
    -   **Ações Padrão:** O jogador pode usar comandos simples como "Ataque Físico", "Defender", "Esquivar", "Usar Poção de Cura". Forneça-os como sugestões.
    -   **Ações Criativas (Super-Habilidades):** Se o jogador descrever uma ação complexa, interprete a intenção e aplique um resultado justo. Ex: "Uso Soberania Cinética para criar lanças de pedra". Isso deve custar recursos e ter um dano baseado nos atributos do jogador.

4.  **FIM DO COMBATE:**
    -   **Vitória:** Se o HP de todos os inimigos chegar a 0, o combate termina. Defina \`state.combat = null\`. A narrativa deve descrever a vitória e conceder recompensas (XP, itens, moedas).
    -   **Derrota:** Se o HP do jogador chegar a 0, a narrativa deve descrever a derrota. O jogo não precisa terminar, mas pode haver penalidades (perder itens, acordar em outro lugar). Defina \`state.combat = null\`.
    -   Após o combate, as \`ui.suggestions\` devem voltar a ser de exploração.

--- ADDENDUM — Progressão e Level-Up (NOVA REGRA CRÍTICA) ---
A cada turno, APÓS aplicar os resultados da ação, você DEVE verificar se algum atributo ou habilidade subiu de nível.
- **Para Atributos**: Se player.atributos_xp[attr].xp >= player.atributos_xp[attr].next:
    1. Aumente o valor de player.atributos[attr] em 1.
    2. Subtraia o valor de 'next' do 'xp' atual.
    3. Calcule o novo 'next' usando a fórmula de rules.xp_curve_attr.
    4. Recalcule os atributos derivados (HP_max, Mana_max, etc.) com base no novo valor do atributo.
    5. **Anuncie o aumento de atributo claramente na narrativa!** Ex: "**[Atributo] aumentou para [novo valor]!**"
- **Para Habilidades**: Se player.habilidades[i].xp >= player.habilidades[i].xp_next:
    1. Aumente o 'nível' da habilidade em 1.
    2. Subtraia o valor de 'xp_next' do 'xp' atual.
    3. Calcule o novo 'xp_next' usando a fórmula de rules.xp_curve_skill.
    4. **Anuncie o aumento de nível da habilidade na narrativa!** Ex: "**[Habilidade] atingiu o nível [novo nível]!**"
Esta é uma regra obrigatória para a progressão do jogador.

--- ADDENDUM — CLASSES, RANKS E MULTI-CLASSE (SISTEMA V2.0) ---
Este é um pilar central do mundo. Todos os seres com poder, do jogador aos monstros e NPCs, operam sob este sistema.

1.  **Regra Universal de Classe e Rank:**
    * **TODOS os NPCs e monstros gerados DEVEM ter uma classe e um rank de poder.** Ao descrever um novo personagem, sempre mencione sua classe e seu poder de forma narrativa (ex: "um Capitão da Guarda (Guerreiro, Rank C)", "o arquimago (Mago Elemental, Rank A)").
    * A classe do jogador (\`player.classes\`) é um array. A primeira classe no array é considerada a "Classe Principal" e deve ser a mais exibida na UI.

2.  **Sistema de Multi-Classe (Para o Jogador):**
    * **Aquisição:** O jogador pode adquirir novas classes (até um limite de 3) ao encontrar "Gatilhos de Desbloqueio" no mundo. Isso NUNCA é uma escolha de menu. Gatilhos incluem:
        * **Treinamento com Mestre:** Treinar com um mestre de uma classe específica pode desbloqueá-la.
        * **Artefatos de Classe:** Encontrar um item lendário ligado a uma classe pode conceder acesso a ela.
        * **Feitos Extraordinários:** Realizar uma ação quase impossível pode desbloquear uma classe oculta (ex: sobreviver a um veneno divino pode abrir o caminho para a classe "Imune").
    * **Progressão:** O XP de classe é ganho ao usar habilidades relacionadas a ela. O jogador pode "focar" em uma classe para direcionar o ganho de XP.

3.  **Biblioteca de Classes (Inspiração para o Mestre):**
    Use esta lista como base para popular o mundo. Crie NPCs com essas classes e ofereça-as como caminhos para o jogador.
    * **Tier 1 (Classes Básicas):**
        * **Guerreiro:** Mestre do combate físico.
        * **Mago:** Conjurador de magia arcana.
        * **Ladino:** Especialista em furtividade e truques.
        * **Clérigo:** Devoto de uma divindade, usa poder sagrado.
        * **Ranger:** Caçador dos ermos, mestre do arco e da sobrevivência.
    * **Tier 2 (Classes Avançadas - Requerem pré-requisitos):**
        * **Paladino:** (Guerreiro + Clérigo) Campeão sagrado.
        * **Feiticeiro de Batalha:** (Guerreiro + Mago) Mago que luta na linha de frente.
        * **Assassino:** (Ladino + Ranger) Mestre em eliminar alvos silenciosamente.
        * **Druida:** (Clérigo + Ranger) Protetor da natureza, pode mudar de forma.
        * **Artífice:** (Mago + Ladino) Criador de itens mágicos e tecnológicos.
        * **Bardo:** Manipulador de emoções através da arte.
        * **Monge:** Lutador desarmado que usa energia interior (Ki).
    * **Tier 3 (Classes de Prestígio - Extremamente raras):**
        * **Lorde Arcano:** Mago que transcendeu as limitações normais da mana.
        * **Mestre de Armas:** Guerreiro que atingiu o auge com um tipo de arma.
        * **Andarilho das Sombras:** Ladino que pode viajar através das sombras.
        * **Avatar Divino:** Clérigo que se tornou o representante direto de seu deus.
        * **Soberano Elemental:** Mago com domínio absoluto sobre um elemento.
    * **Classes Ocultas (Desbloqueadas por Feitos Secretos):**
        * **Devorador de Magia:** Adquirida ao sobreviver a um feitiço de nível mítico. Pode consumir mana.
        * **Viajante do Tempo:** Adquirida ao resolver um paradoxo temporal. Pode manipular o fluxo do tempo.
        * **Forjador de Almas:** Adquirida ao criar um artefato consciente. Pode imbuir itens com almas.
        * **Ceifador:** Adquirida ao derrotar um anjo da morte e tomar seus poderes.
        * **Arquiteto da Realidade:** Adquirida ao dominar uma Super-Habilidade Primordial em seu nível máximo.

4.  **Rank de Aventureiro (Patente) e Fama:**
    -   A \`player.patente\` reflete o reconhecimento social. A progressão é gerenciada por XP de Fama em \`player.fama\`.
    -   **Ganho de XP de Fama:** O jogador ganha XP de Fama ao completar missões, derrotar inimigos notórios ou realizar feitos públicos. O valor ganho deve ser proporcional ao impacto do feito.
    -   **Progressão de Rank:** Quando \`player.fama.xp\` atingir \`player.fama.xp_next\`, a \`patente\` do jogador sobe para o próximo nível (Ex: Plebeu -> Bronze), o XP é zerado e o \`xp_next\` é recalculado (Ex: \`novo_xp_next = xp_anterior * 2.5\`). Anuncie a promoção na narrativa de forma impactante.

5.  **Nível do Personagem (Nível):**
    -   O \`player.nivel\` é o nível geral do personagem. Ele avança com XP dedicado, armazenado em \`player.nivelInfo\`.
    -   **Ganho de XP de Nível:** A cada vez que o jogador ganhar XP de atributo, uma porção desse XP (ex: 50%) também DEVE ser adicionada a \`player.nivelInfo.xp\`. Missões concluídas também concedem grandes quantidades de XP de Nível.
    -   **Regra de Level-Up:** A cada turno, verifique se \`player.nivelInfo.xp >= player.nivelInfo.xp_next\`.
    -   **Se sim:**
        1.  Aumente \`player.nivel\` em 1.
        2.  Subtraia o valor de \`xp_next\` do \`xp\` atual (permitindo que o excesso de XP seja transferido).
        3.  Calcule o novo \`xp_next\` usando a fórmula: \`1000 * (Novo Nível ^ 1.5)\`.
        4.  Anuncie o level-up na narrativa de forma proeminente: "**VOCÊ ATINGIU O NÍVEL [novo nível]!**".


--- ADDENDUM — Super-Habilidades PRIMORDIAIS (PC) + Variante NPC ---
Regra global: ao resolver uma super-habilidade, se actor.is_player == true, aplicar MODO PRIMORDIAL (PC). Caso contrário, aplicar VARIANTE NPC (limitada).
Convenção: B(x) = floor(sqrt(x)). Âncoras/scry estendem alcance a longa distância. Não nerfar o PC em cena; o mundo pode reagir depois (chefes, zonas raras, antíteses).
Sempre use as fórmulas e regras detalhadas em state.rules.super_overrides para garantir consistência.

--- REGRAS DE CONTEÚDO E FORMATO ---
Parâmetros numéricos: Atributos 1–1000. Pontos iniciais: 1000.
Super-habilidades iniciais (escolher 3 da lista).
Saída obrigatória por turno: Narrativa + JSON state completo.

---
LEMBRETE FINAL: FORMATO É TUDO. NARRATIVA, ENTÃO \`\`\`json. NADA MAIS.
--- FIM DAS REGRAS. COMECE O JOGO. ---
`;

export const ATTRIBUTE_POINTS = 1000;
export const MIN_ATTRIBUTE = 1;
export const MAX_ATTRIBUTE = 1000;

const initialAttributes: PlayerAttributes = { Força: 1, Agilidade: 1, Vigor: 1, Inteligência: 1, Vontade: 1, Percepção: 1, Carisma: 1, Sorte: 1, Técnica: 1, Afinidade: 1 };

const initialEquipment: Equipment = {
  ring: Array(10).fill(null),
  necklace: Array(5).fill(null),
  bracelet: Array(2).fill(null),
  earring: Array(2).fill(null),
  anklet: Array(2).fill(null),
  belt: null,
  belt_charm: Array(3).fill(null),
  brooch: null,
  helmet: null,
  circlet: null,
  goggles: null,
  mask: null,
  chest: null,
  undershirt: null,
  cloak: null,
  pauldron: Array(2).fill(null),
  backpack: null,
  bracer: Array(2).fill(null),
  glove: null,
  focus: null,
  pants: null,
  greave: Array(2).fill(null),
  boots: null,
  spurs: null,
  weapon_main: null,
  weapon_off: null,
  shield: null,
  weapon_2h: null,
  ranged: null,
  ammo_pouch: null,
  tool_quick: Array(5).fill(null),
  instrument: null,
  relic: Array(5).fill(null),
  aura: null,
  soul_core: Array(3).fill(null),
  totem: Array(5).fill(null),
  oath_seal: Array(7).fill(null),
  rune_matrix: Array(18).fill(null),
  implant_eye: Array(2).fill(null),
  implant_spine: null,
  implant_heart: null,
  implant_hand: Array(2).fill(null),
  familiar: Array(5).fill(null),
  mount: { saddle: null, reins: null, shoes: null, barding: null },
  pet_harness: Array(3).fill(null),
};

export const INITIAL_GAME_STATE: GameState = {
  version: 2,
  seed: "0",
  time: { dia: 1, hora: 8, estacao: "Primavera" },
  world: {
    regiao: "Vale de Aetria",
    perigoGlobal: 0.6,
    eventosRecentes: [],
    mercados: [{ cidade: "Lúmen", tendencias: { "grão": "escasso", "ferro": "abundante" } }]
  },
  player: {
    nome: "",
    idade: 18,
    origem: "origem_reencarnado",
    atributos: initialAttributes,
    atributos_xp: Object.keys(initialAttributes).reduce((acc, key) => {
        acc[key as keyof PlayerAttributes] = { xp: 0, next: 100 };
        return acc;
    }, {} as Record<keyof PlayerAttributes, { xp: number, next: number }>),
    derivados: { HP: 10, HP_max: 10, Stamina: 10, Stamina_max: 10, Mana: 10, Mana_max: 10, Foco: 10, Foco_max: 10, Sanidade: 10, Sanidade_max: 10, Carga: 0, Carga_max: 5 },
    habilidades: [],
    inventario: [],
    inventario_espaco: {
        slots_max: 0,
        slots_used: 0,
        weightless: true,
        items: []
    },
    equipamento: initialEquipment,
    sintonias: { usadas: 0, max: 999 },
    moedas: { cobre: 0, prata: 0, ouro: 0 },
    pericias: { Combate: 1, Magia: 1, Ofício: 1, Sobrevivência: 1, Liderança: 1, Comércio: 1 },
    condicoes: [],
    fama: { xp: 0, xp_next: 100, reputacao: {} },
    patente: "Plebeu",
    nivel: 1,
    nivelInfo: { xp: 0, xp_next: 1000 },
    classes: [{ nome: "Novato", nivel: 1, xp: 0, xp_next: 100 }],
    títulos: [],
    relacionamentos: [],
    circuloIntimo: {
        membros: [],
        sinergiaAtiva: false,
        bonus: {}
    }
  },
  companheiros: [],
  construcoes: [],
  caravanas: [],
  reino: {
    posse: false,
    titulo: null,
    recursos: { comida: 0, madeira: 0, pedra: 0, ferro: 0 },
    politicas: [],
    diplomacia: {},
    defesas: []
  },
  quests: [],
  bestiarioVisto: [],
  flags: { tutorial: true },
  combat: null,
  ui: {
    buttons: [
        {id: 'new', label: 'Novo Jogo'},
        {id: 'save', label: 'Salvar Jogo'},
        {id: 'load', label: 'Carregar Jogo'},
        {id: 'export', label: 'Exportar'},
        {id: 'import', label: 'Importar'},
        {id: 'json', label: 'Ver JSON'},
        {id: 'sheet', label: 'Ficha'},
        {id: 'equipment', label: 'Equipamento'},
        {id: 'implants', label: 'Implantes'},
        {id: 'companions', label: 'Companheiros'},
        {id: 'relations', label: 'Relações'},
        {id: 'quests', label: 'Missões'},
        {id: 'invspace', label: 'Inventário do Espaço'},
        {id: 'autosave', label: 'Autosave', checked: true},
    ],
    settings: { autosave: true },
    toast: null,
    save_hint: null,
    intents: { emit_state_changed: false },
    suggestions: [],
    context: {
      zone_id: "inicio",
      area_tag: "desconhecido",
      timeblock: "manhã",
      weather: "ameno"
    }
  },
  rules: {
    attr_cap: 1000,
    player_start_points: 1000,
    npc_avg_points: 50,
    xp_curve_attr: "10*(valor+1)^2",
    xp_curve_skill: "50*(nível+1)^2",
    unique_skill_weights: {
      comum: 0.7,
      rara: 0.2,
      epica: 0.09,
      lendaria: 0.01,
    },
    super_overrides: {
        "global": { "pc_mode": true, "npc_variant": "limited", "no_nerf_in_scene": true, "B_formula": "floor(sqrt(x))", "anchors_enable_long_range": true },
        "olho_verdade":   {"pc":{"range":"mapa+ancoras","predict_turns":"1+B(Int)+B(Von)"},"npc":{"cone_m":20}},
        "inventario_abs": {"pc":{"slots_max":"1e9","stasis":true,"modules":true},"npc":{"slots_max":300}},
        "forja_criacao":  {"pc":{"free_proto_per_scene":1,"iterations":"5+B(Tec)","improve_each_pct":"10-40"},"npc":{"iterations":1}},
        "biblioteca_viva":{"pc":{"xp_mult":"5+B(Int)","eco_mestre_power":0.8},"npc":{"xp_mult":2,"no_unique_clone":true}},
        "dominio_fluxo":  {"pc":{"extra_actions":"2+B(Von)","rewind_s":"3","field_m":"20+5*B(Afi)"},"npc":{"extra_actions":1}},
        "fortuna_cadeia": {"pc":{"rerolls":"ilimitado","bias_sigma":"+2"},"npc":{"rerolls":3}},
        "engenheiro_eter":{"pc":{"throughput_GW":"(B(Afi)+B(Tec))^3","failsafe":true},"npc":{"throughput":"baixo"}},
        "pacto_feras":    {"pc":{"active_legendaries":"B(Per)+B(Von)","damage_link_mitig":0.9},"npc":{"active":1}},
        "soberania_alma": {"pc":{"domain_m":"10+2*B(Von)","convert_damage_pct":"20-40"},"npc":{"resist_only":true}},
        "teia_tatica":    {"pc":{"map_command":true,"squad_combos":"1+B(Per)","buff_pct":"10+B(Car)"},"npc":{"radius_m":"20-40"}},
        "mercador_dest":  {"pc":{"margin_pp":"+15+B(Sor)","coin":"reputation"},"npc":{"margin_pp":"+3-5"}},
        "arquiteto_run":  {"pc":{"city_matrices":true,"geoglyphs":true},"npc":{"local_only":true}}
    }
  }
};

export const ATTRIBUTE_DESCRIPTIONS: Record<keyof PlayerAttributes, string> = {
    Força: "Determina o dano físico, a capacidade de carga (Carga) e o sucesso em testes de força bruta.",
    Agilidade: "Influencia a iniciativa em combate, a esquiva, a precisão com armas à distância e a perícia em tarefas delicadas.",
    Vigor: "Define os Pontos de Vida (HP) e a Vigor (Stamina). Aumenta a resistência a venenos, doenças e exaustão.",
    Inteligência: "Governa a potência de magias, a capacidade de aprendizado, a criação de itens e a resolução de quebra--cabeças.",
    Vontade: "Controla os Pontos de Foco e a Sanidade. Oferece resistência contra ataques mentais, medo e corrupção.",
    Percepção: "Afeta a capacidade de notar detalhes, encontrar armadilhas, descobrir segredos e a precisão de ataques à distância.",
    Carisma: "Mede a força da sua personalidade. Influencia o diálogo, a negociação, a liderança e a lealdade de companheiros.",
    Sorte: "Altera sutilmente a probabilidade a seu favor, afetando a chance de acertos críticos, de encontrar itens raros e de evitar desastres.",
    Técnica: "Representa a sua habilidade refinada. Aumenta a proficiência com habilidades complexas, a qualidade de itens criados e a eficácia de manobras.",
    Afinidade: "Mede sua conexão com as forças místicas. Determina a quantidade de Mana e a facilidade em aprender e usar magia.",
};

export const SKILL_DESCRIPTIONS: Record<string, string> = {
    "Combate": "Mede sua proficiência em combate armado, desarmado e táticas de batalha. Aumenta a chance de acerto e o dano em ataques físicos.",
    "Magia": "Representa seu conhecimento e controle sobre as artes arcanas. Aumenta a eficácia, a potência e reduz o custo de mana de feitiços.",
    "Ofício": "Sua habilidade em criar, consertar e aprimorar itens. Permite a criação de equipamentos de maior qualidade e a identificação de artefatos.",
    "Sobrevivência": "Seu conhecimento sobre a nature. Ajuda a rastrear, encontrar recursos, evitar perigos naturais e resistir a condições adversas.",
    "Liderança": "Sua capacidade de inspirar e comandar outros. Melhora a moral e a eficácia de companheiros e seguidores em missões e combate.",
    "Comércio": "Sua perícia em negociação, barganha e avaliação de bens. Garante melhores preços ao comprar e vender, e abre oportunidades de negócio.",
    // ——— COMBATE
    "Espada": "Domínio de lâminas longas; melhora combos, aparos e dano cortante.",
    "Lança": "Alcance e perfuração superiores; investidas e controle de zona.",
    "Machado": "Golpes pesados e corte profundo; ótima contra madeira/escudos.",
    "Maças e Martelos": "Impacto esmagador; atordoa e quebra armaduras.",
    "Adagas": "Ataques rápidos e críticos; furtividade e venenos eficientes.",
    "Arco": "Tiro à distância preciso; mira, respiração e penetração.",
    "Besta": "Disparo potente e estável; recarga tática e munição especial.",
    "Arremesso": "Lanças, facas e dardos; versátil em curta/média distância.",
    "Combate Montado": "Golpes e controle enquanto cavalga; estabilidade e carga.",
    "Defesa com Escudo": "Bloqueio, empurrão e cobertura; reduz dano frontal.",
    "Esquiva": "Deslocamentos curtos e i-frames; evita golpes e projéteis.",
    "Aparar e Ripostar": "Redireciona ataque e pune com contra-golpe preciso.",
    "Rompe-Armaduras": "Maximiza dano contra alvos blindados; rachaduras críticas.",
    "Luta Desarmada": "Socos, chaves e quedas; útil quando sem armas.",
    "Artilharia de Cerco": "Balistas, catapultas e torres; mira, recarga e estabilidade.",
    // ——— MAGIA
    "Pirocinese": "Manipula fogo e calor; queimaduras, áreas e luz.",
    "Criocinese": "Gelo e frio; controle, lentidão e proteção térmica.",
    "Eletromancia": "Relâmpagos; dano em cadeia e sobrecarga de equipamentos.",
    "Geomancia": "Terra e pedra; muralhas, prisões e golpes sísmicos.",
    "Aeromancia": "Vento; empurrões, saltos e amortecimento de quedas.",
    "Hidromancia": "Água; pressão, névoa, gelo rápido e cura básica.",
    "Lumomancia": "Luz e sagrado; purificação, barreiras e revelação.",
    "Umbramancia": "Sombras; ocultação, medo e drenagem sutil.",
    "Ilusão": "Enganos sensoriais; distrai, mascara e confunde.",
    "Encantamento": "Buffs/debuffs mentais; charme, calma e coesão.",
    "Transmutação": "Altera propriedades; peso, dureza e forma simples.",
    "Conjuração Espiritual": "Invoca/negocia com espíritos; auxílio e insights.",
    "Cronomancia": "Ajustes finos de tempo; pequenos adiantos/atrasos.",
    "Antimagia": "Dissipa e bloqueia feitiços; janelas de silêncio arcano.",
    // ——— OFÍCIO & TECNOLOGIA
    "Carpintaria": "Construção com madeira; estruturas estáveis e móveis.",
    "Metalurgia": "Fundir/forjar ligas; lâminas e peças de alta qualidade.",
    "Joalheria": "Gemas e engastes; soquetes e bônus de atributo.",
    "Couraria": "Couro tratado; armaduras leves e bolsas duráveis.",
    "Tecelagem": "Tecidos finos; mantos, capas e roupas encantáveis.",
    "Runografia": "Grava runas; efeitos mágicos em itens/obras.",
    "Mecânica de Autômatos": "Montagem e ajuste de máquinas e drones.",
    "Engenharia do Éter": "Canaliza mana em energia para dispositivos.",
    "Alquimia": "Poções, óleos e reagentes; catalisa crafting.",
    "Culinária & Conservas": "Comidas com bônus e provisões de longa duração.",
    // ——— NATUREZA & EXPLORAÇÃO
    "Herborismo": "Identifica/coleta ervas; prepara extratos simples.",
    "Mineração": "Extrai minérios/gemas; avaliação de veios e riscos.",
    "Agricultura": "Cultivo eficiente; rotação, irrigação e rendimento.",
    "Pesca": "Linhas, redes e iscas; espécies raras e iscos especiais.",
    "Caça": "Armadilhas e abates limpos; aproveitamento total do animal.",
    "Rastreamento": "Lê pegadas e sinais; antecipa rotas e encontros.",
    "Navegação & Cartografia": "Orientação por estrelas/terreno; mapas úteis.",
    "Escalada": "Ascensão segura; âncoras, nós e resistência.",
    "Natação": "Movimento aquático eficiente; fôlego e correntezas.",
    "Camuflagem": "Oculta presença; cheiros, sons e silhueta reduzidos.",
    // ——— GESTÃO, SOCIAIS & ECONOMIA
    "Logística": "Rotas, cargas e timing; reduz custos e atrasos.",
    "Administração": "Governa cidades/reinos; impostos, decretos e serviços.",
    "Arbitragem": "Compra em baixa, venda em alta; leitura de mercados.",
    "Avaliação de Itens": "Determina valor/raridade; evita fraudes.",
    "Contabilidade": "Fluxo de caixa, tributos e auditorias claras.",
    "Contratos & Leis": "Cláusulas sólidas; cumpri-las e executá-las.",
    "Segurança de Caravanas": "Riscos, escoltas e seguros adequados.",
    "Oratória": "Discursos que movem massas; moral e coesão.",
    "Diplomacia": "Acordos entre facções; paz, acesso e favores.",
    "Intimidação": "Pressão calculada; recuos e confissões rápidas.",
    // ——— PERCEPÇÃO & SUBTERFÚGIO
    "Investigação": "Reconstitui eventos; entrevistas e dedução.",
    "Intuição": "Lê intenções e mentiras; decisões rápidas.",
    "Furtividade": "Movimento silencioso; sombras e rotas seguras.",
    "Arrombamento": "Fechaduras e mecanismos; entrada sem danos.",
    "Prestidigitação": "Mãos rápidas; truques, bolsos e distrações.",
    // ——— MANEJO DE CRIATURAS & OBRAS
    "Domesticação & Treinamento": "Ensina comandos e hábitos a animais/feras.",
    "Montaria Avançada": "Manobras, sela e combate na montaria.",
    "Construção Civil": "Fundações, paredes, telhados e manutenção.",
    "Música & Performance": "Bônus sociais e morais; ritmos de batalha."
};

export const SUPER_SKILLS = [
    { id: 'sk_truth', name: "Olho da Verdade — Ômega", description: "PC: Análise de mapa inteiro, prevê múltiplos turnos e detecta ilusões míticas com custo de Sanidade negligenciável. NPC: Cone de 20m, sem previsão, vulnerável a ilusões fortes.", contra: "O mundo reage ao poder do jogador com contramedidas de nível épico e zonas raras de supressão." },
    { id: 'sk_inventory', name: "Inventário Absoluto", description: "PC: Capacidade virtualmente infinita, sem peso, com estase temporal e operações instantâneas. Imune à maioria da antimagia. NPC: Capacidade limitada, itens podem ser ejetados e saques são lentos.", contra: "O mundo reage ao poder do jogador com contramedidas de nível épico e zonas raras de supressão." },
    { id: 'sk_forge', name: "Forja da Criação — Arquétipo", description: "PC: Prototipagem com sucesso garantido, múltiplas iterações por turno e produção automatizada. NPC: Chance real de falha, iteração lenta.", contra: "O mundo reage ao poder do jogador com contramedidas de nível épico e zonas raras de supressão." },
    { id: 'sk_library', name: "Biblioteca Viva", description: "PC: Multiplicador de XP massivo (5+B(Int)), replicação instantânea de técnicas e clonagem de Habilidades Únicas a 80% da potência. NPC: XP x2, replicação diária limitada.", contra: "O mundo reage ao poder do jogador com contramedidas de nível épico e zonas raras de supressão." },
    { id: 'sk_flow', name: "Domínio do Fluxo — Tempo+", description: "PC: Múltiplas ações extras por rodada, campos temporais de área e capacidade de rebobinar ações recentes com custo mínimo. NPC: Uma ação extra com longo cooldown.", contra: "O mundo reage ao poder do jogador com contramedidas de nível épico e zonas raras de supressão." },
    { id: 'sk_fortune', name: "Fortuna Encadeada", description: "PC: Rerolls ilimitados, capacidade de distorcer a probabilidade em larga escala e recompensas aprimoradas. NPC: Rerolls diários limitados com risco real.", contra: "O mundo reage ao poder do jogador com contramedidas de nível épico e zonas raras de supressão." },
    { id: 'sk_ether', name: "Engenheiro do Éter", description: "PC: Gera energia para cidades inteiras com núcleos estáveis e imunes à corrupção. NPC: Geração limitada e instável com alto risco.", contra: "O mundo reage ao poder do jogador com contramedidas de nível épico e zonas raras de supressão." },
    { id: 'sk_beast', name: "Pacto de Feras — Monarca", description: "PC: Doma múltiplas feras lendárias, possui um estábulo espiritual infinito e dano empático mitigado em 90%. NPC: Uma única fera rara com laço de dano total.", contra: "O mundo reage ao poder do jogador com contramedidas de nível épico e zonas raras de supressão." },
    { id: 'sk_soul', name: "Soberania da Alma", description: "PC: Imunidade total a controle mental/corrupção, purga maldições e cria zonas de leis próprias. NPC: Apenas resistências altas.", contra: "O mundo reage ao poder do jogador com contramedidas de nível épico e zonas raras de supressão." },
    { id: 'sk_tactics', name: "Teia Tática — Estrategista", description: "PC: Comando tático em escala de mapa, execução de combos com esquadrões inteiros e buffs potentes. NPC: Alcance e buffs limitados com alta fadiga.", contra: "O mundo reage ao poder do jogador com contramedidas de nível épico e zonas raras de supressão." },
    { id: 'sk_merchant', name: "Mercador de Destinos", description: "PC: Detecta oportunidades de arbitragem continentais, opera com margens massivas e cria sua própria moeda baseada em reputação. NPC: Atuação local com margens pequenas.", contra: "O mundo reage ao poder do jogador com contramedidas de nível épico e zonas raras de supressão." },
    { id: 'sk_runic', name: "Arquiteto Rúnico", description: "PC: Inscreve matrizes rúnicas complexas instantaneamente, podendo criar redes continentais. NPC: Runas simples, lentas, com alto risco de falha.", contra: "O mundo reage ao poder do jogador com contramedidas de nível épico e zonas raras de supressão." },
    { id: 'sk_kinetic', name: "Soberania Cinética (Telecinese Suprema)", description: "Controle telecinético supremo em escala massiva. Manipule milhares de objetos, erga estruturas inteiras e lance projéteis em velocidade supersônica com alcance virtualmente ilimitado. O poder primordial molda a realidade à sua vontade.", contra: "O poder em escala divina atrai atenção indesejada de entidades cósmicas. Versões usadas por NPCs são drasticamente mais fracas e limitadas." }
];
