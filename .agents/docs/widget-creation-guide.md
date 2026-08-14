# Guia de Criação de Novos Widgets e Categorias no GitAscii

> **Documentação de Referência para Agentes e Desenvolvedores**  
> Este documento define os padrões obrigatórios e o fluxo de trabalho completo para implementar novos widgets (internos ou externos), criar categorias temáticas com estilos únicos, e projetar controles e redimensionamentos no padrão profissional do GitAscii.

---

## Sumário

1. [Visão Geral da Arquitetura](#1-visão-geral-da-arquitetura)
2. [Criando uma Nova Categoria Temática](#2-criando-uma-nova-categoria-temática)
3. [Implementando um Novo Widget (Passo a Passo End-to-End)](#3-implementando-um-novo-widget-passo-a-passo-end-to-end)
4. [Redimensionamento Automático e Responsividade SVG](#4-redimensionamento-automático-e-responsividade-svg)
5. [Padrão da Plataforma para Filtros e Painel de Propriedades](#5-padrão-da-plataforma-para-filtros-e-painel-de-propriedades)
6. [Estilização Única por Categoria na Library](#6-estilização-única-por-categoria-na-library)
7. [Checklist Obrigatório de Entrega](#7-checklist-obrigatório-de-entrega)

---

## 1. Visão Geral da Arquitetura

O GitAscii é um gerador de perfis GitHub baseado em composição visual de widgets e renderização vetorial SVG pura.

```
┌────────────────────────────────────────────────────────┐
│               1. Catálogo & Sidebar                    │
│    WIDGET_CATALOG + WIDGET_CATEGORIES + WidgetLibrary  │
└──────────────────────────┬─────────────────────────────┘
                           │ (Adicionar ao Canvas)
┌──────────────────────────▼─────────────────────────────┐
│                 2. Editor Store & State                 │
│      useEditorStore (dimensions, position, config)     │
└──────────────┬──────────────────────────┬──────────────┘
               │                          │
┌──────────────▼─────────────┐ ┌──────────▼──────────────┐
│  3. Painel de Propriedades │ │   4. Engine de SVG      │
│     (Controls & Filters)   │ │  (WidgetRenderer + R.)  │
│  - Presets & Layout modes  │ │  - Renderiza SVG puro   │
│  - Filtros & Seleção       │ │  - Adapta ao viewBox    │
│  - Auto-Resize dinâmico    │ │  - Keyframes & Animações│
└────────────────────────────┘ └─────────────────────────┘
```

---

## 2. Criando uma Nova Categoria Temática

Cada categoria temática no GitAscii possui **identidade visual própria**, refletindo a proposta visual dos widgets que ela agrupa (ex: _Codeweb Aura_ tem gradientes cósmicos e glassmorphism; _Control Plane_ tem estética blueprint/cyber monocromática; _ASCII Profile_ tem estética terminal âmbar).

### 2.1. Passo 1: Registrar o ID da Categoria

No arquivo [src/constants/index.ts](file:///C:/Repos/GitAscii/src/constants/index.ts):

```ts
export const WIDGET_CATEGORIES = {
  ESSENTIAL: 'essential',
  INTERACTIVE: 'interactive',
  STATS: 'stats',
  EXTERNAL: 'external',
  MISC: 'misc',
  GODPROFILE: 'godprofile',
  ASCIIPROFILE: 'asciiprofile',
  CONTROLPLANE: 'controlplane',
  CODEWEB_DEV: 'codeweb-dev',
  MINHA_NOVA_CATEGORIA: 'minha-nova-categoria', // <-- Adicionar aqui
} as const
```

### 2.2. Passo 2: Registrar o Filtro na Sidebar

No arquivo [src/features/editor/config/widgets.ts](file:///C:/Repos/GitAscii/src/features/editor/config/widgets.ts):

```ts
export const WIDGET_FILTERS: WidgetFilterItem[] = [
  // ... filtros existentes
  {
    id: 'minha-nova-categoria',
    labelKey: 'editor.sidebar.filter.minha_nova_categoria',
    defaultLabel: 'Minha Categoria',
    icon: Sparkles, // Ícone Lucide representativo
    match: (item) => item.category === WIDGET_CATEGORIES.MINHA_NOVA_CATEGORIA,
  },
]
```

### 2.3. Passo 3: Adicionar Traduções

No arquivo [src/i18n/index.tsx](file:///C:/Repos/GitAscii/src/i18n/index.tsx), adicione as chaves em português e inglês para o filtro e cabeçalho da categoria.

### 2.4. Passo 4: Criar a Seção Visual Customizada na Library

No arquivo [src/features/editor/components/Sidebar/WidgetLibrary.tsx](file:///C:/Repos/GitAscii/src/features/editor/components/Sidebar/WidgetLibrary.tsx):

- Crie um bloco colapsável dedicado para a categoria.
- Aplique uma paleta de cores temática (bordas, texto, badges, hover shadows).
- Veja exemplos na [Seção 6](#6-estilização-única-por-categoria-na-library).

---

## 3. Implementando um Novo Widget (Passo a Passo End-to-End)

Toda implementação de widget requer modificações em pontos específicos da codebase:

### Checklist de Arquivos a Tocar:

1. `src/constants/index.ts`: Adicionar constante em `WIDGET_IDS`.
2. `src/features/editor/config/widgets.ts`: Registrar no `WIDGET_CATALOG` com dimensões padrão (`defaultSize`), categoria, ícone e badge.
3. `src/features/widgets/renderers/MeuWidgetRenderer.ts`: Criar o motor que gera a string SVG limpa.
4. `src/engine/core/WidgetRenderer.ts`: Importar e adicionar o `case WIDGET_IDS.MEU_WIDGET` no switch.
5. `src/features/editor/components/Properties/MeuWidgetControls.tsx`: Criar o painel de filtros e propriedades.
6. `src/features/editor/components/Properties/PropertiesPanel.tsx`: Conectar o componente de controles ao widget selecionado.
7. `src/features/editor/components/Sidebar/WidgetPreviewTooltip.tsx`: Definir o tamanho de preview no tooltip.
8. `src/app/api/[username]/[profileSlug]/route.ts`: Adicionar dimensões padrão no fallback de renderização da API.

---

## 4. Redimensionamento Automático e Responsividade SVG

> [!IMPORTANT]
> **Regra de Ouro do GitAscii:** O usuário **nunca** deve ver conteúdo cortado ou espaços em branco gigantes após mudar uma configuração (ex: alternar layout de 1 coluna para grid de 2 colunas, adicionar/remover tags, mostrar/esconder descrição).

### 4.1. Fórmulas Determinísticas de Dimensão

No painel de controles do widget, calcule a nova altura/largura e atualize o store imediatamente:

```tsx
// Exemplo em MeuWidgetControls.tsx
const handleLayoutChange = (newLayout: 'single' | 'grid' | 'cards') => {
  let targetHeight = 220

  if (newLayout === 'single') {
    targetHeight = 160
  } else if (newLayout === 'grid') {
    const rows = Math.ceil(activeItems.length / columns)
    targetHeight = 80 + rows * 64
  } else if (newLayout === 'cards') {
    targetHeight = 260
  }

  // 1. Atualiza a configuração do widget
  updateWidgetConfig(instanceId, { layout: newLayout })

  // 2. Redimensiona o container sem poluir o histórico de undo
  useEditorStore.getState().updateWidget(instanceId, {
    dimensions: {
      width: currentDimensions.width || 800,
      height: targetHeight,
    },
  })
}
```

### 4.2. Padrões de SVG para Responsividade

- **`viewBox` dinâmico**: Utilize sempre `viewBox="0 0 ${width} ${height}"` no SVG raiz.
- **Backgrounds e Grids fluidos**: Use larguras percentuais ou `${width - padding * 2}` para que o SVG preencha exatamente a caixa delimitadora do canvas.
- **Truncamento de texto seguro**: Calcule comprimentos máximos de strings ou use atributos SVG `<text>` com `text-overflow` e `clip-path` para evitar transbordamento.

---

## 5. Padrão da Plataforma para Filtros e Painel de Propriedades

O painel de propriedades deve seguir o padrão visual e de interação do GitAscii:

### 5.1. Camada 1 — Presets Visuais Rápidos (Quick Themes)

Ofereça botões de 1 clique para temas pré-configurados:

- Cores de destaque (Ex: _Cosmic Cyan_, _Sunset Amber_, _Cyber Lime_, _Minimal Noir_).
- Gradientes e efeitos visuais combinados.

### 5.2. Camada 2 — Seleção de Layout Visual (Pickers com Ícones)

- **Nunca use `<select>` HTML puro para layout**: Use grupos de botões com ícones Lucide (`LayoutGrid`, `LayoutTemplate`, `Rows`, `Columns`).
- O estado ativo deve ter destaque evidente com `bg-signal-lime/20 text-signal-lime border-signal-lime/40` ou a cor de destaque do tema.

### 5.3. Camada 3 — Filtros de Conteúdo e Seleção Granular

- **Seleção Positiva vs Negativa**:
  - Se a lista for finita (ex: redes sociais, métricas), permita ligar/desligar cada item com chips/pills interativos.
  - Se for longa (ex: tecnologias, repositórios), forneça **campo de busca**, lista com scroll (`max-h-48 overflow-y-auto`) e atalhos de seleção rápida.
- **Preservação de Ordem**: Ao adicionar tags ou repositórios, mantenha a ordem selecionada pelo usuário.

### 5.4. Camada 4 — Controles de Estilo e Personalização Fina

- **Switches/Toggles claros**: Para ligar/desligar animação, ícones, badges, glow e prompts.
- **Sliders numéricos com feedback visual**: Para opacidade, blur, velocidade de animação e raio de borda.
- **Custom Assets (Imagens / GIFs / Ícones)**: Suporte para URL direta, preview em miniatura e remoção fácil.

---

## 6. Estilização Única por Categoria na Library

Ao renderizar os cards de uma categoria na `WidgetLibrary.tsx`, você **DEVE** ir além do básico e implementar **animações de hover avançadas e bonitas** que transmitam a identidade do conjunto. O GitAscii preza por um design impecável, "premium" e dinâmico.

### Exemplos de Identidade Visual Existentes:

| Categoria         | Identidade Visual                          | Efeitos de Hover Obrigatórios                                                                                               |
| :---------------- | :----------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------- |
| **Codeweb Aura**  | Aurora boreal, cosmic glow, glassmorphism  | `radial-gradient` orbs ocultos que revelam opacidade no hover; caixas translúcidas. Sem badges `aura`.                      |
| **Control Plane** | Blueprint técnico, cyber grid, CAD         | SVG de grid no background revelando opacidade no hover; linhas vetoriais brilhantes crescendo nas bordas. Sem badges `sys`. |
| **ASCII Profile** | Terminal retrô monoespaçado, hacker        | Padrões de `repeating-linear-gradient` (scanlines); cantos brilhantes desenhados com bordas expandindo no hover.            |
| **GodProfile**    | Cyberpunk neon, alta densidade de métricas | Sombras profundas (glows coloridos) no hover; bordas de alta opacidade ou efeitos glitchy sutis.                            |

### Estrutura de Card Recomendada com Efeitos (Modelo Control Plane/ASCII):

Sempre envolva seu card em um `group relative overflow-hidden` e inclua `<div>`s absolutas estilizadas para o efeito de fundo no hover.

```tsx
<div
  onClick={() => addWidget(item.id)}
  className="group relative border border-thematic/30 hover:border-thematic/60 bg-thematic-bg hover:bg-thematic-hover transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] rounded-xs cursor-pointer shadow-xs hover:-translate-y-0.5 overflow-hidden hover:shadow-[0_4px_15px_rgba(THEMATIC_COLOR,0.15)] flex flex-col"
>
  {/* Efeitos de Fundo & Animações Dinâmicas (Revealed on Hover) */}
  <div
    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
    style={{
      backgroundImage:
        'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(THEMA_R, THEMA_G, THEMA_B, 0.05) 2px, rgba(THEMA_R, THEMA_G, THEMA_B, 0.05) 4px)',
    }}
  ></div>
  <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-thematic scale-y-0 group-hover:scale-y-100 origin-top transition-transform duration-300 shadow-[0_0_8px_rgba(THEMATIC_COLOR,0.8)] z-20"></div>

  {/* Conteúdo do Card (z-index superior para ficar acima dos efeitos) */}
  <div className="flex items-center gap-3 relative z-10 p-3">
    <div className="p-2 bg-thematic-dark backdrop-blur-xs border border-thematic/40 text-thematic-light group-hover:text-thematic transition-all duration-300 shrink-0">
      <Icon size={16} />
    </div>
    <div>
      <h4 className="font-mono font-medium text-[11px] text-thematic-light group-hover:text-thematic transition-colors duration-300">
        {item.name}
      </h4>
      <p className="font-mono text-[9px] text-thematic-muted group-hover:text-thematic-light transition-colors line-clamp-1 mt-0.5">
        {item.desc}
      </p>
    </div>
  </div>
</div>
```

> **Atenção:** Evite utilizar badges fixos que poluem o visual (como "aura" ou "sys"). Use as cores, o grid e o comportamento de animação do card para transmitir a identidade da categoria.

---

## 7. Checklist Obrigatório de Entrega

Antes de considerar um novo widget ou categoria concluído, execute esta verificação:

- [ ] **ID & Constantes**: Registrado em `WIDGET_IDS` e `WIDGET_CATALOG`.
- [ ] **Default Size**: `defaultSize` definido e coerente com a renderização inicial.
- [ ] **Renderer Isolado**: Código SVG limpo, sem tags HTML inválidas dentro do SVG.
- [ ] **Filtros Granulares**: O usuário pode ligar/desligar elementos e campos específicos.
- [ ] **Auto-Resize sem History Pollution**: Mudanças estruturais ajustam a altura com `recordHistory: false`.
- [ ] **Sem Emojis em Elementos de UI**: Todos os botões e seletores usam ícones Lucide vetoriais.
- [ ] **Scroll em Listas Longas**: Containers de seleção têm `max-h` com scroll customizado.
- [ ] **Tooltip & Preview**: `WidgetPreviewTooltip` exibe a proporção correta no hover da library.
- [ ] **API de Exportação**: Rota `[profileSlug]` possui dimensões de fallback para o novo widget.
- [ ] **Estilo Temático**: A categoria possui estilo visual condizente e diferenciado na sidebar.
