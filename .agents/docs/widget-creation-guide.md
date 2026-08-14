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

Ao renderizar os cards de uma categoria na `WidgetLibrary.tsx`, adote classes Tailwind que transmitam a identidade do conjunto:

### Exemplos de Temas Existentes:

| Categoria         | Identidade Visual                          | Classes & Cores Chave                                                    |
| :---------------- | :----------------------------------------- | :----------------------------------------------------------------------- |
| **Codeweb Aura**  | Aurora boreal, cosmic glow, glassmorphism  | `border-[#8b5cf6]/30 hover:border-[#ec4899] bg-[#0d0915] text-[#c084fc]` |
| **Control Plane** | Blueprint técnico, cyber grid, CAD         | `border-[#00f3ff]/20 hover:border-[#00f3ff] bg-[#050b14] text-[#00f3ff]` |
| **ASCII Profile** | Terminal retrô monoespaçado, hacker        | `border-[#30363d] hover:border-[#ffa657] bg-[#0d1117] text-[#ffa657]`    |
| **GodProfile**    | Cyberpunk neon, alta densidade de métricas | `border-[#a855f7]/30 hover:border-[#a855f7] bg-[#120726] text-[#c084fc]` |

### Estrutura de Card Recomendada:

```tsx
<div
  onClick={() => addWidget(item.id)}
  className="group relative border border-thematic/30 hover:border-thematic bg-thematic-bg hover:bg-thematic-hover transition-all duration-300 rounded-xs cursor-pointer p-3 flex flex-col"
>
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-2">
      <Icon size={14} className="text-thematic" />
      <span className="font-mono text-xs font-semibold text-white">{item.name}</span>
    </div>
    {renderWidgetBadge(item.badge)}
  </div>
  <p className="text-[11px] text-ash mt-1 line-clamp-2">{item.desc}</p>
</div>
```

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
