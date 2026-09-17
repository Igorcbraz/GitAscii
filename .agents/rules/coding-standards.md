## Regras obrigatórias de código

Estas regras são **obrigatórias para qualquer código criado, alterado ou refatorado**. Antes de considerar uma tarefa concluída, revise **todos os arquivos modificados** e corrija qualquer violação encontrada.

### Constants e valores fixos

- Nunca comparar valores de domínio diretamente com strings literais.

Evitar:
`status === 'active'`

Preferir:
`status === USER_STATUS.ACTIVE`

- Strings de status, tipos, categorias, roles, actions, eventos, mensagens reutilizadas e outros valores de domínio devem ficar em arquivos apropriados dentro de `constants`.
- Magic numbers devem ser extraídos para constantes quando representam timeout, limite, quantidade, configuração ou regra de negócio.
- Arrays e objetos grandes ou estáticos não devem permanecer dentro de components, controllers, services ou funções. Devem ser movidos para `constants`, `config` ou arquivo específico conforme sua responsabilidade.
- Não criar uma constante apenas para substituir um valor trivial usado uma única vez quando isso não melhora legibilidade ou domínio.

### URLs e integrações

- URLs externas, endpoints e construção de URLs de APIs devem ficar exclusivamente na camada `service` ou configuração específica da integração.
- Components, controllers, hooks e regras de negócio não devem conhecer URLs externas.
- Credenciais, tokens, secrets e configurações dependentes de ambiente devem vir de configuração/env, nunca hardcoded.
- Centralizar clientes HTTP e evitar configurações duplicadas de `fetch`, `axios` ou equivalentes.

### Modularização

- Manter apenas um component principal por arquivo.
- Components auxiliares relevantes devem possuir seus próprios arquivos.
- Hooks reutilizáveis devem ficar separados dos components.
- Funções utilitárias reutilizáveis devem ser extraídas para `utils`, `helpers` ou módulo equivalente existente no projeto.
- Não criar arquivos que concentrem responsabilidades não relacionadas.
- Quebrar funções grandes em funções menores quando existirem responsabilidades claramente separáveis.
- Evitar components, controllers ou services excessivamente grandes.
- Antes de criar um novo módulo, verificar a estrutura existente e seguir o padrão já adotado pelo projeto.

### Separação de responsabilidades

- Components devem cuidar principalmente de apresentação e interação.
- Hooks devem encapsular comportamento reutilizável e estado quando apropriado.
- Controllers devem coordenar entrada/saída, não concentrar regra de negócio.
- Services devem concentrar integrações e operações próprias da camada de serviço.
- Regras de negócio devem permanecer desacopladas de UI, transporte HTTP e detalhes de infraestrutura sempre que possível.
- Queries e acesso ao banco não devem ser espalhados por components ou controllers quando existir uma camada apropriada para isso.

### Comentários

- Não adicionar comentários que apenas expliquem o que o código já deixa claro.
- Preferir nomes claros e código autoexplicativo em vez de comentários.
- Remover comentários obsoletos, código comentado, TODOs desnecessários e explicações geradas automaticamente.
- Comentários são permitidos somente quando explicam algo que não pode ser representado claramente pelo próprio código, como:

  - decisões técnicas não óbvias;
  - limitações externas;
  - comportamento estranho de biblioteca/API;
  - conversões específicas, por exemplo `300_000 // 5 minutos`;
  - workaround cujo motivo seria perdido sem contexto.

### Duplicação

- Não duplicar lógica existente.
- Antes de implementar uma nova função, helper, constant, service ou component, procurar se já existe algo equivalente.
- Quando duas ou mais partes modificadas possuem a mesma lógica relevante, extrair uma abstração compartilhada quando isso realmente reduzir duplicação.
- Não criar abstrações prematuras para código trivial.

### Legibilidade

- Usar nomes que expressem intenção.
- Evitar nomes genéricos como `data`, `item`, `obj`, `temp`, `value` quando houver um nome de domínio mais claro.
- Evitar condicionais complexas inline.
- Extrair condições extensas para funções ou variáveis com nomes semânticos.
- Preferir early return quando reduzir níveis de indentação.
- Evitar ternários aninhados.
- Evitar funções com muitos parâmetros; quando fizer sentido, utilizar objeto de parâmetros.
- Remover imports, variáveis, funções e código não utilizados.

### Tipagem e contratos

Quando TypeScript estiver sendo utilizado:

- Não utilizar `any` sem necessidade comprovada.
- Não utilizar casts (`as`) apenas para silenciar erros de TypeScript.
- Reutilizar tipos existentes antes de criar novos.
- Interfaces/types compartilhados devem ficar em arquivos próprios quando apropriado.
- Tipar explicitamente contratos externos, respostas de APIs e estruturas relevantes de domínio.

### Tratamento de erros

- Não deixar `catch` vazio.
- Não esconder erros silenciosamente.
- Não duplicar tratamento de erro quando já existir uma estratégia centralizada.
- Mensagens internas e mensagens exibidas ao usuário devem respeitar as responsabilidades de cada camada.
- Erros de integrações externas devem possuir contexto suficiente para diagnóstico sem expor secrets.

### Configuração

- Não hardcodar valores que variam entre ambientes.
- Usar `env`, `config` ou constants conforme a natureza do valor.
- Não acessar `process.env` indiscriminadamente por toda a aplicação se o projeto já possuir camada de configuração.

### Escopo da alteração

Ao receber uma tarefa:

1. Primeiro entenda a estrutura e os padrões existentes.
2. Implemente a alteração solicitada.
3. Revise os arquivos diretamente relacionados que foram modificados.
4. Aplique estas regras também ao código existente que você tocou, não apenas às novas linhas.
5. Não faça refatorações grandes e não relacionadas à tarefa apenas para satisfazer preferências arquiteturais.
6. Preserve comportamento existente que não faça parte da solicitação.

### Validação obrigatória antes de finalizar

Antes de declarar a tarefa concluída, faça uma revisão final dos arquivos alterados procurando explicitamente por:

- strings de domínio hardcoded;
- magic numbers;
- arrays/objetos grandes inline;
- URLs fora de services/config;
- código duplicado;
- comentários desnecessários;
- código comentado;
- imports/código morto;
- funções excessivamente grandes;
- múltiplos components relevantes no mesmo arquivo;
- responsabilidades misturadas;
- `any` ou casts desnecessários;
- tratamento de erros vazio ou silencioso;
- lógica que já deveria ter sido extraída para constant, helper, hook ou service.

Se encontrar qualquer um desses problemas nos arquivos modificados, **corrija antes de finalizar**.

Não apenas informe que encontrou uma violação. A regra padrão é **corrigir a violação diretamente** sempre que ela estiver dentro do escopo dos arquivos modificados.
