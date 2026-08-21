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

### 4.3. Isolamento Estrito de CSS & Prevenção de Vazamento de Fontes e Estilos Globais

> [!CAUTION]
> **PERIGO DE VAZAMENTO DE ESTILOS NO EDITOR:**  
> Quando os SVGs são renderizados inline no DOM (por exemplo, no hover de tooltip da biblioteca `WidgetPreviewTooltip` ou no Canvas do editor), qualquer bloco `<style>` injetado dentro do SVG é lido pelo navegador como stylesheet da página inteira!  
> **NUNCA use seletores de elementos globais sem escopo** como `text, tspan { font-family: ... }`, `svg { ... }`, `.minha-classe { ... }` ou `@keyframes blink { ... }`.  
> Fazer isso altera instantaneamente a tipografia, fontes, espaçamentos ou cores de **toda a interface do editor e de outros widgets**!

#### Regras Obrigatórias para `<style>` em SVGs:

1. **Sempre definir `id="${id}"` na tag raiz `<svg>`**:
   ```svg
   <svg xmlns="http://www.w3.org/2000/svg" id="${id}" width="${w}" height="${h}" ...>
   ```
2. **Escopar todo seletor de tag ou classe com `#${id}`**:
   ```css
   /* CORRETO (100% isolado): */
   #${id} text, #${id} tspan {
     font-family: 'Departure Mono', ui-monospace, Consolas, monospace;
     white-space: pre;
   }
   #${id} .led { animation: blink-${id} 1.1s steps(1,end) infinite; }

   /* ERRADO (vaza para toda a aplicação): */
   text, tspan { font-family: 'Departure Mono'; }
   .led { animation: blink 1.1s infinite; }
   ```
3. **Sempre sufixar nomes de `@keyframes` com o ID da instância (`${id}`)**:
   ```css
   @keyframes blink-${id} { 0%,55%{opacity:1} 56%,100%{opacity:.12} }
   @keyframes jitter-${id} { ... }
   ```
4. **Sempre sufixar IDs de `<defs>`, `<pattern>`, `<filter>`, `<clipPath>`, `<linearGradient>` com `${id}`**:
   ```svg
   <pattern id="scan-${id}" ...>
   <filter id="glow-${id}" ...>
   <clipPath id="clip-${id}" ...>
   ```

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

### 5.5. Arquitetura de Cores, Temas Globais e Regras de Posicionamento

> [!IMPORTANT]
> **Regra Obrigatória de Centralização:**  
> **NUNCA** crie inputs de cor de destaque, cor secundária, fundo ou texto dentro do arquivo específico `MeuWidgetControls.tsx`.  
> Toda a personalização de cores do widget **deve residir exclusivamente no topo do painel de propriedades (`PropertiesPanel.tsx`) na seção `Cores & Tema`**.

#### Padrões de Implementação de Cor:

1. **Suporte a Cor Secundária (`supportsSecondaryColor`)**:
   - Se o seu widget utiliza uma paleta de duas cores de destaque (ex: cor primária para bordas/título e cor secundária para tags/subtítulos como em _Surveillance_, _Control Plane_ ou _Codeweb_), registre a verificação em `PropertiesPanel.tsx`:
     ```tsx
     const supportsSecondaryColor =
       selectedWidget.widgetId.startsWith('surveillance-') ||
       selectedWidget.widgetId.startsWith('controlplane-') ||
       selectedWidget.widgetId === 'codeweb-retro-grid' ||
       'secondaryColor' in cfg
     ```
2. **Presets de Temas de 1 Clique (Theme Presets)**:
   - Se a categoria tiver combinações pré-definidas de cores (como _Cyan Oxide_, _Matrix Green_, _Cyber Crimson_, _Amber Terminal_, _Synthwave Violet_, _Monochrome Ice_), posicione a grade de botões de presets **diretamente dentro da seção `Cores & Tema` no `PropertiesPanel.tsx`**, logo abaixo dos `ColorPicker`s.
   - Ao clicar no preset, atualize `accentColor`, `secondaryColor` e `ledColor` em conjunto:
     ```tsx
     updateWidgetConfig(selectedWidget.instanceId, {
       accentColor: th.primary,
       secondaryColor: th.secondary,
       ...(isSurveillance ? { ledColor: th.led } : {}),
     })
     ```
3. **Resolução de Cores no Renderer (`SurveillanceRenderers.ts` ou `MeuRenderer.ts`)**:
   - O renderer deve sempre priorizar a sobrescrita do widget e fazer fallback automático para o estilo global:
     ```ts
     const primary = (cfg.accentColor as string) || globalStyles.accentColor || '#55ffff'
     const secondary = (cfg.secondaryColor as string) || '#c084fc'
     ```
4. **Glows e Bordas Translúcidas Dinâmicas com `hexToRgba`**:
   - Nunca fixe valores de cores em `rgba(...)` estáticos no SVG. Use uma função utilitária `hexToRgba(hex, alpha)` para que gradientes radiais de fundo, bordas translúcidas (ex: 30%, 18%, 60%) e sombras glow acompanhem 100% a cor escolhida pelo usuário.

### 5.6. Tinting Dinâmico de Fotos e Câmeras em SVG (Efeito CRT / Night-Vision)

Ao renderizar fotos de perfil, avatares ou feeds de câmeras em widgets de estilo tecnológico ou retrô, **nunca use filtros CSS com rotação fixa de matiz** como `hue-rotate(150deg)`. Em vez disso, use um filtro vetorial SVG `<filter id="avtint-${id}">` em `<defs>` que calcula os valores normalizados dos canais RGB da cor primária:

```ts
const hex = (pal.primary || '#55ffff').replace('#', '')
const rNorm = (parseInt(hex.slice(0, 2) || '55', 16) / 255).toFixed(3)
const gNorm = (parseInt(hex.slice(2, 4) || 'ff', 16) / 255).toFixed(3)
const bNorm = (parseInt(hex.slice(4, 6) || 'ff', 16) / 255).toFixed(3)
```

No SVG:

```xml
<filter id="avtint-${id}">
  <feColorMatrix type="matrix" values="
    0.33 0.33 0.33 0 0
    0.33 0.33 0.33 0 0
    0.33 0.33 0.33 0 0
    0    0    0    1 0
  " result="gray"/>
  <feComponentTransfer in="gray" result="contrast">
    <feFuncR type="linear" slope="1.2" intercept="-0.08"/>
    <feFuncG type="linear" slope="1.2" intercept="-0.08"/>
    <feFuncB type="linear" slope="1.2" intercept="-0.08"/>
  </feComponentTransfer>
  <feColorMatrix in="contrast" type="matrix" values="
    ${rNorm} 0 0 0 0
    0 ${gNorm} 0 0 0
    0 0 ${bNorm} 0 0
    0 0 0 1 0
  "/>
</filter>

<image x="${x}" y="${y}" width="${w}" height="${h}" href="${avatarUrl}" filter="url(#avtint-${id})" style="image-rendering:pixelated;"/>
```

Isso garante que a foto mude de tom dinamicamente para Verde Matrix, Vermelho Cyberpunk, Âmbar, Violeta ou Branco Monocromático conforme o usuário troca o tema.

### 5.7. Padrão para Tecnologias, Ferramentas & Badges com Logos

Quando o widget renderizar linguagens de programação, ferramentas de workflow ou stacks de tecnologias:

1. **Utilize o `TECH_CATALOG` padrão** de `@/data/techCatalog` e helper `getTechInfo(tech)`.
2. **Suporte obrigatório aos 3 modos de exibição (`displayMode`)**:
   - `both` ("Nome + Logo"): Exibe o ícone SVG de `https://skillicons.dev/icons?i=${iconId}&theme=dark` acompanhado do nome formatado.
   - `logo` ("Apenas Logo"): Exibe apenas o ícone centralizado no chip vetorial.
   - `name` ("Apenas Nome"): Exibe apenas o texto monoespaçado em caixa alta.
3. **No painel de propriedades**:
   - Forneça seletor de modo em 3 colunas (`Nome + Logo`, `Apenas Logo`, `Apenas Nome`).
   - Forneça abas de categoria (_Todas, Linguagens, Frontend, Backend, DevOps_).
   - Inclua campo de busca com ícone `Search` e lista de atalhos rápidos com `max-h-36 overflow-y-auto`.

### 5.8. Botões de Ligar/Desligar (Switch) vs Checkboxes

> [!TIP]
> **Nunca use `<input type="checkbox">` nativo na interface.**  
> Utilize sempre o componente padrão `<Switch checked={value} onChange={(checked) => handleUpdate({ key: checked })} />` de `@/components/ui/Switch` com label clicável para todas as opções de alternância booleana (ex: `showTitle`, `showLed`, `showRef`, `hideBorder`).

### 5.9. Bloqueio ao Perfil do Usuário Ativo (Sem Seleção de Nome de Terceiros)

> [!IMPORTANT]
> **Regra de Identidade do Perfil:**  
> O usuário **NUNCA** pode selecionar outro nome de usuário do GitHub para renderizar nos widgets do seu perfil.  
> Todo widget deve obrigatoriamente utilizar `data.user.login` como identificador padrão do desenvolvedor.  
> **Não inclua** inputs para digitação de nome de usuário alternativo ou listas de sugestões de terceiros no painel de propriedades (`MeuWidgetControls.tsx`).

---

## 6. Estilização Única por Categoria na Library

Ao renderizar os cards de uma categoria na `WidgetLibrary.tsx`, você **DEVE** ir além do básico e implementar **animações de hover avançadas e bonitas** que transmitam a identidade do conjunto. O GitAscii preza por um design impecável, "premium" e dinâmico.

### Exemplos de Identidade Visual Existentes:

| Categoria         | Identidade Visual                          | Efeitos de Hover Obrigatórios                                                                                               |
| :---------------- | :----------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------- |
| **Surveillance**  | CRT terminal 198X, CCTV, scanlines, HUD    | Borda superior com scanlines verdes/azuis piscantes; retículas nos 4 cantos expandindo no hover.                            |
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
- [ ] **Isolamento de CSS & Fontes**: Todo `<style>` e `@keyframes` dentro do SVG é estritamente escopado com `#${id}` (sem seletores nus como `text`, `tspan` ou `.classe-generica`).
- [ ] **Cores Centralizadas no Topo**: Controles de cor (primária, secundária, fundo, borda, texto e presets de temas) residem no topo em `PropertiesPanel.tsx`, sem duplicações em `MeuWidgetControls.tsx`.
- [ ] **Tinting Dinâmico de Fotos**: Imagens/avatares usam matriz de filtro SVG dinâmica derivada de `${rNorm}, ${gNorm}, ${bNorm}` (sem `hue-rotate` estático).
- [ ] **Tech Stack & Badges**: Widgets de ferramentas/skills suportam `displayMode` (`both`, `logo`, `name`) e ícones de `skillicons.dev`.
- [ ] **Identidade do Perfil Travada**: O widget consome exclusivamente `data.user.login` do perfil ativo sem permitir seleção de terceiros.
- [ ] **Switches Vetoriais**: Todas as opções booleanas usam o componente `<Switch />` em vez de `<input type="checkbox">`.
- [ ] **Filtros Granulares**: O usuário pode ligar/desligar elementos e campos específicos.
- [ ] **Auto-Resize sem History Pollution**: Mudanças estruturais ajustam a altura com `recordHistory: false`.
- [ ] **Sem Emojis em Elementos de UI**: Todos os botões e seletores usam ícones Lucide vetoriais.
- [ ] **Scroll em Listas Longas**: Containers de seleção têm `max-h` com scroll customizado.
- [ ] **Tooltip & Preview**: `WidgetPreviewTooltip` exibe a proporção correta no hover da library sem vazar estilos.
- [ ] **API de Exportação**: Rota `[profileSlug]` possui dimensões de fallback para o novo widget.
- [ ] **Estilo Temático**: A categoria possui estilo visual condizente e diferenciado na sidebar.
