# Regras de Qualidade Técnica de Código — GitAscii

Siga estritamente estas diretrizes ao criar ou editar código no projeto:

## 1. Comentários

- **HTML / JSX**: Nunca utilize comentários no JSX/HTML (ex: `{/* Header */}`).
- **TypeScript / Lógica**: Apenas utilize comentários em trechos com complexidade algorítmica ou comportamentos não-óbvios. Nunca adicione comentários redundantes ou óbvios (ex: `// Top 6 repos by stars`, `// Fallback data`).

## 2. Constantes e Configurações Globais

- Dados estáticos, dicionários de cores, mapas de linguagem e listas de datas/meses (ex: `LANGUAGE_COLORS`, `MONTH_NAMES`, `GITHUB_CONTRIBUTION_COLORS`) devem sempre residir na pasta `src/constants/`.
- Exporte essas constantes centralizadas através do índice `src/constants/index.ts`.

## 3. URLs e Chamadas de API / Serviços

- Qualquer URL de requisição ou endpoint de serviço deve ser declarada e consumida a partir de `src/services/endpoints.ts` (`API_ENDPOINTS`).
- Nunca deixe URLs ou rotas de API hard-coded em componentes.

## 4. Ícones

- Sempre utilize a biblioteca padrão do projeto (`lucide-react`) em vez de inline SVGs manuais para ícones de UI (botões, tabs, menus, notificações, etc.).

## 5. Validação de Textos, Cores e Identificadores

- Validações de nomes de temas, chaves de cor HEX ou identificadores de widgets/estilos devem ser feitas diretamente contra as constantes e tipos do sistema (ex: `GITHUB_THEME_KEYS`, `WIDGET_IDS`, `LANGUAGE_COLORS`) em vez de strings literais soltas no código.
