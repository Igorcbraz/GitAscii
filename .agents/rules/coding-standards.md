# Regras de Qualidade Técnica de Código — GitAscii

Siga estritamente estas diretrizes ao criar, refatorar ou editar código no projeto:

---

## 1. Comentários e Limpeza de Código

- **HTML / JSX**: Nunca utilize comentários dentro do JSX/HTML (ex: `{/* Header */}`, `{/* Live Badge Preview */}`). O JSX deve ser autoexplicativo através de nomes de componentes e tags semânticas.
- **TypeScript / Lógica**: Apenas utilize comentários em trechos com complexidade algorítmica ou comportamentos não-óbvios. Nunca adicione comentários redundantes ou óbvios (ex: `// Top 6 repos by stars`, `// Fallback data`, `// Close modal`).
- **Código Morto**: Nunca deixe blocos de código comentados ou imports não utilizados nos arquivos.

---

## 2. Componentização e Arquitetura (Coordinator Pattern)

- **Evite Mega-Arquivos**: Componentes com mais de 300–400 linhas devem ser decompostos em subcomponentes com responsabilidade única (Single Responsibility Principle).
- **Padrão Coordinator / Orchestrator**: Telas e dashboards complexos devem atuar como coordenadores enxutos, gerenciando estado superior, busca de dados e orquestração de modais, delegando a apresentação visual para subcomponentes isolados:
  - `*KpiStrip.tsx`: Faixas de cards de KPI e métricas principais.
  - `*Section.tsx` / `*Card.tsx`: Seções temáticas de gráficos, listas ou tabelas.
  - `*Table.tsx`: Tabelas com paginação e ações de linha.
  - `*Modal.tsx` / `*Editor.tsx`: Modais e formulários isolados.
  - `*SidebarNav.tsx`: Navegação lateral e seletores de escopo.
- **Skeletons Espelhados**: Componentes de carregamento (`*Skeleton.tsx`) devem espelhar fielmente a estrutura visual do componente real, mantendo os mesmos grids e proporções, sem nenhum comentário JSX.

---

## 3. Organização de Diretórios e Estrutura de Features (`src/features/*`)

- Mantenha a separação de responsabilidades modularizada por domínio em `src/features/<feature>/`:
  - `components/`: Componentes visuais e subcomponentes da feature.
  - `constants/`: Constantes estáticas e opções de formulários do domínio, exportadas pelo barrel `index.ts`.
  - `types/`: Tipos TypeScript e interfaces de dados do domínio.
  - `server/` ou `store/`: Singletons, stores de persistência (Redis/Upstash) e lógica de backend.
  - `utils/`: Funções utilitárias e formatadores específicos da feature.
  - `api/`: Testes de integração de rotas e helpers de API.

---

## 4. Constantes e Configurações Globais

- **Constantes Globais**: Dados estáticos, dicionários de cores, mapas de linguagem e listas de datas/meses (ex: `LANGUAGE_COLORS`, `MONTH_NAMES`, `GITHUB_CONTRIBUTION_COLORS`) devem residir em `src/constants/` e ser exportadas por `src/constants/index.ts`.
- **Constantes de Domínio**: Constantes específicas de features (ex: opções de regras dinâmicas, filtros de tempo, listas de escopo) devem residir em `src/features/<feature>/constants/`.
- **Validação Tipada**: Validações de nomes de temas, chaves de cor HEX ou identificadores de widgets/estilos devem ser feitas diretamente contra as constantes e tipos do sistema (ex: `GITHUB_THEME_KEYS`, `WIDGET_IDS`, `LANGUAGE_COLORS`) em vez de strings literais soltas no código.

---

## 5. URLs e Chamadas de API / Serviços

- **Centralização em `API_ENDPOINTS`**: Qualquer URL de requisição ou endpoint de serviço deve ser declarada e consumida a partir de `src/services/endpoints.ts` (`API_ENDPOINTS`).
- **Zero URLs Hard-Coded**: Nunca escreva strings de rota diretamente em chamadas de `fetch` ou redirecionamentos (ex: proibido `fetch('/api/pro/analytics')` ou `fetch('/api/auth/login')`). Sempre utilize `API_ENDPOINTS.PRO.*` ou `API_ENDPOINTS.AUTH.*`.

---

## 6. Internacionalização (i18n)

- **Todo Texto Visível Traduzido**: Nenhum texto visível para o usuário deve ficar hard-coded em inglês ou português. Sempre envolva strings com o hook `useI18n()` fornecendo uma chave semântica e um fallback padrão em inglês:
  ```tsx
  const { t } = useI18n()
  <span>{t('pro.analytics.kpi_total_views', 'Total Views')}</span>
  ```
- **Interpolação de Variáveis**: Utilize a sintaxe de chaves para interpolação:
  ```tsx
  t('pro.analytics.page_of', 'Page {current} of {total}', {
    current: String(page),
    total: String(totalPages),
  })
  ```

---

## 7. Ícones e Elementos Gráficos

- **Uso Exclusivo de `lucide-react`**: Sempre utilize a biblioteca padrão do projeto (`lucide-react`) em vez de SVGs manuais inline para ícones de UI (botões, tabs, menus, notificações, status, etc.).
- **Proporção e Acessibilidade**: Ícones sem texto adjacente devem possuir `aria-label` ou `title` no botão/container pai para leitores de tela e acessibilidade.

---

## 8. Modais, Diálogos de Confirmação e Feedback Visual

- **Diálogos Destrutivos / Confirmações**: Ações de exclusão, redefinição ou alterações críticas devem utilizar o componente padronizado [`ConfirmDialog`](file:///C:/Repos/GitAscii/src/features/pro/components/ConfirmDialog.tsx) com suporte a `isOpen`, `title`, `description`, `confirmLabel`, `variant` (`'danger'` | `'warning'` | `'primary'`) e `isLoading`.
- **Manipulação de Teclado e Backdrop**: Dropdowns e modais devem fechar ao pressionar a tecla `Escape` e ao clicar fora do elemento (listener de `mousedown` no `document` com cleanup no `useEffect`).
- **Estados de Carregamento**: Todas as operações assíncronas devem fornecer feedback visual (indicadores de `loading`, `disabled`, spinners com `animate-spin`).

---

## 9. Tipagem Estrita e TypeScript

- **Zero `any` Desnecessário**: Todas as respostas de API, payloads de mutação, registros de banco/Redis e props de componentes devem ser devidamente tipados em `types/`.
- **Props Opcionais**: Propriedades opcionais booleanas devem receber valor padrão na desestruturação dos parâmetros do componente (ex: `pageSize = 8`, `compareEnabled = true`).
- **Validação com `tsc`**: Todo código novo ou refatorado deve passar com zero erros na execução de `npx tsc --noEmit`.
