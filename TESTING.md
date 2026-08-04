# Testes E2E & Storybook (Foco em IA e Automação)

Este projeto foi configurado com **Playwright (E2E)** e **Storybook (Componentes)** focando em torná-lo **AI-friendly** (amigável para agentes de IA como Claude Code, Cursor, ChatGPT, Gemini CLI, Copilot etc.). O objetivo principal não é apenas a cobertura de testes, mas sim fornecer uma estrutura estável e previsível que permita a agentes de IA compreender a interface, validar alterações automaticamente e reduzir regressões.

---

## 🛠️ Tecnologias e Configuração

- **Next.js 15.3** + **React 19** + **TypeScript 5.7**
- **Vite** como build engine do Storybook (fornece builds e hot-reloads extremamente rápidos)
- **Playwright** configurado com runner Chromium direcionado para o servidor local (`http://localhost:3000`)
- **Estilos Globais**: Storybook importa diretamente o `src/app/globals.css` (Tailwind 4 + CSS Variables)
- **Contextos e Estado**:
  - Stories e testes E2E compartilham mocks determinísticos do GitHub via `getMockGitHubData`.
  - Stories injetam o contexto de tradução através de um decorator global `<I18nProvider>` no `.storybook/preview.tsx`.
  - O estado do editor (Zustand) é semeado de forma síncrona nos decorators de cada story para renderização instantânea.
  - Testes E2E usam interceptação de rede nativa do Playwright (`page.route`) para simular respostas das rotas de API `/api/github/*` e `/api/auth/session`, permitindo execução totalmente offline e rápida.

---

## 📂 Estrutura Existente

```
gitascii/
├── .storybook/
│   ├── main.ts              # Configuração do Storybook (addons, vite, staticDirs)
│   └── preview.tsx          # Decorator de i18n e importação de globals.css
├── e2e/
│   └── editor.spec.ts       # Testes E2E cobrindo os 7 fluxos críticos
├── playwright.config.ts     # Configuração de portas, navegador e webServer local
├── TESTING.md               # Este arquivo de documentação
└── src/features/editor/components/
    ├── stories/
    │   └── mockData.ts      # Dados compartilhados de mock para os stories
    ├── Canvas/
    │   └── SVGCanvas.stories.tsx
    ├── Properties/
    │   └── PropertiesPanel.stories.tsx
    ├── Sidebar/
    │   └── WidgetLibrary.stories.tsx
    ├── Toolbar/
    │   └── EditorToolbar.stories.tsx
    └── EditorLayout.stories.tsx
```

---

## 🎯 Seletores Estáveis (`data-testid`)

Para permitir que agentes de IA e scripts de testes localizem elementos de forma confiável e independente de refatorações de estilo/DOM, adicionamos seletores estáveis no código da aplicação:

### Toolbar (Toolbar/EditorToolbar.tsx)

- `data-testid="undo-btn"`: Desfazer alteração
- `data-testid="redo-btn"`: Refazer alteração
- `data-testid="zoom-in-btn"`: Aumentar zoom
- `data-testid="zoom-out-btn"`: Diminuir zoom
- `data-testid="save-profile-btn"`: Salvar perfil no servidor
- `data-testid="copy-code-btn"`: Copiar código Markdown de embed
- `data-testid="export-layout-btn"`: Exportar layout em JSON (modo lite)

### Sidebar (Sidebar/WidgetLibrary.tsx)

- `data-testid="widgets-tab-btn"`: Botão para abrir aba de Widgets
- `data-testid="templates-tab-btn"`: Botão para abrir aba de Templates
- `data-testid="add-widget-<widget-id>"`: Botão para adicionar um widget específico ao canvas (ex: `add-widget-bio`, `add-widget-stats`)
- `data-testid="import-layout-btn"`: Importar arquivo JSON de layout
- `data-testid="export-layout-btn"`: Exportar arquivo JSON de layout (equivalente ao da toolbar)
- `data-testid="template-<template-id>"`: Card de template preset para aplicar layout (ex: `template-minimal`, `template-terminal`)

### Canvas (Canvas/SVGCanvas.tsx)

- `data-testid="canvas-svg-container"`: Container da prévia SVG principal (usado para checar se o SVG está renderizado)
- `data-testid="canvas-widget-<widget-id>"`: Elemento interativo de um widget no canvas para cliques, arrastes e seleção (ex: `canvas-widget-header`, `canvas-widget-bio`)

### Properties Panel (Properties/PropertiesPanel.tsx)

- `data-testid="widget-lock-btn"`: Bloquear/desbloquear widget selecionado
- `data-testid="widget-visible-btn"`: Ocultar/exibir widget selecionado
- `data-testid="widget-delete-btn"`: Excluir widget selecionado do layout
- `data-testid="widget-bio-input"`: Textarea para edição do texto da Bio
- `data-testid="widget-location-input"`: Input de texto da localização (Bio)
- `data-testid="widget-website-input"`: Input de texto do website/blog (Bio)
- `data-testid="widget-width-input"`: Input numérico para largura do widget
- `data-testid="widget-height-input"`: Input numérico para altura do widget
- `data-testid="widget-x-input"`: Input numérico para posição X do widget
- `data-testid="widget-y-input"`: Input numérico para posição Y do widget

---

## 🏃 Como Executar

### E2E Tests (Playwright)

Executa em terminal headless com inicialização automática do servidor de desenvolvimento Next.js:

```bash
npm run test:e2e
```

Para depurar visualmente ou usar a UI interativa do Playwright:

```bash
npm run test:e2e:ui
```

### Storybook

Para iniciar o servidor local de desenvolvimento do Storybook:

```bash
npm run storybook
```

Para validar a integridade de compilação de todas as histórias e gerar uma versão estática:

```bash
npm run build-storybook
```

---

## 🤖 Guia de Uso para Agentes de IA

Sempre que estiver modificando o editor ou criando novos widgets:

1. **Garanta seletores estáveis**: Elementos interativos importantes do novo widget devem possuir um `data-testid` legível e documentado.
2. **Atualize o arquivo de testes**: Se modificar as regras de layout ou adicionar comportamentos, garanta que os testes em `e2e/editor.spec.ts` reflitam a nova lógica.
3. **Validação Rápida**: Rode `npm run test:e2e` para validar que nenhuma alteração quebrou os fluxos de criação de widgets, aplicação de templates, ou posicionamento.
4. **Stories do Storybook**: Use os stories criados para inspecionar estados visuais isolados. Se adicionar um novo componente complexo, crie um correspondente arquivo `.stories.tsx` populado com o `mockConfig` e `mockGithubData` de `src/features/editor/components/stories/mockData.ts`.
